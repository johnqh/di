/**
 * Tests for environment interfaces and type validation
 */

import {
  EnvProvider,
  EnvFactory,
  EnvUtils,
  AppConfig,
  FirebaseConfig,
  EnvironmentVariables,
} from '../../src/env';

// Mock implementations for testing interface compliance
class MockEnvProvider implements EnvProvider {
  private envVars: EnvironmentVariables;

  constructor(envVars: EnvironmentVariables = {}) {
    this.envVars = envVars;
  }

  get<K extends keyof EnvironmentVariables>(
    key: K,
    defaultValue?: string
  ): EnvironmentVariables[K] | string | undefined {
    return this.envVars[key] ?? defaultValue;
  }

  isDevelopment(): boolean {
    return this.envVars.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.envVars.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.envVars.NODE_ENV === 'test';
  }

  getAll(): EnvironmentVariables {
    return { ...this.envVars };
  }
}

class MockEnvFactory implements EnvFactory {
  createEnvProvider(): EnvProvider {
    return new MockEnvProvider({
      NODE_ENV: 'test',
      API_KEY: 'test-api-key',
      DATABASE_URL: 'test-db-url',
    });
  }

  createAppConfig(envProvider: EnvProvider): AppConfig {
    const firebaseConfig: FirebaseConfig = {
      apiKey: envProvider.get('FIREBASE_API_KEY', 'default-api-key')!,
      authDomain: envProvider.get('FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')!,
      projectId: envProvider.get('FIREBASE_PROJECT_ID', 'test-project')!,
      storageBucket: envProvider.get('FIREBASE_STORAGE_BUCKET', 'test-project.appspot.com')!,
      messagingSenderId: envProvider.get('FIREBASE_MESSAGING_SENDER_ID', '123456789')!,
      appId: envProvider.get('FIREBASE_APP_ID', '1:123456789:web:abcdef')!,
    };

    return {
      wildDuckBackendUrl: envProvider.get('WILD_DUCK_BACKEND_URL', 'https://api.example.com')!,
      indexerBackendUrl: envProvider.get('INDEXER_BACKEND_URL', 'https://indexer.example.com')!,
      wildDuckApiToken: envProvider.get('WILD_DUCK_API_TOKEN', 'default-token')!,
      revenueCatApiKey: envProvider.get('REVENUE_CAT_API_KEY', 'default-rc-key')!,
      walletConnectProjectId: envProvider.get('WALLET_CONNECT_PROJECT_ID', 'default-wc-id')!,
      privyAppId: envProvider.get('PRIVY_APP_ID', 'default-privy-id')!,
      firebase: firebaseConfig,
      useCloudflareWorker: envProvider.get('USE_CLOUDFLARE_WORKER') === 'true',
      cloudflareWorkerUrl: envProvider.get('CLOUDFLARE_WORKER_URL', 'https://worker.example.com')!,
      useMockFallback: envProvider.get('USE_MOCK_FALLBACK') === 'true',
    };
  }

  detectPlatform(): 'web' | 'react-native' | 'node' {
    if (typeof window !== 'undefined') return 'web';
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') return 'react-native';
    return 'node';
  }
}

class MockEnvUtils implements EnvUtils {
  private envVars: Record<string, string>;

  constructor(envVars: Record<string, string> = {}) {
    this.envVars = envVars;
  }

  isDevelopment(): boolean {
    return this.envVars.NODE_ENV === 'development';
  }

  isProduction(): boolean {
    return this.envVars.NODE_ENV === 'production';
  }

  isTest(): boolean {
    return this.envVars.NODE_ENV === 'test';
  }

  get(key: string, defaultValue?: string): string | undefined {
    return this.envVars[key] ?? defaultValue;
  }
}

describe('EnvProvider Interface', () => {
  let provider: MockEnvProvider;

  beforeEach(() => {
    provider = new MockEnvProvider({
      NODE_ENV: 'development',
      API_KEY: 'test-api-key',
      DATABASE_URL: 'postgres://localhost:5432/test',
      CUSTOM_VAR: 'custom-value',
    });
  });

  test('should get environment variables', () => {
    expect(provider.get('NODE_ENV')).toBe('development');
    expect(provider.get('API_KEY')).toBe('test-api-key');
    expect(provider.get('DATABASE_URL')).toBe('postgres://localhost:5432/test');
  });

  test('should return default value for missing variables', () => {
    expect(provider.get('MISSING_VAR', 'default-value')).toBe('default-value');
  });

  test('should return undefined for missing variables without default', () => {
    expect(provider.get('MISSING_VAR')).toBeUndefined();
  });

  test('should check development environment', () => {
    expect(provider.isDevelopment()).toBe(true);
    expect(provider.isProduction()).toBe(false);
    expect(provider.isTest()).toBe(false);
  });

  test('should check production environment', () => {
    const prodProvider = new MockEnvProvider({ NODE_ENV: 'production' });
    expect(prodProvider.isDevelopment()).toBe(false);
    expect(prodProvider.isProduction()).toBe(true);
    expect(prodProvider.isTest()).toBe(false);
  });

  test('should check test environment', () => {
    const testProvider = new MockEnvProvider({ NODE_ENV: 'test' });
    expect(testProvider.isDevelopment()).toBe(false);
    expect(testProvider.isProduction()).toBe(false);
    expect(testProvider.isTest()).toBe(true);
  });

  test('should return all environment variables', () => {
    const allVars = provider.getAll();
    expect(allVars).toEqual({
      NODE_ENV: 'development',
      API_KEY: 'test-api-key',
      DATABASE_URL: 'postgres://localhost:5432/test',
      CUSTOM_VAR: 'custom-value',
    });
  });
});

