/**
 * Tests for core type definitions and enums
 */

import {
  AnalyticsEvent,
  ChainType,
  WalletType,
  StorageType,
  EnvironmentVariables,
  AppConfig,
  FirebaseConfig,
} from '../../src/types';

describe('AnalyticsEvent Enum', () => {
  test('should have correct user authentication events', () => {
    expect(AnalyticsEvent.USER_LOGIN).toBe('user_login');
    expect(AnalyticsEvent.USER_LOGOUT).toBe('user_logout');
    expect(AnalyticsEvent.USER_SIGNUP).toBe('user_signup');
  });

  test('should have correct email action events', () => {
    expect(AnalyticsEvent.EMAIL_SENT).toBe('email_sent');
    expect(AnalyticsEvent.EMAIL_RECEIVED).toBe('email_received');
    expect(AnalyticsEvent.EMAIL_OPENED).toBe('email_opened');
    expect(AnalyticsEvent.EMAIL_CLICKED).toBe('email_clicked');
  });

  test('should have correct navigation events', () => {
    expect(AnalyticsEvent.PAGE_VIEW).toBe('page_view');
    expect(AnalyticsEvent.SCREEN_VIEW).toBe('screen_view');
  });

  test('should have correct error and custom events', () => {
    expect(AnalyticsEvent.ERROR_OCCURRED).toBe('error_occurred');
    expect(AnalyticsEvent.CUSTOM_EVENT).toBe('custom_event');
  });
});

describe('ChainType Enum', () => {
  test('should have correct blockchain chain types', () => {
    expect(ChainType.EVM).toBe('evm');
    expect(ChainType.SOLANA).toBe('solana');
  });
});

describe('WalletType Enum', () => {
  test('should have correct wallet type values', () => {
    expect(WalletType.METAMASK).toBe('metamask');
    expect(WalletType.PHANTOM).toBe('phantom');
    expect(WalletType.COINBASE).toBe('coinbase');
    expect(WalletType.WALLETCONNECT).toBe('walletconnect');
    expect(WalletType.INJECTED).toBe('injected');
  });
});

describe('StorageType', () => {
  test('should be a union type with correct values', () => {
    const validStorageTypes: StorageType[] = [
      'localStorage',
      'sessionStorage',
      'asyncStorage',
      'memory'
    ];
    
    // This test verifies the type exists and can be used
    validStorageTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });
});

describe('Interface Type Validation', () => {
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

    expect(mockConfig.apiKey).toBe('test-api-key');
    expect(mockConfig.projectId).toBe('test-project');
    expect(mockConfig.measurementId).toBe('G-XXXXXXXXXX');
  });

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
      wildDuckApiToken: 'test-token',
      revenueCatApiKey: 'rc-key',
      walletConnectProjectId: 'wc-project-id',
      privyAppId: 'privy-app-id',
      firebase: mockFirebaseConfig,
      useCloudflareWorker: true,
      cloudflareWorkerUrl: 'https://worker.example.com',
      useMockFallback: false,
    };

    expect(mockAppConfig.wildDuckBackendUrl).toBe('https://api.example.com');
    expect(mockAppConfig.firebase).toEqual(mockFirebaseConfig);
    expect(mockAppConfig.useCloudflareWorker).toBe(true);
  });

  test('EnvironmentVariables interface should be properly typed', () => {
    const mockEnvVars: EnvironmentVariables = {
      NODE_ENV: 'development',
      API_KEY: 'test-key',
      DATABASE_URL: 'postgres://localhost:5432/test',
    };

    expect(mockEnvVars.NODE_ENV).toBe('development');
    expect(mockEnvVars.API_KEY).toBe('test-key');
  });
});