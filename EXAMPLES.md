# Code Examples and Templates

This document provides code examples and templates for AI assistants and developers working with @johnqh/di.

## Interface Design Examples

### 1. Basic Provider Pattern
```typescript
// ✅ GOOD: Generic, reusable interface
export interface DataProvider<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Example usage in implementation:
// class LocalStorageProvider implements DataProvider<string> { ... }
// class SecureStorageProvider implements DataProvider<SensitiveData> { ... }
```

### 2. Event-Driven Interface
```typescript
// Define event types as enum
export enum AnalyticsEvent {
  PageView = 'page_view',
  ButtonClick = 'button_click',
  FormSubmit = 'form_submit',
  Error = 'error',
}

// Generic event payload
export interface EventPayload {
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

// Analytics interface
export interface AnalyticsProvider {
  track(event: AnalyticsEvent, payload: EventPayload): Promise<void>;
  identify(userId: string, traits?: Record<string, unknown>): void;
  reset(): void;
}
```

### 3. Network Client Interface
```typescript
// Request configuration
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  signal?: AbortSignal;
}

// Generic response
export interface NetworkResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Network client
export interface NetworkClient {
  request<T>(url: string, config?: RequestConfig): Promise<NetworkResponse<T>>;
  get<T>(url: string, config?: Omit<RequestConfig, 'method'>): Promise<T>;
  post<T>(url: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T>;
}
```

### 4. Authentication Interface
```typescript
// Auth provider types
export enum AuthProviderType {
  Email = 'email',
  Google = 'google',
  Apple = 'apple',
  Wallet = 'wallet',
}

// User session
export interface UserSession {
  userId: string;
  email?: string;
  provider: AuthProviderType;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

// Auth interface
export interface AuthProvider {
  signIn(provider: AuthProviderType, credentials?: unknown): Promise<UserSession>;
  signOut(): Promise<void>;
  refreshSession(): Promise<UserSession>;
  getCurrentSession(): UserSession | null;
  onAuthStateChange(callback: (session: UserSession | null) => void): () => void;
}
```

### 5. Storage with Encryption
```typescript
// Encryption strategy
export interface EncryptionStrategy {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
}

// Secure storage
export interface SecureStorage<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, encryption?: EncryptionStrategy): Promise<void>;
  remove(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}
```

### 6. Navigation Interface
```typescript
// Route parameters
export interface RouteParams {
  [key: string]: string | number | boolean | undefined;
}

// Navigation state
export interface NavigationState {
  routeName: string;
  params?: RouteParams;
  key: string;
}

// Navigator
export interface Navigator {
  navigate(routeName: string, params?: RouteParams): void;
  goBack(): void;
  replace(routeName: string, params?: RouteParams): void;
  reset(state: NavigationState[]): void;
  getCurrentRoute(): NavigationState;
}
```

### 7. Notification Interface
```typescript
// Notification types
export enum NotificationType {
  Info = 'info',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

// Notification payload
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: unknown;
  timestamp: number;
}

// Notification provider
export interface NotificationProvider {
  requestPermission(): Promise<boolean>;
  show(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<string>;
  schedule(notification: Omit<Notification, 'id'>, date: Date): Promise<string>;
  cancel(notificationId: string): Promise<void>;
  onNotificationReceived(callback: (notification: Notification) => void): () => void;
}
```

## Test Implementation Examples

### Mock Implementation for Testing
```typescript
// Mock implementation of DataProvider
class MockDataProvider<T> implements DataProvider<T> {
  private store: Map<string, T> = new Map();

  async get(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  async set(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// Test example
describe('DataProvider', () => {
  let provider: DataProvider<string>;

  beforeEach(() => {
    provider = new MockDataProvider<string>();
  });

  it('should store and retrieve data', async () => {
    await provider.set('key', 'value');
    const result = await provider.get('key');
    expect(result).toBe('value');
  });

  it('should return undefined for non-existent keys', async () => {
    const result = await provider.get('nonexistent');
    expect(result).toBeUndefined();
  });
});
```

## Common Patterns

### 1. Factory Pattern Interface
```typescript
export interface Factory<T, C = unknown> {
  create(config?: C): T;
  createAsync(config?: C): Promise<T>;
}
```

### 2. Observer Pattern Interface
```typescript
export interface Observer<T> {
  subscribe(callback: (value: T) => void): () => void;
  notify(value: T): void;
}
```

### 3. Repository Pattern Interface
```typescript
export interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}
```

### 4. Middleware Pattern Interface
```typescript
export interface Middleware<T, R> {
  process(input: T, next: (input: T) => Promise<R>): Promise<R>;
}
```

### 5. Adapter Pattern Interface
```typescript
export interface Adapter<S, T> {
  adapt(source: S): T;
  adaptMany(sources: S[]): T[];
}
```

## AI Assistant Templates

### Template: Add New Domain Interface
```typescript
// File: src/[domain]/[domain].interface.ts

/**
 * [Domain] provider interface for [description]
 * @ai-context: [Brief context for AI assistants]
 * @ai-pattern: [Pattern name, e.g., Provider, Repository, Factory]
 * @ai-platform: Cross-platform compatible
 */
export interface [Domain]Provider {
  // Core methods
}

// Supporting types
export enum [Domain]Type {
  // Enum values
}

export interface [Domain]Config {
  // Configuration options
}

// File: tests/[domain]/[domain].test.ts

import { [Domain]Provider } from '../../src/[domain]/[domain].interface';

class Mock[Domain]Provider implements [Domain]Provider {
  // Mock implementation
}

describe('[Domain]Provider', () => {
  let provider: [Domain]Provider;

  beforeEach(() => {
    provider = new Mock[Domain]Provider();
  });

  it('should [test description]', () => {
    // Test implementation
  });
});
```

### Template: Extend Existing Interface
```typescript
// When extending an existing interface
export interface Enhanced[Original]<T> extends [Original] {
  // Additional methods
}

// With additional generic constraints
export interface Cacheable[Original]<T, K extends string = string> extends [Original]<T> {
  cache: Map<K, T>;
  invalidate(key: K): void;
}
```

## Guidelines for AI Assistants

1. **Always use these patterns** as starting points
2. **Modify templates** to fit specific requirements
3. **Maintain consistency** with existing code
4. **Add appropriate JSDoc** comments
5. **Include test examples** for new interfaces
6. **Use generics** for maximum flexibility
7. **Avoid concrete implementations** in src/
8. **Follow naming conventions** consistently

## Quick Copy Templates

### Basic Interface
```typescript
export interface Provider {
  method(): void;
}
```

### Generic Interface
```typescript
export interface Provider<T> {
  method(param: T): Promise<T>;
}
```

### Interface with Optional Methods
```typescript
export interface Provider {
  required(): void;
  optional?(): void;
}
```

### Interface Extending Another
```typescript
export interface Extended extends Base {
  additional(): void;
}
```

### Enum Declaration
```typescript
export enum Type {
  One = 'one',
  Two = 'two',
}
```