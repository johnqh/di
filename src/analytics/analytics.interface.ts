/**
 * Platform-agnostic analytics service interface
 *
 * @ai-context Core analytics interface for dependency injection
 * @ai-pattern Service interface with comprehensive event tracking
 * @ai-platform Cross-platform compatible (Web, React Native, Node.js)
 * @ai-usage Implement this interface to create analytics services for Firebase, Mixpanel, etc.
 *
 * @example
 * ```typescript
 * class FirebaseAnalytics implements AnalyticsService {
 *   async initialize(config: AnalyticsConfig) { ... }
 *   trackEvent(event: AnalyticsEvent, properties?: AnalyticsEventProperties) { ... }
 * }
 * ```
 */

import { AnalyticsEvent, AnalyticsEventProperties } from '../types';

/**
 * Core analytics service interface for tracking user behavior and app performance.
 *
 * This interface provides a complete analytics abstraction that can be implemented
 * by various analytics providers (Firebase Analytics, Mixpanel, Adobe Analytics, etc.).
 *
 * @ai-interface-type Service Provider
 * @ai-implementation-examples Firebase Analytics, Mixpanel, Adobe Analytics
 */
interface AnalyticsService {
  /**
   * Initialize analytics service with configuration.
   *
   * @param config Analytics configuration including API keys and settings
   * @returns Promise that resolves when initialization is complete
   *
   * @ai-pattern Async initialization pattern
   * @example
   * ```typescript
   * await analytics.initialize({
   *   apiKey: 'your-api-key',
   *   enabled: true,
   *   debugMode: false
   * });
   * ```
   */
  initialize(config: AnalyticsConfig): Promise<void>;

  /**
   * Track a user event with optional properties.
   *
   * @param event Event name (use AnalyticsEvent enum or custom string)
   * @param properties Additional event properties for context
   *
   * @ai-pattern Event tracking with typed enums
   * @example
   * ```typescript
   * analytics.trackEvent(AnalyticsEvent.USER_LOGIN, {
   *   login_method: 'email',
   *   user_type: 'premium'
   * });
   * ```
   */
  trackEvent(
    event: AnalyticsEvent | string,
    properties?: AnalyticsEventProperties
  ): void;

  /**
   * Set a user property for analytics segmentation.
   *
   * @param key Property name
   * @param value Property value
   *
   * @ai-pattern User property management
   */
  setUserProperty(key: string, value: string): void;

  /**
   * Set the user ID for analytics tracking.
   *
   * @param userId Unique user identifier
   *
   * @ai-pattern User identification
   */
  setUserId(userId: string): void;

  /**
   * Set multiple user properties in a single call.
   *
   * @param properties Object containing key-value pairs of user properties
   *
   * @ai-pattern Batch property setting
   * @example
   * ```typescript
   * analytics.setUserProperties({
   *   subscription_tier: 'premium',
   *   signup_date: '2024-01-15',
   *   preferred_language: 'en'
   * });
   * ```
   */
  setUserProperties(properties: Record<string, string>): void;

  /**
   * Track screen or page views for navigation analytics.
   *
   * @param screenName Name of the screen/page being viewed
   * @param properties Additional context about the screen view
   *
   * @ai-pattern Navigation tracking
   * @ai-cross-platform Works for both React (pages) and React Native (screens)
   */
  trackScreen(screenName: string, properties?: AnalyticsEventProperties): void;

  /**
   * Track application errors for monitoring and debugging.
   *
   * @param error Error object containing error details
   * @param context Additional context about when/where the error occurred
   *
   * @ai-pattern Error tracking and monitoring
   * @example
   * ```typescript
   * try {
   *   // some operation
   * } catch (error) {
   *   analytics.trackError(error, {
   *     component: 'EmailComposer',
   *     action: 'send_email'
   *   });
   * }
   * ```
   */
  trackError(error: Error, context?: AnalyticsEventProperties): void;

  /**
   * Track timing events for performance monitoring.
   *
   * @param category Timing category (e.g., 'api_call', 'page_load')
   * @param variable Specific timing variable name
   * @param time Time in milliseconds
   * @param label Optional label for additional context
   *
   * @ai-pattern Performance monitoring
   * @example
   * ```typescript
   * const startTime = Date.now();
   * // ... perform operation
   * const duration = Date.now() - startTime;
   * analytics.trackTiming('api_call', 'fetch_emails', duration, 'inbox');
   * ```
   */
  trackTiming(
    category: string,
    variable: string,
    time: number,
    label?: string
  ): void;

  /**
   * Check if analytics tracking is currently enabled.
   *
   * @returns true if analytics is enabled, false otherwise
   *
   * @ai-pattern State checking
   */
  isEnabled(): boolean;

