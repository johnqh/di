/**
 * Mock implementations for Firebase interfaces.
 *
 * @ai-context Test mocks for Firebase services (Analytics, Remote Config, FCM)
 * @ai-usage Use in unit tests to mock Firebase functionality
 */

import type {
  AnalyticsService,
  RemoteConfigService,
  RemoteConfigValue,
  FCMService,
  FCMMessage,
  FCMPermissionState,
  FirebaseService,
  FirebaseConfig,
  FirebaseInitOptions,
} from '../web/firebase/firebase.interface.js';

/**
 * Recorded analytics event for testing assertions.
 */
export interface RecordedFirebaseAnalyticsEvent {
  type: 'event' | 'userProperty' | 'userId';
  name?: string;
  parameters?: Record<string, unknown>;
  properties?: Record<string, string>;
  userId?: string;
  timestamp: number;
}

/**
 * Mock implementation of AnalyticsService for testing.
 *
 * @example
 * ```typescript
 * const analytics = new MockAnalyticsService();
 * analytics.logEvent('purchase', { item: 'premium', price: 9.99 });
 * expect(analytics.getEvents()).toHaveLength(1);
 * expect(analytics.getEvents()[0].name).toBe('purchase');
 * ```
 */
export class MockAnalyticsService implements AnalyticsService {
  private events: RecordedFirebaseAnalyticsEvent[] = [];
  private supported: boolean = true;
  private currentUserId: string | null = null;
  private userProperties: Record<string, string> = {};

  logEvent(eventName: string, parameters?: Record<string, unknown>): void {
    const event: RecordedFirebaseAnalyticsEvent = {
      type: 'event',
      name: eventName,
      timestamp: Date.now(),
    };
    if (parameters !== undefined) {
      event.parameters = parameters;
    }
    this.events.push(event);
  }

  setUserProperties(properties: Record<string, string>): void {
    this.userProperties = { ...this.userProperties, ...properties };
    this.events.push({
      type: 'userProperty',
      properties,
      timestamp: Date.now(),
    });
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
    this.events.push({
      type: 'userId',
      userId,
      timestamp: Date.now(),
    });
  }

  isSupported(): boolean {
    return this.supported;
  }

  // Test helper methods

  /**
   * Set whether analytics is supported
   */
  setSupported(supported: boolean): void {
    this.supported = supported;
  }

  /**
   * Get all recorded events
   */
  getEvents(): RecordedFirebaseAnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(
    type: 'event' | 'userProperty' | 'userId'
  ): RecordedFirebaseAnalyticsEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events by name
   */
  getEventsByName(name: string): RecordedFirebaseAnalyticsEvent[] {
    return this.events.filter((e) => e.name === name);
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.currentUserId;
  }

  /**
   * Get current user properties
   */
  getUserProperties(): Record<string, string> {
    return { ...this.userProperties };
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.events = [];
    this.supported = true;
    this.currentUserId = null;
    this.userProperties = {};
  }
}

/**
 * Mock implementation of RemoteConfigValue for testing.
 */
export class MockRemoteConfigValue implements RemoteConfigValue {
  private value: string;
  private source: 'static' | 'default' | 'remote';

  constructor(
    value: string,
    source: 'static' | 'default' | 'remote' = 'remote'
  ) {
    this.value = value;
    this.source = source;
  }

  asBoolean(): boolean {
    return this.value === 'true' || this.value === '1';
  }

  asString(): string {
    return this.value;
  }

  asNumber(): number {
    return parseFloat(this.value) || 0;
  }

  getSource(): 'static' | 'default' | 'remote' {
    return this.source;
  }
}

/**
 * Mock implementation of RemoteConfigService for testing.
 *
 * @example
 * ```typescript
 * const config = new MockRemoteConfigService();
 * config.setConfig('feature_enabled', 'true');
 * const value = config.getValue('feature_enabled');
 * expect(value.asBoolean()).toBe(true);
 * ```
 */
export class MockRemoteConfigService implements RemoteConfigService {
  private configs: Map<string, MockRemoteConfigValue> = new Map();
  private supported: boolean = true;
  private fetchDelay: number = 0;
  private fetchShouldFail: boolean = false;
  private fetchError: Error | null = null;

