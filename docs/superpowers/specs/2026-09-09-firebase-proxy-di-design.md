# Firebase Proxy Configuration in `di`

**Date:** 2026-09-09
**Status:** Approved, pending implementation plan
**Packages:** `@sudobility/di`, `@sudobility/auth_lib`, ~41 web and RN apps

## Problem

The China reverse proxy (`firebase-china-proxy`) fronts six Google hosts so
Firebase Auth, Remote Config and Analytics keep working for mainland-China
users. Its client shim currently lives in `auth_lib`, which is wrong on two
counts.

First, scope. The proxy covers Analytics, Remote Config and Installations as
well as Auth, but it sits in an auth package. Ten apps import `@sudobility/di`
without `auth_lib` and get no proxy at all today, even for Analytics.

Second, configuration. `auth_lib/src/config/firebase-proxy.ts` hardcodes

```ts
export const DEFAULT_FIREBASE_PROXY_ORIGIN =
  'https://firebaseproxy.sudobility.com';
```

and auto-runs detection as an import-time side effect. A library should not
carry infrastructure defaults or decide policy on import; the consuming app
should supply the origin.

## Decision

Move the proxy core to `di`, expose a `setFirebaseProxy(origin)` setter, and
delete the default. Apps read an environment variable and call the setter. If
the setter is never called, the value is blank and standard Firebase is used.

## Placement

New file `di/src/firebase/firebase-proxy.ts`, moved from
`auth_lib/src/config/firebase-proxy.ts` with the default constant stripped.
Exported from `di/src/firebase/index.ts` and re-exported through both
`di/src/web/index.ts` and `di/src/rn/index.ts`.

Rationale:

- `di/src/firebase/firebase.interface.ts` already declares `AnalyticsService`,
  `RemoteConfigService`, `FCMService` and `FirebaseService` — the same
  Firebase-wide surface the proxy covers.
- `auth_lib` peer-depends on `@sudobility/di`; `di` does not depend on
  `auth_lib`. Moving the code down the dependency graph is cycle-free.
- 31 apps import `auth_lib`; 60+ import `di`.
- The mechanism is a global `fetch` wrapper rewriting hostnames to path
  prefixes. It is platform-agnostic, so it belongs in `di` core rather than
  in `di_web` or `di_rn`, which hold platform-specific implementations.
- `di` already uses this convention: `initializeInfoService()`,
  `initializeFirebaseAnalytics()` — a singleton configured once at startup.

## Public API

```ts
setFirebaseProxy(origin?: string | null): void   // blank => standard Firebase
getFirebaseProxyOrigin(): string | null
isFirebaseProxyActive(): boolean
firebaseProxyReady(): Promise<boolean>
forceFirebaseProxy(origin: string): void
disableFirebaseProxy(): void
rewriteFirebaseProxyUrl(url: string, origin: string): string
isFirebaseReachable(timeoutMs?: number): Promise<boolean>
```

`DEFAULT_FIREBASE_PROXY_ORIGIN` is removed. The library reads no environment
variables. `forceFirebaseProxy` now requires an explicit origin, since there
is no default to fall back to.

## Behavior

`setFirebaseProxy(origin)` trims its input.

A blank, `null` or `undefined` origin clears any configured origin, uninstalls
routing and returns. No probe runs, no timezone check, no cost — this is the
standard-Firebase path.

A non-blank origin is stored, then detection runs, memoized once per session:

1. A fresh cached verdict (24h) applies immediately.
2. Otherwise a mainland-China timezone pre-enables routing, so the first
   requests are not lost while the probe is in flight.
3. The reachability probe against `https://www.googleapis.com/generate_204`
   confirms or corrects the decision and refreshes the cache — including
   turning routing back off when Google became directly reachable again.

Calling the setter again with a different origin re-points the wrapper and
re-runs detection. Calling it with the same origin is a no-op.

`firebaseProxyReady()` resolves to whether traffic is being routed through the
proxy. With no origin configured it resolves `false` immediately, without
starting a probe. With an origin configured it resolves once detection
settles, and repeat callers share the one in-flight detection run.
`isFirebaseProxyActive()` is its synchronous counterpart, reporting the
current state without waiting for a pending probe.

