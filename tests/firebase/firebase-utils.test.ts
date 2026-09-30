import { describe, it, expect } from 'vitest';
import { hashUserIdForAnalytics } from '../../src/firebase/firebase-utils.js';

describe('hashUserIdForAnalytics', () => {
  it('should return a 16-character hex string', () => {
    const result = hashUserIdForAnalytics('test-user-123');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should return consistent results for the same input', () => {
    const result1 = hashUserIdForAnalytics('user@example.com');
    const result2 = hashUserIdForAnalytics('user@example.com');
    expect(result1).toBe(result2);
  });

  it('should return different results for different inputs', () => {
    const result1 = hashUserIdForAnalytics('user1@example.com');
    const result2 = hashUserIdForAnalytics('user2@example.com');
    expect(result1).not.toBe(result2);
  });

  it('should handle empty string', () => {
    const result = hashUserIdForAnalytics('');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should handle special characters', () => {
    const result = hashUserIdForAnalytics('user+special@example.com!#$%');
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });

  it('should handle long strings', () => {
    const longId = 'a'.repeat(1000);
    const result = hashUserIdForAnalytics(longId);
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[0-9a-f]{16}$/);
  });
});

import { toAnalyticsEventName } from '../../src/firebase/firebase-utils';

describe('toAnalyticsEventName', () => {
  it('leaves valid names unchanged', () => {
    for (const name of ['page_view', 'page_view_techniques', 'button_click_Play', 'error_occurred_unknown']) {
      expect(toAnalyticsEventName(name)).toBe(name);
    }
  });

  it('replaces characters GA4 rejects', () => {
    expect(toAnalyticsEventName('page_view_mcps_api.example.com')).toBe('page_view_mcps_api_example_com');
    expect(toAnalyticsEventName('page_view_techniques_x-wing')).toBe('page_view_techniques_x_wing');
    expect(toAnalyticsEventName('button_click_Sign in')).toBe('button_click_Sign_in');
  });

  it('starts with a letter and stays within 40 characters', () => {
    expect(toAnalyticsEventName('404_page')).toBe('e_404_page');
    const long = toAnalyticsEventName(`page_view_${'a'.repeat(60)}`);
    expect(long).toHaveLength(40);
    expect(long.startsWith('page_view_')).toBe(true);
  });
});
