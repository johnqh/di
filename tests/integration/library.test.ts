/**
 * Integration tests for the complete library
 */

import * as DI from '../../src/index';

describe('Library Integration', () => {
  test('should export all core types', () => {
    // Test enum exports
    expect(DI.AnalyticsEvent.USER_LOGIN).toBe('user_login');
    expect(DI.AuthStatus.AUTHENTICATED).toBe('authenticated');
    expect(DI.ChainType.ETHEREUM).toBe('ethereum');
    expect(DI.LoginMethod.WALLET).toBe('wallet');
    expect(DI.WalletType.METAMASK).toBe('metamask');
  });

  test('should provide complete TypeScript interface support', () => {
    // This test verifies that all interfaces are properly exported
    // and can be used for type checking in consuming applications
    
    const mockUser: DI.AuthUser = {
      id: 'test-user',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    const mockConfig: DI.AppConfig = {
      wildDuckBackendUrl: 'https://api.example.com',
      indexerBackendUrl: 'https://indexer.example.com',
      wildDuckApiToken: 'token',
      revenueCatApiKey: 'rc-key',
      walletConnectProjectId: 'wc-id',
      privyAppId: 'privy-id',
      firebase: {
        apiKey: 'firebase-key',
        authDomain: 'app.firebaseapp.com',
        projectId: 'firebase-project',
        storageBucket: 'firebase-bucket',
        messagingSenderId: '123456',
        appId: 'firebase-app-id',
      },
      useCloudflareWorker: false,
      cloudflareWorkerUrl: 'https://worker.example.com',
      useMockFallback: true,
    };

    expect(mockUser.id).toBe('test-user');
    expect(mockConfig.firebase.projectId).toBe('firebase-project');
  });

  test('should support dependency injection patterns', () => {
    // Test that the library supports the intended DI patterns
    // by checking interface compliance
    
    class TestAnalyticsClient implements DI.AnalyticsClient {
      trackEvent(): void { /* implementation */ }
      setUserProperties(): void { /* implementation */ }
      setUserId(): void { /* implementation */ }
      setAnalyticsEnabled(): void { /* implementation */ }
      setCurrentScreen(): void { /* implementation */ }
    }

    class TestEnvProvider implements DI.EnvProvider {
      get() { return 'test-value'; }
      isDevelopment() { return true; }
      isProduction() { return false; }
      isTest() { return true; }
      getAll(): DI.EnvironmentVariables { return { NODE_ENV: 'test' }; }
    }

    const analyticsClient = new TestAnalyticsClient();
    const envProvider = new TestEnvProvider();

    expect(analyticsClient).toBeInstanceOf(TestAnalyticsClient);
    expect(envProvider).toBeInstanceOf(TestEnvProvider);
    expect(envProvider.isDevelopment()).toBe(true);
  });

  test('should work across platform boundaries', () => {
    // Test that interfaces work for cross-platform scenarios
    const storageTypes: DI.StorageType[] = [
      'localStorage',    // Web
      'sessionStorage',  // Web
      'asyncStorage',    // React Native
      'memory'          // Universal fallback
    ];

    storageTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });

    const chainTypes = Object.values(DI.ChainType);
    expect(chainTypes).toContain('ethereum');
    expect(chainTypes).toContain('solana');
    expect(chainTypes).toContain('polygon');
  });

  test('should maintain type safety', () => {
    // Test that the library maintains strict TypeScript typing
    const eventData: DI.AnalyticsEventData = {
      event: DI.AnalyticsEvent.PAGE_VIEW,
      parameters: {
        page_title: 'Home',
        user_id: 'user-123',
        timestamp: Date.now(),
      },
    };

    expect(eventData.event).toBe(DI.AnalyticsEvent.PAGE_VIEW);
    expect(eventData.parameters?.page_title).toBe('Home');
  });
});