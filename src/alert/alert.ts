import { Optional } from '@sudobility/types';

/**
 * Platform-agnostic alert dialog interface for showing a modal confirmation
 * with one or more action buttons.
 *
 * Unlike {@link InfoInterface}, which is a fire-and-forget transient message
 * (toast / banner), an alert is a blocking dialog that presents choices and
 * reports back which one the user picked through per-button callbacks.
 *
 * @ai-context Modal alert/confirmation interface for dependency injection
 * @ai-pattern Service interface for showing a titled dialog with action buttons
 * @ai-platform Universal (React Native native alert, web modal, etc.)
 * @ai-usage Implement with the host platform's native alert on RN, or a modal on web
 *
 * @example
 * ```typescript
 * getAlertService().alert(
 *   'Game in Progress',
 *   'You have an unsaved game in progress. Switch puzzle?',
 *   [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'Switch', style: 'destructive', onPress: () => switchPuzzle() },
 *   ]
 * );
 * ```
 */

/**
 * Visual/semantic style of an alert button. Mirrors React Native's
 * `AlertButtonStyle` so a React Native implementation can map it 1:1.
 */
export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

/**
 * A single action button in an alert dialog.
 */
export interface AlertButton {
  /** The button label. */
  text: string;
  /** Invoked when the user taps this button. */
  onPress?: () => void;
  /** Visual/semantic style (default, cancel, destructive). */
  style?: AlertButtonStyle;
}

interface AlertInterface {
  /**
   * Show a modal alert dialog.
   *
   * @param title - The dialog title.
   * @param message - Optional body text.
   * @param buttons - Optional action buttons. When omitted, implementations
   *   show a single dismiss button (e.g. "OK").
   *
   * @ai-pattern Modal dialog with per-button callbacks
   * @ai-usage Call to ask the user to confirm or choose before an action
   */
  alert(
    title: string,
    message?: Optional<string>,
    buttons?: Optional<AlertButton[]>
  ): void;
}

export { type AlertInterface };
