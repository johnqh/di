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

// Authentication Types
export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData?: Array<{
    providerId: string;
    uid: string;
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
  }>;
}

export interface AuthCredential {
  providerId: string;
  signInMethod: string;
}

// Storage Types
export type StorageType =
  | 'localStorage'
  | 'sessionStorage'
  | 'asyncStorage'
  | 'memory';

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

// Authentication Status Enum
export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
  ERROR = 'error',
}

// Chain Type Enum
export enum ChainType {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  POLYGON = 'polygon',
  BSC = 'bsc',
  AVALANCHE = 'avalanche',
}

// Login Method Enum
export enum LoginMethod {
  WALLET = 'wallet',
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
  TWITTER = 'twitter',
}

// Wallet Type Enum
export enum WalletType {
  METAMASK = 'metamask',
  PHANTOM = 'phantom',
  COINBASE = 'coinbase',
  WALLETCONNECT = 'walletconnect',
  INJECTED = 'injected',
}
