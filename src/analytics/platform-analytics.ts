/**
 * Platform-agnostic analytics interface for event tracking and user properties.
 *
 * @ai-context Analytics service interface for dependency injection
 * @ai-pattern Service interface for analytics tracking operations
 * @ai-platform Universal (Web, React Native, Node.js)
 * @ai-usage Implement for Google Analytics, Firebase Analytics, Mixpanel, etc.
 *
 * @example
 * ```typescript
 * class FirebaseAnalytics implements PlatformAnalytics {
 *   trackEvent(event: string, properties: Record<string, any>): void {
 *     analytics().logEvent(event, properties);
 *   }
 * }
 * ```
 */
export interface PlatformAnalytics {
  /**
   * Track an analytics event with properties
   * @param event Event name
   * @param properties Event properties
   */
  trackEvent(event: string, properties: Record<string, unknown>): void;

  /**
   * Set a user property
   * @param key Property key
   * @param value Property value
   */
  setUserProperty(key: string, value: string): void;

  /**
   * Set the user ID for analytics
   * @param userId User identifier
   */
  setUserId(userId: string): void;

  /**
   * Check if analytics is enabled
   * @returns Whether analytics tracking is active
   */
  isEnabled(): boolean;
}
