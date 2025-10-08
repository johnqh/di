/**
 * Platform-agnostic notifications interface for showing alerts and scheduling notifications.
 *
 * @ai-context Notifications service interface for dependency injection
 * @ai-pattern Service interface for notification operations
 * @ai-platform Universal (Web Notifications API, React Native push notifications)
 * @ai-usage Implement for web notifications, push notifications, toast messages
 *
 * @example
 * ```typescript
 * class WebNotifications implements PlatformNotifications {
 *   showNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error'): void {
 *     new Notification(title, { body: message });
 *   }
 * }
 * ```
 */
export interface PlatformNotifications {
  /**
   * Show a notification to the user
   * @param title Notification title
   * @param message Notification message
   * @param type Notification type
   */
  showNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error'
  ): void;

  /**
   * Request notification permission from the user
   * @returns Promise resolving to whether permission was granted
   */
  requestPermission(): Promise<boolean>;

  /**
   * Schedule a notification to be shown after a delay
   * @param title Notification title
   * @param message Notification message
   * @param delay Delay in milliseconds
   */
  scheduleNotification(title: string, message: string, delay: number): void;
}
