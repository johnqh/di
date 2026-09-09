import { describe, expect, it } from 'vitest';

import * as webEntry from '../../src/web/index';

const REQUIRED = [
  'setFirebaseProxy',
  'getFirebaseProxyOrigin',
  'isFirebaseProxyActive',
  'firebaseProxyReady',
  'disableFirebaseProxy',
  'rewriteFirebaseProxyUrl',
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
