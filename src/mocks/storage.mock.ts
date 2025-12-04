/**
 * Mock implementations for storage interfaces.
 *
 * @ai-context Test mocks for PlatformStorage, AdvancedPlatformStorage, StorageProvider, StorageService, SerializedStorageService, StorageFactory
 * @ai-usage Use in unit tests to mock storage operations
 */

import { StorageType, type Optional } from '@sudobility/types';
import type {
  PlatformStorage,
  AdvancedPlatformStorage,
  StorageProvider,
  StorageService,
  SerializedStorageService,
  StorageFactory,
} from '../storage/storage.js';

/**
 * Mock implementation of PlatformStorage for testing.
 *
 * @example
 * ```typescript
 * const storage = new MockPlatformStorage();
 * storage.setItem('key', 'value');
 * expect(storage.getItem('key')).toBe('value');
 * ```
 */
export class MockPlatformStorage implements PlatformStorage {
  private store: Map<string, string> = new Map();

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  getItem(key: string): Optional<string> {
    return this.store.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  // Test helper methods

  /**
   * Get the internal store size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    return this.store.has(key);
  }

  /**
   * Reset the store
   */
  reset(): void {
    this.store.clear();
  }
}

/**
 * Storage entry with TTL metadata.
 */
interface StorageEntry {
  value: string;
  ttl?: number | undefined;
  createdAt: number;
}

/**
 * Mock implementation of AdvancedPlatformStorage for testing.
 *
 * @example
 * ```typescript
 * const storage = new MockAdvancedPlatformStorage();
 * storage.setItem('key', 'value', 1000); // 1 second TTL
 * expect(storage.hasItem('key')).toBe(true);
 * ```
 */
export class MockAdvancedPlatformStorage implements AdvancedPlatformStorage {
  private store: Map<string, StorageEntry> = new Map();

  setItem(key: string, value: string, ttl?: Optional<number>): void {
    this.store.set(key, {
      value,
      ttl: ttl ?? undefined,
      createdAt: Date.now(),
    });
  }