The existing `globalThis.__SUDOBILITY_FIREBASE_PROXY_FORCED` escape hatch is
preserved, so `sudojo_app/src/config/force-firebase-proxy.ts` needs no change.

## auth_lib migration

`auth_lib` re-exports the proxy symbols from `@sudobility/di`, so existing
imports across 31 apps keep compiling.

Deleted:

- `DEFAULT_FIREBASE_PROXY_ORIGIN`
- `src/config/firebase-proxy-auto.ts`
- `src/config/firebase-proxy-auto.native.ts`
- the import-time side effect in `src/index.ts` and `src/index.rn.ts`

Kept, because they are genuinely auth-specific:

- `filterAuthProvidersForProxy` (`src/config/firebase-proxy-providers.ts`)
- `useProxyFilteredAuthProviders` (`src/hooks/`), rewired from
  `autoConfigureFirebaseProxy()` to `firebaseProxyReady()`

## App wiring

The target set is **deployable web and RN applications** that import
`@sudobility/di` — roughly 41 repos. Libraries and client packages that also
depend on `di` (`mixr_client`, `sudojo_lib`, `whisperly_client`,
`mail_box_indexer_client`, `ratelimit_client`, `heavymath_ui`,
`building_blocks`, and similar) are explicitly out of scope: a library must
not call the setter, for the same reason `di` must not read the environment.
The implementation plan will pin the exact repo list before any edits.

Each app gets one environment variable and one call, placed as early as
possible in the entry module, before `initializeApp()`.

```ts
// web: src/main.tsx, first import
setFirebaseProxy(import.meta.env.VITE_FIREBASE_PROXY_ORIGIN);

// RN: index.js or App.tsx
setFirebaseProxy(process.env.EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN);
```

Variable names follow existing conventions: `VITE_FIREBASE_PROXY_ORIGIN` for
Vite apps and browser extensions, `EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN` for
React Native.

Both `.env` and `.env.example` get the real value,
`https://firebaseproxy.sudobility.com`. The proxy host is public
infrastructure — it already ships as a hardcoded constant in every bundle —
so there is nothing to withhold from the example file.

The ten apps that use `di` without `auth_lib`, and therefore gain proxy
coverage they do not have today: `mail_box_rn`, `mail_box_wallet`,
`mail_box_wallet_landing`, `mail_box_oauth`, `dimensions_web`, `sudobility`,
`sudobility_design`, `wcprediction_app`, `music_app_rn`, `sanity-web`.

## Edge cases

**No `fetch`.** SSR and prerender paths without a global `fetch` return false
from detection and never patch, unchanged from today.

**React Native native SDKs.** The wrapper covers the Firebase **JS** SDK only.
`@react-native-firebase` native modules do not route through JS `fetch` and
stay direct. This is a pre-existing limitation, but it becomes more visible
once RN apps opt in explicitly, so it must be documented in the `di` README
and in `di`'s CLAUDE.md.

**Empty string from an env file.** `.env` entries are empty strings, not
`undefined`. `setFirebaseProxy('')` must be treated as unset. This is why the
setter trims and checks for blank rather than relying on `??`.

## Testing

`firebase-proxy.test.ts` and `firebase-proxy-auto.test.ts` move from
`auth_lib` to `di`, plus new cases:

- unset origin installs nothing and runs no probe
- blank string and whitespace-only string behave as unset
- set, then clear, then re-set
- re-set with a different origin re-points routing
- probe failure routes through the proxy
- probe success disables routing and caches the verdict

`auth_lib` keeps a test asserting its re-export surface, and one asserting
that importing `auth_lib` no longer triggers proxy detection.

Apps get no new tests; typecheck and build are the gate.

## Publish order

1. `di` — minor bump, new API
2. `auth_lib` — bump `di` dependency, re-export, drop the auto-run
3. the ~41 apps — bump deps, add the env var and the setter call

Between steps 2 and 3 an app that upgrades `auth_lib` without adding the
setter loses proxying. That is correct under the new contract, but it means
the apps must be updated as one batch rather than trickled.

## Accepted consequence

Today every `auth_lib` app proxies automatically via the hardcoded constant.
After this change, an app that does not call `setFirebaseProxy` goes direct to
Google and will be blocked in mainland China. The step-3 sweep is what keeps
coverage intact. This behavior change is intentional and was explicitly
acknowledged when the design was approved.