describe('EnvFactory Interface', () => {
  let factory: MockEnvFactory;

  beforeEach(() => {
    factory = new MockEnvFactory();
  });

  test('should create environment provider', () => {
    const provider = factory.createEnvProvider();
    expect(provider).toBeInstanceOf(MockEnvProvider);
    expect(provider.isTest()).toBe(true);
    expect(provider.get('API_KEY')).toBe('test-api-key');
  });

  test('should create app config from environment provider', () => {
    const provider = factory.createEnvProvider();
    const config = factory.createAppConfig(provider);

    expect(config.wildDuckBackendUrl).toBe('https://api.example.com');
    expect(config.indexerBackendUrl).toBe('https://indexer.example.com');
    expect(config.firebase.projectId).toBe('test-project');
    expect(config.useCloudflareWorker).toBe(false);
    expect(config.useMockFallback).toBe(false);
  });

  test('should create app config with custom environment variables', () => {
    const customProvider = new MockEnvProvider({
      WILD_DUCK_BACKEND_URL: 'https://custom-api.example.com',
      USE_CLOUDFLARE_WORKER: 'true',
      USE_MOCK_FALLBACK: 'true',
      FIREBASE_PROJECT_ID: 'custom-project',
    });

    const config = factory.createAppConfig(customProvider);

    expect(config.wildDuckBackendUrl).toBe('https://custom-api.example.com');
    expect(config.useCloudflareWorker).toBe(true);
    expect(config.useMockFallback).toBe(true);
    expect(config.firebase.projectId).toBe('custom-project');
  });

  test('should detect platform', () => {
    const platform = factory.detectPlatform();
    // In Node.js test environment, it should detect 'node'
    expect(platform).toBe('node');
  });
});

describe('EnvUtils Interface', () => {
  test('should check environment states', () => {
    const devUtils = new MockEnvUtils({ NODE_ENV: 'development' });
    expect(devUtils.isDevelopment()).toBe(true);
    expect(devUtils.isProduction()).toBe(false);
    expect(devUtils.isTest()).toBe(false);

    const prodUtils = new MockEnvUtils({ NODE_ENV: 'production' });
    expect(prodUtils.isDevelopment()).toBe(false);
    expect(prodUtils.isProduction()).toBe(true);
    expect(prodUtils.isTest()).toBe(false);

    const testUtils = new MockEnvUtils({ NODE_ENV: 'test' });
    expect(testUtils.isDevelopment()).toBe(false);
    expect(testUtils.isProduction()).toBe(false);
    expect(testUtils.isTest()).toBe(true);
  });

  test('should get environment variables with fallback', () => {
    const utils = new MockEnvUtils({
      API_KEY: 'test-key',
      DATABASE_URL: 'test-db',
    });

    expect(utils.get('API_KEY')).toBe('test-key');
    expect(utils.get('MISSING_VAR', 'fallback')).toBe('fallback');
    expect(utils.get('MISSING_VAR')).toBeUndefined();
  });
});

describe('Environment Integration Tests', () => {
  test('should work together in a complete environment setup', () => {
    const factory = new MockEnvFactory();
    const provider = factory.createEnvProvider();
    const config = factory.createAppConfig(provider);
    const platform = factory.detectPlatform();

    // Verify the complete setup
    expect(provider.isTest()).toBe(true);
    expect(config.firebase).toBeDefined();
    expect(config.firebase.projectId).toBe('test-project');
    expect(platform).toBe('node');

    // Verify all required config properties are present
    expect(config.wildDuckBackendUrl).toBeDefined();
    expect(config.indexerBackendUrl).toBeDefined();
    expect(config.wildDuckApiToken).toBeDefined();
    expect(config.revenueCatApiKey).toBeDefined();
    expect(config.walletConnectProjectId).toBeDefined();
    expect(config.privyAppId).toBeDefined();
    expect(config.cloudflareWorkerUrl).toBeDefined();
    expect(typeof config.useCloudflareWorker).toBe('boolean');
    expect(typeof config.useMockFallback).toBe('boolean');
  });
});