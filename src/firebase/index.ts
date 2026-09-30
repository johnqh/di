/**
 * Firebase module exports
 * Platform-agnostic Firebase interfaces and types
 */

// Export all interfaces and types
export type {
  AnalyticsEvent,
  AnalyticsService,
  RemoteConfigValue,
  RemoteConfigService,
  FCMNotificationPayload,
  FCMDataPayload,
  FCMMessage,
  FCMPermissionState,
  FCMState,
  FCMService,
  FirebaseService,
  FirebaseConfig,
  FirebaseInitOptions,
} from './firebase.interface.js';

// Export shared utilities
export {
  hashUserIdForAnalytics,
  toAnalyticsEventName,
  MAX_ANALYTICS_EVENT_NAME_LENGTH,
} from './firebase-utils.js';

// Export the unified analytics wrapper
export {
  FirebaseAnalyticsService,
  initializeFirebaseAnalytics,
  getAnalyticsService,
  resetAnalyticsService,
  type AnalyticsEventParams,
} from './firebase-analytics.js';

// Export the China reverse-proxy configuration
export {
  setFirebaseProxy,
  getFirebaseProxyOrigin,
  isFirebaseProxyActive,
  firebaseProxyReady,
  disableFirebaseProxy,
  rewriteFirebaseProxyUrl,
  resetFirebaseProxyForTests,
} from './firebase-proxy.js';
