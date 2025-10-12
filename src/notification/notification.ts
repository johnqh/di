import { Optional } from '@sudobility/types';

/**
 * Platform-agnostic notification interfaces for cross-platform push notifications and alerts.
 *
 * @ai-context Notification service interfaces for dependency injection with permission management
 * @ai-pattern Service provider with permission handling, capability detection, and event management
 * @ai-platform Universal (Web Notifications API, React Native push notifications, Expo notifications)
 * @ai-usage Implement for Web Notifications API, Firebase Cloud Messaging, Expo notifications, or OneSignal
 * @ai-security Requires user permission - handle permission states and fallbacks appropriately
 *
 * @example
 * ```typescript
 * // Web implementation using Notifications API
 * class WebNotificationService implements NotificationService {
 *   async showNotification(title: string, options?: NotificationOptions): Promise<NotificationResult> {
 *     if (!this.hasPermission()) {
 *       return { success: false, error: 'Permission denied' };
 *     }
 *     const notification = new Notification(title, options);
 *     return { success: true, notificationId: notification.tag || Date.now().toString() };
 *   }
 * }
 *
 * // React Native implementation using Expo notifications
 * class ExpoNotificationService implements NotificationService {
 *   async showNotification(title: string, options?: NotificationOptions): Promise<NotificationResult> {
 *     const result = await Notifications.scheduleNotificationAsync({
 *       content: { title, body: options?.body },
 *       trigger: null
 *     });
 *     return { success: true, notificationId: result };
 *   }
 * }
 * ```
 */

/**
 * Configuration options for notifications.
 *
 * @ai-context Configuration object for customizing notification appearance and behavior
 * @ai-pattern Options parameter with platform-specific optional properties
 * @ai-platform Web supports all options, mobile may have limited support for some features
 */
interface NotificationOptions {
  /** Notification body text */
  body?: Optional<string>;
  /** Icon URL or identifier */
  icon?: Optional<string>;
  /** Badge URL or identifier */
  badge?: Optional<string>;
  /** Unique tag for notification grouping */
  tag?: Optional<string>;
  /** Keep notification until user interacts */
  requireInteraction?: Optional<boolean>;
  /** Show notification without sound */
  silent?: Optional<boolean>;
  /** Custom data to associate with notification */
  data?: Optional<unknown>;
  /** Interactive action buttons */
  actions?: Optional<NotificationAction[]>;
  /** Notification timestamp */
  timestamp?: Optional<number>;
}

/**
 * Interactive action for notifications.
 *
 * @ai-context Action button configuration for interactive notifications
 * @ai-usage Define clickable actions in supported notification implementations
 */
interface NotificationAction {
  /** Unique action identifier */
  action: string;
  /** Action button title */
  title: string;
  /** Optional action icon */
  icon?: Optional<string>;
}

/**
 * Result of a notification operation.
 *
 * @ai-context Response object for notification operations
 * @ai-pattern Result object with success flag and optional error/ID information
 */
interface NotificationResult {
  /** Whether operation succeeded */
  success: boolean;
  /** Error message if operation failed */
  error?: Optional<string>;
  /** Unique notification identifier for tracking */
  notificationId?: Optional<string>;
}

/**
 * Result of notification permission request.
 *
 * @ai-context Permission request response with detailed permission state
 * @ai-usage Handle different permission states for graceful fallbacks
 */
interface NotificationPermissionResult {
  /** Whether permission was granted */
  granted: boolean;
  /** Detailed permission state */
  permission: 'granted' | 'denied' | 'default';
  /** Error message if request failed */
  error?: Optional<string>;
}

/**
 * Platform-agnostic notification service for managing notifications across platforms.
 *
 * @ai-context Core notification service interface for dependency injection
 * @ai-pattern Service interface with permission management, capability detection, and notification operations
 * @ai-platform Abstracts Web Notifications API, Firebase Cloud Messaging, Expo notifications, and OneSignal
 * @ai-usage Primary interface for implementing notification services across platforms
 * @ai-security Handles user permissions and sensitive notification data
 *
 * @example
 * ```typescript
 * class MyNotificationService implements NotificationService {
 *   async showNotification(title: string, options?: NotificationOptions) {
 *     // Platform-specific notification implementation
 *   }
 * }
 * ```
 */
