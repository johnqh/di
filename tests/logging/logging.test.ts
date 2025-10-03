/**
 * @ai-test-suite Logging interface tests
 * @ai-test-category Interface compliance and type safety
 * @ai-test-pattern Mock implementations with runtime validation
 */

import { Logger, LoggerProvider, LogType } from '../../src/logging';

/**
 * @ai-purpose Mock console logger implementation for testing
 * @ai-pattern Service implementation matching console.log signature
 */
class MockConsoleLogger implements Logger {
  readonly type = LogType.Console;
  public messages: any[][] = [];

  log(...args: any[]): void {
    this.messages.push(args);
  }

  clear(): void {
    this.messages = [];
  }
}

/**
 * @ai-purpose Mock file logger implementation for testing
 * @ai-pattern Service implementation simulating file operations
 */
class MockFileLogger implements Logger {
  readonly type = LogType.File;
  public fileContents: string[] = [];

  log(...args: any[]): void {
    this.fileContents.push(args.join(' '));
  }

  clear(): void {
    this.fileContents = [];
  }
}

/**
 * @ai-purpose Mock no-op logger implementation for testing
 * @ai-pattern Silent logger that discards all messages
 */
class MockNoOpLogger implements Logger {
  readonly type = LogType.None;

  log(...args: any[]): void {
    // No-op
  }
}

/**
 * @ai-purpose Mock logger provider for testing
 * @ai-pattern Provider pattern with runtime logger switching
 */
class MockLoggerProvider implements LoggerProvider {
  private logger: Logger;

  constructor(type: LogType = LogType.Console) {
    this.logger = this.createLogger(type);
  }

  getLogger(): Logger {
    return this.logger;
  }

  setLogType(type: LogType): void {
    this.logger = this.createLogger(type);
  }

  private createLogger(type: LogType): Logger {
    switch (type) {
      case LogType.Console:
        return new MockConsoleLogger();
      case LogType.File:
        return new MockFileLogger();
      case LogType.None:
        return new MockNoOpLogger();
    }
  }
}

describe('LogType Enum', () => {
  /**
   * @ai-purpose Verify enum values are correct
   * @ai-coverage LogType enum structure
   */
  it('should have correct enum values', () => {
    expect(LogType.None).toBe('none');
    expect(LogType.Console).toBe('console');
    expect(LogType.File).toBe('file');
  });

  /**
   * @ai-purpose Verify all expected enum members exist
   * @ai-coverage Complete enum member enumeration
   */
  it('should have all expected members', () => {
    const values = Object.values(LogType);
    expect(values).toContain('none');
    expect(values).toContain('console');
    expect(values).toContain('file');
    expect(values.length).toBe(3);
  });

  /**
   * @ai-purpose Verify enum is available at runtime
   * @ai-coverage Runtime enum iteration
   */
  it('should be iterable at runtime', () => {
    const types: LogType[] = [];
    for (const value of Object.values(LogType)) {
      types.push(value as LogType);
    }
    expect(types.length).toBe(3);
  });
});

describe('Logger Interface', () => {
  describe('ConsoleLogger', () => {
    let logger: MockConsoleLogger;

    beforeEach(() => {
      logger = new MockConsoleLogger();
    });

    /**
     * @ai-purpose Verify logger type property
     * @ai-coverage Logger.type property
     */
    it('should have correct type', () => {
      expect(logger.type).toBe(LogType.Console);
    });

    /**
     * @ai-purpose Verify single argument logging
     * @ai-use-case Basic string logging
     */
    it('should log single argument', () => {
      logger.log('test message');
      expect(logger.messages).toHaveLength(1);
      expect(logger.messages[0]).toEqual(['test message']);
    });

    /**
     * @ai-purpose Verify multiple argument logging
     * @ai-use-case Complex logging with multiple data types
     */
    it('should log multiple arguments', () => {
      logger.log('user:', { id: 123 }, 'logged in');
      expect(logger.messages).toHaveLength(1);
      expect(logger.messages[0]).toEqual(['user:', { id: 123 }, 'logged in']);
    });

    /**
     * @ai-purpose Verify variadic argument handling
     * @ai-use-case console.log() signature compatibility
     */
    it('should handle variadic arguments like console.log', () => {
      logger.log('a', 'b', 'c', 1, 2, 3, { key: 'value' }, [1, 2, 3]);
      expect(logger.messages[0]).toHaveLength(8);
    });

    /**
     * @ai-purpose Verify empty log calls
     * @ai-use-case Edge case handling
     */
    it('should handle empty log calls', () => {
      logger.log();
      expect(logger.messages).toHaveLength(1);
      expect(logger.messages[0]).toEqual([]);
    });

    /**
     * @ai-purpose Verify multiple sequential log calls
     * @ai-use-case Message accumulation
     */
    it('should accumulate multiple log calls', () => {
      logger.log('first');
      logger.log('second');
      logger.log('third');
      expect(logger.messages).toHaveLength(3);
    });
  });

  describe('FileLogger', () => {
    let logger: MockFileLogger;

    beforeEach(() => {
      logger = new MockFileLogger();
    });

    /**
     * @ai-purpose Verify file logger type
     * @ai-coverage Logger.type property for file logging
     */
    it('should have correct type', () => {
      expect(logger.type).toBe(LogType.File);
    });

    /**
     * @ai-purpose Verify file output formatting
     * @ai-use-case File-based logging with string concatenation
     */
    it('should format log output for file', () => {
      logger.log('error:', 'something went wrong');
      expect(logger.fileContents).toHaveLength(1);
      expect(logger.fileContents[0]).toBe('error: something went wrong');
    });

    /**
     * @ai-purpose Verify object logging in file format
     * @ai-use-case Logging complex data to files
     */
    it('should handle objects in file output', () => {
      const obj = { user: 'john', action: 'login' };
      logger.log('event:', obj);
      expect(logger.fileContents[0]).toContain('[object Object]');
    });
  });

  describe('NoOpLogger', () => {
    let logger: MockNoOpLogger;

    beforeEach(() => {
      logger = new MockNoOpLogger();
    });

    /**
     * @ai-purpose Verify no-op logger type
     * @ai-coverage Logger.type property for silent logging
     */
    it('should have correct type', () => {
      expect(logger.type).toBe(LogType.None);
    });

    /**
     * @ai-purpose Verify silent operation
     * @ai-use-case Production logging disabled
     */
    it('should not throw on log calls', () => {
      expect(() => logger.log('test')).not.toThrow();
      expect(() => logger.log('a', 'b', 'c')).not.toThrow();
      expect(() => logger.log()).not.toThrow();
    });
  });
});