  async fetchAndActivate(): Promise<boolean> {
    if (this.fetchDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.fetchDelay));
    }

    if (this.fetchShouldFail) {
      throw this.fetchError || new Error('Remote config fetch failed');
    }

    return true;
  }

  getValue(key: string): RemoteConfigValue {
    return this.configs.get(key) || new MockRemoteConfigValue('', 'default');
  }

  getAll(): Record<string, RemoteConfigValue> {
    const result: Record<string, RemoteConfigValue> = {};
    this.configs.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  isSupported(): boolean {
    return this.supported;
  }

  // Test helper methods

  /**
   * Set whether remote config is supported
   */
  setSupported(supported: boolean): void {
    this.supported = supported;
  }

  /**
   * Set a config value
   */
  setConfig(
    key: string,
    value: string,
    source: 'static' | 'default' | 'remote' = 'remote'
  ): void {
    this.configs.set(key, new MockRemoteConfigValue(value, source));
  }

  /**
   * Set multiple config values
   */
  setConfigs(configs: Record<string, string>): void {
    Object.entries(configs).forEach(([key, value]) => {
      this.setConfig(key, value);
    });
  }

  /**
   * Set fetch delay for testing loading states
   */
  setFetchDelay(delay: number): void {
    this.fetchDelay = delay;
  }

  /**
   * Make fetch fail for testing error handling
   */
  setFetchShouldFail(shouldFail: boolean, error?: Error): void {
    this.fetchShouldFail = shouldFail;
    this.fetchError = error || null;
  }

  /**
   * Clear a specific config
   */
  clearConfig(key: string): void {
    this.configs.delete(key);
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.configs.clear();
    this.supported = true;
    this.fetchDelay = 0;
    this.fetchShouldFail = false;
    this.fetchError = null;
  }
}

/**
 * Recorded FCM event for testing assertions.
 */
export interface RecordedFCMEvent {
  type: 'permissionRequest' | 'getToken' | 'deleteToken' | 'messageReceived';
  token?: string | null;
  message?: FCMMessage;
  timestamp: number;
}

/**
 * Mock implementation of FCMService for testing.
 *
 * @example
 * ```typescript
 * const fcm = new MockFCMService();
 * fcm.setPermissionGranted(true);
 * fcm.setToken('mock-fcm-token');
 * const granted = await fcm.requestPermission();
 * expect(granted).toBe(true);
 * const token = await fcm.getToken();
 * expect(token).toBe('mock-fcm-token');
 * ```
 */
export class MockFCMService implements FCMService {
  private events: RecordedFCMEvent[] = [];
  private supported: boolean = true;
  private permissionStatus: FCMPermissionState = {
    status: 'default',
    token: null,
  };
  private mockToken: string | null = null;
  private messageListeners: Set<(message: FCMMessage) => void> = new Set();
  private permissionRequestDelay: number = 0;
  private tokenRequestDelay: number = 0;
  private shouldFailPermission: boolean = false;
  private shouldFailToken: boolean = false;

  async requestPermission(): Promise<boolean> {
    if (this.permissionRequestDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.permissionRequestDelay)
      );
    }

    this.events.push({
      type: 'permissionRequest',
      timestamp: Date.now(),
    });

    if (this.shouldFailPermission) {
      this.permissionStatus = { status: 'denied', token: null };
      return false;
    }

    this.permissionStatus = {
      status: 'granted',
      token: this.mockToken,
    };
    return true;
  }

  async getToken(): Promise<string | null> {
    if (this.tokenRequestDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.tokenRequestDelay)
      );
    }

    if (this.shouldFailToken) {
      throw new Error('Failed to get FCM token');
    }

    this.events.push({
      type: 'getToken',
      token: this.mockToken,
      timestamp: Date.now(),
    });

    return this.mockToken;
  }

  async deleteToken(): Promise<boolean> {
    this.events.push({
      type: 'deleteToken',
      timestamp: Date.now(),
    });

    this.mockToken = null;
    this.permissionStatus.token = null;
    return true;
  }

  onMessage(callback: (message: FCMMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => {
      this.messageListeners.delete(callback);
    };
  }

  isSupported(): boolean {
    return this.supported;
  }

  getPermissionStatus(): FCMPermissionState {
    return { ...this.permissionStatus };
  }

  // Test helper methods

  /**
   * Set whether FCM is supported
   */
  setSupported(supported: boolean): void {
    this.supported = supported;
  }

  /**
   * Set the mock FCM token
   */
  setToken(token: string | null): void {
    this.mockToken = token;
    if (this.permissionStatus.status === 'granted') {
      this.permissionStatus.token = token;
    }
  }

  /**
   * Set permission granted status
   */
  setPermissionGranted(granted: boolean): void {
    this.permissionStatus = {
      status: granted ? 'granted' : 'denied',
      token: granted ? this.mockToken : null,
    };
  }

  /**
   * Set permission request delay for testing loading states
   */
  setPermissionRequestDelay(delay: number): void {
    this.permissionRequestDelay = delay;
  }

  /**
   * Set token request delay for testing loading states
   */
  setTokenRequestDelay(delay: number): void {
    this.tokenRequestDelay = delay;
  }

  /**
   * Make permission request fail
   */
  setShouldFailPermission(shouldFail: boolean): void {
    this.shouldFailPermission = shouldFail;
  }

  /**
   * Make token request fail
   */
  setShouldFailToken(shouldFail: boolean): void {
    this.shouldFailToken = shouldFail;
  }

  /**
   * Simulate receiving a push message
   */
  simulateMessage(message: FCMMessage): void {
    this.events.push({
      type: 'messageReceived',
      message,
      timestamp: Date.now(),
    });

    this.messageListeners.forEach((listener) => listener(message));
  }

  /**
   * Get all recorded events
   */
  getEvents(): RecordedFCMEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(
    type: 'permissionRequest' | 'getToken' | 'deleteToken' | 'messageReceived'
  ): RecordedFCMEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get number of active message listeners
   */
  getListenerCount(): number {
    return this.messageListeners.size;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.events = [];
    this.supported = true;
    this.permissionStatus = { status: 'default', token: null };
    this.mockToken = null;
    this.messageListeners.clear();
    this.permissionRequestDelay = 0;
    this.tokenRequestDelay = 0;
    this.shouldFailPermission = false;
    this.shouldFailToken = false;
  }
}

