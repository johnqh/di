/**
 * @johnqh/di - React Native Platform Implementations
 *
 * This module provides React Native-specific implementations of the DI interfaces
 * using native modules (AsyncStorage, NetInfo, Notifee, etc.)
 */

// Re-export all interfaces from main package
export * from '../index.js';

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
  getNavigationService,
  initializeNavigationService,
  resetNavigationService,
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
  getNetworkService,
  initializeNetworkService,
  resetNetworkService,
  getNetworkClient,
  initializeNetworkClient,
  resetNetworkClient,
} from './network/network-singleton.js';

// RN Notification implementations
export {
  RNNotificationService,
  rnNotificationService,
  getNotificationService,
  initializeNotificationService,
  resetNotificationService,
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
  getStorageService,
  initializeStorageService,
  resetStorageService,
} from './storage/storage-singleton.js';

// RN Theme implementations
export type { ThemeMode, FontSize } from './theme/theme.rn.js';
export {
  RNThemeService,
  rnThemeService,
  getThemeService,
  initializeThemeService,
  resetThemeService,
} from './theme/theme.rn.js';
