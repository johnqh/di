/**
 * Core type definitions for dependency injection interfaces
 * Platform-agnostic types that work across web and React Native
 *
 * @ai-context Core types and enums for cross-platform dependency injection
 * @ai-platform Universal compatibility (Web, React Native, Node.js)
 * @ai-pattern Type definitions with runtime enum support
 */

/**
 * Environment variables interface with typed NODE_ENV and flexible additional properties.
 *
 * @ai-interface-type Configuration Data Type
 * @ai-pattern Flexible configuration with typed common properties
 * @ai-security Environment variables may contain sensitive data
 */
export interface EnvironmentVariables {
  /** Node.js environment setting with strict typing */
  NODE_ENV?: 'development' | 'production' | 'test';
  /** Additional environment variables with flexible string keys */
  [key: string]: string | undefined;
}

/**
 * Environment provider interface for accessing and validating environment configuration.
 *
 * Provides type-safe access to environment variables with runtime environment detection.
 * Essential for configuration management across different deployment environments.
 *
 * @ai-interface-type Service Provider
 * @ai-pattern Environment abstraction with type safety
 * @ai-use-case Configuration management, environment detection
 *
 * @example
 * ```typescript
 * class NodeEnvProvider implements EnvProvider {
 *   get(key: string, defaultValue?: string) {
 *     return process.env[key] ?? defaultValue;
 *   }
 *   isDevelopment() { return this.get('NODE_ENV') === 'development'; }
 * }
 * ```
 */
export interface EnvProvider {
  /**
   * Get environment variable with type-safe key access.
   *
   * @param key Environment variable key (typed when using EnvironmentVariables keys)
   * @param defaultValue Default value if environment variable is not set
   * @returns Environment variable value or default
   *
   * @ai-pattern Type-safe configuration access
   * @ai-generics Uses generic constraints for type safety
   */
  get<K extends keyof EnvironmentVariables>(
    key: K,
    defaultValue?: string
  ): EnvironmentVariables[K] | string | undefined;

  /**
   * Check if currently running in development environment.
   *
   * @returns true if NODE_ENV is 'development'
   * @ai-pattern Environment detection
   */
  isDevelopment(): boolean;

  /**
   * Check if currently running in production environment.
   *
   * @returns true if NODE_ENV is 'production'
   * @ai-pattern Environment detection
   */
  isProduction(): boolean;

  /**
   * Check if currently running in test environment.
   *
   * @returns true if NODE_ENV is 'test'
   * @ai-pattern Environment detection
   */
  isTest(): boolean;

  /**
   * Get all environment variables as a typed object.
   *
   * @returns Complete environment variables object
   * @ai-pattern Bulk configuration access
   * @ai-security Be cautious when exposing all environment variables
   */
  getAll(): EnvironmentVariables;
}

/**
 * Firebase service configuration interface.
 *
 * Contains all necessary configuration for Firebase services including
 * authentication, analytics, messaging, and web push notifications.
 *
 * @ai-interface-type Configuration Data Type
 * @ai-service Firebase configuration
 * @ai-security Contains sensitive API keys and configuration data
 * @ai-platform Works across web and React Native Firebase SDKs
 */
export interface FirebaseConfig {
  /** Firebase project API key */
  apiKey: string;
  /** Firebase authentication domain */
  authDomain: string;
  /** Firebase project ID */
  projectId: string;
  /** Firebase storage bucket URL */
  storageBucket: string;
  /** Firebase Cloud Messaging sender ID */
  messagingSenderId: string;
  /** Firebase application ID */
  appId: string;
  /** Google Analytics measurement ID (optional) */
  measurementId?: string;
  /** VAPID key for web push notifications (optional) */
  vapidKey?: string;
}

/**
 * Main application configuration interface.
 *
 * Centralizes all application configuration including API endpoints,
 * service keys, and feature flags. Designed for email/communication
 * applications with blockchain wallet integration.
 *
 * @ai-interface-type Configuration Data Type
 * @ai-pattern Centralized application configuration
 * @ai-security Contains multiple sensitive API keys and tokens
 * @ai-domain Email applications with blockchain/crypto integration
 *
 * @example
 * ```typescript
 * const config: AppConfig = {
 *   wildDuckBackendUrl: 'https://api.myemailapp.com',
 *   indexerBackendUrl: 'https://indexer.myapp.com',
 *   // ... other required configuration
 * };
 * ```
 */
export interface AppConfig {
  /** Backend API URL for WildDuck email server */
  wildDuckBackendUrl: string;
  /** Backend URL for blockchain/crypto indexer service */
  indexerBackendUrl: string;

  /** API token for WildDuck email server authentication */
  wildDuckApiToken: string;
  /** RevenueCat API key for subscription management */
  revenueCatApiKey: string;
  /** WalletConnect project ID for crypto wallet integration */
  walletConnectProjectId: string;
  /** Privy application ID for authentication service */
  privyAppId: string;

  /** Complete Firebase service configuration */
  firebase: FirebaseConfig;

  /** Whether to use Cloudflare Worker for proxy/caching */
  useCloudflareWorker: boolean;
  /** Cloudflare Worker URL when enabled */
  cloudflareWorkerUrl: string;

  /** Enable mock/fallback services for development/testing */
  useMockFallback: boolean;
}