/**
 * Mock implementation of FirebaseService for testing.
 *
 * @example
 * ```typescript
 * const firebase = new MockFirebaseService();
 *
 * // Use analytics
 * firebase.analytics.logEvent('screen_view', { screen: 'Home' });
 *
 * // Use remote config
 * firebase.remoteConfig.setConfig('feature_flag', 'true');
 * await firebase.remoteConfig.fetchAndActivate();
 * const value = firebase.remoteConfig.getValue('feature_flag');
 *
 * // Use FCM
 * firebase.messaging.setToken('mock-token');
 * firebase.messaging.setPermissionGranted(true);
 * const token = await firebase.messaging.getToken();
 * ```
 */
export class MockFirebaseService implements FirebaseService {
  public analytics: MockAnalyticsService;
  public remoteConfig: MockRemoteConfigService;
  public messaging: MockFCMService;

  private configured: boolean = true;
  private developmentMode: boolean = false;
  private config: FirebaseConfig | null = null;
  private options: FirebaseInitOptions | null = null;

  constructor(config?: FirebaseConfig, options?: FirebaseInitOptions) {
    this.config = config || null;
    this.options = options || null;
    this.analytics = new MockAnalyticsService();
    this.remoteConfig = new MockRemoteConfigService();
    this.messaging = new MockFCMService();

    if (options?.enableDevelopmentMode) {
      this.developmentMode = true;
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  isDevelopment(): boolean {
    return this.developmentMode;
  }

  // Test helper methods

  /**
   * Set whether Firebase is configured
   */
  setConfigured(configured: boolean): void {
    this.configured = configured;
  }

  /**
   * Set development mode
   */
  setDevelopmentMode(developmentMode: boolean): void {
    this.developmentMode = developmentMode;
  }

  /**
   * Get the config used to initialize
   */
  getConfig(): FirebaseConfig | null {
    return this.config;
  }

  /**
   * Get the options used to initialize
   */
  getOptions(): FirebaseInitOptions | null {
    return this.options;
  }

  /**
   * Reset all state including sub-services
   */
  reset(): void {
    this.configured = true;
    this.developmentMode = false;
    this.analytics.reset();
    this.remoteConfig.reset();
    this.messaging.reset();
  }
}

// Singleton management for tests
let mockFirebaseService: MockFirebaseService | null = null;

/**
 * Get the mock Firebase service singleton.
 */
export function getMockFirebaseService(): MockFirebaseService {
  if (!mockFirebaseService) {
    mockFirebaseService = new MockFirebaseService();
  }
  return mockFirebaseService;
}

/**
 * Initialize the mock Firebase service singleton.
 */
export function initializeMockFirebaseService(
  config?: FirebaseConfig,
  options?: FirebaseInitOptions
): MockFirebaseService {
  mockFirebaseService = new MockFirebaseService(config, options);
  return mockFirebaseService;
}

/**
 * Reset the mock Firebase service singleton.
 */
export function resetMockFirebaseService(): void {
  if (mockFirebaseService) {
    mockFirebaseService.reset();
  }
  mockFirebaseService = null;
}
