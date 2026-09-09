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
  it.each([undefined, null, '', '   '])('treats %p as unset', async (value) => {
    setFirebaseProxy(value as string | null | undefined);
    expect(getFirebaseProxyOrigin()).toBeNull();
    expect(isFirebaseProxyActive()).toBe(false);
    await expect(firebaseProxyReady()).resolves.toBe(false);
  });

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
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('blocked')))
    );
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
