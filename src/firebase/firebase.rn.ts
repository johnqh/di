/**
 * React Native implementation of Firebase services
 * Uses @react-native-firebase/* packages
 */

import type {
  FirebaseService,
  AnalyticsService,
  RemoteConfigService,
  FCMService,
  FirebaseInitOptions,
  RemoteConfigValue,
  FCMMessage,
  FCMPermissionState,
} from './firebase.interface.js';

// Lazy load Firebase modules to avoid crashes if native modules are not linked
type FirebaseAnalyticsModule =
  typeof import('@react-native-firebase/analytics');
type FirebaseRemoteConfigModule =
  typeof import('@react-native-firebase/remote-config');
type FirebaseMessagingModule =
  typeof import('@react-native-firebase/messaging');

let analyticsModule: FirebaseAnalyticsModule | null = null;
let remoteConfigModule: FirebaseRemoteConfigModule | null = null;
let messagingModule: FirebaseMessagingModule | null = null;

function getAnalytics() {
  if (!analyticsModule) {
    try {
      const mod = require('@react-native-firebase/analytics');
      analyticsModule = mod;
    } catch (e) {
      console.warn('Firebase analytics not available:', e);
    }
  }
  const analytics = analyticsModule?.default ?? analyticsModule;
  return typeof analytics === 'function' ? analytics() : null;
}

function getRemoteConfig() {
  if (!remoteConfigModule) {
    try {
      const mod = require('@react-native-firebase/remote-config');
      remoteConfigModule = mod;
    } catch (e) {
      console.warn('Firebase remote config not available:', e);
    }
  }
  const remoteConfig = remoteConfigModule?.default ?? remoteConfigModule;
  return typeof remoteConfig === 'function' ? remoteConfig() : null;
}

function getMessaging() {
  if (!messagingModule) {
    try {
      const mod = require('@react-native-firebase/messaging');
      messagingModule = mod;
    } catch (e) {
      console.warn('Firebase messaging not available:', e);
    }
  }
  const messaging = messagingModule?.default ?? messagingModule;
  return typeof messaging === 'function' ? messaging() : null;
}

/**
 * Hash a user ID for privacy-preserving analytics.
 * Uses the same algorithm as web to ensure consistent user IDs across platforms.
 */
function hashUserIdForAnalytics(userId: string): string {
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

class RNAnalyticsService implements AnalyticsService {
  private enabled: boolean = true;

  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    if (!this.enabled) return;
    const analytics = getAnalytics();
    if (!analytics) return;

    analytics
      .logEvent(eventName, parameters as Record<string, string | number>)
      .catch(() => {
        // Silently handle analytics errors
      });
  }

  setUserProperties(properties: Record<string, string>): void {
    if (!this.enabled) return;
    const analytics = getAnalytics();
    if (!analytics) return;

    for (const [key, value] of Object.entries(properties)) {
      analytics.setUserProperty(key, String(value)).catch(() => {
        // Silently handle analytics errors
      });
    }
  }

  setUserId(userId: string): void {
    if (!this.enabled) return;
    const analytics = getAnalytics();
    if (!analytics) return;

    // Hash the user ID for privacy before sending to analytics
    const hashedId = hashUserIdForAnalytics(userId);
    analytics.setUserId(hashedId).catch(() => {
      // Silently handle analytics errors
    });
    // Also set as a user property for easier querying
    analytics.setUserProperty('user_hash', hashedId).catch(() => {
      // Silently handle analytics errors
    });
  }

  isSupported(): boolean {
    return getAnalytics() !== null;
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.enabled = enabled;
    const analytics = getAnalytics();
    if (!analytics) return;

    analytics.setAnalyticsCollectionEnabled(enabled).catch(() => {
      // Silently handle analytics errors
    });
  }

  setCurrentScreen(screenName: string, screenClass?: string): void {
    if (!this.enabled) return;
    const analytics = getAnalytics();
    if (!analytics) return;

    analytics
      .logScreenView({
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      })
      .catch(() => {
        // Silently handle analytics errors
      });
  }
}

class RNRemoteConfigValue implements RemoteConfigValue {
  constructor(
    private value: {
      asBoolean: () => boolean;
      asString: () => string;
      asNumber: () => number;
      getSource: () => string;
    }
  ) {}

  asBoolean(): boolean {
    return this.value.asBoolean();
  }

  asString(): string {
    return this.value.asString();
  }

  asNumber(): number {
    return this.value.asNumber();
  }

  getSource(): 'static' | 'default' | 'remote' {
    return this.value.getSource() as 'static' | 'default' | 'remote';
  }
}

class RNRemoteConfigService implements RemoteConfigService {
  async fetchAndActivate(): Promise<boolean> {
    const remoteConfig = getRemoteConfig();
    if (!remoteConfig) return false;

    try {
      await remoteConfig.fetchAndActivate();
      return true;
    } catch (error) {
      console.error('Error fetching and activating remote config:', error);
      return false;
    }
  }