describe('LoggerProvider Interface', () => {
  let provider: MockLoggerProvider;

  beforeEach(() => {
    provider = new MockLoggerProvider();
  });

  /**
   * @ai-purpose Verify default logger initialization
   * @ai-coverage LoggerProvider.getLogger() method
   */
  it('should provide a logger instance', () => {
    const logger = provider.getLogger();
    expect(logger).toBeDefined();
    expect(logger.type).toBe(LogType.Console);
  });

  /**
   * @ai-purpose Verify logger type switching
   * @ai-coverage LoggerProvider.setLogType() method
   */
  it('should allow changing logger type', () => {
    provider.setLogType(LogType.File);
    const logger = provider.getLogger();
    expect(logger.type).toBe(LogType.File);
  });

  /**
   * @ai-purpose Verify switching to no-op logger
   * @ai-use-case Disabling logging in production
   */
  it('should switch to no-op logger', () => {
    provider.setLogType(LogType.None);
    const logger = provider.getLogger();
    expect(logger.type).toBe(LogType.None);
  });

  /**
   * @ai-purpose Verify logger instance updates after type change
   * @ai-coverage Runtime logger switching behavior
   */
  it('should return new logger instance after type change', () => {
    const logger1 = provider.getLogger();
    provider.setLogType(LogType.File);
    const logger2 = provider.getLogger();
    expect(logger1.type).toBe(LogType.Console);
    expect(logger2.type).toBe(LogType.File);
  });

  /**
   * @ai-purpose Verify custom initialization
   * @ai-use-case Provider initialization with specific logger type
   */
  it('should allow custom initialization', () => {
    const customProvider = new MockLoggerProvider(LogType.File);
    const logger = customProvider.getLogger();
    expect(logger.type).toBe(LogType.File);
  });
});

describe('Integration Tests', () => {
  /**
   * @ai-purpose End-to-end logging workflow test
   * @ai-use-case Real-world usage pattern with provider and logger
   */
  it('should support drop-in replacement for console.log', () => {
    const provider = new MockLoggerProvider(LogType.Console);
    const logger = provider.getLogger() as MockConsoleLogger;

    // Replace console.log with logger.log
    const log = logger.log.bind(logger);

    log('Application started');
    log('User:', { id: 123, name: 'John' });
    log('Processing', 'step', 1, 'of', 5);

    expect(logger.messages).toHaveLength(3);
    expect(logger.messages[0]).toEqual(['Application started']);
    expect(logger.messages[1]).toEqual(['User:', { id: 123, name: 'John' }]);
    expect(logger.messages[2]).toEqual(['Processing', 'step', 1, 'of', 5]);
  });

  /**
   * @ai-purpose Test runtime logger switching
   * @ai-use-case Dynamic logging configuration
   */
  it('should switch logger types at runtime', () => {
    const provider = new MockLoggerProvider(LogType.Console);

    let logger = provider.getLogger() as MockConsoleLogger;
    logger.log('console message');
    expect(logger.messages).toHaveLength(1);

    provider.setLogType(LogType.File);
    const fileLogger = provider.getLogger() as MockFileLogger;
    fileLogger.log('file message');
    expect(fileLogger.fileContents).toHaveLength(1);

    provider.setLogType(LogType.None);
    const noopLogger = provider.getLogger();
    expect(() => noopLogger.log('ignored')).not.toThrow();
  });

  /**
   * @ai-purpose Test environment-based logger selection
   * @ai-use-case Production vs development logging
   */
  it('should support environment-based logger selection', () => {
    const isDevelopment = true;
    const isProduction = false;

    const devProvider = new MockLoggerProvider(
      isDevelopment ? LogType.Console : LogType.None
    );
    expect(devProvider.getLogger().type).toBe(LogType.Console);

    const prodProvider = new MockLoggerProvider(
      isProduction ? LogType.None : LogType.Console
    );
    expect(prodProvider.getLogger().type).toBe(LogType.Console);
  });
});
