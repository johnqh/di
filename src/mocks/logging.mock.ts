/**
 * Mock implementations for logging interfaces.
 *
 * @ai-context Test mocks for Logger, LoggerProvider
 * @ai-usage Use in unit tests to mock logging operations
 */

import {
  LogType,
  type Logger,
  type LoggerProvider,
} from '../logging/logging.interface.js';

/**
 * Recorded log entry for testing assertions.
 */
export interface RecordedLogEntry {
  args: unknown[];
  timestamp: number;
}

/**
 * Mock implementation of Logger for testing.
 *
 * @example
 * ```typescript
 * const logger = new MockLogger(LogType.Console);
 * logger.log('Hello', 'World');
 * expect(logger.getLogEntries()).toHaveLength(1);
 * expect(logger.getLogEntries()[0].args).toEqual(['Hello', 'World']);
 * ```
 */
export class MockLogger implements Logger {
  readonly type: LogType;
  private entries: RecordedLogEntry[] = [];
  private enabled: boolean = true;

  constructor(type: LogType = LogType.Console) {
    this.type = type;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...args: any[]): void {
    if (!this.enabled || this.type === LogType.None) return;

    this.entries.push({
      args: [...args],
      timestamp: Date.now(),
    });
  }

  // Test helper methods

  /**
   * Get all log entries
   */
  getLogEntries(): RecordedLogEntry[] {
    return [...this.entries];
  }

  /**
   * Get the last log entry
   */
  getLastEntry(): RecordedLogEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  /**
   * Get entries containing a specific string
   */
  getEntriesContaining(search: string): RecordedLogEntry[] {
    return this.entries.filter((entry) =>
      entry.args.some((arg) => String(arg).includes(search))
    );
  }

  /**
   * Get the number of log entries
   */
  getEntryCount(): number {
    return this.entries.length;
  }

  /**
   * Check if a message was logged
   */
  hasLogged(message: string): boolean {
    return this.entries.some((entry) =>
      entry.args.some((arg) => String(arg).includes(message))
    );
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled && this.type !== LogType.None;
  }

  /**
   * Clear all log entries
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Reset the logger
   */
  reset(): void {
    this.entries = [];
    this.enabled = true;
  }
}

/**
 * Mock implementation of LoggerProvider for testing.
 *
 * @example
 * ```typescript
 * const provider = new MockLoggerProvider();
 * const logger = provider.getLogger();
 * logger.log('Test message');
 * expect(provider.getMockLogger().getLogEntries()).toHaveLength(1);
 * ```
 */
export class MockLoggerProvider implements LoggerProvider {
  private logger: MockLogger;
  private logTypeChanges: LogType[] = [];

  constructor(initialType: LogType = LogType.Console) {
    this.logger = new MockLogger(initialType);
    this.logTypeChanges.push(initialType);
  }

  getLogger(): Logger {
    return this.logger;
  }

  setLogType(type: LogType): void {
    this.logTypeChanges.push(type);
    this.logger = new MockLogger(type);
  }

  // Test helper methods

  /**
   * Get the underlying MockLogger for direct access
   */
  getMockLogger(): MockLogger {
    return this.logger;
  }

  /**
   * Get the history of log type changes
   */
  getLogTypeChanges(): LogType[] {
    return [...this.logTypeChanges];
  }

  /**
   * Get current log type
   */
  getCurrentLogType(): LogType {
    return this.logger.type;
  }

  /**
   * Reset the provider
   */
  reset(): void {
    this.logger = new MockLogger(LogType.Console);
    this.logTypeChanges = [LogType.Console];
  }
}

/**
 * Create a no-op logger that doesn't record anything.
 * Useful for tests that need a logger but don't care about log output.
 */
export function createNoOpLogger(): Logger {
  return new MockLogger(LogType.None);
}

/**
 * Create a console-style logger that records all output.
 * Useful for debugging tests.
 */
export function createDebugLogger(): MockLogger {
  return new MockLogger(LogType.Console);
}
