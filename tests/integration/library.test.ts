/**
 * Integration tests for the complete library
 */

import * as DI from '../../src/index';
import { AnalyticsEvent, ChainType, WalletType, StorageType } from '@sudobility/types';

describe('Library Integration', () => {
  test('should export all core types', () => {
    // Test enum exports from @sudobility/types (peer dependency)
    expect(AnalyticsEvent.USER_LOGIN).toBe('user_login');
    expect(ChainType.EVM).toBe('evm');
    expect(WalletType.METAMASK).toBe('metamask');
  });

  test('should provide complete TypeScript interface support', () => {
    // This test verifies that all interfaces are properly exported
    // and can be used for type checking in consuming applications
    
    const mockConfig: DI.AppConfig = {
      wildDuckBackendUrl: 'https://api.example.com',
      indexerBackendUrl: 'https://indexer.example.com',
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
    const storageTypesArray: StorageType[] = [
      StorageType.LOCAL_STORAGE,    // Web
      StorageType.SESSION_STORAGE,  // Web
      StorageType.ASYNC_STORAGE,    // React Native
      StorageType.MEMORY           // Universal fallback
    ];

    storageTypesArray.forEach(type => {
      expect(typeof type).toBe('string');
    });

    const chainTypes = Object.values(ChainType);
    expect(chainTypes).toContain('evm');
    expect(chainTypes).toContain('solana');

    const storageTypeValues = Object.values(StorageType);
    expect(storageTypeValues).toContain('localStorage');
    expect(storageTypeValues).toContain('sessionStorage');
    expect(storageTypeValues).toContain('asyncStorage');
    expect(storageTypeValues).toContain('memory');
  });

  test('should maintain type safety', () => {
    // Test that the library maintains strict TypeScript typing
    const eventData: DI.AnalyticsEventData = {
      event: AnalyticsEvent.PAGE_VIEW,
      parameters: {
        page_title: 'Home',
        user_id: 'user-123',
        timestamp: Date.now(),
      },
    };

    expect(eventData.event).toBe(AnalyticsEvent.PAGE_VIEW);
    expect(eventData.parameters?.page_title).toBe('Home');
  });
});