/**
 * Storage type enumeration for cross-platform storage abstraction.
 *
 * Provides runtime-accessible values for different storage mechanisms
 * across web browsers, React Native, and Node.js environments.
 *
 * @ai-enum-type Storage mechanism selector
 * @ai-pattern Cross-platform storage abstraction
 * @ai-runtime-value Enum values available at runtime for dynamic selection
 * @ai-cross-platform Web (localStorage/sessionStorage), React Native (AsyncStorage), Universal (memory)
 *
 * @example
 * ```typescript
 * // Use enum values for storage factory
 * const storage = storageFactory.create(StorageType.LOCAL_STORAGE);
 *
 * // Runtime value access
 * Object.values(StorageType) // ['localStorage', 'sessionStorage', 'asyncStorage', 'memory']
 * ```
 */
export enum StorageType {
  /** Web browser localStorage for persistent client-side storage */
  LOCAL_STORAGE = 'localStorage',
  /** Web browser sessionStorage for session-based storage */
  SESSION_STORAGE = 'sessionStorage',
  /** React Native AsyncStorage for mobile persistent storage */
  ASYNC_STORAGE = 'asyncStorage',
  /** In-memory storage for testing or temporary data */
  MEMORY = 'memory',
}

/**
 * Flexible analytics event properties interface.
 *
 * Supports arbitrary key-value pairs for analytics event metadata
 * with common data types used in analytics tracking.
 *
 * @ai-interface-type Data Container
 * @ai-pattern Flexible properties with common analytics data types
 * @ai-analytics Event metadata and context information
 */
export interface AnalyticsEventProperties {
  /** Flexible analytics properties supporting common data types */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Standardized analytics events enumeration.
 *
 * Provides consistent event naming for common application analytics scenarios.
 * Organized by functional categories for better code organization and analytics reporting.
 *
 * @ai-enum-type Analytics event identifiers
 * @ai-pattern Standardized event naming convention
 * @ai-analytics Pre-defined events for consistent tracking
 * @ai-categories User auth, email actions, navigation, errors, custom events
 *
 * @example
 * ```typescript
 * // Use predefined events for consistency
 * analytics.track(AnalyticsEvent.USER_LOGIN, { method: 'email' });
 * analytics.track(AnalyticsEvent.EMAIL_OPENED, { email_id: 'msg-123' });
 * ```
 */
export enum AnalyticsEvent {
  /** User successfully logged into the application */
  USER_LOGIN = 'user_login',
  /** User logged out of the application */
  USER_LOGOUT = 'user_logout',
  /** New user completed account registration */
  USER_SIGNUP = 'user_signup',

  /** User sent an email message */
  EMAIL_SENT = 'email_sent',
  /** User received a new email message */
  EMAIL_RECEIVED = 'email_received',
  /** User opened an email message */
  EMAIL_OPENED = 'email_opened',
  /** User clicked a link within an email */
  EMAIL_CLICKED = 'email_clicked',

  /** User viewed a web page */
  PAGE_VIEW = 'page_view',
  /** User viewed a mobile screen */
  SCREEN_VIEW = 'screen_view',

  /** An application error occurred */
  ERROR_OCCURRED = 'error_occurred',

  /** Custom application-specific event */
  CUSTOM_EVENT = 'custom_event',
}

/**
 * Blockchain network type enumeration.
 *
 * Identifies different blockchain ecosystems for wallet and transaction processing.
 * Essential for multi-chain applications and crypto wallet integrations.
 *
 * @ai-enum-type Blockchain network identifier
 * @ai-domain Cryptocurrency and blockchain applications
 * @ai-pattern Multi-chain support with network abstraction
 *
 * @example
 * ```typescript
 * // Chain-specific wallet operations
 * if (chainType === ChainType.EVM) {
 *   // Handle Ethereum-compatible chains
 * } else if (chainType === ChainType.SOLANA) {
 *   // Handle Solana network operations
 * }
 * ```
 */
export enum ChainType {
  /** Ethereum Virtual Machine compatible chains (Ethereum, Polygon, BSC, etc.) */
  EVM = 'evm',
  /** Solana blockchain network */
  SOLANA = 'solana',
}

/**
 * Cryptocurrency wallet type enumeration.
 *
 * Identifies different wallet providers and connection methods for blockchain interactions.
 * Supports both browser extension wallets and protocol-based connections.
 *
 * @ai-enum-type Wallet provider identifier
 * @ai-domain Cryptocurrency wallet integration
 * @ai-pattern Multi-wallet support with provider abstraction
 * @ai-web3 Browser extension wallets and connection protocols
 *
 * @example
 * ```typescript
 * // Wallet-specific connection logic
 * switch (walletType) {
 *   case WalletType.METAMASK:
 *     return connectMetaMask();
 *   case WalletType.WALLETCONNECT:
 *     return connectWalletConnect();
 * }
 * ```
 */
export enum WalletType {
  /** MetaMask browser extension wallet */
  METAMASK = 'metamask',
  /** Phantom wallet (primarily for Solana) */
  PHANTOM = 'phantom',
  /** Coinbase Wallet */
  COINBASE = 'coinbase',
  /** WalletConnect protocol for mobile wallets */
  WALLETCONNECT = 'walletconnect',
  /** Generic injected wallet provider */
  INJECTED = 'injected',
}
