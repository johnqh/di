/**
 * Alert service singleton
 * No platform-specific implementation - user provides their own
 *
 * @ai-context Singleton holder for AlertInterface without built-in implementation
 * @ai-pattern Singleton with user-provided implementation
 * @ai-usage Initialize with your own AlertInterface implementation at app startup
 *
 * @example
 * ```typescript
 * // Create your implementation (native alert on RN, modal on web)
 * class MyAlertService implements AlertInterface {
 *   alert(title: string, message?: string, buttons?: AlertButton[]): void {
 *     // Your implementation
 *   }
 * }
 *
 * // Initialize at app startup
 * initializeAlertService(new MyAlertService());
 *
 * // Use anywhere in your app
 * getAlertService().alert('Title', 'Message', [{ text: 'OK' }]);
 * ```
 */

import type { AlertInterface } from './alert.js';

/**
 * Singleton alert service instance
 */
let alertServiceInstance: AlertInterface | null = null;

/**
 * Initialize the alert service singleton with a custom implementation
 * Should be called once at app startup
 *
 * @param implementation - Your AlertInterface implementation
 */
export function initializeAlertService(implementation: AlertInterface): void {
  if (alertServiceInstance) {
    return;
  }

  alertServiceInstance = implementation;
}

/**
 * Get the alert service singleton
 * @throws Error if not initialized
 */
export function getAlertService(): AlertInterface {
  if (!alertServiceInstance) {
    throw new Error(
      'Alert service not initialized. Call initializeAlertService(implementation) at app startup.'
    );
  }
  return alertServiceInstance;
}

/**
 * Reset alert service (for testing only)
 */
export function resetAlertService(): void {
  alertServiceInstance = null;
}
