/**
 * Tests for core type definitions and enums
 * 
 * @ai-test-suite Core types validation
 * @ai-coverage Enum value verification, interface type checking, runtime behavior
 * @ai-pattern Type safety validation with practical examples
 */

import {
  AnalyticsEvent,
  ChainType,
  WalletType,
  StorageType,
} from '@sudobility/types';
import {
  EnvironmentVariables,
  AppConfig,
  FirebaseConfig,
} from '../../src/types';

/**
 * @ai-test-category Analytics Event Enum Validation
 * @ai-purpose Verify analytics event enum values match expected strings for tracking consistency
 */
describe('AnalyticsEvent Enum', () => {
  /**
   * @ai-test-pattern Enum value verification
   * @ai-purpose Ensure user authentication events have correct tracking identifiers
   */
  test('should have correct user authentication events', () => {
    expect(AnalyticsEvent.USER_LOGIN).toBe('user_login');
    expect(AnalyticsEvent.USER_LOGOUT).toBe('user_logout');
    expect(AnalyticsEvent.USER_SIGNUP).toBe('user_signup');
  });

  /**
   * @ai-test-pattern Domain-specific enum validation
   * @ai-purpose Verify email-related events for email application analytics
   */
  test('should have correct email action events', () => {
    expect(AnalyticsEvent.EMAIL_SENT).toBe('email_sent');
    expect(AnalyticsEvent.EMAIL_RECEIVED).toBe('email_received');
    expect(AnalyticsEvent.EMAIL_OPENED).toBe('email_opened');
    expect(AnalyticsEvent.EMAIL_CLICKED).toBe('email_clicked');
  });

  /**
   * @ai-test-pattern Cross-platform enum validation
   * @ai-purpose Ensure navigation events work for both web pages and mobile screens
   */
  test('should have correct navigation events', () => {
    expect(AnalyticsEvent.PAGE_VIEW).toBe('page_view');
    expect(AnalyticsEvent.SCREEN_VIEW).toBe('screen_view');
  });

  /**
   * @ai-test-pattern Error tracking and extensibility validation
   * @ai-purpose Verify error tracking and custom event support
   */
  test('should have correct error and custom events', () => {
    expect(AnalyticsEvent.ERROR_OCCURRED).toBe('error_occurred');
    expect(AnalyticsEvent.CUSTOM_EVENT).toBe('custom_event');
  });

  /**
   * @ai-test-pattern Runtime enum behavior
   * @ai-purpose Verify enum can be used for dynamic operations like iteration
   */
  test('should be iterable for dynamic event processing', () => {
    const allEvents = Object.values(AnalyticsEvent);
    expect(allEvents).toContain('user_login');
    expect(allEvents).toContain('email_sent');
    expect(allEvents.length).toBeGreaterThan(5);
    
    // Verify all values are strings (required for analytics APIs)
    allEvents.forEach(event => {
      expect(typeof event).toBe('string');
    });
  });
});

/**
 * @ai-test-category Blockchain Chain Type Validation
 * @ai-purpose Verify blockchain network identifiers for multi-chain wallet integration
 */
describe('ChainType Enum', () => {
  /**
   * @ai-test-pattern Web3 enum validation
   * @ai-purpose Ensure blockchain network types match expected protocol identifiers
   */
  test('should have correct blockchain chain types', () => {
    expect(ChainType.EVM).toBe('evm');
    expect(ChainType.SOLANA).toBe('solana');
  });

  /**
   * @ai-test-pattern Multi-chain support validation
   * @ai-purpose Verify enum supports common blockchain ecosystems
   */
  test('should support major blockchain ecosystems', () => {
    const chainTypes = Object.values(ChainType);
    expect(chainTypes).toContain('evm'); // Ethereum, Polygon, BSC, etc.
    expect(chainTypes).toContain('solana'); // Solana ecosystem
    expect(chainTypes.length).toBeGreaterThanOrEqual(2);
  });
});

/**
 * @ai-test-category Cryptocurrency Wallet Type Validation
 * @ai-purpose Verify wallet provider identifiers for blockchain integration
 */
