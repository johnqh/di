/**
 * Unified Firebase Analytics Service wrapper
 * Works across web and React Native platforms
 */

import type { AnalyticsService } from './firebase.interface.js';

export interface AnalyticsEventParams {
  [key: string]: unknown;
}

/**
 * Firebase Analytics Service class
 * A higher-level wrapper that provides convenience methods for common analytics operations.
 * Works with any AnalyticsService implementation (web or RN).
 */
export class FirebaseAnalyticsService {
  private analyticsService: AnalyticsService | null = null;
  private getService: (() => AnalyticsService) | null = null;

  /**
   * Create a FirebaseAnalyticsService with a getter function.
   * The getter is called lazily to avoid initialization order issues.
   */
  constructor(getAnalyticsService?: () => AnalyticsService) {
    this.getService = getAnalyticsService ?? null;
  }

  private getAnalytics(): AnalyticsService | null {
    if (this.analyticsService) {
      return this.analyticsService;
    }
    if (this.getService) {
      try {
        this.analyticsService = this.getService();
        return this.analyticsService;
      } catch {
        // Service not initialized yet
        return null;
      }
    }
    return null;
  }

  /**
   * Track a custom event
   */
  trackEvent(eventName: string, params?: AnalyticsEventParams): void {
    const analytics = this.getAnalytics();
    if (analytics?.isSupported()) {
      analytics.logEvent(eventName, {
        ...params,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Track a page view (web) or screen view (RN)
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    this.trackEvent('page_view', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  /**
   * Track a screen view (for React Native)
   */
  trackScreenView(screenName: string, screenClass?: string): void {
    const analytics = this.getAnalytics();
    if (analytics?.isSupported()) {
      analytics.logEvent('screen_view', {
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      });
    }
  }

  /**
   * Track a button click
   */
  trackButtonClick(buttonName: string, params?: AnalyticsEventParams): void {
    this.trackEvent('button_click', {
      button_name: buttonName,
      ...params,
    });
  }

  /**
   * Track a link click
   */
  trackLinkClick(
    linkUrl: string,
    linkText?: string,
    params?: AnalyticsEventParams
  ): void {
    this.trackEvent('link_click', {
      link_url: linkUrl,
      link_text: linkText,
      ...params,
    });
  }

  /**
   * Track an error
   */
  trackError(errorMessage: string, errorCode?: string): void {
    this.trackEvent('error_occurred', {
      error_message: errorMessage,
      error_code: errorCode,
    });
  }

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string): void {
    const analytics = this.getAnalytics();
    if (analytics?.isSupported()) {
      analytics.setUserId(userId);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, string>): void {
    const analytics = this.getAnalytics();
    if (analytics?.isSupported()) {
      analytics.setUserProperties(properties);
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    const analytics = this.getAnalytics();
    return analytics?.isSupported() ?? false;
  }
}

// Singleton instance
let analyticsService: FirebaseAnalyticsService | null = null;

/**
 * Initialize the Firebase Analytics service singleton
 */
export function initializeFirebaseAnalytics(
  getAnalyticsService?: () => AnalyticsService
): FirebaseAnalyticsService {
  if (!analyticsService) {
    analyticsService = new FirebaseAnalyticsService(getAnalyticsService);
  }
  return analyticsService;
}

/**
 * Get the Firebase Analytics service singleton
 * @throws Error if not initialized
 */
export function getAnalyticsService(): FirebaseAnalyticsService {
  if (!analyticsService) {
    throw new Error(
      'Analytics service not initialized. Call initializeFirebaseAnalytics() first.'
    );
  }
  return analyticsService;
}

/**
 * Reset the analytics service (for testing)
 */
export function resetAnalyticsService(): void {
  analyticsService = null;
}
