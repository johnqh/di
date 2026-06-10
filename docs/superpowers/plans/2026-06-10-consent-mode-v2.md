# Google Consent Mode v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace broken Firebase `setConsent()` call with proper gtag-based Google Consent Mode v2 defaults so GA4 operates in cookieless mode and actually sends events.

**Architecture:** Push consent defaults to `window.dataLayer` as a gtag command array before Firebase Analytics initializes. This tells the Google tag to start in consent mode, sending cookieless pings instead of suppressing events entirely.

**Tech Stack:** Firebase Web SDK, gtag consent API via `window.dataLayer`, TypeScript, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/web/types.d.ts` | Modify | Add `Window.dataLayer` type declaration |
| `src/firebase/firebase.web.ts` | Modify | Replace `setConsent()` with gtag consent defaults |
| `tests/firebase/firebase-web.test.ts` | Create | Test consent defaults are pushed before analytics init |

---

### Task 1: Add Window.dataLayer type declaration

**Files:**
- Modify: `src/web/types.d.ts` (add to end of file)

- [ ] **Step 1: Add the dataLayer type to the Window interface**

Add this at the end of `src/web/types.d.ts`:

```typescript
/**
 * Google Tag Manager / gtag.js dataLayer
 * Used for Google Consent Mode v2 defaults
 */
interface Window {
  dataLayer?: unknown[];
}
```

- [ ] **Step 2: Run typecheck to verify**

Run: `cd /Users/johnhuang/projects/di && bun run typecheck`
Expected: No new errors (existing errors, if any, unchanged)

- [ ] **Step 3: Commit**

```bash
cd /Users/johnhuang/projects/di
git add src/web/types.d.ts
git commit -m "feat: add Window.dataLayer type declaration for Consent Mode v2"
```

---

### Task 2: Write test for consent mode defaults

**Files:**
- Create: `tests/firebase/firebase-web.test.ts`

- [ ] **Step 1: Write the test file**

Create `tests/firebase/firebase-web.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock firebase/app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]', options: {} })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ name: '[DEFAULT]', options: {} })),
}));

// Mock firebase/analytics
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({ app: { name: '[DEFAULT]' } })),
  logEvent: vi.fn(),
  setUserProperties: vi.fn(),
  setUserId: vi.fn(),
}));

// Mock @firebase/analytics — should NOT be called after our change
vi.mock('@firebase/analytics', () => ({
  setConsent: vi.fn(),
}));

// Mock firebase/remote-config
vi.mock('firebase/remote-config', () => ({
  getRemoteConfig: vi.fn(() => ({ app: { name: '[DEFAULT]' } })),
  fetchAndActivate: vi.fn(),
  getValue: vi.fn(),
  getAll: vi.fn(() => ({})),
}));

// Mock firebase/messaging
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({ app: { name: '[DEFAULT]' } })),
  getToken: vi.fn(),
  onMessage: vi.fn(),
  deleteToken: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));

const TEST_CONFIG = {
  apiKey: 'test-key',
  authDomain: 'test.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test.appspot.com',
  messagingSenderId: '123456',
  appId: '1:123456:web:abc',
};