  /**
   * Enable or disable analytics tracking.
   *
   * @param enabled Whether to enable analytics tracking
   *
   * @ai-pattern Feature toggle
   * @ai-privacy Respects user privacy preferences
   */
  setEnabled(enabled: boolean): void;

  /**
   * Reset all user-specific analytics data (call on logout).
   *
   * @ai-pattern User session management
   * @ai-privacy Clears user data on logout for privacy
   */
  resetUser(): void;
}

/**
 * Configuration interface for analytics service initialization.
 *
 * @ai-config-interface Analytics service configuration
 * @ai-pattern Configuration object pattern
 * @ai-security Contains sensitive data (API keys) - handle securely
 */
interface AnalyticsConfig {
  /** API key for the analytics service (Firebase, Mixpanel, etc.) */
  apiKey?: string;

  /** Application identifier for the analytics platform */
  appId?: string;

  /** Google Analytics measurement ID (for Firebase Analytics) */
  measurementId?: string;

  /** Whether analytics tracking is enabled */
  enabled: boolean;

  /** Enable debug mode for development/testing */
  debugMode: boolean;

  /** Pre-set user ID for analytics (optional) */
  userId?: string;
}

/**
 * Extended analytics interface specifically designed for email applications.
 *
 * Provides email-specific tracking methods while inheriting all base analytics functionality.
 * Perfect for email clients, marketing platforms, and communication apps.
 *
 * @ai-interface-type Extended Service Provider
 * @ai-domain Email and communication applications
 * @ai-inheritance Extends AnalyticsService with email-specific methods
 *
 * @example
 * ```typescript
 * class EmailAppAnalytics implements EmailAnalyticsService {
 *   // Implement all AnalyticsService methods plus email-specific ones
 *   trackEmailAction(action: 'sent' | 'read' | 'archived', emailId: string) { ... }
 * }
 * ```
 */
interface EmailAnalyticsService extends AnalyticsService {
  /**
   * Track email-specific user actions.
   *
   * @param action The email action performed (sent, read, archived, deleted, etc.)
   * @param emailId Unique identifier for the email
   * @param properties Additional context about the email action
   *
   * @ai-pattern Domain-specific event tracking
   * @ai-use-case Email client analytics, engagement tracking
   *
   * @example
   * ```typescript
   * analytics.trackEmailAction('read', 'email-123', {
   *   folder: 'inbox',
   *   sender: 'user@example.com',
   *   subject_length: 45
   * });
   * ```
   */
  trackEmailAction(
    action: string,
    emailId: string,
    properties?: AnalyticsEventProperties
  ): void;

  /**
   * Track user navigation between different sections of the app.
   *
   * @param from Previous screen/page identifier
   * @param to Current screen/page identifier
   * @param properties Additional navigation context
   *
   * @ai-pattern Navigation flow tracking
   * @ai-use-case User journey analysis, UX optimization
   */
  trackNavigation(
    from: string,
    to: string,
    properties?: AnalyticsEventProperties
  ): void;

  /**
   * Track subscription-related events (upgrades, cancellations, etc.).
   *
   * @param action Subscription action (subscribe, upgrade, cancel, renew)
   * @param planType Type of subscription plan (free, premium, pro, etc.)
   * @param properties Additional subscription context
   *
   * @ai-pattern Revenue and subscription tracking
   * @ai-use-case Subscription analytics, churn analysis
   *
   * @example
   * ```typescript
   * analytics.trackSubscription('upgrade', 'premium', {
   *   previous_plan: 'free',
   *   billing_cycle: 'monthly',
   *   revenue: 9.99
   * });
   * ```
   */
  trackSubscription(
    action: string,
    planType?: string,
    properties?: AnalyticsEventProperties
  ): void;

  /**
   * Track search queries and results.
   *
   * @param query The search query entered by user
   * @param resultsCount Number of results returned
   * @param properties Additional search context
   *
   * @ai-pattern Search analytics
   * @ai-use-case Search optimization, content discovery analysis
   */
  trackSearch(
    query: string,
    resultsCount: number,
    properties?: AnalyticsEventProperties
  ): void;

  /**
   * Track A/B test interactions for experimental features.
   *
   * @param testName Name/identifier of the A/B test
   * @param variant Which variant the user is seeing (A, B, control, etc.)
   * @param action Whether user viewed or converted on the test
   * @param conversionType Type of conversion if action is 'converted'
   *
   * @ai-pattern A/B testing and experimentation
   * @ai-use-case Feature testing, conversion optimization
   *
   * @example
   * ```typescript
   * // When user sees the test
   * analytics.trackABTest('new-compose-ui', 'variant-b', 'viewed');
   *
   * // When user converts
   * analytics.trackABTest('new-compose-ui', 'variant-b', 'converted', 'email-sent');
   * ```
   */
  trackABTest(
    testName: string,
    variant: string,
    action: 'viewed' | 'converted',
    conversionType?: string
  ): void;
}

