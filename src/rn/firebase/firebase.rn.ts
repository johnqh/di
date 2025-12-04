/**
 * React Native implementation of Firebase services
 * Uses React Native Firebase SDK (@react-native-firebase/*)
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
} from '../../web/firebase/firebase.interface.js';

// Re-export interfaces for convenience
export type {
  FirebaseService,
  AnalyticsService,
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
  AnalyticsEvent,
} from '../../web/firebase/firebase.interface.js';

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

function getAnalyticsModule() {
  if (!analyticsModule) {
    try {
      analyticsModule = require('@react-native-firebase/analytics');
    } catch (e) {
      console.warn('Firebase Analytics not available:', e);
    }
  }
  const analytics = analyticsModule?.default ?? analyticsModule;
  return typeof analytics === 'function' ? analytics() : null;
}

function getRemoteConfigModule() {
  if (!remoteConfigModule) {
    try {
      remoteConfigModule = require('@react-native-firebase/remote-config');
    } catch (e) {
      console.warn('Firebase Remote Config not available:', e);
    }
  }
  const remoteConfig = remoteConfigModule?.default ?? remoteConfigModule;
  return typeof remoteConfig === 'function' ? remoteConfig() : null;
}

function getMessagingModule() {
  if (!messagingModule) {
    try {
      messagingModule = require('@react-native-firebase/messaging');
    } catch (e) {
      console.warn('Firebase Messaging not available:', e);
    }
  }
  const messaging = messagingModule?.default ?? messagingModule;
  return typeof messaging === 'function' ? messaging() : null;
}

// Default configuration
const DEFAULT_OPTIONS: FirebaseInitOptions = {
  enableAnalytics: true,
  enableRemoteConfig: true,
  enableMessaging: true,
  enableDevelopmentMode: false,
};

/**
 * React Native Analytics Service using Firebase Analytics
 */
class RNAnalyticsService implements AnalyticsService {
  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    if (!this.isSupported()) return;

    const analytics = getAnalyticsModule();
    if (!analytics) return;

    analytics
      .logEvent(eventName, parameters as Record<string, string | number>)
      .catch(() => {
        // Silently handle analytics errors
      });
  }

  setUserProperties(properties: Record<string, string>): void {
    if (!this.isSupported()) return;

    const analytics = getAnalyticsModule();
    if (!analytics) return;

    for (const [key, value] of Object.entries(properties)) {
      analytics.setUserProperty(key, value).catch(() => {
        // Silently handle analytics errors
      });
    }
  }

  setUserId(userId: string): void {
    if (!this.isSupported()) return;

    const analytics = getAnalyticsModule();
    if (!analytics) return;

    analytics.setUserId(userId).catch(() => {
      // Silently handle analytics errors
    });
  }

  isSupported(): boolean {
    return getAnalyticsModule() !== null;
  }
}

/**
 * React Native Remote Config Value wrapper
 */
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

/**
 * Default Remote Config Value for when service is unavailable
 */
class DefaultRemoteConfigValue implements RemoteConfigValue {
  asBoolean(): boolean {
    return false;
  }
  asString(): string {
    return '';
  }
  asNumber(): number {
    return 0;
  }
  getSource(): 'static' | 'default' | 'remote' {
    return 'default';
  }
}

/**
 * React Native Remote Config Service
 */
class RNRemoteConfigService implements RemoteConfigService {
  async fetchAndActivate(): Promise<boolean> {
    if (!this.isSupported()) return false;

    const remoteConfig = getRemoteConfigModule();
    if (!remoteConfig) return false;

    try {
      await remoteConfig.setConfigSettings({
        minimumFetchIntervalMillis: 0,
      });
      await remoteConfig.fetchAndActivate();
      return true;
    } catch (error) {
      console.error('Error fetching remote config:', error);
      return false;
    }
  }

  getValue(key: string): RemoteConfigValue {
    if (!this.isSupported()) {
      return new DefaultRemoteConfigValue();
    }

    const remoteConfig = getRemoteConfigModule();
    if (!remoteConfig) {
      return new DefaultRemoteConfigValue();
    }

    try {
      const value = remoteConfig.getValue(key);
      return new RNRemoteConfigValue(value);
    } catch {
      return new DefaultRemoteConfigValue();
    }
  }

