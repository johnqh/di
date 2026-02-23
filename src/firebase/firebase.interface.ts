/**
 * Platform-agnostic Firebase interface
 * Abstracts Firebase services to work across web and React Native
 */

/** A named analytics event with optional parameters */
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, unknown>;
}

/** Service for logging analytics events and managing user identity */
export interface AnalyticsService {
  /** Log a named event with optional key-value parameters */
  logEvent(eventName: string, parameters?: Record<string, unknown>): void;
  /** Set persistent user properties for segmentation */
  setUserProperties(properties: Record<string, string>): void;
  /** Associate a user ID with future analytics events */
  setUserId(userId: string): void;
  /** Whether analytics collection is available on this platform */
  isSupported(): boolean;
}

/** A single Remote Config value that can be read as multiple types */
export interface RemoteConfigValue {
  /** Read the value as a boolean */
  asBoolean(): boolean;
  /** Read the value as a string */
  asString(): string;
  /** Read the value as a number */
  asNumber(): number;
  /** Where this value came from: static default, developer default, or fetched remote */
  getSource(): 'static' | 'default' | 'remote';
}

/** Service for fetching and reading Firebase Remote Config values */
export interface RemoteConfigService {
  /** Fetch remote values and activate them for use */
  fetchAndActivate(): Promise<boolean>;
  /** Get a single config value by key */
  getValue(key: string): RemoteConfigValue;
  /** Get all config values as a key-value map */
  getAll(): Record<string, RemoteConfigValue>;
  /** Whether Remote Config is available on this platform */
  isSupported(): boolean;
}

/** Push notification payload from Firebase Cloud Messaging */
export interface FCMNotificationPayload {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/** Custom data payload attached to an FCM message */
export interface FCMDataPayload {
  [key: string]: string;
}

/** A Firebase Cloud Messaging message with optional notification and data */
export interface FCMMessage {
  notification?: FCMNotificationPayload;
  data?: FCMDataPayload;
  messageId?: string;
  from?: string;
  collapseKey?: string;
}

/** Current permission status and token for push notifications */
export interface FCMPermissionState {
  status: 'granted' | 'denied' | 'default';
  token: string | null;
}

/** Combined FCM state including support detection and permission */
export interface FCMState {
  isSupported: boolean;
  permission: FCMPermissionState;
}

/** Service for managing Firebase Cloud Messaging (push notifications) */
export interface FCMService {
  /** Request permission to show push notifications */
  requestPermission(): Promise<boolean>;
  /** Get the device push token (requires granted permission) */
  getToken(): Promise<string | null>;
  /** Delete the current push token */
  deleteToken(): Promise<boolean>;
  /** Subscribe to incoming messages; returns an unsubscribe function */
  onMessage(callback: (message: FCMMessage) => void): () => void;
  /** Whether FCM is available on this platform */
  isSupported(): boolean;
  /** Get the current notification permission status */
  getPermissionStatus(): FCMPermissionState;
}

/** Composite Firebase service exposing analytics, remote config, and messaging */
export interface FirebaseService {
  analytics: AnalyticsService;
  remoteConfig: RemoteConfigService;
  messaging: FCMService;
  /** Whether the Firebase app was successfully initialized */
  isConfigured(): boolean;
  /** Whether the service is running in development/debug mode */
  isDevelopment(): boolean;
}

/** Configuration for initializing a Firebase app */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  /** VAPID key for web push notifications (web only) */
  vapidKey?: string;
}

/** Options controlling which Firebase services to enable */
export interface FirebaseInitOptions {
  enableAnalytics?: boolean;
  enableRemoteConfig?: boolean;
  enableMessaging?: boolean;
  enableDevelopmentMode?: boolean;
}
