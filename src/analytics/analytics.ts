/**
 * Platform-agnostic analytics interfaces for cross-platform event tracking.
 *
 * @ai-context Analytics client and context provider interfaces for dependency injection
 * @ai-pattern Service provider with context injection and event-driven tracking
 * @ai-platform Universal (Firebase Analytics, Mixpanel, Amplitude, custom analytics)
 * @ai-usage Implement for Firebase Analytics (web/mobile), Mixpanel, or custom tracking
 * @ai-security Event parameters may contain sensitive data - sanitize before tracking
 *
 * @example
 * ```typescript
 * // Firebase Analytics implementation
 * class FirebaseAnalyticsClient implements AnalyticsClient {
 *   trackEvent(event: AnalyticsEvent | AnalyticsEventData): void {
 *     if (typeof event === 'object' && 'event' in event) {
 *       gtag('event', event.event, event.parameters);
 *     } else {
 *       gtag('event', event);
 *     }
 *   }
 * }
 *
 * // React Native Firebase implementation
 * class RNFirebaseAnalyticsClient implements AnalyticsClient {
 *   trackEvent(event: AnalyticsEvent | AnalyticsEventData): void {
 *     if (typeof event === 'object' && 'event' in event) {
 *       analytics().logEvent(event.event, event.parameters);
 *     } else {
 *       analytics().logEvent(event);
 *     }
 *   }
 * }
 * ```
 */

// AnalyticsEvent and Optional are now imported from @sudobility/types
import { AnalyticsEvent, type Optional } from '@sudobility/types';
export { AnalyticsEvent };
export type { Optional };

/**
 * Analytics event data interface for passing event with parameters.
 *
 * @ai-context Data structure for analytics events with optional parameters
 * @ai-pattern Data transfer object with event enum and parameter dictionary
 * @ai-usage Use when tracking events that need additional context data
 *
 * @example
 * ```typescript
 * const eventData: AnalyticsEventData = {
 *   event: AnalyticsEvent.USER_SIGNUP,
 *   parameters: {
 *     method: 'email',
 *     source: 'landing_page'
 *   }
 * };
 * ```
 */
interface AnalyticsEventData {
  event: AnalyticsEvent;
  parameters?: Optional<Record<string, unknown>>;
}

/**
 * Platform-agnostic analytics client interface for event tracking.
 *
 * @ai-context Core analytics service interface for dependency injection
 * @ai-pattern Service interface with event tracking, user management, and configuration
 * @ai-platform Abstracts Firebase Analytics, Mixpanel, Amplitude, and custom solutions
 * @ai-usage Primary interface for implementing analytics tracking services
 * @ai-security Handle user data and event parameters according to privacy policies
 *
 * @example
 * ```typescript
 * class MyAnalyticsClient implements AnalyticsClient {
 *   trackEvent(event: AnalyticsEvent | AnalyticsEventData): void {
 *     // Implementation specific to your analytics provider
 *   }
 * }
 * ```
 */
interface _AnalyticsClient {
  /**
   * Track an analytics event
   * @param event Event enum value or event data with parameters
   */
  trackEvent(event: AnalyticsEvent | AnalyticsEventData): void;

  /**
   * Set user properties for analytics
   * @param properties User properties to set
   */
  setUserProperties(properties: Record<string, unknown>): void;

  /**
   * Set current user ID for analytics
   * @param userId User identifier
   */
  setUserId(userId: Optional<string>): void;

  /**
   * Enable or disable analytics collection
   * @param enabled Whether analytics should be enabled
   */
  setAnalyticsEnabled(enabled: boolean): void;

  /**
   * Set current screen/page for analytics
   * @param screenName Name of the current screen/page
   * @param screenClass Optional screen class
   */
  setCurrentScreen(screenName: string, screenClass?: Optional<string>): void;
}

/**
 * Context provider interface for automatic analytics context injection.
 *
 * @ai-context Provider interface for automatic context data injection into analytics events
 * @ai-pattern Context provider pattern for automatic data enrichment
 * @ai-platform Works with any analytics implementation to provide contextual data
 * @ai-usage Implement to automatically include user, session, or environment data
 * @ai-security Ensure context data complies with privacy policies and data retention rules
 *
 * @example
 * ```typescript
 * class UserAnalyticsContextProvider implements AnalyticsContextProvider {
 *   getCurrentContext(): Record<string, unknown> {
 *     return {
 *       userId: this.userService.getCurrentUserId(),
 *       sessionId: this.sessionService.getSessionId(),
 *       platform: this.platformService.getPlatform(),
 *       version: this.appConfig.version
 *     };
 *   }
 * }
 * ```
 */
interface _AnalyticsContextProvider {
  /**
   * Get current context data that should be included with all events
   * @returns Context data to merge with event parameters
   */
  getCurrentContext(): Record<string, unknown>;
}

export {
  type AnalyticsEventData,
  type _AnalyticsClient as AnalyticsClient,
  type _AnalyticsContextProvider as AnalyticsContextProvider,
};
