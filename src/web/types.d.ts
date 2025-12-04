/**
 * Type declarations for Firebase Web SDK
 * These are stubs for TypeScript compilation - actual implementations come from firebase package
 */

declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, unknown>;
  }

  export function initializeApp(config: Record<string, unknown>): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(name?: string): FirebaseApp;
}

declare module 'firebase/analytics' {
  import { FirebaseApp } from 'firebase/app';

  export interface Analytics {
    app: FirebaseApp;
  }

  export function getAnalytics(app: FirebaseApp): Analytics;
  export function logEvent(
    analytics: Analytics,
    eventName: string,
    eventParams?: Record<string, unknown>
  ): void;
  export function setUserProperties(
    analytics: Analytics,
    properties: Record<string, string>
  ): void;
  export function setUserId(analytics: Analytics, userId: string): void;
}

declare module 'firebase/remote-config' {
  import { FirebaseApp } from 'firebase/app';

  export interface Value {
    asBoolean(): boolean;
    asString(): string;
    asNumber(): number;
    getSource(): string;
  }

  export interface RemoteConfig {
    app: FirebaseApp;
  }

  export function getRemoteConfig(app: FirebaseApp): RemoteConfig;
  export function fetchAndActivate(config: RemoteConfig): Promise<boolean>;
  export function getValue(config: RemoteConfig, key: string): Value;
  export function getAll(config: RemoteConfig): Record<string, Value>;
}

declare module 'firebase/messaging' {
  import { FirebaseApp } from 'firebase/app';

  export interface MessagePayload {
    notification?: {
      title?: string;
      body?: string;
      icon?: string;
      badge?: string;
      image?: string;
      tag?: string;
      requireInteraction?: boolean;
    };
    data?: Record<string, string>;
    messageId?: string;
    from?: string;
    collapseKey?: string;
  }

  export interface Messaging {
    app: FirebaseApp;
  }

  export function getMessaging(app: FirebaseApp): Messaging;
  export function getToken(
    messaging: Messaging,
    options?: { vapidKey?: string }
  ): Promise<string>;
  export function onMessage(
    messaging: Messaging,
    callback: (payload: MessagePayload) => void
  ): () => void;
  export function deleteToken(messaging: Messaging): Promise<boolean>;
  export function isSupported(): Promise<boolean>;
}