  getItem(key: string): Optional<string> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (entry.ttl && Date.now() - entry.createdAt > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getAllKeys(): string[] {
    // Filter out expired keys
    const now = Date.now();
    const validKeys: string[] = [];
    for (const [key, entry] of this.store.entries()) {
      if (!entry.ttl || now - entry.createdAt <= entry.ttl) {
        validKeys.push(key);
      }
    }
    return validKeys;
  }

  hasItem(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;

    // Check TTL expiration
    if (entry.ttl && Date.now() - entry.createdAt > entry.ttl) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  clearPattern(pattern?: Optional<string>): void {
    if (!pattern) {
      this.store.clear();
      return;
    }

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  // Test helper methods

  /**
   * Get the internal store size (including expired)
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Force expire an item for testing
   */
  expireItem(key: string): void {
    const entry = this.store.get(key);
    if (entry) {
      entry.createdAt = 0;
      entry.ttl = 1;
    }
  }

  /**
   * Reset the store
   */
  reset(): void {
    this.store.clear();
  }
}

/**
 * Mock implementation of StorageProvider for testing.
 *
 * @example
 * ```typescript
 * const provider = new MockStorageProvider();
 * provider.set('key', 'value');
 * expect(provider.get('key')).toBe('value');
 * ```
 */
export class MockStorageProvider implements StorageProvider {
  storage: PlatformStorage | AdvancedPlatformStorage;

  constructor(storage?: PlatformStorage | AdvancedPlatformStorage) {
    this.storage = storage ?? new MockPlatformStorage();
  }

  get(key: string): Optional<string> {
    return this.storage.getItem(key) as Optional<string>;
  }

  set(key: string, value: string, ttl?: Optional<number>): void {
    if ('hasItem' in this.storage && ttl !== undefined) {
      (this.storage as AdvancedPlatformStorage).setItem(key, value, ttl);
    } else {
      this.storage.setItem(key, value);
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    if (this.storage.clear) {
      this.storage.clear();
    }
  }

  // Test helper methods

  /**
   * Reset the provider
   */
  reset(): void {
    this.clear();
  }
}

/**
 * Mock implementation of StorageService for testing.
 *
 * @example
 * ```typescript
 * const service = new MockStorageService();
 * service.setItem('key', 'value');
 * expect(service.getItem('key')).toBe('value');
 * expect(service.isAvailable()).toBe(true);
 * ```
 */
export class MockStorageService implements StorageService {
  private store: Map<string, string> = new Map();
  private available: boolean = true;
  private storageType: StorageType = StorageType.MEMORY;

  getItem(key: string): Optional<string> {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  isAvailable(): boolean {
    return this.available;
  }

  getType(): StorageType {
    return this.storageType;
  }

  // Test helper methods

  /**
   * Set availability for testing
   */
  setAvailable(available: boolean): void {
    this.available = available;
  }

  /**
   * Set storage type for testing
   */
  setStorageType(type: StorageType): void {
    this.storageType = type;
  }

  /**
   * Get store size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.store.clear();
    this.available = true;
    this.storageType = StorageType.MEMORY;
  }
}

/**
 * Mock implementation of SerializedStorageService for testing.
 *
 * @example
 * ```typescript
 * const service = new MockSerializedStorageService();
 * service.setObject('user', { name: 'John', age: 30 });
 * expect(service.getObject<User>('user')).toEqual({ name: 'John', age: 30 });
 * ```
 */
export class MockSerializedStorageService implements SerializedStorageService {
  private store: Map<string, unknown> = new Map();

  getObject<T>(key: string): Optional<T> {
    const value = this.store.get(key);
    return value !== undefined ? (value as T) : null;
  }

  setObject<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  removeObject(key: string): void {
    this.store.delete(key);
  }

  hasObject(key: string): boolean {
    return this.store.has(key);
  }

  // Test helper methods

  /**
   * Get all stored objects
   */
  getAllObjects(): Map<string, unknown> {
    return new Map(this.store);
  }

  /**
   * Get store size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.store.clear();
  }
}

/**
 * Mock implementation of StorageFactory for testing.
 *
 * @example
 * ```typescript
 * const factory = new MockStorageFactory();
 * const storage = factory.createStorage(StorageType.MEMORY);
 * expect(storage.isAvailable()).toBe(true);
 * ```
 */
export class MockStorageFactory implements StorageFactory {
  private defaultStorageType: StorageType = StorageType.MEMORY;
  private storageInstances: Map<StorageType, StorageService> = new Map();
  private serializedInstances: Map<StorageType, SerializedStorageService> =
    new Map();

  createStorage(type: StorageType): StorageService {
    const existing = this.storageInstances.get(type);
    if (existing) return existing;

    const service = new MockStorageService();
    service.setStorageType(type);
    this.storageInstances.set(type, service);
    return service;
  }

  createSerializedStorage(type: StorageType): SerializedStorageService {
    const existing = this.serializedInstances.get(type);
    if (existing) return existing;

    const service = new MockSerializedStorageService();
    this.serializedInstances.set(type, service);
    return service;
  }

  getDefaultStorageType(): StorageType {
    return this.defaultStorageType;
  }

  // Test helper methods

  /**
   * Set default storage type for testing
   */
  setDefaultStorageType(type: StorageType): void {
    this.defaultStorageType = type;
  }

  /**
   * Get all created storage instances
   */
  getStorageInstances(): Map<StorageType, StorageService> {
    return new Map(this.storageInstances);
  }

  /**
   * Get all created serialized storage instances
   */
  getSerializedInstances(): Map<StorageType, SerializedStorageService> {
    return new Map(this.serializedInstances);
  }

  /**
   * Reset the factory
   */
  reset(): void {
    this.storageInstances.clear();
    this.serializedInstances.clear();
    this.defaultStorageType = StorageType.MEMORY;
  }
}
