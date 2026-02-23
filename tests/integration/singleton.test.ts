/**
 * Integration tests for singleton management patterns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InfoType } from '@sudobility/types';
import type { InfoInterface } from '../../src/info/info.js';
import {
  initializeInfoService,
  getInfoService,
  resetInfoService,
} from '../../src/info/info-singleton.js';
import {
  FirebaseAnalyticsService,
  initializeFirebaseAnalytics,
  getAnalyticsService,
  resetAnalyticsService,
} from '../../src/firebase/firebase-analytics.js';

describe('Info Singleton', () => {
  beforeEach(() => {
    resetInfoService();
  });

  it('should throw when getting uninitialized service', () => {
    expect(() => getInfoService()).toThrow(
      'Info service not initialized'
    );
  });

  it('should initialize and return the service', () => {
    const mockInfo: InfoInterface = {
      show: () => {},
    };
    initializeInfoService(mockInfo);
    expect(getInfoService()).toBe(mockInfo);
  });

  it('should not re-initialize once set', () => {
    const first: InfoInterface = { show: () => {} };
    const second: InfoInterface = { show: () => {} };
    initializeInfoService(first);
    initializeInfoService(second);
    expect(getInfoService()).toBe(first);
  });

  it('should allow re-initialization after reset', () => {
    const first: InfoInterface = { show: () => {} };
    const second: InfoInterface = { show: () => {} };
    initializeInfoService(first);
    resetInfoService();
    initializeInfoService(second);
    expect(getInfoService()).toBe(second);
  });

  it('should call show on the initialized service', () => {
    const calls: Array<{ title: string; text: string; type: InfoType }> = [];
    const mockInfo: InfoInterface = {
      show: (title, text, type) => {
        calls.push({ title, text, type });
      },
    };
    initializeInfoService(mockInfo);
    getInfoService().show('Test', 'Hello', InfoType.SUCCESS);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toEqual({
      title: 'Test',
      text: 'Hello',
      type: InfoType.SUCCESS,
    });
  });
});

describe('Firebase Analytics Singleton', () => {
  beforeEach(() => {
    resetAnalyticsService();
  });

  it('should throw when getting uninitialized service', () => {
    expect(() => getAnalyticsService()).toThrow(
      'Analytics service not initialized'
    );
  });

  it('should initialize and return the service', () => {
    const service = initializeFirebaseAnalytics();
    expect(service).toBeInstanceOf(FirebaseAnalyticsService);
    expect(getAnalyticsService()).toBe(service);
  });

  it('should not re-initialize once set', () => {
    const first = initializeFirebaseAnalytics();
    const second = initializeFirebaseAnalytics();
    expect(first).toBe(second);
  });

  it('should allow re-initialization after reset', () => {
    const first = initializeFirebaseAnalytics();
    resetAnalyticsService();
    const second = initializeFirebaseAnalytics();
    expect(first).not.toBe(second);
  });

  it('should track events through the singleton', () => {
    const events: Array<{ name: string; params?: Record<string, unknown> }> = [];
    const mockAnalytics = {
      logEvent: (name: string, params?: Record<string, unknown>) => {
        events.push({ name, params });
      },
      setUserProperties: () => {},
      setUserId: () => {},
      isSupported: () => true,
    };

    initializeFirebaseAnalytics(() => mockAnalytics);
    getAnalyticsService().trackEvent('test_event', { key: 'value' });
    expect(events).toHaveLength(1);
    expect(events[0]?.name).toBe('test_event');
  });

  it('should report enabled status from underlying service', () => {
    const mockAnalytics = {
      logEvent: () => {},
      setUserProperties: () => {},
      setUserId: () => {},
      isSupported: () => true,
    };

    initializeFirebaseAnalytics(() => mockAnalytics);
    expect(getAnalyticsService().isEnabled()).toBe(true);
  });
});
