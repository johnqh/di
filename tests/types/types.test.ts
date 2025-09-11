/**
 * Tests for core type definitions and enums
 */

import {
  AnalyticsEvent,
  AuthStatus,
  ChainType,
  LoginMethod,
  WalletType,
  StorageType,
  EnvironmentVariables,
  AppConfig,
  FirebaseConfig,
  AuthUser,
  AuthCredential,
  EmailAddress,
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

describe('AuthStatus Enum', () => {
  test('should have correct authentication status values', () => {
    expect(AuthStatus.AUTHENTICATED).toBe('authenticated');
    expect(AuthStatus.UNAUTHENTICATED).toBe('unauthenticated');
    expect(AuthStatus.LOADING).toBe('loading');
    expect(AuthStatus.ERROR).toBe('error');
  });
});

describe('ChainType Enum', () => {
  test('should have correct blockchain chain types', () => {
    expect(ChainType.ETHEREUM).toBe('ethereum');
    expect(ChainType.SOLANA).toBe('solana');
    expect(ChainType.POLYGON).toBe('polygon');
    expect(ChainType.BSC).toBe('bsc');
    expect(ChainType.AVALANCHE).toBe('avalanche');
  });
});

describe('LoginMethod Enum', () => {
  test('should have correct login method values', () => {
    expect(LoginMethod.WALLET).toBe('wallet');
    expect(LoginMethod.EMAIL).toBe('email');
    expect(LoginMethod.GOOGLE).toBe('google');
    expect(LoginMethod.APPLE).toBe('apple');
    expect(LoginMethod.TWITTER).toBe('twitter');
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
  test('AuthUser interface should be properly typed', () => {
    const mockUser: AuthUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: '2023-01-01T00:00:00.000Z',
        lastSignInTime: '2023-01-02T00:00:00.000Z',
      },
      providerData: [{
        providerId: 'google.com',
        uid: 'google-uid',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
      }]
    };

    expect(mockUser.id).toBe('test-user-id');
    expect(mockUser.email).toBe('test@example.com');
    expect(mockUser.emailVerified).toBe(true);
  });

  test('AuthCredential interface should be properly typed', () => {
    const mockCredential: AuthCredential = {
      providerId: 'google.com',
      signInMethod: 'popup',
    };

    expect(mockCredential.providerId).toBe('google.com');
    expect(mockCredential.signInMethod).toBe('popup');
  });

  test('EmailAddress interface should be properly typed', () => {
    const mockEmail: EmailAddress = {
      id: 'email-1',
      address: 'test@example.com',
      verified: true,
      primary: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };

    expect(mockEmail.id).toBe('email-1');
    expect(mockEmail.address).toBe('test@example.com');
    expect(mockEmail.verified).toBe(true);
    expect(mockEmail.createdAt).toBeInstanceOf(Date);
  });

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