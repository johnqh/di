/**
 * Mock implementations for notification interfaces.
 *
 * @ai-context Test mocks for NotificationService, NotificationClient, NotificationContextProvider, PlatformNotifications
 * @ai-usage Use in unit tests to mock notification operations
 */

import type { Optional } from '@sudobility/types';
import type {
  NotificationService,
  NotificationOptions,
  NotificationResult,
  NotificationPermissionResult,
  NotificationCapabilities,
  NotificationConfig,
  NotificationClient,
  NotificationContextProvider,
} from '../notification/notification.js';
import type { PlatformNotifications } from '../notification/platform-notifications.js';

/**
 * Recorded notification for testing assertions.
 */
export interface RecordedNotification {
  id: string;
  title: string;
  options?: NotificationOptions | undefined;
  timestamp: number;
}

/**
 * Mock implementation of NotificationService for testing.
 *
 * @example
 * ```typescript
 * const notifications = new MockNotificationService();
 * await notifications.showNotification('Hello', { body: 'World' });
 * expect(notifications.getNotifications()).toHaveLength(1);
 * ```
 */
export class MockNotificationService implements NotificationService {
  private supported: boolean = true;
  private permission: 'granted' | 'denied' | 'default' = 'default';
  private notifications: Map<string, RecordedNotification> = new Map();
  private clickHandler: ((data?: Optional<unknown>) => void) | null = null;
  private nextId: number = 1;

  isSupported(): boolean {
    return this.supported;
  }

  getPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (!this.supported) return 'unsupported';
    return this.permission;
  }

  async requestPermission(): Promise<NotificationPermissionResult> {
    // Simulate permission request
    return {
      granted: this.permission === 'granted',
      permission: this.permission,
    };
  }

  async showNotification(
    title: string,
    options?: Optional<NotificationOptions>
  ): Promise<NotificationResult> {
    if (!this.supported) {
      return { success: false, error: 'Notifications not supported' };
    }

    if (this.permission !== 'granted') {
      return { success: false, error: 'Permission not granted' };
    }

    const id = `notification-${this.nextId++}`;
    const notification: RecordedNotification = {
      id,
      title,
      options: options ?? undefined,
      timestamp: Date.now(),
    };

    this.notifications.set(id, notification);

    return { success: true, notificationId: id };
  }

  async closeNotification(notificationId: string): Promise<boolean> {
    return this.notifications.delete(notificationId);
  }

  async clearAllNotifications(): Promise<boolean> {
    this.notifications.clear();
    return true;
  }

  setClickHandler(handler: (data?: Optional<unknown>) => void): void {
    this.clickHandler = handler;
  }

  hasPermission(): boolean {
    return this.permission === 'granted';
  }

  getCapabilities(): NotificationCapabilities {
    return {
      supportsActions: true,
      supportsIcon: true,
      supportsBadge: true,
      supportsData: true,
      supportsSound: true,
      supportsVibration: false,
      maxActions: 2,
    };
  }

  // Test helper methods

  /**
   * Set supported status for testing
   */
  setSupported(supported: boolean): void {
    this.supported = supported;
  }

  /**
   * Set permission status for testing
   */
  setPermission(permission: 'granted' | 'denied' | 'default'): void {
    this.permission = permission;
  }

  /**
   * Get all notifications
   */
  getNotifications(): RecordedNotification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Get a specific notification by ID
   */
  getNotificationById(id: string): RecordedNotification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Simulate a notification click
   */
  simulateClick(notificationId: string, data?: unknown): void {
    const notification = this.notifications.get(notificationId);
    if (notification && this.clickHandler) {
      this.clickHandler(data ?? notification.options?.data);
    }
  }

  /**
   * Get the click handler for testing
   */
  getClickHandler(): ((data?: Optional<unknown>) => void) | null {
    return this.clickHandler;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.supported = true;
    this.permission = 'default';
    this.notifications.clear();
    this.clickHandler = null;
    this.nextId = 1;
  }
}

/**
 * Creates a default mock NotificationConfig for testing.
 */
export function createMockNotificationConfig(
  overrides: Partial<NotificationConfig> = {}
): NotificationConfig {
  return {
    enableAutoClose: true,
    autoCloseDelay: 5000,
    defaultIcon: '/icon.png',
    enableDebugLogging: false,
    fallbackToAlert: true,
    ...overrides,
  };
}

/**
 * Mock implementation of NotificationClient for testing.
 *
 * @example
 * ```typescript
 * const client = new MockNotificationClient();
 * await client.show('Test', { body: 'Message' });
 * expect(client.service.getNotifications()).toHaveLength(1);
 * ```
 */
