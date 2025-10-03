/**
 * Logging type enumeration
 *
 * @ai-enum-type Defines available logging output types
 * @ai-pattern Configuration enum for service initialization
 * @ai-runtime-value Available as values at runtime for configuration
 * @ai-categories Output destinations for log messages
 */
export enum LogType {
  /** No logging output - silent mode */
  None = 'none',
  /** Log to console output (stdout/stderr) */
  Console = 'console',
  /** Log to file system */
  File = 'file',
}

/**
 * Logger service interface for dependency injection
 *
 * @ai-context Core logging interface for dependency injection across platforms
 * @ai-pattern Service provider with flexible output configuration
 * @ai-platform Cross-platform compatible (Web, React Native, Node.js)
 * @ai-usage Implement this interface for console logging, file logging, or custom logging services
 * @ai-test See tests/logging/logging.test.ts
 * @ai-interface-type Service Provider
 * @ai-domain Universal logging for all application types
 *
 * @example
 * ```typescript
 * // Console logger implementation
 * class ConsoleLogger implements Logger {
 *   readonly type = LogType.Console;
 *
 *   log(...args: any[]): void {
 *     console.log(...args);
 *   }
 * }
 *
 * // File logger implementation
 * class FileLogger implements Logger {
 *   readonly type = LogType.File;
 *
 *   log(...args: any[]): void {
 *     fs.appendFileSync('app.log', args.join(' ') + '\n');
 *   }
 * }
 *
 * // Silent logger implementation
 * class NoOpLogger implements Logger {
 *   readonly type = LogType.None;
 *
 *   log(...args: any[]): void {
 *     // No-op
 *   }
 * }
 * ```
 */
export interface Logger {
  /**
   * The type of logging being used
   *
   * @ai-pattern Read-only configuration property
   * @ai-usage Check this property to determine logging behavior
   */
  readonly type: LogType;

  /**
   * Log a message with optional additional arguments
   *
   * Compatible with console.log() signature for easy drop-in replacement
   *
   * @param args - Variable arguments matching console.log() signature
   *
   * @ai-pattern Variadic function matching console.log API
   * @ai-usage Direct replacement for console.log in application code
   *
   * @example
   * ```typescript
   * logger.log('User logged in:', { userId: 123, timestamp: Date.now() });
   * logger.log('Error:', error.message, error.stack);
   * logger.log('Simple message');
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...args: any[]): void;
}

/**
 * Logger provider interface for dependency injection
 *
 * @ai-context Factory interface for creating and managing logger instances
 * @ai-pattern Provider pattern with configuration and instance management
 * @ai-platform Cross-platform compatible (Web, React Native, Node.js)
 * @ai-usage Implement this interface to provide logger instances to your application
 * @ai-test See tests/logging/logging.test.ts
 * @ai-interface-type Service Provider Factory
 *
 * @example
 * ```typescript
 * class LoggerProvider implements LoggerProviderInterface {
 *   private logger: Logger;
 *
 *   constructor(type: LogType) {
 *     this.logger = this.createLogger(type);
 *   }
 *
 *   getLogger(): Logger {
 *     return this.logger;
 *   }
 *
 *   setLogType(type: LogType): void {
 *     this.logger = this.createLogger(type);
 *   }
 *
 *   private createLogger(type: LogType): Logger {
 *     switch (type) {
 *       case LogType.Console: return new ConsoleLogger();
 *       case LogType.File: return new FileLogger();
 *       case LogType.None: return new NoOpLogger();
 *     }
 *   }
 * }
 * ```
 */
export interface LoggerProvider {
  /**
   * Get the current logger instance
   *
   * @returns The active logger instance
   *
   * @ai-pattern Getter method for accessing service instance
   * @ai-usage Call this method to get the logger for use in application code
   */
  getLogger(): Logger;

  /**
   * Set or change the logging type
   *
   * @param type - The logging type to use
   *
   * @ai-pattern Configuration method for runtime logger switching
   * @ai-usage Call this method to change logging behavior at runtime
   *
   * @example
   * ```typescript
   * // Disable logging in production
   * if (process.env.NODE_ENV === 'production') {
   *   loggerProvider.setLogType(LogType.None);
   * }
   *
   * // Enable file logging for debugging
   * loggerProvider.setLogType(LogType.File);
   * ```
   */
  setLogType(type: LogType): void;
}
