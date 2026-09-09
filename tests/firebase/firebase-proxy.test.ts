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
const PROXIED_SIGNIN = `${PROXY}/identitytoolkit/v1/accounts:signInWithPassword?key=abc`;

// vitest runs with environment: 'node', which provides no localStorage.
// Detection caches its verdict there, so stub it before each test.
const memoryStore = new Map<string, string>();
const localStorageStub = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStore.set(k, v),
  removeItem: (k: string) => void memoryStore.delete(k),
  clear: () => memoryStore.clear(),
};

/** Google unreachable => device is behind the block. */
const blockedFetch = () => vi.fn(() => Promise.reject(new Error('blocked')));
/** Google reachable => no proxy needed. */
const reachableFetch = () =>
  vi.fn(() => Promise.resolve(new Response(null, { status: 204 })));

beforeEach(() => {
  resetFirebaseProxyForTests();
  memoryStore.clear();
  vi.stubGlobal('localStorage', localStorageStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('not configured means Firebase direct', () => {
  it.each([undefined, null, '', '   '])('treats %p as unset', async (value) => {
    setFirebaseProxy(value as string | null | undefined);
    expect(getFirebaseProxyOrigin()).toBeNull();
    expect(isFirebaseProxyActive()).toBe(false);
    await expect(firebaseProxyReady()).resolves.toBe(false);
  });

  it('runs no probe when unset', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    setFirebaseProxy('');
    await firebaseProxyReady();
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('configured + Google unreachable => routes through the proxy', () => {
  it('reports the origin once detection settles', async () => {
    vi.stubGlobal('fetch', blockedFetch());
    setFirebaseProxy(PROXY);
    await expect(firebaseProxyReady()).resolves.toBe(true);
    expect(getFirebaseProxyOrigin()).toBe(PROXY);
    expect(isFirebaseProxyActive()).toBe(true);
  });

  it('trims surrounding whitespace', async () => {
    vi.stubGlobal('fetch', blockedFetch());
    setFirebaseProxy(`  ${PROXY}  `);
    await firebaseProxyReady();
    expect(getFirebaseProxyOrigin()).toBe(PROXY);
  });
});

describe('configured + Google reachable => stays direct', () => {
  it('hands callers null even though an origin was configured', async () => {
    vi.stubGlobal('fetch', reachableFetch());
    setFirebaseProxy(PROXY);
    await expect(firebaseProxyReady()).resolves.toBe(false);
    expect(getFirebaseProxyOrigin()).toBeNull();
    expect(isFirebaseProxyActive()).toBe(false);
  });

  it('caches the verdict so a later run can read it', async () => {
    vi.stubGlobal('fetch', reachableFetch());
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();
    expect(memoryStore.get('sudobility.firebase-proxy.blocked')).toContain(
      '"blocked":false'
    );
  });
});

describe('cached verdict', () => {
  it('applies a cached blocked=true instantly, before the probe resolves', () => {
    memoryStore.set(
      'sudobility.firebase-proxy.blocked',
      JSON.stringify({ blocked: true, ts: Date.now() })
    );
    vi.stubGlobal('fetch', blockedFetch());
    setFirebaseProxy(PROXY);
    // synchronous: routing is already on without awaiting the probe
    expect(isFirebaseProxyActive()).toBe(true);
  });

  it('ignores a stale cache entry', async () => {
    memoryStore.set(
      'sudobility.firebase-proxy.blocked',
      JSON.stringify({ blocked: true, ts: Date.now() - 25 * 60 * 60 * 1000 })
    );
    vi.stubGlobal('fetch', reachableFetch());
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();
    expect(isFirebaseProxyActive()).toBe(false);
  });
});

describe('fetch routing', () => {
  it('rewrites Firebase requests while routing is on', async () => {
    const underlying = blockedFetch();
    vi.stubGlobal('fetch', underlying);
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();

    underlying.mockClear();
    underlying.mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 200 }))
    );
    await globalThis.fetch(SIGNIN);
    expect(underlying.mock.calls[0]?.[0]).toBe(PROXIED_SIGNIN);
  });

  it('passes non-Firebase requests through unchanged', async () => {
    const underlying = blockedFetch();
    vi.stubGlobal('fetch', underlying);
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();

    underlying.mockClear();
    underlying.mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 200 }))
    );
    await globalThis.fetch('https://example.com/thing');
    expect(underlying.mock.calls[0]?.[0]).toBe('https://example.com/thing');
  });
});

describe('re-configuring', () => {
  it('re-points to a different origin', async () => {
    vi.stubGlobal('fetch', blockedFetch());
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();
    setFirebaseProxy(OTHER);
    await firebaseProxyReady();
    expect(getFirebaseProxyOrigin()).toBe(OTHER);
  });

  it('goes back to direct when re-set to blank', async () => {
    vi.stubGlobal('fetch', blockedFetch());
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
    expect(rewriteFirebaseProxyUrl(SIGNIN, PROXY)).toBe(PROXIED_SIGNIN);
  });

  it('leaves unrelated hosts untouched', () => {
    const url = 'https://example.com/thing';
    expect(rewriteFirebaseProxyUrl(url, PROXY)).toBe(url);
  });

  it('tolerates a trailing slash on the proxy origin', () => {
    expect(rewriteFirebaseProxyUrl(SIGNIN, `${PROXY}/`)).toBe(PROXIED_SIGNIN);
  });
});

describe('environments without fetch', () => {
  it('never routes when globalThis.fetch is undefined', async () => {
    vi.stubGlobal('fetch', undefined);
    setFirebaseProxy(PROXY);
    await expect(firebaseProxyReady()).resolves.toBe(false);
    expect(getFirebaseProxyOrigin()).toBeNull();
  });
});

describe('disableFirebaseProxy', () => {
  it('stops routing and forgets the configuration', async () => {
    vi.stubGlobal('fetch', blockedFetch());
    setFirebaseProxy(PROXY);
    await firebaseProxyReady();

    disableFirebaseProxy();
    expect(isFirebaseProxyActive()).toBe(false);
    expect(getFirebaseProxyOrigin()).toBeNull();
  });
});
