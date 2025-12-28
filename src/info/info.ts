import { InfoType, Optional } from '@sudobility/types';

/**
 * Platform-agnostic information display interface for showing user notifications.
 *
 * @ai-context Information display interface for dependency injection
 * @ai-pattern Service interface for showing user-facing information messages
 * @ai-platform Universal (Web toast/snackbar, React Native alerts, etc.)
 * @ai-usage Implement for web toast libraries, React Native ToastAndroid, or custom UI components
 *
 * @example
 * ```typescript
 * // Web implementation using a toast library
 * class WebInfoService implements InfoInterface {
 *   show(title: string, text: string, type: InfoType, interval?: number): void {
 *     toast.show({
 *       title,
 *       message: text,
 *       type: type === InfoType.ERROR ? 'error' : type,
 *       duration: interval ?? 3000
 *     });
 *   }
 * }
 *
 * // React Native implementation using a custom toast
 * class RNInfoService implements InfoInterface {
 *   show(title: string, text: string, type: InfoType, interval?: number): void {
 *     Toast.show({
 *       text: `${title}: ${text}`,
 *       type,
 *       duration: interval ?? 3000
 *     });
 *   }
 * }
 * ```
 */
interface InfoInterface {
  /**
   * Show an information message to the user.
   *
   * @param title - The title of the information message
   * @param text - The body text of the information message
   * @param type - The type of information (info, success, warning, error)
   * @param interval - Optional duration in milliseconds for how long the message stays on screen
   *
   * @ai-pattern Fire-and-forget notification method
   * @ai-usage Call to display transient user notifications
   */
  show(
    title: string,
    text: string,
    type: InfoType,
    interval?: Optional<number>
  ): void;
}

export { type InfoInterface, InfoType };
