/**
 * @fileoverview Firebase reverse-proxy shim for regions where
 * *.googleapis.com is blocked (e.g. mainland China).
 *
 * The Firebase JS SDK hardcodes Google hostnames, so this module intercepts
 * fetch() (and navigator.sendBeacon for Analytics) and rewrites known Firebase
 * hosts to path prefixes on a reverse proxy. The proxy routes each prefix
 * back to the corresponding Google host:
 *
 *   /identitytoolkit -> identitytoolkit.googleapis.com        (Auth)
 *   /securetoken     -> securetoken.googleapis.com            (token refresh)
 *   /remoteconfig    -> firebaseremoteconfig.googleapis.com   (Remote Config)
 *   /installations   -> firebaseinstallations.googleapis.com  (FIS)
 *   /gtm             -> www.googletagmanager.com              (gtag.js)
 *   /ga              -> region1.google-analytics.com          (Analytics collect)
 *
 * CONFIGURATION — the app's whole job is one line at startup:
 *
 *   setFirebaseProxy(import.meta.env.VITE_FIREBASE_PROXY);
 *
 * Not set -> Firebase is used directly. Nothing is patched, no probe runs.
 * Set     -> this module decides whether the device actually needs the proxy.
 *
 * DETECTION lives here, not in consumers. Callers never ask "am I in China?" —
 * they ask getFirebaseProxyOrigin(), which returns the origin only while
 * traffic is genuinely being routed, and null otherwise (unset, or reachable
 * Google). A caller that gets null behaves exactly as if no proxy existed.
 *
 * Detection order, once an origin is configured:
 *   1. A fresh cached verdict (localStorage, 24h TTL) applies instantly.
 *   2. On a cache miss, a mainland-China timezone pre-enables routing so the
 *      first requests are not lost while the probe is in flight.
 *   3. A reachability probe against Google confirms or corrects the decision
 *      and refreshes the cache — including turning routing back off once
 *      Google is directly reachable again.
 *
 * Await firebaseProxyReady() for the settled verdict.
 *
 * JS-level only: on React Native this covers fetch-based Firebase usage, but
 * traffic from @react-native-firebase native SDKs cannot be redirected here.
 */

const HOST_TO_PREFIX: Record<string, string> = {
  'identitytoolkit.googleapis.com': 'identitytoolkit',
  'securetoken.googleapis.com': 'securetoken',
  'firebaseremoteconfig.googleapis.com': 'remoteconfig',
  'firebaseinstallations.googleapis.com': 'installations',
  'www.googletagmanager.com': 'gtm',
  'www.google-analytics.com': 'ga',
  'region1.google-analytics.com': 'ga',
  'analytics.google.com': 'ga',
};

/**
 * Probe URL: a Google host blocked alongside the Firebase endpoints but
 * deliberately NOT in HOST_TO_PREFIX, so the probe always measures the direct
 * route even while the proxy is active.
 */
const PROBE_URL = 'https://www.googleapis.com/generate_204';

/** Mainland-China timezones (GFW scope) — HK/Macau/Taipei excluded. */
const CHINA_TIMEZONES = new Set([
  'Asia/Shanghai',
  'Asia/Urumqi',
  'Asia/Chongqing',
  'Asia/Harbin',
  'Asia/Kashgar',
]);

const CACHE_KEY = 'sudobility.firebase-proxy.blocked';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Origin the app configured, or null when the app set nothing. */
let configuredOrigin: string | null = null;
/** Origin traffic is actually routed through right now, or null. */
let activeProxyOrigin: string | null = null;
let wrapperInstalled = false;
let detectionPromise: Promise<boolean> | null = null;

/**
 * Rewrite a URL pointing at a known Firebase/Google host to the equivalent
 * proxy URL. URLs for other hosts (and unparseable strings) are returned
 * unchanged.
 *
 * @param rawUrl - Absolute URL the SDK is about to request
 * @param proxyOrigin - Proxy origin, e.g. 'https://fb-api.example.com'
 * @returns The proxied URL, or the input unchanged if no mapping applies
 */
export function rewriteFirebaseProxyUrl(
  rawUrl: string,
  proxyOrigin: string
): string {
  try {
    const url = new URL(rawUrl);
    const prefix = HOST_TO_PREFIX[url.hostname];
    if (!prefix) {
      return rawUrl;
    }
    const base = proxyOrigin.replace(/\/$/, '');
    return `${base}/${prefix}${url.pathname}${url.search}`;
  } catch {
    return rawUrl;
  }
}

/** Rewrite against the currently active proxy origin (identity when off). */
function rewriteActive(rawUrl: string): string {
  return activeProxyOrigin
    ? rewriteFirebaseProxyUrl(rawUrl, activeProxyOrigin)
    : rawUrl;
}

/**
 * Patch globalThis.fetch and navigator.sendBeacon once. The wrapper is a
 * pass-through while no proxy origin is active, so it is safe to leave
 * installed and toggle routing on/off afterwards.
 */