describe('WebFirebaseService consent mode', () => {
  beforeEach(() => {
    // Ensure window exists in test environment
    if (typeof globalThis.window === 'undefined') {
      (globalThis as Record<string, unknown>).window = {};
    }
    delete (window as Record<string, unknown>).dataLayer;
    vi.resetModules();
  });

  afterEach(() => {
    delete (window as Record<string, unknown>).dataLayer;
    vi.restoreAllMocks();
  });

  it('should push consent defaults to window.dataLayer before analytics init', async () => {
    const { WebFirebaseService } = await import(
      '../../src/firebase/firebase.web.js'
    );

    new WebFirebaseService(TEST_CONFIG);

    expect(window.dataLayer).toBeDefined();
    expect(window.dataLayer!.length).toBeGreaterThan(0);

    // The consent command is pushed as a single array entry: ['consent', 'default', {...}]
    const consentEntry = window.dataLayer!.find(
      (entry) =>
        Array.isArray(entry) && entry[0] === 'consent' && entry[1] === 'default'
    ) as unknown[] | undefined;

    expect(consentEntry).toBeDefined();
    expect(consentEntry![2]).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('should not call setConsent from @firebase/analytics', async () => {
    const { setConsent } = await import('@firebase/analytics');
    const { WebFirebaseService } = await import(
      '../../src/firebase/firebase.web.js'
    );

    new WebFirebaseService(TEST_CONFIG);

    expect(setConsent).not.toHaveBeenCalled();
  });

  it('should not push consent defaults when analytics is disabled', async () => {
    const { WebFirebaseService } = await import(
      '../../src/firebase/firebase.web.js'
    );

    new WebFirebaseService(TEST_CONFIG, { enableAnalytics: false });

    expect(window.dataLayer).toBeUndefined();
  });

  it('should preserve existing dataLayer entries', async () => {
    (window as Record<string, unknown>).dataLayer = [{ event: 'existing' }];

    const { WebFirebaseService } = await import(
      '../../src/firebase/firebase.web.js'
    );

    new WebFirebaseService(TEST_CONFIG);

    expect(window.dataLayer![0]).toEqual({ event: 'existing' });
    expect(window.dataLayer!.length).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/johnhuang/projects/di && bun run test -- tests/firebase/firebase-web.test.ts`
Expected: FAIL — the current code uses `setConsent()` and doesn't push to `window.dataLayer`

- [ ] **Step 3: Commit the failing test**

```bash
cd /Users/johnhuang/projects/di
git add tests/firebase/firebase-web.test.ts
git commit -m "test: add failing tests for Consent Mode v2 dataLayer defaults"
```

---

### Task 3: Replace setConsent with gtag consent defaults

**Files:**
- Modify: `src/firebase/firebase.web.ts:14` (remove `setConsent` import)
- Modify: `src/firebase/firebase.web.ts:343-364` (replace `initializeAnalytics()` body)

- [ ] **Step 1: Remove the `setConsent` import**

In `src/firebase/firebase.web.ts`, delete line 14:

```typescript
// DELETE this line:
import { setConsent } from '@firebase/analytics';
```

- [ ] **Step 2: Replace the `initializeAnalytics()` method**

In `src/firebase/firebase.web.ts`, replace the `initializeAnalytics()` method (lines 343-364) with:

```typescript
  private initializeAnalytics(): Analytics | null {
    if (
      !this.app ||
      !this.options.enableAnalytics ||
      typeof window === 'undefined'
    ) {
      return null;
    }

    try {
      // Google Consent Mode v2 — push defaults BEFORE the tag loads.
      // With all consent types denied, GA4 sends cookieless pings
      // (no _ga/_gid cookies) and uses behavioral modeling for reporting.
      // Format: single array entry matching gtag() command queue convention.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push([
        'consent',
        'default',
        {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        },
      ]);

      return getAnalytics(this.app);
    } catch (error) {
      console.error('Error initializing Analytics:', error);
      return null;
    }
  }
```

- [ ] **Step 3: Run typecheck**

Run: `cd /Users/johnhuang/projects/di && bun run typecheck`
Expected: PASS (no errors about missing `setConsent` since it's no longer imported)

- [ ] **Step 4: Run the consent mode tests**

Run: `cd /Users/johnhuang/projects/di && bun run test -- tests/firebase/firebase-web.test.ts`
Expected: PASS — all 4 tests green

- [ ] **Step 5: Run the full test suite**

Run: `cd /Users/johnhuang/projects/di && bun run test`
Expected: PASS — no regressions

- [ ] **Step 6: Commit**

```bash
cd /Users/johnhuang/projects/di
git add src/firebase/firebase.web.ts tests/firebase/firebase-web.test.ts
git commit -m "feat: implement Google Consent Mode v2 via gtag dataLayer defaults

Replace Firebase SDK setConsent() (which fired 'update' and suppressed
all events) with gtag consent 'default' push to window.dataLayer. This
activates proper Consent Mode v2: GA4 sends cookieless pings, no
_ga/_gid cookies are set, and all four v2-required consent types
(analytics_storage, ad_storage, ad_user_data, ad_personalization) are
denied by default."
```
