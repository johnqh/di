/**
 * GA4 Measurement Protocol analytics — an `AnalyticsService` for a JavaScript
 * runtime that is not a browser: React Native on macOS and Windows.
 *
 * The Firebase JS SDK's analytics needs a browser — it loads gtag.js into the
 * page, keeps the client id in a cookie and the installation in IndexedDB —
 * and its `isSupported()` answers false anywhere without them, which is every
 * React Native desktop. The Measurement Protocol is Google's documented HTTP
 * endpoint for exactly that case: the same GA4 property and data stream (the
 * desktop's Firebase web app's `measurementId`), plus an API secret created for
 * that stream (Google Analytics > Admin > Data streams > the stream >
 * Measurement Protocol API secrets).
 *
 * Wrap it in `FirebaseAnalyticsService` like any other backend, so a desktop
 * calls `trackScreenView`, `trackEvent`, `trackButtonClick`, `trackError` and
 * `setUserId` exactly as a phone does. Like the rest of this library it reads
 * no environment: the app passes the ids in.
 *
 * What the browser SDK does for free is done here:
 * - **client id** — generated once in GA's own `<random>.<seconds>` form and
 *   kept in the `storage` handed in (AsyncStorage), so a relaunch is the same
 *   user rather than a new one. Without storage it lasts for the process.
 * - **sessions** — `session_id` and `engagement_time_msec` on every event, a
 *   new session after 30 minutes without one (GA's own timeout); without them
 *   GA reports the events but no users or sessions.
 * - **the user id** is hashed with `hashUserIdForAnalytics` first, as the web
 *   backend does, so the same account has the same id on every platform.
 * - **limits** — event and parameter names are made valid, string values cut
 *   to 100 characters, at most 25 parameters an event and 25 events a request.
 *
 * Events are batched for `flushIntervalMs` and sent fire-and-forget: analytics
 * must never fail or slow the app. Requests go through the global `fetch`, so
 * the China proxy (`setFirebaseProxy`), which rewrites www.google-analytics.com,
 * covers them as it covers auth.
 */
import type { AnalyticsService } from './firebase.interface.js';
import {
  hashUserIdForAnalytics,
  toAnalyticsEventName,
} from './firebase-utils.js';

/** The key the client id is kept under in `storage`. */
export const MEASUREMENT_PROTOCOL_CLIENT_ID_KEY =
  '@sudobility/di:ga4_client_id';

/** GA4's endpoints; `debug` validates without recording anything. */
export const MEASUREMENT_PROTOCOL_ENDPOINT =
  'https://www.google-analytics.com/mp/collect';
export const MEASUREMENT_PROTOCOL_DEBUG_ENDPOINT =
  'https://www.google-analytics.com/debug/mp/collect';

/** GA4's limits, from the Measurement Protocol reference. */
const MAX_EVENTS_PER_REQUEST = 25;
const MAX_PARAMS_PER_EVENT = 25;
const MAX_PARAM_NAME_LENGTH = 40;
const MAX_PARAM_VALUE_LENGTH = 100;
const MAX_USER_PROPERTY_NAME_LENGTH = 24;
const MAX_USER_PROPERTY_VALUE_LENGTH = 36;
/** GA's session timeout. */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** Reported per event so GA counts the user as active. */
const ENGAGEMENT_TIME_MSEC = 100;

/** The subset of AsyncStorage (or any key-value store) the client id needs. */
export interface MeasurementProtocolStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface MeasurementProtocolConfig {
  /** The data stream's measurement id, `G-…`. */
  measurementId: string;
  /** A Measurement Protocol API secret created for that stream. */
  apiSecret: string;
  /** Keeps the client id across launches. Omitted, it lasts for the process. */
  storage?: MeasurementProtocolStorage;
  /** Send to the validation endpoint and log GA's verdict; records nothing. */
  debug?: boolean;
  /** How long events wait to be sent together. Default 1000 ms. */
  flushIntervalMs?: number;
  /** Tests only: the request function and the clock. */
  fetch?: typeof fetch;
  now?: () => number;
}

type Param = string | number;

interface QueuedEvent {
  name: string;
  params: Record<string, Param>;
  timestampMicros: number;
}

function validName(name: string, max: number): string {
  let out = name.replace(/[^A-Za-z0-9_]/g, '_');
  if (!/^[A-Za-z]/.test(out)) out = `p_${out}`;
  return out.slice(0, max);
}

/** GA4 takes strings and numbers; everything else is made one or dropped. */
function toParam(value: unknown): Param | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') return value.slice(0, MAX_PARAM_VALUE_LENGTH);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  try {
    return JSON.stringify(value).slice(0, MAX_PARAM_VALUE_LENGTH);
  } catch {
    return undefined;
  }
}