function ensureWrapperInstalled(): void {
  if (wrapperInstalled || typeof fetch === 'undefined') {
    return;
  }
  wrapperInstalled = true;

  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      return originalFetch(rewriteActive(input), init);
    }
    if (input instanceof URL) {
      return originalFetch(rewriteActive(input.href), init);
    }
    if (input instanceof Request) {
      const rewritten = rewriteActive(input.url);
      return rewritten === input.url
        ? originalFetch(input, init)
        : originalFetch(new Request(rewritten, input), init);
    }
    return originalFetch(input as RequestInfo, init);
  }) as typeof fetch;

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    const originalSendBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) =>
      originalSendBeacon(rewriteActive(String(url)), data);
  }
}

/** Instant offline heuristic: is the device's timezone mainland China? */
function isLikelyChinaRegion(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return !!tz && CHINA_TIMEZONES.has(tz);
  } catch {
    return false;
  }
}

/**
 * Probe whether Google is directly reachable. True means the network path
 * works (an opaque no-cors response counts); false means blocked.
 */
async function isGoogleReachable(timeoutMs = 3000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(PROBE_URL, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Read the cached verdict; null when absent, stale, or unavailable. */
function readCachedBlocked(): boolean | null {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as { blocked: boolean; ts: number };
    if (typeof parsed.blocked !== 'boolean' || typeof parsed.ts !== 'number') {
      return null;
    }
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      return null;
    }
    return parsed.blocked;
  } catch {
    return null; // no localStorage (React Native, SSR) or corrupt entry
  }
}

/** Persist the verdict; silently no-op where storage is unavailable. */
function writeCachedBlocked(blocked: boolean): void {
  try {
    globalThis.localStorage?.setItem(
      CACHE_KEY,
      JSON.stringify({ blocked, ts: Date.now() })
    );
  } catch {
    // ignore
  }
}

async function runDetection(origin: string): Promise<boolean> {
  if (typeof fetch === 'undefined') {
    return false; // no network layer to patch (SSR without fetch)
  }

  // Fast path: apply the cached verdict, or the timezone heuristic on a cache
  // miss, so a blocked device does not leak its first requests to the direct
  // route while the probe is in flight.
  const cachedBlocked = readCachedBlocked();
  if (
    cachedBlocked === true ||
    (cachedBlocked === null && isLikelyChinaRegion())
  ) {
    activeProxyOrigin = origin;
    ensureWrapperInstalled();
  }

  const reachable = await isGoogleReachable();
  writeCachedBlocked(!reachable);

  // The app may have cleared the configuration while the probe was in flight.
  if (configuredOrigin !== origin) {
    return activeProxyOrigin !== null;
  }

  if (reachable) {
    activeProxyOrigin = null;
  } else {
    activeProxyOrigin = origin;
    ensureWrapperInstalled();
  }
  return !reachable;
}

/**
 * Configure the Firebase reverse proxy. The library never reads the
 * environment — the app passes its own configured value in, once, at startup
 * and before Firebase is initialized.
 *
 * Passing a blank value means "no proxy": nothing is patched and no probe
 * runs. Passing an origin hands this module permission to use it *if* the
 * device turns out to need it; detection decides.
 *
 * @param origin - Proxy origin, e.g. https://firebaseproxy.example.com.
 *   Blank, null or undefined means use Firebase directly.
 */
export function setFirebaseProxy(origin?: string | null): void {
  const trimmed = typeof origin === 'string' ? origin.trim() : '';

  if (!trimmed) {
    configuredOrigin = null;
    activeProxyOrigin = null;
    detectionPromise = null;
    return;
  }

  if (configuredOrigin === trimmed) {
    return;
  }

  configuredOrigin = trimmed;
  activeProxyOrigin = null;
  detectionPromise = runDetection(trimmed);
  void detectionPromise;
}

/**
 * The proxy origin traffic is being routed through, or null.
 *
 * Null means "use Firebase directly" — either the app configured nothing, or
 * detection found Google directly reachable. Callers do not need to know which.
 */
export function getFirebaseProxyOrigin(): string | null {
  return activeProxyOrigin;
}

/** Whether Firebase traffic is currently routed through the proxy. */
export function isFirebaseProxyActive(): boolean {
  return activeProxyOrigin !== null;
}

/**
 * Resolves once detection has settled, to whether traffic is being routed.
 * Resolves false immediately when no origin is configured. Repeat callers
 * share the single in-flight detection run.
 */
export function firebaseProxyReady(): Promise<boolean> {
  return detectionPromise ?? Promise.resolve(false);
}

/**
 * Stop routing through the proxy and forget the configuration. The fetch
 * wrapper stays installed as a transparent pass-through.
 */
export function disableFirebaseProxy(): void {
  configuredOrigin = null;
  activeProxyOrigin = null;
  detectionPromise = null;
}

/**
 * Reset module state. Test-only.
 *
 * Also clears the "wrapper already installed" flag so a suite that stubs
 * globalThis.fetch per test gets the wrapper re-applied to each fresh stub.
 * Outside tests the flag exists precisely to prevent double-wrapping.
 */
export function resetFirebaseProxyForTests(): void {
  configuredOrigin = null;
  activeProxyOrigin = null;
  detectionPromise = null;
  wrapperInstalled = false;
}
