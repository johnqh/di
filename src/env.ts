/**
 * Environment provider interfaces for dependency injection
 * Abstract interfaces without platform-specific implementations
 */

import type {
  EnvProvider,
  AppConfig,
  EnvironmentVariables,
  FirebaseConfig,
} from './types';

export type { EnvProvider, AppConfig, EnvironmentVariables, FirebaseConfig };

/**
 * Environment factory interface for creating environment providers
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
 * Environment utilities interface
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
  get(key: string, defaultValue?: string): string | undefined;
}
