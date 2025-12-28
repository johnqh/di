/**
 * Info service singleton
 * No platform-specific implementation - user provides their own
 *
 * @ai-context Singleton holder for InfoInterface without built-in implementation
 * @ai-pattern Singleton with user-provided implementation
 * @ai-usage Initialize with your own InfoInterface implementation at app startup
 *
 * @example
 * ```typescript
 * // Create your implementation
 * class MyInfoService implements InfoInterface {
 *   show(title: string, text: string, type: InfoType, interval?: number): void {
 *     // Your implementation (toast, alert, snackbar, etc.)
 *   }
 * }
 *
 * // Initialize at app startup
 * initializeInfoService(new MyInfoService());
 *
 * // Use anywhere in your app
 * const info = getInfoService();
 * info.show('Success', 'Data saved', InfoType.SUCCESS);
 * ```
 */

import type { InfoInterface } from './info.js';

/**
 * Singleton info service instance
 */
let infoServiceInstance: InfoInterface | null = null;

/**
 * Initialize the info service singleton with a custom implementation
 * Should be called once at app startup
 *
 * @param implementation - Your InfoInterface implementation
 */
export function initializeInfoService(implementation: InfoInterface): void {
  if (infoServiceInstance) {
    return;
  }

  infoServiceInstance = implementation;
}

/**
 * Get the info service singleton
 * @throws Error if not initialized
 */
export function getInfoService(): InfoInterface {
  if (!infoServiceInstance) {
    throw new Error(
      'Info service not initialized. Call initializeInfoService(implementation) at app startup.'
    );
  }
  return infoServiceInstance;
}

/**
 * Reset info service (for testing only)
 */
export function resetInfoService(): void {
  infoServiceInstance = null;
}