  getValue(key: string): RemoteConfigValue {
    const remoteConfig = getRemoteConfig();
    if (!remoteConfig) {
      return {
        asBoolean: () => false,
        asString: () => '',
        asNumber: () => 0,
        getSource: () => 'default',
      };
    }

    try {
      const value = remoteConfig.getValue(key);
      return new RNRemoteConfigValue(value);
    } catch (error) {
      console.error('Error getting remote config value:', error);
      return {
        asBoolean: () => false,
        asString: () => '',
        asNumber: () => 0,
        getSource: () => 'default',
      };
    }
  }

  getAll(): Record<string, RemoteConfigValue> {
    const remoteConfig = getRemoteConfig();
    if (!remoteConfig) return {};

    try {
      const allValues = remoteConfig.getAll();
      const result: Record<string, RemoteConfigValue> = {};

      for (const [key, value] of Object.entries(allValues)) {
        result[key] = new RNRemoteConfigValue(
          value as {
            asBoolean: () => boolean;
            asString: () => string;
            asNumber: () => number;
            getSource: () => string;
          }
        );
      }

      return result;
    } catch (error) {
      console.error('Error getting all remote config values:', error);
      return {};
    }
  }

  isSupported(): boolean {
    return getRemoteConfig() !== null;
  }
}

class RNFCMService implements FCMService {
  private unsubscribe?: () => void;

  async requestPermission(): Promise<boolean> {
    const messaging = getMessaging();
    if (!messaging) return false;

    try {
      const authStatus = await messaging.requestPermission();
      return (
        authStatus === 1 || // AUTHORIZED
        authStatus === 2 // PROVISIONAL
      );
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    const messaging = getMessaging();
    if (!messaging) return null;

    try {
      return await messaging.getToken();
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async deleteToken(): Promise<boolean> {
    const messaging = getMessaging();
    if (!messaging) return false;

    try {
      await messaging.deleteToken();
      return true;
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }

  onMessage(callback: (message: FCMMessage) => void): () => void {
    const messaging = getMessaging();
    if (!messaging) return () => {};

    try {
      this.unsubscribe = messaging.onMessage(
        (remoteMessage: {
          notification?: { title?: string; body?: string };
          data?: Record<string, string>;
          messageId?: string;
          from?: string;
          collapseKey?: string;
        }) => {
          const message: FCMMessage = {
            ...(remoteMessage.notification && {
              notification: remoteMessage.notification,
            }),
            ...(remoteMessage.data && { data: remoteMessage.data }),
            ...(remoteMessage.messageId && {
              messageId: remoteMessage.messageId,
            }),
            ...(remoteMessage.from && { from: remoteMessage.from }),
            ...(remoteMessage.collapseKey && {
              collapseKey: remoteMessage.collapseKey,
            }),
          };
          callback(message);
        }
      );

      return () => {
        if (this.unsubscribe) {
          this.unsubscribe();
          delete this.unsubscribe;
        }
      };
    } catch (error) {
      console.error('Error setting up FCM message listener:', error);
      return () => {};
    }
  }

  isSupported(): boolean {
    return getMessaging() !== null;
  }

  getPermissionStatus(): FCMPermissionState {
    // RN Firebase checks permissions differently
    return {
      status: 'default',
      token: null,
    };
  }
}

export class RNFirebaseService implements FirebaseService {
  public analytics: AnalyticsService;
  public remoteConfig: RemoteConfigService;
  public messaging: FCMService;
  private options: FirebaseInitOptions;

  constructor(options: FirebaseInitOptions = {}) {
    this.options = options;
    this.analytics = new RNAnalyticsService();
    this.remoteConfig = new RNRemoteConfigService();
    this.messaging = new RNFCMService();
  }

  isConfigured(): boolean {
    // RN Firebase is configured via native files (google-services.json / GoogleService-Info.plist)
    return true;
  }

  isDevelopment(): boolean {
    return this.options.enableDevelopmentMode ?? false;
  }
}

/**
 * Create a React Native Firebase service instance
 */
export function createRNFirebaseService(
  options?: FirebaseInitOptions
): FirebaseService {
  return new RNFirebaseService(options);
}

// Singleton management
let firebaseService: RNFirebaseService | null = null;

export function getFirebaseService(): RNFirebaseService {
  if (!firebaseService) {
    // Auto-initialize with defaults for RN (since config is in native files)
    firebaseService = new RNFirebaseService();
  }
  return firebaseService;
}

export function initializeFirebaseService(
  options?: FirebaseInitOptions
): RNFirebaseService {
  firebaseService = new RNFirebaseService(options);
  return firebaseService;
}

export function resetFirebaseService(): void {
  firebaseService = null;
}

// Export the RN analytics service class for direct use
export { RNAnalyticsService };
