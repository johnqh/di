/**
 * Type declarations for React Native globals and native modules
 * These are stubs for TypeScript compilation - actual implementations come from native packages
 */

// React Native global for development mode detection
declare const __DEV__: boolean;

// Stub module declarations for React Native native modules
declare module 'react-native' {
  export type ColorSchemeName = 'light' | 'dark' | null;

  export interface AppearancePreferences {
    colorScheme: ColorSchemeName;
  }

  export interface Appearance {
    getColorScheme(): ColorSchemeName;
    addChangeListener(listener: (preferences: AppearancePreferences) => void): {
      remove: () => void;
    };
    removeChangeListener(
      listener: (preferences: AppearancePreferences) => void
    ): void;
  }

  export const Appearance: Appearance;
}

declare module 'react-native-config' {
  const Config: Record<string, string | undefined>;
  export default Config;
}

declare module '@react-native-async-storage/async-storage' {
  interface AsyncStorageStatic {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<readonly string[]>;
    multiRemove(keys: string[]): Promise<void>;
  }

  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}

declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
    details: unknown;
  }

  interface NetInfoStatic {
    fetch(): Promise<NetInfoState>;
    addEventListener(listener: (state: NetInfoState) => void): () => void;
  }

  const NetInfo: NetInfoStatic;
  export default NetInfo;
  export type { NetInfoState };
}

declare module '@notifee/react-native' {
  export interface AndroidImportance {
    HIGH: number;
    DEFAULT: number;
    LOW: number;
    MIN: number;
    NONE: number;
  }

  export interface AuthorizationStatus {
    AUTHORIZED: number;
    DENIED: number;
    NOT_DETERMINED: number;
    PROVISIONAL: number;
  }

  export const AndroidImportance: AndroidImportance;
  export const AuthorizationStatus: AuthorizationStatus;

  export interface NotificationSettings {
    authorizationStatus: number;
  }

  export interface AndroidChannel {
    id: string;
    name: string;
    importance?: number;
  }

  export interface NotificationPressAction {
    id: string;
  }

  export interface AndroidNotification {
    channelId: string;
    smallIcon?: string;
    pressAction?: NotificationPressAction;
  }

  export interface IOSNotification {
    sound?: string;
  }

  export interface Notification {
    title: string;
    body?: string;
    data?: Record<string, unknown>;
    android?: AndroidNotification;
    ios?: IOSNotification;
  }

  interface NotifeeStatic {
    createChannel(channel: AndroidChannel): Promise<string>;
    displayNotification(notification: Notification): Promise<string>;
    cancelNotification(id: string): Promise<void>;
    cancelAllNotifications(): Promise<void>;
    requestPermission(): Promise<NotificationSettings>;
    getBadgeCount(): Promise<number>;
    setBadgeCount(count: number): Promise<void>;
  }

  const Notifee: NotifeeStatic;
  export default Notifee;
}

declare module '@react-native-firebase/analytics' {
  interface FirebaseAnalytics {
    logEvent(
      name: string,
      params?: Record<string, string | number>
    ): Promise<void>;
    logScreenView(params: {
      screen_name: string;
      screen_class?: string;
    }): Promise<void>;
    setUserProperty(name: string, value: string): Promise<void>;
    setUserId(id: string | null): Promise<void>;
    setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
  }

  function analytics(): FirebaseAnalytics;
  export default analytics;
}

declare module '@react-native-firebase/remote-config' {
  interface RemoteConfigValue {
    asBoolean(): boolean;
    asString(): string;
    asNumber(): number;
    getSource(): string;
  }

  interface FirebaseRemoteConfig {
    setConfigSettings(settings: {
      minimumFetchIntervalMillis?: number;
    }): Promise<void>;
    fetchAndActivate(): Promise<boolean>;
    getValue(key: string): RemoteConfigValue;
    getAll(): Record<string, RemoteConfigValue>;
  }

  function remoteConfig(): FirebaseRemoteConfig;
  export default remoteConfig;
}

declare module '@react-native-firebase/messaging' {
  interface RemoteMessage {
    messageId?: string;
    from?: string;
    collapseKey?: string;
    notification?: {
      title?: string;
      body?: string;
      ios?: {
        imageUrl?: string;
      };
      android?: {
        imageUrl?: string;
      };
    };
    data?: Record<string, string>;
  }

  interface FirebaseMessaging {
    requestPermission(): Promise<number>;
    getToken(): Promise<string>;
    deleteToken(): Promise<void>;
    onMessage(callback: (message: RemoteMessage) => void): () => void;
    onNotificationOpenedApp(
      callback: (message: RemoteMessage) => void
    ): () => void;
    getInitialNotification(): Promise<RemoteMessage | null>;
  }

  function messaging(): FirebaseMessaging;
  export default messaging;
}

declare module '@react-navigation/native' {
  export interface NavigationRoute {
    key?: string;
    name: string;
    params?: Record<string, unknown>;
    state?: NavigationState;
  }

  export interface NavigationState {
    index: number;
    routes: NavigationRoute[];
    key?: string;
    routeNames?: string[];
    type?: string;
    stale?: boolean;
  }

  export interface ResetState {
    index: number;
    routes: Array<{ name: string; params?: Record<string, unknown> }>;
  }

  export interface NavigationContainerRef<T = Record<string, unknown>> {
    navigate(name: string, params?: T): void;
    goBack(): void;
    canGoBack(): boolean;
    isReady(): boolean;
    getCurrentRoute(): NavigationRoute | undefined;
    getRootState(): NavigationState;
    reset(state: ResetState): void;
    addListener(event: string, callback: () => void): () => void;
  }

  export function useNavigationContainerRef<
    T = Record<string, unknown>,
  >(): NavigationContainerRef<T>;
}
