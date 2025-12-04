/**
 * @johnqh/di - React Native Platform Implementations
 *
 * This module provides React Native-specific implementations of the DI interfaces
 * using native modules (AsyncStorage, NetInfo, Notifee, etc.)
 */

// Re-export all interfaces from main package
export * from '../index.js';

// ============================================================================
// UNIFIED EXPORTS (same names as Web for cross-platform code)
// ============================================================================

// Network - unified names
export { rnNetworkClient as networkClient } from './network/network.rn.js';
export { RNNetworkService as NetworkService } from './network/network.rn.js';
export {
  getNetworkService,
  initializeNetworkService,
  resetNetworkService,
} from './network/network-singleton.js';

// Storage - unified names
export {
  rnStorage as storage,
  advancedRNStorage as advancedStorage,
} from './storage/storage.rn.js';
export { RNStorageService as StorageService } from './storage/storage-singleton.js';
export {
  getStorageService,
  initializeStorageService,
  resetStorageService,
} from './storage/storage-singleton.js';

// Firebase - unified names
export { RNFirebaseService as FirebaseService } from './firebase/firebase.rn.js';
export {
  getFirebaseService,
  initializeFirebaseService,
  resetFirebaseService,
} from './firebase/firebase.rn.js';

// Theme - unified names
export { RNThemeService as ThemeService } from './theme/theme.rn.js';
export {
  getThemeService,
  initializeThemeService,
  resetThemeService,
} from './theme/theme.rn.js';

// Navigation - unified names
export { RNNavigationService as NavigationService } from './navigation/navigation.rn.js';
export {
  getNavigationService,
  initializeNavigationService,
  resetNavigationService,
} from './navigation/navigation.rn.js';

// Notifications - unified names
export { RNNotificationService as NotificationService } from './notification/notification.rn.js';
export {
  getNotificationService,
  initializeNotificationService,
  resetNotificationService,
} from './notification/notification.rn.js';

// ============================================================================
// PLATFORM-SPECIFIC EXPORTS (RN-prefixed names for explicit usage)
// ============================================================================

// RN Analytics implementations
export {
  RNAnalyticsClient,
  rnAnalyticsClient,
  getAnalyticsClient,
  initializeAnalyticsClient,
  resetAnalyticsClient,
} from './analytics/analytics.rn.js';

// RN Environment implementations
export {
  RNEnvProvider,
  rnEnvProvider,
  rnAppConfig,
  createRNAppConfig,
} from './env/env.rn.js';

// RN Logging implementations
export {
  RNLogger,
  RNLoggerProvider,
  rnLogger,
  rnLoggerProvider,
  getLoggerProvider,
  getLogger,
  initializeLoggerProvider,
  resetLoggerProvider,
} from './logging/logging.rn.js';

// RN Navigation implementations
export {
  RNNavigationService,
  rnNavigationService,
} from './navigation/navigation.rn.js';

// RN Network implementations
export {
  RNNetworkClient,
  NetworkError,
  RNNetworkService,
  rnNetworkClient,
  rnNetworkService,
} from './network/network.rn.js';
export {
  getNetworkClient,
  initializeNetworkClient,
  resetNetworkClient,
} from './network/network-singleton.js';

// RN Notification implementations
export {
  RNNotificationService,
  rnNotificationService,
} from './notification/notification.rn.js';

// RN Storage implementations
export {
  RNStorage,
  AdvancedRNStorage,
  rnStorage,
  advancedRNStorage,
  setAsyncStorageModule,
} from './storage/storage.rn.js';
export {
  RNStorageService,
  RNSerializedStorageService,
} from './storage/storage-singleton.js';

// RN Theme implementations
export type { ThemeMode, FontSize } from './theme/theme.rn.js';
export { RNThemeService, rnThemeService } from './theme/theme.rn.js';

// RN Firebase implementations
export type {
  FirebaseService as FirebaseServiceInterface,
  AnalyticsService as FirebaseAnalyticsService,
  RemoteConfigService,
  FCMService,
  FirebaseInitOptions,
  RemoteConfigValue,
  FCMMessage,
  FCMPermissionState,
  FCMNotificationPayload,
  FCMDataPayload,
  FCMState,
  FirebaseConfig,
  AnalyticsEvent as FirebaseAnalyticsEvent,
} from './firebase/firebase.rn.js';
export {
  RNFirebaseService,
  createRNFirebaseService,
  rnFirebaseService,
} from './firebase/firebase.rn.js';