function toParams(parameters?: Record<string, unknown>): Record<string, Param> {
  const out: Record<string, Param> = {};
  for (const [key, value] of Object.entries(parameters ?? {})) {
    if (Object.keys(out).length >= MAX_PARAMS_PER_EVENT - 2) break; // room for the session pair
    const param = toParam(value);
    if (param !== undefined) out[validName(key, MAX_PARAM_NAME_LENGTH)] = param;
  }
  return out;
}

/** A client id in GA's own `<random>.<seconds since epoch>` form. */
function newClientId(nowMs: number): string {
  const random = Math.floor(Math.random() * 2147483647);
  return `${random}.${Math.floor(nowMs / 1000)}`;
}

export class MeasurementProtocolAnalyticsService implements AnalyticsService {
  private readonly config: MeasurementProtocolConfig;
  private readonly now: () => number;
  private clientId: Promise<string> | null = null;
  private userId: string | undefined;
  private userProperties: Record<string, { value: string }> = {};
  private sessionId = 0;
  private lastEventAt = 0;
  private queue: QueuedEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: MeasurementProtocolConfig) {
    this.config = config;
    this.now = config.now ?? (() => Date.now());
  }

  /** Configured: a measurement id and an API secret. Blank either, and nothing is sent. */
  isSupported(): boolean {
    return this.config.measurementId !== '' && this.config.apiSecret !== '';
  }

  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    if (!this.isSupported()) return;
    const now = this.now();
    if (this.sessionId === 0 || now - this.lastEventAt > SESSION_TIMEOUT_MS) {
      this.sessionId = Math.floor(now / 1000);
    }
    this.lastEventAt = now;
    this.queue.push({
      name: toAnalyticsEventName(eventName),
      params: {
        ...toParams(parameters),
        session_id: this.sessionId,
        engagement_time_msec: ENGAGEMENT_TIME_MSEC,
      },
      timestampMicros: now * 1000,
    });
    if (this.queue.length >= MAX_EVENTS_PER_REQUEST) void this.flush();
    else this.schedule();
  }

  setUserId(userId: string): void {
    if (!this.isSupported()) return;
    this.userId = userId ? hashUserIdForAnalytics(userId) : undefined;
    if (this.userId) this.setUserProperties({ user_hash: this.userId });
  }

  setUserProperties(properties: Record<string, string>): void {
    if (!this.isSupported()) return;
    for (const [key, value] of Object.entries(properties)) {
      this.userProperties[validName(key, MAX_USER_PROPERTY_NAME_LENGTH)] = {
        value: String(value).slice(0, MAX_USER_PROPERTY_VALUE_LENGTH),
      };
    }
  }

  /** Sends whatever is queued now. Resolves once the request settles; never rejects. */
  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, MAX_EVENTS_PER_REQUEST);
      await this.send(batch);
    }
  }

  private schedule(): void {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, this.config.flushIntervalMs ?? 1000);
  }

  private loadClientId(): Promise<string> {
    if (!this.clientId) {
      const storage = this.config.storage;
      this.clientId = (async () => {
        try {
          const stored = await storage?.getItem(
            MEASUREMENT_PROTOCOL_CLIENT_ID_KEY
          );
          if (stored) return stored;
        } catch {
          // A storage that cannot be read just means a new client id.
        }
        const id = newClientId(this.now());
        try {
          await storage?.setItem(MEASUREMENT_PROTOCOL_CLIENT_ID_KEY, id);
        } catch {
          // Kept for this process only.
        }
        return id;
      })();
    }
    return this.clientId;
  }

  private async send(batch: QueuedEvent[]): Promise<void> {
    const { measurementId, apiSecret, debug } = this.config;
    const endpoint = debug
      ? MEASUREMENT_PROTOCOL_DEBUG_ENDPOINT
      : MEASUREMENT_PROTOCOL_ENDPOINT;
    const url =
      `${endpoint}?measurement_id=${encodeURIComponent(measurementId)}` +
      `&api_secret=${encodeURIComponent(apiSecret)}`;
    try {
      const body = {
        client_id: await this.loadClientId(),
        ...(this.userId ? { user_id: this.userId } : {}),
        ...(Object.keys(this.userProperties).length > 0
          ? { user_properties: this.userProperties }
          : {}),
        events: batch.map((event) => ({
          name: event.name,
          params: event.params,
          timestamp_micros: event.timestampMicros,
        })),
      };
      // Looked up at call time, so the China proxy's wrapper is the one used.
      const request = this.config.fetch ?? globalThis.fetch;
      const response = await request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (debug) {
        console.log(
          '[analytics] Measurement Protocol validation:',
          await response.text()
        );
      }
    } catch (error) {
      if (debug)
        console.warn('[analytics] Measurement Protocol send failed:', error);
      // Fire and forget: analytics never fails the app.
    }
  }
}