describe('WalletType Enum', () => {
  /**
   * @ai-test-pattern Wallet provider enum validation
   * @ai-purpose Ensure wallet type identifiers match provider specifications
   */
  test('should have correct wallet type values', () => {
    expect(WalletType.METAMASK).toBe('metamask');
    expect(WalletType.PHANTOM).toBe('phantom');
    expect(WalletType.COINBASE).toBe('coinbase');
    expect(WalletType.WALLETCONNECT).toBe('walletconnect');
    expect(WalletType.INJECTED).toBe('injected');
  });

  /**
   * @ai-test-pattern Multi-wallet ecosystem support
   * @ai-purpose Verify comprehensive wallet provider coverage
   */
  test('should cover major wallet providers and connection methods', () => {
    const walletTypes = Object.values(WalletType);
    
    // Browser extension wallets
    expect(walletTypes).toContain('metamask');
    expect(walletTypes).toContain('phantom');
    expect(walletTypes).toContain('coinbase');
    
    // Connection protocols
    expect(walletTypes).toContain('walletconnect');
    expect(walletTypes).toContain('injected');
    
    expect(walletTypes.length).toBeGreaterThanOrEqual(5);
  });
});

/**
 * @ai-test-category Storage Type Enum Validation
 * @ai-purpose Verify cross-platform storage mechanism identifiers
 */
describe('StorageType Enum', () => {
  /**
   * @ai-test-pattern Storage mechanism enum validation
   * @ai-purpose Ensure storage type identifiers match platform APIs
   */
  test('should have correct storage type values', () => {
    expect(StorageType.LOCAL_STORAGE).toBe('localStorage');
    expect(StorageType.SESSION_STORAGE).toBe('sessionStorage');
    expect(StorageType.ASYNC_STORAGE).toBe('asyncStorage');
    expect(StorageType.MEMORY).toBe('memory');
  });

  /**
   * @ai-test-pattern Cross-platform storage support
   * @ai-purpose Verify storage types cover web, mobile, and universal scenarios
   */
  test('should support all major platform storage mechanisms', () => {
    const storageTypes = Object.values(StorageType);
    
    // Web browser storage
    expect(storageTypes).toContain('localStorage');
    expect(storageTypes).toContain('sessionStorage');
    
    // React Native storage
    expect(storageTypes).toContain('asyncStorage');
    
    // Universal fallback
    expect(storageTypes).toContain('memory');
    
    expect(storageTypes.length).toBe(4);
  });

  /**
   * @ai-test-pattern Runtime enum usage validation
   * @ai-purpose Verify enum can be used for storage factory patterns
   */
  test('should be usable for dynamic storage selection', () => {
    const validStorageTypes: StorageType[] = [
      StorageType.LOCAL_STORAGE,
      StorageType.SESSION_STORAGE,
      StorageType.ASYNC_STORAGE,
      StorageType.MEMORY
    ];
    
    // Verify enum values are runtime accessible strings
    validStorageTypes.forEach(type => {
      expect(typeof type).toBe('string');
      expect(type.length).toBeGreaterThan(0);
    });
    
    // Verify can be used in switch statements (common pattern)
    const testStorageFactory = (type: StorageType): string => {
      switch (type) {
        case StorageType.LOCAL_STORAGE:
          return 'web-persistent';
        case StorageType.SESSION_STORAGE:
          return 'web-session';
        case StorageType.ASYNC_STORAGE:
          return 'mobile-persistent';
        case StorageType.MEMORY:
          return 'memory-temp';
        default:
          return 'unknown';
      }
    };
    
    expect(testStorageFactory(StorageType.LOCAL_STORAGE)).toBe('web-persistent');
    expect(testStorageFactory(StorageType.ASYNC_STORAGE)).toBe('mobile-persistent');
  });
});

/**
 * @ai-test-category Interface Type Safety Validation
 * @ai-purpose Verify TypeScript interfaces provide proper type checking and structure
 */
