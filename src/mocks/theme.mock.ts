/**
 * Mock implementations for theme interfaces.
 *
 * @ai-context Test mocks for PlatformTheme
 * @ai-usage Use in unit tests to mock theme and appearance operations
 */

import type { PlatformTheme } from '../theme/platform-theme.js';

/**
 * Recorded theme change for testing assertions.
 */
export interface RecordedThemeChange {
  type: 'theme' | 'fontSize';
  value: string;
  timestamp: number;
}

/**
 * Mock implementation of PlatformTheme for testing.
 *
 * @example
 * ```typescript
 * const theme = new MockPlatformTheme();
 * theme.applyTheme('dark');
 * expect(theme.getCurrentTheme()).toBe('dark');
 * expect(theme.getThemeChanges()).toHaveLength(1);
 * ```
 */
export class MockPlatformTheme implements PlatformTheme {
  private currentTheme: string = 'light';
  private currentFontSize: string = 'medium';
  private systemTheme: string = 'light';
  private systemThemeListeners: Set<(theme: string) => void> = new Set();
  private themeChanges: RecordedThemeChange[] = [];

  applyTheme(theme: string): void {
    this.themeChanges.push({
      type: 'theme',
      value: theme,
      timestamp: Date.now(),
    });
    this.currentTheme = theme;
  }

  applyFontSize(fontSize: string): void {
    this.themeChanges.push({
      type: 'fontSize',
      value: fontSize,
      timestamp: Date.now(),
    });
    this.currentFontSize = fontSize;
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  watchSystemTheme(callback: (theme: string) => void): () => void {
    this.systemThemeListeners.add(callback);
    // Immediately call with current system theme
    callback(this.systemTheme);
    return () => {
      this.systemThemeListeners.delete(callback);
    };
  }

  // Test helper methods

  /**
   * Get current font size
   */
  getCurrentFontSize(): string {
    return this.currentFontSize;
  }

  /**
   * Get all theme changes
   */
  getThemeChanges(): RecordedThemeChange[] {
    return [...this.themeChanges];
  }

  /**
   * Get theme changes by type
   */
  getThemeChangesByType(type: 'theme' | 'fontSize'): RecordedThemeChange[] {
    return this.themeChanges.filter((c) => c.type === type);
  }

  /**
   * Simulate system theme change
   */
  simulateSystemThemeChange(theme: string): void {
    this.systemTheme = theme;
    this.systemThemeListeners.forEach((listener) => listener(theme));
  }

  /**
   * Get the system theme
   */
  getSystemTheme(): string {
    return this.systemTheme;
  }

  /**
   * Set system theme without triggering listeners
   */
  setSystemTheme(theme: string): void {
    this.systemTheme = theme;
  }

  /**
   * Get the number of system theme listeners
   */
  getListenerCount(): number {
    return this.systemThemeListeners.size;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.currentTheme = 'light';
    this.currentFontSize = 'medium';
    this.systemTheme = 'light';
    this.systemThemeListeners.clear();
    this.themeChanges = [];
  }
}
