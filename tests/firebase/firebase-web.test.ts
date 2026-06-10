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