export class MockNotificationClient implements NotificationClient {
  service: NotificationService;
  config: NotificationConfig;

  constructor(
    service?: NotificationService,
    config?: Partial<NotificationConfig>
  ) {
    this.service = service ?? new MockNotificationService();
    this.config = createMockNotificationConfig(config);
  }

  async show(
    title: string,
    options?: Optional<NotificationOptions>
  ): Promise<NotificationResult> {
    const mergedOptions: NotificationOptions = {
      icon: this.config.defaultIcon,
      ...options,
    };
    return this.service.showNotification(title, mergedOptions);
  }

  async requestPermissions(): Promise<NotificationPermissionResult> {
    return this.service.requestPermission();
  }

  // Test helper methods

  /**
   * Get the underlying mock service (if using default)
   */
  getMockService(): MockNotificationService | null {
    return this.service instanceof MockNotificationService
      ? this.service
      : null;
  }

  /**
   * Reset the client
   */
  reset(): void {
    if (this.service instanceof MockNotificationService) {
      this.service.reset();
    }
    this.config = createMockNotificationConfig();
  }
}

/**
 * Mock implementation of NotificationContextProvider for testing.
 *
 * @example
 * ```typescript
 * const context = new MockNotificationContextProvider();
 * context.setHasPermission(true);
 * expect(context.hasPermission).toBe(true);
 * ```
 */
export class MockNotificationContextProvider
  implements NotificationContextProvider
{
  client: NotificationClient;
  isSupported: boolean = true;
  hasPermission: boolean = false;

  private permissionRequested: boolean = false;

  constructor(client?: NotificationClient) {
    this.client = client ?? new MockNotificationClient();
  }

  async requestPermission(): Promise<void> {
    this.permissionRequested = true;
    const result = await this.client.requestPermissions();
    this.hasPermission = result.granted;
  }

  // Test helper methods

  /**
   * Set isSupported for testing
   */
  setIsSupported(supported: boolean): void {
    this.isSupported = supported;
  }

  /**
   * Set hasPermission for testing
   */
  setHasPermission(hasPermission: boolean): void {
    this.hasPermission = hasPermission;
  }

  /**
   * Check if permission was requested
   */
  wasPermissionRequested(): boolean {
    return this.permissionRequested;
  }

  /**
   * Get the underlying mock client
   */
  getMockClient(): MockNotificationClient | null {
    return this.client instanceof MockNotificationClient ? this.client : null;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.isSupported = true;
    this.hasPermission = false;
    this.permissionRequested = false;
    if (this.client instanceof MockNotificationClient) {
      this.client.reset();
    }
  }
}

/**
 * Recorded platform notification for testing assertions.
 */
export interface RecordedPlatformNotification {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  delay?: number;
}

/**
 * Mock implementation of PlatformNotifications for testing.
 *
 * @example
 * ```typescript
 * const notifications = new MockPlatformNotifications();
 * notifications.showNotification('Title', 'Message', 'info');
 * expect(notifications.getNotifications()).toHaveLength(1);
 * ```
 */
export class MockPlatformNotifications implements PlatformNotifications {
  private notifications: RecordedPlatformNotification[] = [];
  private scheduledNotifications: RecordedPlatformNotification[] = [];
  private permissionGranted: boolean = false;

  showNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error'
  ): void {
    this.notifications.push({
      title,
      message,
      type,
      timestamp: Date.now(),
    });
  }

  async requestPermission(): Promise<boolean> {
    return this.permissionGranted;
  }

  scheduleNotification(title: string, message: string, delay: number): void {
    this.scheduledNotifications.push({
      title,
      message,
      type: 'info',
      timestamp: Date.now(),
      delay,
    });
  }

  // Test helper methods

  /**
   * Set permission status for testing
   */
  setPermissionGranted(granted: boolean): void {
    this.permissionGranted = granted;
  }

  /**
   * Get all shown notifications
   */
  getNotifications(): RecordedPlatformNotification[] {
    return [...this.notifications];
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(
    type: 'info' | 'success' | 'warning' | 'error'
  ): RecordedPlatformNotification[] {
    return this.notifications.filter((n) => n.type === type);
  }

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications(): RecordedPlatformNotification[] {
    return [...this.scheduledNotifications];
  }

  /**
   * Get the last notification
   */
  getLastNotification(): RecordedPlatformNotification | undefined {
    return this.notifications[this.notifications.length - 1];
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.notifications = [];
    this.scheduledNotifications = [];
    this.permissionGranted = false;
  }
}
