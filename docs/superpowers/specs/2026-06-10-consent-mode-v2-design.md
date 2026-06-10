# Google Consent Mode v2 (Always Denied) Design

## Problem

Commit `57e661b` added `setConsent({ analytics_storage: 'denied', ad_storage: 'denied' })` from `@firebase/analytics` before `getAnalytics()` in `firebase.web.ts`. This was intended to enable cookieless GA4 operation, but it broke analytics entirely — no events reach GA4.

**Root cause:** Firebase SDK's `setConsent()` internally calls `gtag('consent', 'update', ...)`. Without a prior `gtag('consent', 'default', ...)` call, the Google tag never enters consent mode — it interprets the update as "user revoked consent" and suppresses all event dispatch, including cookieless pings.

## Solution

Replace the Firebase `setConsent()` call with a `gtag('consent', 'default', ...)` push to `window.dataLayer` before `getAnalytics()`. This is the canonical Google Consent Mode v2 implementation. The tag starts in consent mode from initialization, sending cookieless pings that GA4 processes via behavioral modeling.

All four Consent Mode v2 required types are set to `'denied'`:
- `analytics_storage` — no `_ga`/`_gid` cookies
- `ad_storage` — no ad cookies
- `ad_user_data` — no user data sent to Google Ads
- `ad_personalization` — no personalized ads

No consent update UI or `updateConsent()` API is needed — the app always runs in denied/cookieless mode.

## Changes

### `src/firebase/firebase.web.ts`

1. **Remove** `import { setConsent } from '@firebase/analytics'` (line 14)
2. **Replace** the `setConsent({...})` call in `initializeAnalytics()` with:

```typescript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
});
```

### `src/web/types.d.ts`

Add global type declaration for `window.dataLayer`:

```typescript
interface Window {
  dataLayer?: unknown[];
}
```

### No changes needed

- `firebase.interface.ts` — no new types or options
- `firebase-analytics.ts` — wrapper unchanged
- `firebase.rn.ts` — RN has no gtag/cookie concept
- All existing tests — behavior unchanged from test perspective

## How It Works

1. Before `getAnalytics()`, consent defaults are pushed to `window.dataLayer`
2. When the Google tag initializes (via Firebase SDK), it reads the dataLayer and enters consent mode
3. In consent mode with `analytics_storage: 'denied'`, the tag sends cookieless pings to GA4
4. GA4 uses behavioral modeling to fill reporting gaps from cookieless data
5. No first-party cookies (`_ga`, `_gid`) are ever set

## Testing

- Verify no `_ga` or `_gid` cookies are set in the browser
- Verify events appear in GA4 DebugView / Realtime reports
- Verify `logEvent()`, `setUserId()`, `setUserProperties()` still function without errors
