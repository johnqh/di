/**
 * Shared Firebase utility functions
 */

/**
 * Hash a user ID for privacy-preserving analytics.
 * Uses a simple but consistent hash algorithm suitable for analytics.
 * Returns a 16-character hex string.
 *
 * This function produces identical output on both web and React Native
 * to ensure consistent user IDs across platforms.
 */
export function hashUserIdForAnalytics(userId: string): string {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash1 = (hash1 << 5) - hash1 + char;
    hash1 = hash1 & hash1;
    hash2 = (hash2 << 7) - hash2 + char;
    hash2 = hash2 & hash2;
  }
  const hex1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return (hex1 + hex2).slice(0, 16);
}
