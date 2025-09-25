/**
 * Environment provider interfaces for dependency injection across platforms.
 *
 * @ai-context Environment configuration and platform detection interfaces
 * @ai-pattern Factory and utility provider patterns for environment management
 * @ai-platform Universal (Web environment variables, React Native config, Node.js process.env)
 * @ai-usage Implement for different deployment environments (development, staging, production)
 * @ai-security Contains environment variables - handle sensitive data carefully
 *
 * @example
 * ```typescript
 * // Web implementation using environment variables
 * class WebEnvProvider implements EnvProvider {
 *   get(key: string): Optional<string> {
 *     return import.meta.env[key] || process.env[key];
 *   }
 * }
 *
 * // React Native implementation using react-native-config
 * class RNEnvProvider implements EnvProvider {
 *   get(key: string): Optional<string> {
 *     return Config[key];
 *   }
 * }
 * ```
 */

import type {
  EnvProvider,
  AppConfig,
  EnvironmentVariables,
  FirebaseConfig,
  Optional,
} from './types';

export type {
  EnvProvider,
  AppConfig,
  EnvironmentVariables,
  FirebaseConfig,
  Optional,
};

/**
 * Environment factory interface for creating environment providers.
 *
 * @ai-context Factory pattern for environment provider creation
 * @ai-pattern Abstract factory with platform detection
 * @ai-platform Creates providers for web, React Native, and Node.js environments
 * @ai-usage Implement to create platform-specific environment providers
 *
 * @example
 * ```typescript
 * class UniversalEnvFactory implements EnvFactory {
 *   createEnvProvider(): EnvProvider {
 *     const platform = this.detectPlatform();
 *     switch (platform) {
 *       case 'web': return new WebEnvProvider();
 *       case 'react-native': return new RNEnvProvider();
 *       case 'node': return new NodeEnvProvider();
 *     }
 *   }
 * }
 * ```
 */
export interface EnvFactory {
  /**
   * Create an environment provider for the current platform
   */
  createEnvProvider(): EnvProvider;

  /**
   * Create application configuration from environment
   */
  createAppConfig(envProvider: EnvProvider): AppConfig;

  /**
   * Detect the current platform
   */
  detectPlatform(): 'web' | 'react-native' | 'node';
}

/**
 * Environment utilities interface for common environment operations.
 *
 * @ai-context Utility interface for environment detection and variable access
 * @ai-pattern Utility provider with boolean checks and safe value access
 * @ai-platform Works across all environments with fallback mechanisms
 * @ai-usage Implement for centralized environment checks and variable access
 * @ai-security Provides safe access to environment variables with fallbacks
 *
 * @example
 * ```typescript
 * class StandardEnvUtils implements EnvUtils {
 *   isDevelopment(): boolean {
 *     return this.get('NODE_ENV') === 'development';
 *   }
 *
 *   get(key: string, defaultValue?: Optional<string>): Optional<string> {
 *     return process.env[key] || defaultValue;
 *   }
 * }
 * ```
 */
export interface EnvUtils {
  /**
   * Check if running in development
   */
  isDevelopment(): boolean;

  /**
   * Check if running in production
   */
  isProduction(): boolean;

  /**
   * Check if running in test
   */
  isTest(): boolean;

  /**
   * Get environment variable with fallback
   */
  get(key: string, defaultValue?: Optional<string>): Optional<string>;
}
