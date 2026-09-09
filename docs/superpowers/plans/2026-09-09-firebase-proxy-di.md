# Firebase Proxy in `di` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Firebase China proxy from `auth_lib` into `@sudobility/di` behind a `setFirebaseProxy(origin)` setter that carries no default and reads no environment variables, then have 40 apps supply the origin from their own env.

**Architecture:** The proxy is a global `fetch` + `sendBeacon` wrapper that rewrites six Google hostnames to path prefixes on a proxy origin. It moves to `di/src/firebase/firebase-proxy.ts` and is re-exported through `di/src/web/index.ts` and `di/src/rn/index.ts`. `auth_lib` re-exports the same symbols so existing imports keep compiling, but loses its hardcoded default and its import-time auto-run. Apps call the setter once in their entry module.

**Tech Stack:** TypeScript, Bun, vitest, Vite (web apps), React Native, npm scope `@sudobility/*`.

**Spec:** `di/docs/superpowers/specs/2026-09-09-firebase-proxy-di-design.md`

## Global Constraints

- Package manager is **Bun** everywhere. Never `npm`/`yarn`/`pnpm`.
- The library must **never** read `process.env` or `import.meta.env`. Origin arrives only as a function argument.
- No default proxy origin anywhere in `di` or `auth_lib`. `DEFAULT_FIREBASE_PROXY_ORIGIN` is deleted, not deprecated.
- Blank input (`''`, whitespace-only, `null`, `undefined`) means **standard Firebase**: no wrapper routing, no probe, no timezone check.
- Proxy origin value used by apps: `https://firebaseproxy.sudobility.com`
- Env var names: `VITE_FIREBASE_PROXY_ORIGIN` (Vite apps and extensions), `EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN` (React Native).
- Both `.env` and `.env.example` get the real URL. The proxy host is public infrastructure.
- Commit directly on `main` (or the repo's current branch); no feature branches.
- Test command in `di` and `auth_lib`: `bun run test` (vitest).
- Libraries and client packages that depend on `di` must **not** call the setter. Apps only.
- `di` enforces a **95% coverage threshold** (branches, functions, lines, statements) via `vitest.config.ts`. New code in `src/firebase/firebase-proxy.ts` must be covered or the suite fails.
- `di` tests live in `tests/`, NOT co-located in `src/`. `vitest.config.ts` sets `include: ['tests/**/*.{test,spec}.*']`, so a test placed under `src/` silently never runs.
- `di`'s vitest `environment` is `'node'`: there is no `localStorage`, no `window`, no `document`. Stub what the code under test needs.

---

### Task 1: Move the proxy core into `di` with the new setter

**Files:**
- Create: `di/src/firebase/firebase-proxy.ts`
- Test: `di/tests/firebase/firebase-proxy.test.ts`
- Reference (do not modify yet): `auth_lib/src/config/firebase-proxy.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `setFirebaseProxy(origin?: string | null): void`
  - `getFirebaseProxyOrigin(): string | null`
  - `isFirebaseProxyActive(): boolean`
  - `firebaseProxyReady(): Promise<boolean>`
  - `forceFirebaseProxy(origin: string): void`
  - `disableFirebaseProxy(): void`
  - `rewriteFirebaseProxyUrl(url: string, proxyOrigin: string): string`
  - `isFirebaseReachable(timeoutMs?: number): Promise<boolean>`
  - `isLikelyChinaRegion(): boolean`
  - `isTestEnvironment(): boolean`
  - `resetFirebaseProxyForTests(): void`

- [ ] **Step 1: Copy the source file as the starting point**

```bash
cd /Users/johnhuang/projects
cp auth_lib/src/config/firebase-proxy.ts di/src/firebase/firebase-proxy.ts
```

- [ ] **Step 2: Write the failing tests for the new setter semantics**

Create `di/tests/firebase/firebase-proxy.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  disableFirebaseProxy,
  firebaseProxyReady,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  resetFirebaseProxyForTests,
  rewriteFirebaseProxyUrl,
  setFirebaseProxy,
} from '../../src/firebase/firebase-proxy';

const PROXY = 'https://fb-api.example.com';
const OTHER = 'https://fb-alt.example.com';
const SIGNIN =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=abc';

// vitest runs with environment: 'node', which provides no localStorage.
// The proxy caches its probe verdict there, so stub it before each test.
const memoryStore = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStore.set(k, v),
  removeItem: (k: string) => void memoryStore.delete(k),
  clear: () => memoryStore.clear(),
};