describe('Interface Type Validation', () => {
  /**
   * @ai-test-pattern Firebase configuration interface validation
   * @ai-purpose Ensure FirebaseConfig interface supports all Firebase service requirements
   */
  test('FirebaseConfig interface should be properly typed', () => {
    const mockConfig: FirebaseConfig = {
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
      measurementId: 'G-XXXXXXXXXX',
      vapidKey: 'test-vapid-key',
    };

    // Verify required properties
    expect(mockConfig.apiKey).toBe('test-api-key');
    expect(mockConfig.projectId).toBe('test-project');
    expect(mockConfig.authDomain).toBe('test.firebaseapp.com');
    expect(mockConfig.storageBucket).toBe('test-project.appspot.com');
    
    // Verify optional properties
    expect(mockConfig.measurementId).toBe('G-XXXXXXXXXX');
    expect(mockConfig.vapidKey).toBe('test-vapid-key');
    
    // Verify interface structure allows Firebase SDK initialization
    expect(typeof mockConfig).toBe('object');
    expect(Object.keys(mockConfig).length).toBeGreaterThanOrEqual(6);
  });

  /**
   * @ai-test-pattern Application configuration interface validation
   * @ai-purpose Ensure AppConfig interface supports complete application configuration
   */
  test('AppConfig interface should be properly typed', () => {
    const mockFirebaseConfig: FirebaseConfig = {
      apiKey: 'test-api-key',
      authDomain: 'test.firebaseapp.com',
      projectId: 'test-project',
      storageBucket: 'test-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef',
    };

    const mockAppConfig: AppConfig = {
      wildDuckBackendUrl: 'https://api.example.com',
      indexerBackendUrl: 'https://indexer.example.com',
      revenueCatApiKey: 'rc-key',
      walletConnectProjectId: 'wc-project-id',
      privyAppId: 'privy-app-id',
      firebase: mockFirebaseConfig,
      useCloudflareWorker: true,
      cloudflareWorkerUrl: 'https://worker.example.com',
      useMockFallback: false,
    };

    // Verify backend configuration
    expect(mockAppConfig.wildDuckBackendUrl).toBe('https://api.example.com');
    expect(mockAppConfig.indexerBackendUrl).toBe('https://indexer.example.com');
    
    // Verify service integrations
    expect(mockAppConfig.revenueCatApiKey).toBe('rc-key');
    expect(mockAppConfig.walletConnectProjectId).toBe('wc-project-id');
    expect(mockAppConfig.privyAppId).toBe('privy-app-id');
    
    // Verify nested configuration
    expect(mockAppConfig.firebase).toEqual(mockFirebaseConfig);
    
    // Verify feature flags
    expect(mockAppConfig.useCloudflareWorker).toBe(true);
    expect(mockAppConfig.useMockFallback).toBe(false);
    
    // Verify configuration completeness for email/crypto app
    expect(typeof mockAppConfig.cloudflareWorkerUrl).toBe('string');
  });

  /**
   * @ai-test-pattern Environment variables interface validation
   * @ai-purpose Ensure EnvironmentVariables interface supports flexible configuration
   */
  test('EnvironmentVariables interface should be properly typed', () => {
    const mockEnvVars: EnvironmentVariables = {
      NODE_ENV: 'development',
      API_KEY: 'test-key',
      DATABASE_URL: 'postgres://localhost:5432/test',
    };

    // Verify typed NODE_ENV property
    expect(mockEnvVars.NODE_ENV).toBe('development');
    expect(['development', 'production', 'test']).toContain(mockEnvVars.NODE_ENV);
    
    // Verify flexible additional properties
    expect(mockEnvVars.API_KEY).toBe('test-key');
    expect(mockEnvVars.DATABASE_URL).toBe('postgres://localhost:5432/test');
    
    // Verify interface supports undefined values (common for missing env vars)
    const partialEnvVars: EnvironmentVariables = {
      NODE_ENV: 'production',
      MISSING_VAR: undefined,
    };
    expect(partialEnvVars.MISSING_VAR).toBeUndefined();
  });

  /**
   * @ai-test-pattern Type safety edge cases
   * @ai-purpose Verify interfaces handle edge cases and maintain type safety
   */
  test('should maintain type safety with partial configurations', () => {
    // Test FirebaseConfig with minimal required fields
    const minimalFirebaseConfig: FirebaseConfig = {
      apiKey: 'required-key',
      authDomain: 'required-domain',
      projectId: 'required-project',
      storageBucket: 'required-bucket',
      messagingSenderId: 'required-sender',
      appId: 'required-app-id',
      // Optional fields omitted
    };
    
    expect(minimalFirebaseConfig.measurementId).toBeUndefined();
    expect(minimalFirebaseConfig.vapidKey).toBeUndefined();
    
    // Test EnvironmentVariables with only NODE_ENV
    const minimalEnvVars: EnvironmentVariables = {
      NODE_ENV: 'test',
    };
    
    expect(minimalEnvVars.NODE_ENV).toBe('test');
    expect(Object.keys(minimalEnvVars).length).toBe(1);
  });
});