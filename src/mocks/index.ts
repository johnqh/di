/**
 * Mock implementations for all DI interfaces.
 *
 * @ai-context Centralized exports for all mock implementations
 * @ai-usage Import mocks from this module for testing:
 *   import { MockAnalyticsClient, MockStorageService } from '@johnqh/di/mocks';
 *
 * @example
 * ```typescript
 * import {
 *   MockEnvProvider,
 *   MockAnalyticsClient,
 *   MockPlatformNetwork,
 *   MockStorageService,
 *   MockNavigationService,
 *   MockNotificationService,
 *   MockPlatformTheme,
 *   MockLogger,
 * } from '@johnqh/di/mocks';
 *
 * // Use in tests
 * const analytics = new MockAnalyticsClient();
 * analytics.trackEvent(AnalyticsEvent.USER_SIGNUP);
 * expect(analytics.getTrackedEvents()).toHaveLength(1);
 * ```
 */

// Environment mocks
export {
  MockEnvProvider,
  MockEnvFactory,
  MockEnvUtils,
  createMockFirebaseConfig,
  createMockAppConfig,
} from './env.mock.js';

// Analytics mocks
export {
  MockAnalyticsClient,
  MockAnalyticsContextProvider,
  MockPlatformAnalytics,
  type RecordedAnalyticsEvent,
} from './analytics.mock.js';

// Network mocks
export {
  MockPlatformNetwork,
  type RecordedRequest,
  type MockResponseConfig,
} from './network.mock.js';

// Storage mocks
export {
  MockPlatformStorage,
  MockAdvancedPlatformStorage,
  MockStorageProvider,
  MockStorageService,
  MockSerializedStorageService,
  MockStorageFactory,
} from './storage.mock.js';

// Navigation mocks
export {
  MockNavigationService,
  MockNavigationHook,
  MockLocationHook,
  type RecordedNavigation,
} from './navigation.mock.js';

// Notification mocks
export {
  MockNotificationService,
  MockNotificationClient,
  MockNotificationContextProvider,
  MockPlatformNotifications,
  createMockNotificationConfig,
  type RecordedNotification,
  type RecordedPlatformNotification,
} from './notification.mock.js';

// Theme mocks
export { MockPlatformTheme, type RecordedThemeChange } from './theme.mock.js';

// Logging mocks
export {
  MockLogger,
  MockLoggerProvider,
  createNoOpLogger,
  createDebugLogger,
  type RecordedLogEntry,
} from './logging.mock.js';