beforeEach(() => {
  resetFirebaseProxyForTests();
  memoryStore.clear();
  vi.stubGlobal('localStorage', localStorageStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('setFirebaseProxy - blank input means standard Firebase', () => {
  it.each([undefined, null, '', '   '])(
    'treats %p as unset',
    async (value) => {
      setFirebaseProxy(value as string | null | undefined);
      expect(getFirebaseProxyOrigin()).toBeNull();
      expect(isFirebaseProxyActive()).toBe(false);
      await expect(firebaseProxyReady()).resolves.toBe(false);
    }
  );

  it('runs no reachability probe when unset', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    setFirebaseProxy('');
    await firebaseProxyReady();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('setFirebaseProxy - configured origin', () => {
  it('stores a trimmed origin', () => {
    setFirebaseProxy(`  ${PROXY}  `);
    expect(getFirebaseProxyOrigin()).toBe(PROXY);
  });

  it('routes when the probe reports Google unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('blocked')))
    );
    setFirebaseProxy(PROXY);
    await expect(firebaseProxyReady()).resolves.toBe(true);
    expect(isFirebaseProxyActive()).toBe(true);
  });

  it('does not route when the probe reports Google reachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response(null, { status: 204 })))
    );
    setFirebaseProxy(PROXY);
    await expect(firebaseProxyReady()).resolves.toBe(false);
    expect(isFirebaseProxyActive()).toBe(false);
  });
});

describe('setFirebaseProxy - re-setting', () => {
  it('re-points routing when called with a different origin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('blocked')))
    );
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();
    setFirebaseProxy(OTHER);
    await firebaseProxyReady();
    expect(getFirebaseProxyOrigin()).toBe(OTHER);
  });

  it('clears routing when re-set to blank', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('blocked')))
    );
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();
    expect(isFirebaseProxyActive()).toBe(true);

    setFirebaseProxy('');
    expect(getFirebaseProxyOrigin()).toBeNull();
    expect(isFirebaseProxyActive()).toBe(false);
  });
});

describe('rewriteFirebaseProxyUrl', () => {
  it('rewrites identitytoolkit URLs preserving path and query', () => {
    expect(rewriteFirebaseProxyUrl(SIGNIN, PROXY)).toBe(
      `${PROXY}/identitytoolkit/v1/accounts:signInWithPassword?key=abc`
    );
  });

  it('leaves unrelated hosts untouched', () => {
    const url = 'https://example.com/thing';
    expect(rewriteFirebaseProxyUrl(url, PROXY)).toBe(url);
  });
});

describe('environments without fetch', () => {
  it('never patches when globalThis.fetch is undefined', async () => {
    vi.stubGlobal('fetch', undefined);
    setFirebaseProxy(PROXY);
    await expect(firebaseProxyReady()).resolves.toBe(false);
    expect(isFirebaseProxyActive()).toBe(false);
  });
});

