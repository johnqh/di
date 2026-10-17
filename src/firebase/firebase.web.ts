/**
 * Web implementation of Firebase services
 * Uses Firebase Web SDK v9+
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  Analytics,
  logEvent,
  setUserProperties,
  setUserId,
} from 'firebase/analytics';
import {
  getMessaging,
  Messaging,
  getToken,
  onMessage,
  deleteToken,
  isSupported as isMessagingSupported,
} from 'firebase/messaging';

import {
  FirebaseService,
  AnalyticsService,
  FCMService,
  FirebaseConfig,
  FirebaseInitOptions,
  FCMMessage,
  FCMPermissionState,
} from './firebase.interface.js';
import {
  hashUserIdForAnalytics,
  toAnalyticsEventName,
} from './firebase-utils.js';

// Default configuration
const DEFAULT_OPTIONS: FirebaseInitOptions = {
  enableAnalytics: true,
  enableMessaging: true,
  enableDevelopmentMode: false,
};

class WebAnalyticsService implements AnalyticsService {
  constructor(private analytics: Analytics | null) {}

  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    if (this.analytics && this.isSupported()) {
      try {
        logEvent(this.analytics, toAnalyticsEventName(eventName), parameters);
      } catch (error) {
        console.error('Error logging analytics event:', error);
      }
    }
  }

  setUserProperties(properties: Record<string, string>): void {
    if (this.analytics && this.isSupported()) {
      try {
        setUserProperties(this.analytics, properties);
      } catch (error) {
        console.error('Error setting user properties:', error);
      }
    }
  }

  setUserId(userId: string): void {
    if (this.analytics && this.isSupported()) {
      try {
        // Hash the user ID for privacy before sending to analytics
        const hashedId = hashUserIdForAnalytics(userId);
        setUserId(this.analytics, hashedId);
        // Also set as a user property for easier querying
        setUserProperties(this.analytics, { user_hash: hashedId });
      } catch (error) {
        console.error('Error setting user ID:', error);
      }
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && this.analytics !== null;
  }
}

class WebFCMService implements FCMService {
  private unsubscribe?: () => void;

  constructor(
    private messaging: Messaging | null,
    private vapidKey: string
  ) {}

  async requestPermission(): Promise<boolean> {
    if (
      !this.isSupported() ||
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.messaging || !this.isSupported()) {
      return null;
    }

    try {
      if (Notification.permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: this.vapidKey,
        });
        return token || null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  }

  async deleteToken(): Promise<boolean> {
    if (!this.messaging || !this.isSupported()) {
      return false;
    }

    try {
      return await deleteToken(this.messaging);
    } catch (error) {
      console.error('Error deleting FCM token:', error);
      return false;
    }
  }

  onMessage(callback: (message: FCMMessage) => void): () => void {
    if (!this.messaging || !this.isSupported()) {
      return () => {};
    }

    try {
      this.unsubscribe = onMessage(this.messaging, (payload) => {
        const message: FCMMessage = {
          ...(payload.notification && { notification: payload.notification }),
          ...(payload.data && { data: payload.data }),
          ...(payload.messageId && { messageId: payload.messageId }),
          ...(payload.from && { from: payload.from }),
          ...(payload.collapseKey && { collapseKey: payload.collapseKey }),
        };
        callback(message);
      });

      const cleanup = (): void => {
        if (this.unsubscribe) {
          this.unsubscribe();
          delete this.unsubscribe;
        }
      };
      return cleanup;
    } catch (error) {
      console.error('Error setting up FCM message listener:', error);
      return () => {};
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && this.messaging !== null;
  }

  getPermissionStatus(): FCMPermissionState {
    if (
      !this.isSupported() ||
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      return { status: 'denied', token: null };
    }

    return {
      status: Notification.permission,
      token: null, // Token is fetched separately
    };
  }
}

export class WebFirebaseService implements FirebaseService {
  public analytics: AnalyticsService;
  public messaging: FCMService;

  private app: FirebaseApp | null = null;
  private config: FirebaseConfig;
  private options: FirebaseInitOptions;
  private configured: boolean = false;

  constructor(config: FirebaseConfig, options: FirebaseInitOptions = {}) {
    this.config = config;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Initialize Firebase
    this.initializeFirebase();

    // Initialize services
    this.analytics = new WebAnalyticsService(this.initializeAnalytics());
    this.messaging = new WebFCMService(null, config.vapidKey || '');
    this.initializeMessaging()
      .then((messaging) => {
        if (messaging) {
          this.messaging = new WebFCMService(messaging, config.vapidKey || '');
        }
      })
      .catch(console.error);
  }

  private initializeFirebase(): void {
    try {
      // Validate configuration. Only what initializeApp and Analytics need:
      // authDomain belongs to Auth and storageBucket to Storage, and neither
      // is initialized here. Requiring them turned Analytics off for apps
      // that do not use Auth.
      const requiredFields = ['apiKey', 'projectId', 'appId'] as const;
      const missingFields = requiredFields.filter(
        (field) => !this.config[field]
      );
      if (this.options.enableMessaging && !this.config.messagingSenderId) {
        // Messaging alone needs the sender id; keep Analytics running.
        this.options = { ...this.options, enableMessaging: false };
      }

      if (missingFields.length > 0) {
        this.configured = false;
        // Previously silent: a typo in one env var disabled Analytics with
        // no trace. Say which fields are missing.
        console.warn(
          `[di] Firebase is not configured (missing ${missingFields.join(', ')}); ` +
            'analytics and messaging are disabled.'
        );
        return;
      }

      // Initialize app (avoid duplicate initialization)
      // Exclude vapidKey since it's not a Firebase app config property
      const { vapidKey: _, ...firebaseAppConfig } = this.config;
      this.app =
        getApps().length === 0 ? initializeApp(firebaseAppConfig) : getApp();
      this.configured = true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      this.configured = false;
    }
  }

  private initializeAnalytics(): Analytics | null {
    if (
      !this.app ||
      !this.options.enableAnalytics ||
      typeof window === 'undefined'
    ) {
      return null;
    }

    try {
      // Google Consent Mode v2 — push defaults BEFORE the tag loads.
      // With all consent types denied, GA4 sends cookieless pings
      // (no _ga/_gid cookies) and uses behavioral modeling for reporting.
      // Format: single array entry matching gtag() command queue convention.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push([
        'consent',
        'default',
        {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        },
      ]);

      return getAnalytics(this.app);
    } catch (error) {
      console.error('Error initializing Analytics:', error);
      return null;
    }
  }

  private async initializeMessaging(): Promise<Messaging | null> {
    if (
      !this.app ||
      !this.options.enableMessaging ||
      typeof window === 'undefined'
    ) {
      return null;
    }

    try {
      // Check if messaging is supported first
      return new Promise<Messaging | null>((resolve) => {
        isMessagingSupported()
          .then((supported) => {
            if (supported) {
              try {
                const messaging = getMessaging(this.app!);
                resolve(messaging);
              } catch (error) {
                console.error('Error getting messaging instance:', error);
                resolve(null);
              }
            } else {
              resolve(null);
            }
          })
          .catch(() => {
            resolve(null);
          });
      });
    } catch (error) {
      console.error('Error initializing messaging:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  isDevelopment(): boolean {
    return this.options.enableDevelopmentMode || !this.configured;
  }
}

/**
 * Create a web Firebase service instance
 */
export function createWebFirebaseService(
  config: FirebaseConfig,
  options?: FirebaseInitOptions
): FirebaseService {
  return new WebFirebaseService(config, options);
}

// Singleton management
let firebaseService: WebFirebaseService | null = null;

export function getFirebaseService(): WebFirebaseService {
  if (!firebaseService) {
    throw new Error(
      'Firebase service not initialized. Call initializeFirebaseService() first.'
    );
  }
  return firebaseService;
}

export function initializeFirebaseService(
  config: FirebaseConfig,
  options?: FirebaseInitOptions
): WebFirebaseService {
  firebaseService = new WebFirebaseService(config, options);
  return firebaseService;
}

export function resetFirebaseService(): void {
  firebaseService = null;
}
