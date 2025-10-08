/**
 * Platform-agnostic theme interface for managing UI themes and appearance.
 *
 * @ai-context Theme service interface for dependency injection
 * @ai-pattern Service interface for theme and appearance operations
 * @ai-platform Universal (Web CSS, React Native StyleSheet)
 * @ai-usage Implement for dark mode, font sizing, theme switching
 *
 * @example
 * ```typescript
 * class WebTheme implements PlatformTheme {
 *   applyTheme(theme: string): void {
 *     document.documentElement.setAttribute('data-theme', theme);
 *   }
 * }
 * ```
 */
export interface PlatformTheme {
  /**
   * Apply a theme to the application
   * @param theme Theme identifier (e.g., 'dark', 'light')
   */
  applyTheme(theme: string): void;

  /**
   * Apply a font size to the application
   * @param fontSize Font size identifier (e.g., 'small', 'medium', 'large')
   */
  applyFontSize(fontSize: string): void;

  /**
   * Get the current theme
   * @returns Current theme identifier
   */
  getCurrentTheme(): string;

  /**
   * Watch for system theme changes
   * @param callback Function to call when system theme changes
   * @returns Cleanup function to stop watching
   */
  watchSystemTheme(callback: (theme: string) => void): () => void;
}
