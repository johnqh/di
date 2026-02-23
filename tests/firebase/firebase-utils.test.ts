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
