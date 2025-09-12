/**
 * Core type definitions for dependency injection interfaces
 * Platform-agnostic types that work across web and React Native
 */

// Environment Configuration Types
export interface EnvironmentVariables {
  NODE_ENV?: 'development' | 'production' | 'test';
  [key: string]: string | undefined;
}

export interface EnvProvider {
  /**
   * Get environment variable
   */
  get<K extends keyof EnvironmentVariables>(
    key: K,
    defaultValue?: string
  ): EnvironmentVariables[K] | string | undefined;

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
   * Get all environment variables
   */
  getAll(): EnvironmentVariables;
}

// Application Configuration
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  vapidKey?: string;
}

export interface AppConfig {
  // Backend URLs
  wildDuckBackendUrl: string;
  indexerBackendUrl: string;

  // API Keys and Tokens
  wildDuckApiToken: string;
  revenueCatApiKey: string;
  walletConnectProjectId: string;
  privyAppId: string;

  // Firebase Configuration
  firebase: FirebaseConfig;

  // Cloudflare Worker Configuration
  useCloudflareWorker: boolean;
  cloudflareWorkerUrl: string;

  // Development/Testing
  useMockFallback: boolean;
}

// Storage Types
export enum StorageType {
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  ASYNC_STORAGE = 'asyncStorage',
  MEMORY = 'memory',
}

// Analytics Types
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

// Analytics Events Enum
export enum AnalyticsEvent {
  // User Authentication
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_SIGNUP = 'user_signup',

  // Email Actions
  EMAIL_SENT = 'email_sent',
  EMAIL_RECEIVED = 'email_received',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',

  // Navigation
  PAGE_VIEW = 'page_view',
  SCREEN_VIEW = 'screen_view',

  // Errors
  ERROR_OCCURRED = 'error_occurred',

  // Custom Events
  CUSTOM_EVENT = 'custom_event',
}

// Chain Type Enum
export enum ChainType {
  EVM = 'evm',
  SOLANA = 'solana',
}

// Wallet Type Enum
export enum WalletType {
  METAMASK = 'metamask',
  PHANTOM = 'phantom',
  COINBASE = 'coinbase',
  WALLETCONNECT = 'walletconnect',
  INJECTED = 'injected',
}