  getAll(): Record<string, RemoteConfigValue> {
    if (!this.isSupported()) return {};

    const remoteConfig = getRemoteConfigModule();
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
    } catch {
      return {};
    }
  }

  isSupported(): boolean {
    return getRemoteConfigModule() !== null;
  }
}

/**
 * React Native FCM Service for push notifications
 */
class RNFCMService implements FCMService {
  private messageUnsubscribe: (() => void) | null = null;

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    const messaging = getMessagingModule();
    if (!messaging) return false;

    try {
      const authStatus = await messaging.requestPermission();
      // AuthorizationStatus: NOT_DETERMINED = -1, DENIED = 0, AUTHORIZED = 1, PROVISIONAL = 2
      return authStatus === 1 || authStatus === 2;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.isSupported()) return null;

    const messaging = getMessagingModule();
    if (!messaging) return null;

    try {
      const token = await messaging.getToken();
      return token || null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async deleteToken(): Promise<boolean> {
    if (!this.isSupported()) return false;

    const messaging = getMessagingModule();
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
    if (!this.isSupported()) {
      return () => {};
    }

    const messaging = getMessagingModule();
    if (!messaging) {
      return () => {};
    }

    try {
      this.messageUnsubscribe = messaging.onMessage((remoteMessage) => {
        const message: FCMMessage = {};

        if (remoteMessage.messageId) {
          message.messageId = remoteMessage.messageId;
        }
        if (remoteMessage.from) {
          message.from = remoteMessage.from;
        }
        if (remoteMessage.collapseKey) {
          message.collapseKey = remoteMessage.collapseKey;
        }

        if (remoteMessage.notification) {
          message.notification = {};
          if (remoteMessage.notification.title) {
            message.notification.title = remoteMessage.notification.title;
          }
          if (remoteMessage.notification.body) {
            message.notification.body = remoteMessage.notification.body;
          }
          if (remoteMessage.notification.ios?.imageUrl) {
            message.notification.image =
              remoteMessage.notification.ios.imageUrl;
          }
        }

        if (remoteMessage.data) {
          message.data = remoteMessage.data;
        }

        callback(message);
      });

      return () => {
        if (this.messageUnsubscribe) {
          this.messageUnsubscribe();
          this.messageUnsubscribe = null;
        }
      };
    } catch (error) {
      console.error('Error setting up message listener:', error);
      return () => {};
    }
  }

  isSupported(): boolean {
    return getMessagingModule() !== null;
  }

  getPermissionStatus(): FCMPermissionState {
    // React Native Firebase doesn't have a sync way to check permission
    // Return default and let consumers use requestPermission for accurate status
    return {
      status: 'default',
      token: null,
    };
  }
}

/**
 * React Native Firebase Service
 * Provides unified access to Firebase Analytics, Remote Config, and Messaging
 */
export class RNFirebaseService implements FirebaseService {
  public analytics: AnalyticsService;
  public remoteConfig: RemoteConfigService;
  public messaging: FCMService;

  private options: FirebaseInitOptions;
  private configured: boolean = false;

  constructor(options: FirebaseInitOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Initialize services
    this.analytics = new RNAnalyticsService();
    this.remoteConfig = new RNRemoteConfigService();
    this.messaging = new RNFCMService();

    // Check if Firebase is configured (app is initialized via native config)
    this.configured = this.checkConfiguration();
  }

  private checkConfiguration(): boolean {
    // In React Native Firebase, the app is configured via google-services.json (Android)
    // and GoogleService-Info.plist (iOS), so we check if modules are available
    return (
      this.analytics.isSupported() ||
      this.remoteConfig.isSupported() ||
      this.messaging.isSupported()
    );
  }

  isConfigured(): boolean {
    return this.configured;
  }

  isDevelopment(): boolean {
    return this.options.enableDevelopmentMode || !this.configured;
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

export const rnFirebaseService = new RNFirebaseService();