/**
 * Utility class for building standardized analytics event properties.
 *
 * Provides static methods to create consistent event property objects
 * for common analytics scenarios. Ensures proper naming conventions
 * and includes standard fields like timestamps.
 *
 * @ai-utility-class Event property builders
 * @ai-pattern Factory pattern for event properties
 * @ai-standardization Ensures consistent event property naming
 *
 * @example
 * ```typescript
 * // Use builders to create standardized event properties
 * const properties = AnalyticsEventBuilder.emailAction('read', 'email-123', 'inbox');
 * analytics.trackEvent(AnalyticsEvent.EMAIL_OPENED, properties);
 * ```
 */
class AnalyticsEventBuilder {
  /**
   * Build properties for email action events.
   *
   * @param action Email action performed (read, sent, archived, etc.)
   * @param emailId Unique identifier for the email
   * @param folder Email folder context (inbox, sent, trash, etc.)
   * @returns Standardized event properties object
   *
   * @ai-builder Email action properties
   * @ai-standardization Consistent email event tracking
   */
  static emailAction(
    action: string,
    emailId: string,
    folder?: string
  ): AnalyticsEventProperties {
    return {
      action,
      email_id: emailId,
      folder,
      timestamp: Date.now(),
    };
  }

  /**
   * Build properties for page/screen view events.
   *
   * @param pageName Human-readable page name
   * @param pagePath URL path or screen identifier
   * @returns Standardized page view properties
   *
   * @ai-builder Navigation tracking properties
   * @ai-cross-platform Works for web pages and mobile screens
   */
  static pageView(
    pageName: string,
    pagePath: string
  ): AnalyticsEventProperties {
    return {
      page_name: pageName,
      page_path: pagePath,
      timestamp: Date.now(),
    };
  }

  /**
   * Build properties for error tracking events.
   *
   * @param errorType Category of error (network, validation, runtime, etc.)
   * @param errorMessage Error message or description
   * @param pageName Page/screen where error occurred
   * @returns Standardized error event properties
   *
   * @ai-builder Error tracking properties
   * @ai-debugging Consistent error event structure
   */
  static error(
    errorType: string,
    errorMessage: string,
    pageName?: string
  ): AnalyticsEventProperties {
    return {
      error_type: errorType,
      error_message: errorMessage,
      page_name: pageName,
      timestamp: Date.now(),
    };
  }

  /**
   * Build properties for subscription/revenue events.
   *
   * @param action Subscription action (subscribe, upgrade, cancel, etc.)
   * @param planType Subscription plan type (free, premium, pro, etc.)
   * @param amount Monetary amount (for revenue tracking)
   * @param currency Currency code (USD, EUR, etc.)
   * @returns Standardized subscription event properties
   *
   * @ai-builder Revenue tracking properties
   * @ai-business-metrics Subscription and revenue analytics
   */
  static subscription(
    action: string,
    planType?: string,
    amount?: number,
    currency?: string
  ): AnalyticsEventProperties {
    return {
      action,
      plan_type: planType,
      amount,
      currency,
      timestamp: Date.now(),
    };
  }

  /**
   * Build properties for user engagement events.
   *
   * @param feature Feature name or component identifier
   * @param interaction Type of interaction (click, scroll, hover, etc.)
   * @param duration Time spent on interaction (milliseconds)
   * @returns Standardized engagement event properties
   *
   * @ai-builder User engagement properties
   * @ai-ux-analytics User experience and interaction tracking
   */
  static engagement(
    feature: string,
    interaction: string,
    duration?: number
  ): AnalyticsEventProperties {
    return {
      feature,
      interaction,
      duration,
      timestamp: Date.now(),
    };
  }

  /**
   * Build properties for performance monitoring events.
   *
   * @param metric Performance metric name (load_time, api_response, etc.)
   * @param value Metric value (usually in milliseconds)
   * @param context Additional context about the performance event
   * @returns Standardized performance event properties
   *
   * @ai-builder Performance monitoring properties
   * @ai-performance Application performance tracking
   */
  static performance(
    metric: string,
    value: number,
    context?: string
  ): AnalyticsEventProperties {
    return {
      metric,
      value,
      context,
      timestamp: Date.now(),
    };
  }
}

export {
  AnalyticsEventBuilder,
  type AnalyticsEventProperties,
  type AnalyticsService,
  type AnalyticsConfig,
  type EmailAnalyticsService,
};
