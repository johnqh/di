/**
 * Platform-agnostic storage interfaces for cross-platform data persistence.
 *
 * @ai-context Storage service interfaces for dependency injection with multiple abstraction levels
 * @ai-pattern Service provider with basic/advanced tiers, factory pattern, and generic data handling
 * @ai-platform Universal (Web localStorage/sessionStorage, React Native AsyncStorage, Node.js file system)
 * @ai-usage Implement for localStorage, AsyncStorage, SQLite, or custom storage solutions
 * @ai-security Handle sensitive data with encryption options and secure key management
 *
 * @example
 * ```typescript
 * // Web implementation using localStorage
 * class WebStorageService implements StorageService {
 *   setItem(key: string, value: string): void {
 *     localStorage.setItem(key, value);
 *   }
 *   getItem(key: string): Optional<string> {
 *     return localStorage.getItem(key);
 *   }
 * }
 *
 * // React Native implementation using AsyncStorage
 * class RNStorageService implements StorageService {
 *   async setItem(key: string, value: string): Promise<void> {
 *     await AsyncStorage.setItem(key, value);
 *   }
 *   async getItem(key: string): Promise<Optional<string>> {
 *     return await AsyncStorage.getItem(key);
 *   }
 * }
 * ```
 */

import { StorageType, Optional } from '../types';

/**
 * Basic platform storage interface for low-level storage operations.
 *
 * @ai-context Low-level storage interface matching native platform APIs
 * @ai-pattern Interface matching localStorage/AsyncStorage APIs with union return types
 * @ai-platform Web (localStorage, sessionStorage), React Native (AsyncStorage), Node.js (file system)
 * @ai-usage Direct platform API wrapper - implement for specific storage backends
 *
 * @example
 * ```typescript
 * class LocalStoragePlatform implements PlatformStorage {
 *   setItem(key: string, value: string): void {
 *     localStorage.setItem(key, value);
 *   }
 * }
 * ```
 */
interface PlatformStorage {
  /**
   * Store a value with a key
   * @param key Storage key
   * @param value Value to store
   */
  setItem(key: string, value: string): Promise<void> | void;

  /**
   * Retrieve a value by key
   * @param key Storage key
   * @returns The stored value or null if not found
   */
  getItem(key: string): Promise<Optional<string>> | Optional<string>;

  /**
   * Remove a value by key
   * @param key Storage key
   */
  removeItem(key: string): Promise<void> | void;

  /**
   * Clear all storage (optional)
   */
  clear?: Optional<() => Promise<void> | void>;

  /**
   * Get all keys (optional)
   */
  getAllKeys?: Optional<() => Promise<string[]> | string[]>;
}

/**
 * Advanced storage interface with TTL, pattern matching, and enhanced features.
 *
 * @ai-context Enhanced storage interface with advanced features like TTL and pattern operations
 * @ai-pattern Extension interface adding time-to-live and pattern-based operations
 * @ai-usage Implement for storage solutions requiring cache-like behavior or advanced features
 *
 * @example
 * ```typescript
 * class RedisAdvancedStorage implements AdvancedPlatformStorage {
 *   setItem(key: string, value: string, ttl?: Optional<number>): Promise<void> {
 *     if (ttl) {
 *       return this.client.setex(key, ttl / 1000, value);
 *     }
 *     return this.client.set(key, value);
 *   }
 * }
 * ```
 */
interface AdvancedPlatformStorage extends PlatformStorage {
  /**
   * Store a value with optional TTL
   * @param key Storage key
   * @param value Value to store
   * @param ttl Time to live in milliseconds (optional)
   */
  setItem(
    key: string,
    value: string,
    ttl?: Optional<number>
  ): Promise<void> | void;

  /**
   * Check if a key exists
   * @param key Storage key
   */
  hasItem(key: string): Promise<boolean> | boolean;

  /**
   * Clear items matching a pattern
   * @param pattern Pattern to match (optional)
   */
  clearPattern(pattern?: Optional<string>): Promise<void> | void;
}

/**
 * Storage provider wrapper for platform storage with enhanced API.
 *
 * @ai-context Provider wrapper interface for platform storage with simplified method names
 * @ai-pattern Facade pattern providing simplified API over platform storage
 * @ai-usage Use as a wrapper layer over platform-specific storage implementations
 */
interface StorageProvider {
  /** Underlying platform storage implementation */
  storage: PlatformStorage | AdvancedPlatformStorage;
  /** Get value by key with simplified method name */
  get(key: string): Promise<Optional<string>> | Optional<string>;
  /** Set value by key with simplified method name and optional TTL */
  set(key: string, value: string, ttl?: Optional<number>): Promise<void> | void;
  /** Remove value by key with simplified method name */
  remove(key: string): Promise<void> | void;
  /** Clear all storage with simplified method name */
  clear(): Promise<void> | void;
}

