/**
 * Simple logger for async helpers.
 * Provides a minimal logging interface for error tracking.
 *
 * @ai-context Basic logging utility for error tracking
 * @ai-pattern Singleton logger with console fallback
 * @ai-platform Universal (Web, React Native, Node.js)
 */

/**
 * Simple logger interface for error and info logging.
 *
 * @ai-context Logger interface for async helpers
 */
export interface SimpleLogger {
  error(message: string, context?: string, error?: unknown): void;
  info(message: string, context?: string): void;
  warn(message: string, context?: string): void;
}

/**
 * Default console-based logger implementation.
 *
 * @ai-context Default logger using console API
 */
class ConsoleLogger implements SimpleLogger {
  error(message: string, context?: string, error?: unknown): void {
    const prefix = context ? `[${context}]` : '';
    console.error(`${prefix} ${message}`, error);
  }

  info(message: string, context?: string): void {
    const prefix = context ? `[${context}]` : '';
    console.log(`${prefix} ${message}`);
  }

  warn(message: string, context?: string): void {
    const prefix = context ? `[${context}]` : '';
    console.warn(`${prefix} ${message}`);
  }
}

/**
 * Singleton logger instance.
 * Can be replaced with custom implementation via setLogger.
 *
 * @ai-context Singleton logger instance
 */
export let logger: SimpleLogger = new ConsoleLogger();

/**
 * Set a custom logger implementation.
 * Use this to integrate with your logging service.
 *
 * @param customLogger Custom logger implementation
 *
 * @ai-context Logger injection function
 * @ai-usage Call this to replace default console logger
 *
 * @example
 * ```typescript
 * setLogger({
 *   error: (msg, ctx, err) => myLoggingService.error(msg, err),
 *   info: (msg, ctx) => myLoggingService.info(msg),
 *   warn: (msg, ctx) => myLoggingService.warn(msg),
 * });
 * ```
 */
export const setLogger = (customLogger: SimpleLogger): void => {
  logger = customLogger;
};