describe('disableFirebaseProxy', () => {
  it('stops routing and clears the configured origin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('blocked')))
    );
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();

    disableFirebaseProxy();
    expect(isFirebaseProxyActive()).toBe(false);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd /Users/johnhuang/projects/di && bun run test tests/firebase/firebase-proxy.test.ts`
Expected: FAIL — `setFirebaseProxy`, `isFirebaseProxyActive`, `firebaseProxyReady` and `resetFirebaseProxyForTests` are not exported.

- [ ] **Step 4: Delete the default constant**

In `di/src/firebase/firebase-proxy.ts`, remove lines 32-34:

```typescript
/** Default reverse proxy operated by Sudobility. */
export const DEFAULT_FIREBASE_PROXY_ORIGIN =
  'https://firebaseproxy.sudobility.com';
```

- [ ] **Step 5: Add module state for the configured origin**

Next to the existing `let activeProxyOrigin: string | null = null;` block, add:

```typescript
/** Origin supplied by the app via setFirebaseProxy(); null when unset. */
let configuredOrigin: string | null = null;
```

- [ ] **Step 6: Make `installFirebaseProxy` and `forceFirebaseProxy` require an origin**

Replace the two signatures that defaulted to the deleted constant:

```typescript
export function installFirebaseProxy(proxyOrigin: string): void {
  if (activeProxyOrigin === proxyOrigin) {
    return;
  }
  activeProxyOrigin = proxyOrigin;
  ensureWrapperInstalled();
}

export function forceFirebaseProxy(proxyOrigin: string): void {
  forcedByCaller = true;
  activeProxyOrigin = proxyOrigin;
  ensureWrapperInstalled();
}
```

Note the changed idempotence rule: the old code returned early whenever *any*
origin was active, so re-pointing was impossible. It now returns early only
when the origin is unchanged.

- [ ] **Step 7: Add the setter, the readiness accessor and the test reset**

Append to `di/src/firebase/firebase-proxy.ts`:

```typescript
/**
 * Configure the Firebase reverse proxy origin. The library never reads the
 * environment — the app passes its own configured value in.
 *
 * A blank, null or undefined origin means standard Firebase: routing is
 * uninstalled, and no reachability probe or timezone check runs.
 *
 * A non-blank origin starts memoized detection: a fresh cached verdict
 * applies immediately, a mainland-China timezone pre-enables routing, and
 * the reachability probe then confirms or corrects the decision.
 *
 * @param origin - Proxy origin, e.g. https://firebaseproxy.example.com
 */
export function setFirebaseProxy(origin?: string | null): void {
  const trimmed = typeof origin === 'string' ? origin.trim() : '';

  if (!trimmed) {
    configuredOrigin = null;
    autoConfigurePromise = null;
    disableFirebaseProxy();
    return;
  }

  if (configuredOrigin === trimmed) {
    return;
  }

  configuredOrigin = trimmed;
  autoConfigurePromise = null;
  void autoConfigureFirebaseProxy({ proxyOrigin: trimmed });
}

/**
 * Resolves to whether Firebase traffic is being routed through the proxy.
 * With no origin configured it resolves false immediately without probing.
 * Repeat callers share the single in-flight detection run.
 */
export function firebaseProxyReady(): Promise<boolean> {
  if (!configuredOrigin) {
    return Promise.resolve(false);
  }
  return autoConfigureFirebaseProxy({ proxyOrigin: configuredOrigin });
}

/** Synchronous counterpart to firebaseProxyReady(). */
export function isFirebaseProxyActive(): boolean {
  return activeProxyOrigin !== null;
}

/** Reset all module state. Test-only. */
export function resetFirebaseProxyForTests(): void {
  configuredOrigin = null;
  activeProxyOrigin = null;
  autoConfigurePromise = null;
  forcedByCaller = false;
}
```

- [ ] **Step 8: Make `getFirebaseProxyOrigin` report the configured origin**

Replace the body of the existing `getFirebaseProxyOrigin`:

```typescript
export function getFirebaseProxyOrigin(): string | null {
  return configuredOrigin;
}
```

- [ ] **Step 9: Make `disableFirebaseProxy` clear the configured origin too**

Replace its body:

```typescript
export function disableFirebaseProxy(): void {
  forcedByCaller = false;
  activeProxyOrigin = null;
  configuredOrigin = null;
}
```

- [ ] **Step 10: Fix `runAutoConfigure` to require an explicit origin**

In `runAutoConfigure`, replace the line that fell back to the deleted constant:

```typescript
const proxyOrigin = options.proxyOrigin;
if (!proxyOrigin) {
  return false;
}
```

And in the same function, replace `forceFirebaseProxy(forcedOrigin ?? proxyOrigin)` with:

```typescript
forceFirebaseProxy(forcedOrigin ?? proxyOrigin);
```

(unchanged in shape, but now `proxyOrigin` is guaranteed non-empty by the guard above).

- [ ] **Step 11: Run the tests to verify they pass**

Run: `cd /Users/johnhuang/projects/di && bun run test tests/firebase/firebase-proxy.test.ts`
Expected: PASS, all cases.

- [ ] **Step 12: Typecheck**

Run: `cd /Users/johnhuang/projects/di && bun run typecheck`
Expected: no errors.

- [ ] **Step 13: Commit**

```bash
cd /Users/johnhuang/projects/di
git add src/firebase/firebase-proxy.ts tests/firebase/firebase-proxy.test.ts
git commit -m "feat: add Firebase proxy core with setFirebaseProxy setter

Moved from auth_lib. No default origin and no environment reads: the app
supplies the origin, and a blank value means standard Firebase."
```

---

### Task 2: Export the proxy from `di`'s public entries

**Files:**
- Modify: `di/src/firebase/index.ts`
- Modify: `di/src/web/index.ts:52` (after the firebase-analytics export block)
- Modify: `di/src/rn/index.ts:53` (after the firebase-analytics export block)
- Test: `di/tests/firebase/firebase-proxy-exports.test.ts`

**Interfaces:**
- Consumes: every symbol produced by Task 1.
- Produces: the same symbols importable from `@sudobility/di` on both the web and rn entry points.

- [ ] **Step 1: Write the failing export test**

Create `di/tests/firebase/firebase-proxy-exports.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import * as webEntry from '../../src/web/index';

const REQUIRED = [
  'setFirebaseProxy',
  'getFirebaseProxyOrigin',
  'isFirebaseProxyActive',
  'firebaseProxyReady',
  'forceFirebaseProxy',
  'disableFirebaseProxy',
  'rewriteFirebaseProxyUrl',
  'isFirebaseReachable',
] as const;

describe('di web entry', () => {
  it.each(REQUIRED)('exports %s', (name) => {
    expect(typeof (webEntry as Record<string, unknown>)[name]).toBe('function');
  });

  it('does not export a default proxy origin', () => {
    expect(
      (webEntry as Record<string, unknown>).DEFAULT_FIREBASE_PROXY_ORIGIN
    ).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /Users/johnhuang/projects/di && bun run test tests/firebase/firebase-proxy-exports.test.ts`
Expected: FAIL — the symbols are undefined on the web entry.

- [ ] **Step 3: Export from the firebase barrel**

Append to `di/src/firebase/index.ts`:

```typescript
// Export the China reverse-proxy configuration
export {
  setFirebaseProxy,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  firebaseProxyReady,
  forceFirebaseProxy,
  disableFirebaseProxy,
  installFirebaseProxy,
  rewriteFirebaseProxyUrl,
  isFirebaseReachable,
  isLikelyChinaRegion,
  isTestEnvironment,
  resetFirebaseProxyForTests,
  type AutoConfigureFirebaseProxyOptions,
} from './firebase-proxy.js';
```

- [ ] **Step 4: Export from the web entry**

In `di/src/web/index.ts`, immediately after the `firebase-analytics.js` export block (around line 52), add:

```typescript
// Firebase - China reverse proxy
export {
  setFirebaseProxy,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  firebaseProxyReady,
  forceFirebaseProxy,
  disableFirebaseProxy,
  installFirebaseProxy,
  rewriteFirebaseProxyUrl,
  isFirebaseReachable,
  isLikelyChinaRegion,
} from '../firebase/firebase-proxy.js';
```

- [ ] **Step 5: Export from the rn entry**

In `di/src/rn/index.ts`, immediately after the `firebase-analytics.js` export block (around line 53), add the identical block:

```typescript
// Firebase - China reverse proxy
export {
  setFirebaseProxy,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  firebaseProxyReady,
  forceFirebaseProxy,
  disableFirebaseProxy,
  installFirebaseProxy,
  rewriteFirebaseProxyUrl,
  isFirebaseReachable,
  isLikelyChinaRegion,
} from '../firebase/firebase-proxy.js';
```

- [ ] **Step 6: Run the export test to verify it passes**

Run: `cd /Users/johnhuang/projects/di && bun run test tests/firebase/firebase-proxy-exports.test.ts`
Expected: PASS.

- [ ] **Step 7: Run the whole `di` suite and typecheck**

Run: `cd /Users/johnhuang/projects/di && bun run test && bun run typecheck`
Expected: PASS, no type errors.

- [ ] **Step 8: Commit**

```bash
cd /Users/johnhuang/projects/di
git add src/firebase/index.ts src/web/index.ts src/rn/index.ts tests/firebase/firebase-proxy-exports.test.ts
git commit -m "feat: export Firebase proxy configuration from di web and rn entries"
```

---

### Task 3: Document the RN native-SDK limitation in `di`

**Files:**
- Modify: `di/README.md`
- Modify: `di/CLAUDE.md`

**Interfaces:**
- Consumes: the public API from Task 2.
- Produces: no code symbols. Documentation only.

This task exists because the spec calls the limitation out explicitly: RN apps
opting in will otherwise assume native Firebase traffic is covered when it is
not.

- [ ] **Step 1: Add a section to `di/README.md`**

Append:

```markdown
## Firebase China proxy

Firebase Auth, Remote Config, Installations and Analytics are unreachable from
mainland China. `di` can route that traffic through a reverse proxy
(see the `firebase-china-proxy` project).

The library holds no default and reads no environment variable. The app
supplies the origin:

```ts
import { setFirebaseProxy } from '@sudobility/di';

// web
setFirebaseProxy(import.meta.env.VITE_FIREBASE_PROXY_ORIGIN);
// react native
setFirebaseProxy(process.env.EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN);
```

Call it once, as early as possible in the entry module, before
`initializeApp()`. A blank value means standard Firebase — no routing, and no
reachability probe.

With an origin set, routing is decided automatically per session: a cached
verdict (24h) applies immediately, a mainland-China timezone pre-enables
routing, and a probe against `googleapis.com/generate_204` then confirms or
corrects it. Await `firebaseProxyReady()` if you need the settled decision.

**React Native limitation:** the proxy is a JavaScript `fetch` wrapper, so it
covers the Firebase **JS** SDK only. `@react-native-firebase` native modules
do not route through JS `fetch` and will still reach Google directly. RN apps
using the native SDKs are not fully covered by this mechanism.
```

- [ ] **Step 2: Add the same limitation note to `di/CLAUDE.md`**

Under the existing gotchas/patterns section, add:

```markdown
- **Firebase proxy is JS-only**: `setFirebaseProxy()` wraps `globalThis.fetch`
  and `navigator.sendBeacon`. It covers the Firebase JS SDK on both platforms,
  but NOT `@react-native-firebase` native modules. Never claim full RN
  coverage.
- **No defaults, no env reads**: `di` must not embed a proxy origin or read
  `process.env`/`import.meta.env`. The app passes the origin in.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/johnhuang/projects/di
git add README.md CLAUDE.md
git commit -m "docs: document Firebase proxy setup and RN native-SDK limitation"
```

---

### Task 4: Rewire `auth_lib` to re-export from `di`

**Files:**
- Delete: `auth_lib/src/config/firebase-proxy.ts`
- Delete: `auth_lib/src/config/firebase-proxy.test.ts`
- Delete: `auth_lib/src/config/firebase-proxy-auto.ts`
- Delete: `auth_lib/src/config/firebase-proxy-auto.native.ts`
- Delete: `auth_lib/src/config/firebase-proxy-auto.test.ts`
- Modify: `auth_lib/src/config/index.ts:16-23`
- Modify: `auth_lib/src/index.ts:27-36`
- Modify: `auth_lib/src/index.rn.ts:14-23`
- Modify: `auth_lib/src/hooks/useProxyFilteredAuthProviders.ts:31`
- Modify: `auth_lib/package.json` (bump the `@sudobility/di` floor)
- Test: `auth_lib/src/config/firebase-proxy-reexport.test.ts`

**Interfaces:**
- Consumes: every symbol exported from `@sudobility/di` in Task 2.
- Produces: the same symbols re-exported from `@sudobility/auth_lib`, minus
  `DEFAULT_FIREBASE_PROXY_ORIGIN` and `autoConfigureFirebaseProxy`. Keeps
  `filterAuthProvidersForProxy` and `useProxyFilteredAuthProviders`.

- [ ] **Step 1: Write the failing re-export test**

Create `auth_lib/src/config/firebase-proxy-reexport.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import * as authLib from '../index';

describe('auth_lib proxy surface', () => {
  it.each([
    'setFirebaseProxy',
    'getFirebaseProxyOrigin',
    'firebaseProxyReady',
    'disableFirebaseProxy',
    'isFirebaseReachable',
  ])('re-exports %s from di', (name) => {
    expect(typeof (authLib as Record<string, unknown>)[name]).toBe('function');
  });

  it('keeps the auth-specific provider filter', () => {
    expect(typeof authLib.filterAuthProvidersForProxy).toBe('function');
  });

  it('no longer exports a default proxy origin', () => {
    expect(
      (authLib as Record<string, unknown>).DEFAULT_FIREBASE_PROXY_ORIGIN
    ).toBeUndefined();
  });

  it('does not route Firebase traffic merely because it was imported', () => {
    expect(authLib.getFirebaseProxyOrigin()).toBeNull();
    expect(authLib.isFirebaseProxyActive()).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd /Users/johnhuang/projects/auth_lib && bun run test src/config/firebase-proxy-reexport.test.ts`
Expected: FAIL — `setFirebaseProxy` is not exported, and `DEFAULT_FIREBASE_PROXY_ORIGIN` is still defined.

- [ ] **Step 3: Delete the moved and obsolete files**

```bash
cd /Users/johnhuang/projects/auth_lib
git rm src/config/firebase-proxy.ts \
       src/config/firebase-proxy.test.ts \
       src/config/firebase-proxy-auto.ts \
       src/config/firebase-proxy-auto.native.ts \
       src/config/firebase-proxy-auto.test.ts
```

If `firebase-proxy-auto.test.ts` does not exist, drop it from the command
rather than letting `git rm` fail.

- [ ] **Step 4: Replace the proxy exports in `auth_lib/src/config/index.ts`**

Replace the block at lines 16-23 that re-exported from `./firebase-proxy` with:

```typescript
export {
  setFirebaseProxy,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  firebaseProxyReady,
  forceFirebaseProxy,
  disableFirebaseProxy,
  installFirebaseProxy,
  rewriteFirebaseProxyUrl,
  isFirebaseReachable,
  isLikelyChinaRegion,
} from '@sudobility/di';

export { filterAuthProvidersForProxy } from './firebase-proxy-providers';
```

- [ ] **Step 5: Update `auth_lib/src/index.ts`**

Replace the proxy export block at lines 27-36 with:

```typescript
export {
  setFirebaseProxy,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  firebaseProxyReady,
  forceFirebaseProxy,
  disableFirebaseProxy,
  installFirebaseProxy,
  rewriteFirebaseProxyUrl,
  isFirebaseReachable,
  isLikelyChinaRegion,
} from '@sudobility/di';
```

Then delete any `import './config/firebase-proxy-auto';` side-effect import in
this file.

- [ ] **Step 6: Update `auth_lib/src/index.rn.ts`**

Replace the proxy export block at lines 14-23 with the identical block from
Step 5, and delete any `import './config/firebase-proxy-auto.native';`
side-effect import.

- [ ] **Step 7: Rewire the hook**

In `auth_lib/src/hooks/useProxyFilteredAuthProviders.ts` line 31, replace:

```typescript
    void autoConfigureFirebaseProxy().then(() => {
```

with:

```typescript
    void firebaseProxyReady().then(() => {
```

and update that file's import to pull `firebaseProxyReady` from
`@sudobility/di` instead of `autoConfigureFirebaseProxy` from
`../config/firebase-proxy`.

- [ ] **Step 8: Resolve `di` locally for the test run**

Do **not** bump the published `@sudobility/di` floor here — that version does
not exist yet, and Task 8 owns it. To run this task's tests against the Task 1
and 2 code, link the local build:

```bash
cd /Users/johnhuang/projects/di && bun run build && bun link
cd /Users/johnhuang/projects/auth_lib && bun link @sudobility/di
```

Task 8 Step 2 replaces this link with the published version.

- [ ] **Step 9: Run the tests to verify they pass**

Run: `cd /Users/johnhuang/projects/auth_lib && bun run test`
Expected: PASS. The provider-filtering tests must still pass unchanged.

- [ ] **Step 10: Typecheck**

Run: `cd /Users/johnhuang/projects/auth_lib && bun run typecheck`
Expected: no errors. Any remaining reference to `DEFAULT_FIREBASE_PROXY_ORIGIN`
or `autoConfigureFirebaseProxy` surfaces here.

- [ ] **Step 11: Commit**

```bash
cd /Users/johnhuang/projects/auth_lib
git add -A
git commit -m "refactor!: re-export Firebase proxy from di, drop default and auto-run

The proxy core now lives in @sudobility/di. auth_lib re-exports it so
existing imports keep working, but no longer hardcodes an origin or
configures the proxy as an import side effect. Apps must call
setFirebaseProxy() with their own configured origin."
```

---

### Task 5: Wire one web app end to end (`sudojo_app`)

`sudojo_app` goes first because it already has proxy config and the
`__SUDOBILITY_FIREBASE_PROXY_FORCED` force toggle, so it is the only app where
the wiring can be verified against real behavior before the fleet sweep.

**Files:**
- Modify: `sudojo_app/src/main.tsx`
- Modify: `sudojo_app/.env`
- Modify: `sudojo_app/.env.example`
- Modify: `sudojo_app/src/vite-env.d.ts`

**Interfaces:**
- Consumes: `setFirebaseProxy` from `@sudobility/di`.
- Produces: the wiring pattern that Tasks 6 and 7 replicate verbatim.

- [ ] **Step 1: Add the env var to `.env.example`**

Append to `sudojo_app/.env.example`:

```bash
# -----------------------------------------------------------------------------
# FIREBASE CHINA PROXY
# -----------------------------------------------------------------------------
# Reverse proxy that keeps Firebase Auth, Remote Config and Analytics working
# for mainland-China users. Leave blank to use Firebase directly.
VITE_FIREBASE_PROXY_ORIGIN=https://firebaseproxy.sudobility.com
```

- [ ] **Step 2: Add the same key with the same value to `.env`**

Append to `sudojo_app/.env`:

```bash
VITE_FIREBASE_PROXY_ORIGIN=https://firebaseproxy.sudobility.com
```

- [ ] **Step 3: Declare the type**

In `sudojo_app/src/vite-env.d.ts`, add to the `ImportMetaEnv` interface:

```typescript
  readonly VITE_FIREBASE_PROXY_ORIGIN?: string;
```

- [ ] **Step 4: Call the setter in the entry module**

In `sudojo_app/src/main.tsx`, immediately after the existing
`import './config/force-firebase-proxy';` line (it must stay first), add:

```typescript
import { setFirebaseProxy } from '@sudobility/di';

setFirebaseProxy(import.meta.env.VITE_FIREBASE_PROXY_ORIGIN);
```

The call must run before any `initializeApp()`. If `main.tsx` imports a
Firebase bootstrap module, place the `setFirebaseProxy` call above that import
and leave a comment saying why.

- [ ] **Step 5: Typecheck and build**

Run: `cd /Users/johnhuang/projects/sudojo_app && bun run typecheck && bun run build`
Expected: both succeed.

- [ ] **Step 6: Verify the wiring in a browser**

Run `bun run dev`, open the app, and in the devtools console run:

```js
// with the env var set, this should report the configured origin
window.__SUDOBILITY_FIREBASE_PROXY_FORCED = true;
```

Reload, then confirm in the Network tab that identitytoolkit requests go to
`firebaseproxy.sudobility.com/identitytoolkit/...` rather than
`identitytoolkit.googleapis.com`. Then blank the env var, restart the dev
server, and confirm requests go direct to Google again.

Record both observations before moving on. If routing does not toggle, stop
and fix Task 1 rather than proceeding to the fleet sweep.

- [ ] **Step 7: Commit**

```bash
cd /Users/johnhuang/projects/sudojo_app
git add src/main.tsx src/vite-env.d.ts .env.example
git commit -m "feat: configure the Firebase China proxy from the environment"
```

Note `.env` is gitignored and is deliberately not staged.

---

### Task 6: Wire the remaining 23 web apps and 4 extensions

Apply the Task 5 pattern verbatim to each repo below. Each repo is an
independent commit.

**Web apps (23):** `dimensions_web`, `entitystarter_app`, `genuivo_app`,
`heavymath_app`, `mail_box`, `mail_box_oauth`, `mail_box_wallet_landing`,
`mixr`, `mogulgame_app`, `music_app`, `sanity-web`, `shaperouter_app`,
`shapeshyft_app`, `sider_app`, `starter_app`, `sudobility`,
`sudobility_design`, `svgr_app`, `tapayoka_buyer_app`, `tapayoka_vendor_app`,
`testomniac_app`, `wcprediction_app`, `whisperly_app`

**Extensions (4):** `sider_extension` (`src/sidepanel/main.tsx`),
`sudojo_extension` (`src/sidepanel/main.tsx`), `testomniac_extension`
(`src/sidepanel/main.tsx`), `mail_box_wallet` (`src/popup/main.tsx`)

**Files per repo:**
- Modify: `<repo>/src/main.tsx` (extensions: the entry listed above)
- Modify: `<repo>/.env`
- Modify: `<repo>/.env.example`
- Modify: `<repo>/src/vite-env.d.ts` if the repo has one

**Interfaces:**
- Consumes: `setFirebaseProxy` from `@sudobility/di`.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: For each repo, append to `.env.example`**

```bash
# -----------------------------------------------------------------------------
# FIREBASE CHINA PROXY
# -----------------------------------------------------------------------------
# Reverse proxy that keeps Firebase Auth, Remote Config and Analytics working
# for mainland-China users. Leave blank to use Firebase directly.
VITE_FIREBASE_PROXY_ORIGIN=https://firebaseproxy.sudobility.com
```

- [ ] **Step 2: For each repo, append the same key and value to `.env`**

```bash
VITE_FIREBASE_PROXY_ORIGIN=https://firebaseproxy.sudobility.com
```

- [ ] **Step 3: For each repo, add the type declaration**

If `<repo>/src/vite-env.d.ts` exists and declares an `ImportMetaEnv`
interface, add:

```typescript
  readonly VITE_FIREBASE_PROXY_ORIGIN?: string;
```

Skip repos without that file rather than creating one.

- [ ] **Step 4: For each repo, call the setter at the top of the entry module**

Add as the first statements of the entry file, above any Firebase bootstrap
import:

```typescript
import { setFirebaseProxy } from '@sudobility/di';

setFirebaseProxy(import.meta.env.VITE_FIREBASE_PROXY_ORIGIN);
```

- [ ] **Step 5: Typecheck and build each repo**

Run, per repo: `cd /Users/johnhuang/projects/<repo> && bun run typecheck && bun run build`
Expected: both succeed. A failure means that repo's entry module bootstraps
Firebase at import time above the setter — move the call higher.

- [ ] **Step 6: Commit each repo separately**

```bash
cd /Users/johnhuang/projects/<repo>
git add src/ .env.example
git commit -m "feat: configure the Firebase China proxy from the environment"
```

---

### Task 7: Wire the 12 React Native apps

**Repos and entry files:**
- `entitystarter_app_rn` — `App.tsx`
- `genuivo_app_rn` — `App.tsx`
- `mail_box_rn` — `App.tsx`
- `mogulgame_app_rn` — `App.tsx`
- `music_app_rn` — `index.js`
- `starter_app_rn` — `App.tsx`
- `sudojo_app_rn` — `App.tsx`
- `svgr_app_rn` — `App.tsx`
- `tapayoka_buyer_app_rn` — `App.tsx`
- `tapayoka_vendor_app_rn` — `App.tsx`
- `testomniac_app_rn` — `App.tsx`
- `wcprediction_app_rn` — `App.tsx`

**Files per repo:**
- Modify: the entry file listed above
- Modify: `<repo>/.env`
- Modify: `<repo>/.env.example`

**Interfaces:**
- Consumes: `setFirebaseProxy` from `@sudobility/di`.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: For each repo, append to `.env.example`**

```bash
# Firebase China Proxy
# Reverse proxy that keeps Firebase Auth, Remote Config and Analytics working
# for mainland-China users. Leave blank to use Firebase directly.
# NOTE: covers the Firebase JS SDK only; @react-native-firebase native
# modules still reach Google directly.
EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN=https://firebaseproxy.sudobility.com
```

- [ ] **Step 2: For each repo, append the same key and value to `.env`**

```bash
EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN=https://firebaseproxy.sudobility.com
```

- [ ] **Step 3: For each repo, call the setter at the top of the entry file**

Add as the first statements, above every other import that could touch
Firebase:

```typescript
import { setFirebaseProxy } from '@sudobility/di';

setFirebaseProxy(process.env.EXPO_PUBLIC_FIREBASE_PROXY_ORIGIN);
```

For `music_app_rn` the entry is `index.js`, so use the same two lines there.

- [ ] **Step 4: Confirm the var survives bundling in the unprefixed repos**

`svgr_app_rn` reads bare (unprefixed) names via babel
`transform-inline-environment-variables` against `.env.merged`. In that repo
only, also add the key to whatever `.env.merged` generation script it uses
(`scripts/merge-env.js`), so the value reaches the bundle.

`testomniac_app_rn` and `wcprediction_app_rn` do **not** load `.env.merged`.
`EXPO_PUBLIC_*` is inlined for them by the standard RN transform, so the new
key works — but note this is why the plan uses the `EXPO_PUBLIC_` prefix
rather than a bare name.

- [ ] **Step 5: Typecheck each repo**

Run, per repo: `cd /Users/johnhuang/projects/<repo> && bun run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit each repo separately**

```bash
cd /Users/johnhuang/projects/<repo>
git add App.tsx .env.example    # music_app_rn: index.js instead of App.tsx
git commit -m "feat: configure the Firebase China proxy from the environment"
```

---

### Task 8: Publish and roll out

This task is sequenced last because every app in Tasks 6 and 7 needs the
published `di` and `auth_lib` versions before its build can resolve
`setFirebaseProxy`.

**Files:**
- Modify: `di/package.json` (version)
- Modify: `auth_lib/package.json` (version, and the `@sudobility/di` floor)
- Modify: each app's `package.json` (dependency floors)

**Interfaces:**
- Consumes: everything from Tasks 1-7.
- Produces: published packages.

- [ ] **Step 1: Bump and publish `di`**

```bash
cd /Users/johnhuang/projects/di
# minor bump: 1.5.63 -> 1.6.0 (new public API)
bun run test && bun run build
npm publish --access public
```

If npm rejects the version as already reserved, bump the patch and retry —
unpublished versions stay reserved.

- [ ] **Step 2: Point `auth_lib` at the published `di` and publish it**

```bash
cd /Users/johnhuang/projects/auth_lib
# set @sudobility/di to ^1.6.0 in peerDependencies and devDependencies
bun install
bun run test && bun run build
# minor bump: 0.0.94 -> 0.1.0 (breaking: default and auto-run removed)
npm publish --access public
```

- [ ] **Step 3: Bump dependency floors across the 40 apps**

For every repo in Tasks 5, 6 and 7, raise `@sudobility/di` to `^1.6.0` and,
where present, `@sudobility/auth_lib` to `^0.1.0`, then `bun install`.

- [ ] **Step 4: Verify the fleet builds**

Run, per repo: `bun run typecheck && bun run build`
Expected: all succeed. Any failure means that app still imports
`DEFAULT_FIREBASE_PROXY_ORIGIN` or `autoConfigureFirebaseProxy`.

- [ ] **Step 5: Verify no app was missed**

```bash
cd /Users/johnhuang/projects
for d in */; do
  d=${d%/}
  [ -f "$d/package.json" ] || continue
  grep -q '"@sudobility/di"' "$d/package.json" || continue
  { [ -d "$d/android" ] && [ -d "$d/ios" ]; } || \
    { [ -f "$d/index.html" ] || ls "$d"/vite.config.* >/dev/null 2>&1; } || continue
  grep -rq 'setFirebaseProxy' "$d/src" "$d/App.tsx" "$d/index.js" 2>/dev/null \
    || echo "MISSING setter: $d"
done
```

Expected: no output. Any repo listed is an app that still goes direct to
Google.

- [ ] **Step 6: Commit the dependency bumps**

Commit each app's `package.json` and lockfile change with:

```bash
git commit -m "chore: bump @sudobility/di and auth_lib for the proxy setter"
```

---

## Notes for the executor

- **`.env` is gitignored in every one of these repos.** Add the key to it for
  local development, but never stage it. Only `.env.example` is committed.
- **`bun.lock` drives CI package-manager detection.** Do not delete it; a
  missing lockfile makes the shared CI workflow run `npm ci`.
- **Two apps have `.env` not gitignored** (`schoolpick`, `music_app_rn`).
  `music_app_rn` is in Task 7 — check `git status` there before committing and
  do not stage `.env`.
- Six repos are on `develop`, not `main`: `mail_box`, `shapeshyft_app`,
  `sudojo_app`, `svgr_app`, `whisperly_app`, `sudojo_solver`. Commit on
  whatever branch the repo is currently on.
