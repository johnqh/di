/**
 * Mock implementations for analytics interfaces.
 *
 * @ai-context Test mocks for AnalyticsClient, AnalyticsContextProvider, PlatformAnalytics
 * @ai-usage Use in unit tests to mock analytics tracking
 */

import { AnalyticsEvent, type Optional } from '@sudobility/types';
import type {
  AnalyticsClient,
  AnalyticsContextProvider,
  AnalyticsEventData,
} from '../analytics/analytics.js';
import type { PlatformAnalytics } from '../analytics/platform-analytics.js';

/**
 * Recorded event for testing assertions.
 */
export interface RecordedAnalyticsEvent {
  event: AnalyticsEvent | string;
  parameters?: Record<string, unknown> | undefined;
  timestamp: number;
}

/**
 * Mock implementation of AnalyticsClient for testing.
 *
 * @example
 * ```typescript
 * const analytics = new MockAnalyticsClient();
 * analytics.trackEvent(AnalyticsEvent.USER_SIGNUP);
 * expect(analytics.getTrackedEvents()).toHaveLength(1);
 * ```
 */
export class MockAnalyticsClient implements AnalyticsClient {
  private events: RecordedAnalyticsEvent[] = [];
  private userProperties: Record<string, unknown> = {};
  private userId: Optional<string> = null;
  private enabled: boolean = true;
  private currentScreen: { name: string; class?: Optional<string> } | null =
    null;

  trackEvent(event: AnalyticsEvent | AnalyticsEventData): void {
    if (!this.enabled) return;

    if (typeof event === 'object' && 'event' in event) {
      this.events.push({
        event: event.event,
        parameters: event.parameters ?? undefined,
        timestamp: Date.now(),
      });
    } else {
      this.events.push({
        event,
        timestamp: Date.now(),
      });
    }
  }

  setUserProperties(properties: Record<string, unknown>): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  setUserId(userId: Optional<string>): void {
    this.userId = userId;
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setCurrentScreen(screenName: string, screenClass?: Optional<string>): void {
    this.currentScreen = { name: screenName, class: screenClass };
  }

  // Test helper methods

  /**
   * Get all tracked events
   */
  getTrackedEvents(): RecordedAnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events filtered by event type
   */
  getEventsByType(eventType: AnalyticsEvent): RecordedAnalyticsEvent[] {
    return this.events.filter((e) => e.event === eventType);
  }

  /**
   * Get the last tracked event
   */
  getLastEvent(): RecordedAnalyticsEvent | undefined {
    return this.events[this.events.length - 1];
  }

  /**
   * Get current user properties
   */
  getUserProperties(): Record<string, unknown> {
    return { ...this.userProperties };
  }

  /**
   * Get current user ID
   */
  getUserId(): Optional<string> {
    return this.userId;
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current screen info
   */
  getCurrentScreen(): { name: string; class?: Optional<string> } | null {
    return this.currentScreen;
  }

  /**
   * Reset all tracked data
   */
  reset(): void {
    this.events = [];
    this.userProperties = {};
    this.userId = null;
    this.enabled = true;
    this.currentScreen = null;
  }
}

/**
 * Mock implementation of AnalyticsContextProvider for testing.
 *
 * @example
 * ```typescript
 * const contextProvider = new MockAnalyticsContextProvider({ platform: 'web' });
 * expect(contextProvider.getCurrentContext()).toEqual({ platform: 'web' });
 * ```
 */
export class MockAnalyticsContextProvider implements AnalyticsContextProvider {
  private context: Record<string, unknown>;

  constructor(initialContext: Record<string, unknown> = {}) {
    this.context = initialContext;
  }

  getCurrentContext(): Record<string, unknown> {
    return { ...this.context };
  }

  // Test helper methods

  /**
   * Set context data for testing
   */
  setContext(context: Record<string, unknown>): void {
    this.context = context;
  }

  /**
   * Add to existing context
   */
  addContext(key: string, value: unknown): void {
    this.context[key] = value;
  }

  /**
   * Reset context to empty
   */
  reset(): void {
    this.context = {};
  }
}

/**
 * Mock implementation of PlatformAnalytics for testing.
 *
 * @example
 * ```typescript
 * const analytics = new MockPlatformAnalytics();
 * analytics.trackEvent('button_click', { button: 'submit' });
 * expect(analytics.getTrackedEvents()).toHaveLength(1);
 * ```
 */
export class MockPlatformAnalytics implements PlatformAnalytics {
  private events: Array<{
    event: string;
    properties: Record<string, unknown>;
  }> = [];
  private userProperties: Record<string, string> = {};
  private userId: string = '';
  private enabled: boolean = true;

  trackEvent(event: string, properties: Record<string, unknown>): void {
    if (!this.enabled) return;
    this.events.push({ event, properties });
  }

  setUserProperty(key: string, value: string): void {
    this.userProperties[key] = value;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Test helper methods

  /**
   * Get all tracked events
   */
  getTrackedEvents(): Array<{
    event: string;
    properties: Record<string, unknown>;
  }> {
    return [...this.events];
  }

  /**
   * Get events by name
   */
  getEventsByName(
    eventName: string
  ): Array<{ event: string; properties: Record<string, unknown> }> {
    return this.events.filter((e) => e.event === eventName);
  }

  /**
   * Get user properties
   */
  getUserProperties(): Record<string, string> {
    return { ...this.userProperties };
  }

  /**
   * Get user ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Set enabled state for testing
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Reset all tracked data
   */
  reset(): void {
    this.events = [];
    this.userProperties = {};
    this.userId = '';
    this.enabled = true;
  }
}