/**
 * Enhanced storage service interface with platform detection and availability checking.
 *
 * @ai-context High-level storage service interface for dependency injection
 * @ai-pattern Service interface with availability detection and type identification
 * @ai-platform Provides platform-agnostic storage operations with capability detection
 * @ai-usage Primary interface for application-level storage operations
 *
 * @example
 * ```typescript
 * class AppStorageService implements StorageService {
 *   getType(): StorageType {
 *     return StorageType.LOCAL_STORAGE;
 *   }
 *   isAvailable(): boolean {
 *     return typeof Storage !== 'undefined';
 *   }
 * }
 * ```
 */
interface StorageService {
  /**
   * Get item from storage
   * @param key Storage key
   * @returns Promise or direct value depending on platform
   */
  getItem(key: string): Promise<Optional<string>> | Optional<string>;

  /**
   * Set item in storage
   * @param key Storage key
   * @param value Value to store
   */
  setItem(key: string, value: string): Promise<void> | void;

  /**
   * Remove item from storage
   * @param key Storage key
   */
  removeItem(key: string): Promise<void> | void;

  /**
   * Clear all items from storage
   */
  clear(): Promise<void> | void;

  /**
   * Get all keys in storage
   * @returns Array of all storage keys
   */
  getAllKeys(): Promise<string[]> | string[];

  /**
   * Check if storage is available on this platform
   * @returns Whether storage is supported and accessible
   */
  isAvailable(): boolean;

  /**
   * Get storage implementation type
   * @returns The type of storage being used
   */
  getType(): StorageType;
}

/**
 * Serialized storage service for object persistence with automatic JSON serialization.
 *
 * @ai-context Object storage interface with automatic serialization/deserialization
 * @ai-pattern Generic service interface with type-safe object operations
 * @ai-usage Use for storing complex objects with automatic JSON handling
 * @ai-security Objects may contain sensitive data - consider encryption for security
 *
 * @example
 * ```typescript
 * class JSONStorageService implements SerializedStorageService {
 *   async getObject<T>(key: string): Promise<Optional<T>> {
 *     const json = await this.storage.getItem(key);
 *     return json ? JSON.parse(json) : null;
 *   }
 * }
 * ```
 */
interface SerializedStorageService {
  /**
   * Get object from storage with automatic deserialization
   * @param key Storage key
   * @returns Typed object or null if not found
   */
  getObject<T>(key: string): Promise<Optional<T>> | Optional<T>;

  /**
   * Set object in storage with automatic serialization
   * @param key Storage key
   * @param value Object to store
   */
  setObject<T>(key: string, value: T): Promise<void> | void;

  /**
   * Remove object from storage
   * @param key Storage key
   */
  removeObject(key: string): Promise<void> | void;

  /**
   * Check if object exists in storage
   * @param key Storage key
   * @returns Whether object exists
   */
  hasObject(key: string): Promise<boolean> | boolean;
}

/**
 * Factory interface for creating storage services based on platform and type.
 *
 * @ai-context Factory interface for creating platform-appropriate storage services
 * @ai-pattern Abstract factory with platform detection and service creation
 * @ai-usage Implement to create storage services based on platform capabilities
 *
 * @example
 * ```typescript
 * class UniversalStorageFactory implements StorageFactory {
 *   createStorage(type: StorageType): StorageService {
 *     switch (type) {
 *       case StorageType.LOCAL_STORAGE: return new WebStorageService();
 *       case StorageType.ASYNC_STORAGE: return new RNStorageService();
 *     }
 *   }
 * }
 * ```
 */
interface StorageFactory {
  /**
   * Create storage service for specified type
   * @param type Storage type to create
   * @returns Storage service implementation
   */
  createStorage(type: StorageType): StorageService;

  /**
   * Create serialized storage service for specified type
   * @param type Storage type to create
   * @returns Serialized storage service implementation
   */
  createSerializedStorage(type: StorageType): SerializedStorageService;

  /**
   * Get default storage type for current platform
   * @returns Most appropriate storage type for platform
   */
  getDefaultStorageType(): StorageType;
}

/**
 * Configuration options for storage service behavior.
 *
 * @ai-context Configuration interface for storage service customization
 * @ai-pattern Configuration object with optional enhancement features
 * @ai-usage Configure storage behavior for different deployment scenarios
 * @ai-security Encryption option for sensitive data protection
 */
interface StorageConfig {
  /** Key prefix for namespacing storage entries */
  prefix?: Optional<string>;
  /** Enable encryption for stored values */
  encryption?: Optional<boolean>;
  /** Enable compression for stored values */
  compression?: Optional<boolean>;
  /** Default time to live in milliseconds */
  ttl?: Optional<number>;
}

export {
  type PlatformStorage,
  type AdvancedPlatformStorage,
  type StorageProvider,
  type StorageService,
  type SerializedStorageService,
  type StorageFactory,
  type StorageConfig,
};