interface NotificationService {
  /**
   * Check if notifications are supported on this platform
   */
  isSupported(): boolean;

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported';

  /**
   * Request notification permission from user
   * @returns Promise with permission result
   */
  requestPermission(): Promise<NotificationPermissionResult>;

  /**
   * Show a notification
   * @param title Notification title
   * @param options Notification options
   * @returns Promise with operation result
   */
  showNotification(
    title: string,
    options?: Optional<NotificationOptions>
  ): Promise<NotificationResult>;

  /**
   * Close a notification by ID
   * @param notificationId Notification identifier
   */
  closeNotification(notificationId: string): Promise<boolean>;

  /**
   * Clear all notifications
   */
  clearAllNotifications(): Promise<boolean>;

  /**
   * Set notification click handler
   * @param handler Function to call when notification is clicked
   */
  setClickHandler(handler: (data?: Optional<unknown>) => void): void;

  /**
   * Check if permission is granted
   */
  hasPermission(): boolean;

  /**
   * Get platform-specific capabilities
   */
  getCapabilities(): NotificationCapabilities;
}

/**
 * Platform-specific notification capabilities.
 *
 * @ai-context Capability detection interface for feature availability
 * @ai-pattern Capability object with boolean flags and optional limits
 * @ai-platform Different platforms support different notification features
 */
interface NotificationCapabilities {
  /** Platform supports interactive action buttons */
  supportsActions: boolean;
  /** Platform supports custom icons */
  supportsIcon: boolean;
  /** Platform supports badge notifications */
  supportsBadge: boolean;
  /** Platform supports custom data attachment */
  supportsData: boolean;
  /** Platform supports notification sounds */
  supportsSound: boolean;
  /** Platform supports vibration patterns */
  supportsVibration: boolean;
  /** Maximum number of actions supported */
  maxActions?: Optional<number>;
}

/**
 * Configuration for notification service behavior.
 *
 * @ai-context Configuration interface for notification service customization
 * @ai-pattern Configuration object with behavior flags and default values
 * @ai-usage Configure notification service for different deployment scenarios
 */
interface NotificationConfig {
  /** Automatically close notifications after delay */
  enableAutoClose: boolean;
  /** Delay before auto-closing notifications (milliseconds) */
  autoCloseDelay: number;
  /** Default icon for notifications */
  defaultIcon: string;
  /** Enable debug logging for development */
  enableDebugLogging: boolean;
  /** Use alert() as fallback when notifications unavailable */
  fallbackToAlert: boolean;
}

/**
 * High-level notification client with simplified API.
 *
 * @ai-context Client wrapper interface for simplified notification usage
 * @ai-pattern Facade pattern wrapping service and configuration
 * @ai-usage Use for simplified notification operations with default configuration
 */
interface NotificationClient {
  /** Underlying notification service */
  service: NotificationService;
  /** Client configuration */
  config: NotificationConfig;
  /** Simplified show notification method */
  show(
    title: string,
    options?: Optional<NotificationOptions>
  ): Promise<NotificationResult>;
  /** Simplified permission request method */
  requestPermissions(): Promise<NotificationPermissionResult>;
}

/**
 * Context provider for React notification integration.
 *
 * @ai-context React context provider interface for notification state management
 * @ai-pattern React context pattern with client injection and reactive state
 * @ai-usage Use in React applications for component-wide notification access
 */
interface NotificationContextProvider {
  /** Notification client instance */
  client: NotificationClient;
  /** Whether notifications are supported on this platform */
  isSupported: boolean;
  /** Whether user has granted notification permission */
  hasPermission: boolean;
  /** Request notification permission from user */
  requestPermission(): Promise<void>;
}

export {
  type NotificationOptions,
  type NotificationAction,
  type NotificationResult,
  type NotificationPermissionResult,
  type NotificationService,
  type NotificationCapabilities,
  type NotificationConfig,
  type NotificationClient,
  type NotificationContextProvider,
};
