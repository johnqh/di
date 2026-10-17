/**
 * React Native implementation of Firebase services
 * Uses @react-native-firebase/* packages
 */

import type {
  FirebaseService,
  AnalyticsService,
  FCMService,
  FirebaseInitOptions,
  FCMMessage,
  FCMPermissionState,
} from './firebase.interface.js';
import {
  hashUserIdForAnalytics,
  toAnalyticsEventName,
} from './firebase-utils.js';

// Lazy load Firebase modules to avoid crashes if native modules are not linked
type FirebaseAnalyticsModule =
  typeof import('@react-native-firebase/analytics');
type FirebaseMessagingModule =
  typeof import('@react-native-firebase/messaging');

let analyticsModule: FirebaseAnalyticsModule | null = null;
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

class RNAnalyticsService implements AnalyticsService {
  private enabled: boolean = true;

  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    if (!this.enabled) return;
    const analytics = getAnalytics();
    if (!analytics) return;

    analytics
      .logEvent(
        toAnalyticsEventName(eventName),
        parameters as Record<string, string | number>
      )
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
  public messaging: FCMService;
  private options: FirebaseInitOptions;

  constructor(options: FirebaseInitOptions = {}) {
    this.options = options;
    this.analytics = new RNAnalyticsService();
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
