# Storage Implementation Example

This example demonstrates how to implement cross-platform storage services using the storage interfaces.

## Storage Factory Pattern

```typescript
import { StorageType } from '@johnqh/di';

/**
 * Storage interface matching the library's storage patterns
 */
interface PlatformStorage {
  setItem(key: string, value: string): Promise<void> | void;
  getItem(key: string): Promise<string | null> | string | null;
  removeItem(key: string): Promise<void> | void;
  clear?(): Promise<void> | void;
  getAllKeys?(): Promise<string[]> | string[];
}

/**
 * Web localStorage implementation
 * 
 * @ai-implementation Web browser localStorage adapter
 * @ai-platform Web browsers with localStorage support
 */
class WebLocalStorage implements PlatformStorage {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  getAllKeys(): string[] {
    return Object.keys(localStorage);
  }
}

/**
 * Web sessionStorage implementation
 * 
 * @ai-implementation Web browser sessionStorage adapter
 * @ai-platform Web browsers with sessionStorage support
 */
class WebSessionStorage implements PlatformStorage {
  setItem(key: string, value: string): void {
    sessionStorage.setItem(key, value);
  }

  getItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }

  getAllKeys(): string[] {
    return Object.keys(sessionStorage);
  }
}

/**
 * React Native AsyncStorage implementation
 * 
 * @ai-implementation React Native AsyncStorage adapter
 * @ai-platform React Native with @react-native-async-storage/async-storage
 */
class ReactNativeAsyncStorage implements PlatformStorage {
  private AsyncStorage: any;

  constructor() {
    // Dynamic import for React Native
    try {
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch (error) {
      throw new Error('AsyncStorage not available. Install @react-native-async-storage/async-storage');
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.AsyncStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await this.AsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await this.AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await this.AsyncStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return await this.AsyncStorage.getAllKeys();
  }
}

/**
 * In-memory storage implementation for testing
 * 
 * @ai-implementation Memory storage for testing and fallback
 * @ai-platform Universal (works everywhere)
 */
class MemoryStorage implements PlatformStorage {
  private data = new Map<string, string>();

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }
}

/**
 * Storage factory using the StorageType enum
 * 
 * @ai-pattern Factory pattern with enum-based selection
 * @ai-cross-platform Creates appropriate storage for current platform
 */
class StorageFactory {
  static createStorage(type: StorageType): PlatformStorage {
    switch (type) {
      case StorageType.LOCAL_STORAGE:
        if (typeof window !== 'undefined' && window.localStorage) {
          return new WebLocalStorage();
        }
        throw new Error('localStorage not available');

      case StorageType.SESSION_STORAGE:
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return new WebSessionStorage();
        }
        throw new Error('sessionStorage not available');

      case StorageType.ASYNC_STORAGE:
        return new ReactNativeAsyncStorage();

      case StorageType.MEMORY:
        return new MemoryStorage();

      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }

  /**
   * Auto-detect and create appropriate storage for current platform
   */
  static createPlatformStorage(): PlatformStorage {
    // React Native detection
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return this.createStorage(StorageType.ASYNC_STORAGE);
    }

    // Web detection
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        return this.createStorage(StorageType.LOCAL_STORAGE);
      }
      if (window.sessionStorage) {
        return this.createStorage(StorageType.SESSION_STORAGE);
      }
    }

    // Fallback to memory storage
    return this.createStorage(StorageType.MEMORY);
  }
}
```

## Enhanced Storage Service with JSON Support

```typescript
/**
 * Enhanced storage service with JSON serialization and error handling
 * 
 * @ai-implementation Enhanced storage with type safety and serialization
 * @ai-pattern Adapter pattern with JSON support
 */
class JsonStorageService {
  constructor(private storage: PlatformStorage) {}

  /**
   * Store any serializable object
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.storage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`Failed to store object at key "${key}": ${error}`);
    }
  }

  /**
   * Retrieve and deserialize object
   */
  async getObject<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const serialized = await this.storage.getItem(key);
      if (serialized === null) {
        return defaultValue || null;
      }
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error(`Failed to retrieve object at key "${key}":`, error);
      return defaultValue || null;
    }
  }

  /**
   * Store string value
   */
  async setString(key: string, value: string): Promise<void> {
    await this.storage.setItem(key, value);
  }

  /**
   * Retrieve string value
   */
  async getString(key: string, defaultValue?: string): Promise<string | null> {
    const value = await this.storage.getItem(key);
    return value || defaultValue || null;
  }

  /**
   * Remove item
   */
  async removeItem(key: string): Promise<void> {
    await this.storage.removeItem(key);
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    if (this.storage.clear) {
      await this.storage.clear();
    }
  }

  /**
   * Get all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    if (this.storage.getAllKeys) {
      return await this.storage.getAllKeys();
    }
    return [];
  }

  /**
   * Check if key exists
   */
  async hasItem(key: string): Promise<boolean> {
    const value = await this.storage.getItem(key);
    return value !== null;
  }

  /**
   * Get storage size (approximate)
   */
  async getSize(): Promise<number> {
    const keys = await this.getAllKeys();
    let totalSize = 0;
    
    for (const key of keys) {
      const value = await this.storage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    }
    
    return totalSize;
  }
}
```

## Usage Examples

### Basic Usage

```typescript
import { StorageType } from '@johnqh/di';

// Create storage based on platform
const storage = StorageFactory.createPlatformStorage();

// Or create specific storage type
const webStorage = StorageFactory.createStorage(StorageType.LOCAL_STORAGE);
const mobileStorage = StorageFactory.createStorage(StorageType.ASYNC_STORAGE);

// Use storage (handles both sync and async automatically)
await storage.setItem('user_id', '12345');
const userId = await storage.getItem('user_id');
```

### JSON Storage Service

```typescript
// Create JSON storage service
const jsonStorage = new JsonStorageService(StorageFactory.createPlatformStorage());

// Store complex objects
interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

const preferences: UserPreferences = {
  theme: 'dark',
  language: 'en',
  notifications: true
};

await jsonStorage.setObject('user_preferences', preferences);

// Retrieve objects with type safety
const savedPreferences = await jsonStorage.getObject<UserPreferences>('user_preferences');
if (savedPreferences) {
  console.log(`Theme: ${savedPreferences.theme}`);
}
```

### React Hook for Storage

```typescript
import { useState, useEffect } from 'react';
import { StorageType } from '@johnqh/di';

/**
 * React hook for persistent storage
 */
function useStorage<T>(key: string, defaultValue: T, storageType: StorageType = StorageType.LOCAL_STORAGE) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  const storage = useMemo(() => {
    const platformStorage = StorageFactory.createStorage(storageType);
    return new JsonStorageService(platformStorage);
  }, [storageType]);

  useEffect(() => {
    const loadValue = async () => {
      try {
        const stored = await storage.getObject<T>(key);
        if (stored !== null) {
          setValue(stored);
        }
      } catch (error) {
        console.error(`Failed to load stored value for key "${key}":`, error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key, storage]);

  const setStoredValue = async (newValue: T) => {
    try {
      setValue(newValue);
      await storage.setObject(key, newValue);
    } catch (error) {
      console.error(`Failed to store value for key "${key}":`, error);
    }
  };

  const removeStoredValue = async () => {
    try {
      setValue(defaultValue);
      await storage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove stored value for key "${key}":`, error);
    }
  };

  return {
    value,
    setValue: setStoredValue,
    removeValue: removeStoredValue,
    loading
  };
}

// Usage in React components
function UserPreferencesComponent() {
  const {
    value: preferences,
    setValue: setPreferences,
    loading
  } = useStorage('user_preferences', {
    theme: 'light' as const,
    language: 'en',
    notifications: true
  });

  if (loading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div>
      <button onClick={() => setPreferences({
        ...preferences,
        theme: preferences.theme === 'light' ? 'dark' : 'light'
      })}>
        Toggle Theme ({preferences.theme})
      </button>
    </div>
  );
}
```

### Storage Migration Pattern

```typescript
/**
 * Storage migration service for handling data format changes
 */
class StorageMigrationService {
  constructor(private storage: JsonStorageService) {}

  async migrate(migrations: Array<{ version: number; migrate: (data: any) => any }>) {
    const currentVersion = await this.storage.getObject<number>('storage_version') || 0;
    
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        console.log(`Running storage migration to version ${migration.version}`);
        
        // Get all data
        const keys = await this.storage.getAllKeys();
        const data: Record<string, any> = {};
        
        for (const key of keys) {
          if (key !== 'storage_version') {
            data[key] = await this.storage.getObject(key);
          }
        }
        
        // Run migration
        const migratedData = migration.migrate(data);
        
        // Clear and restore migrated data
        await this.storage.clear();
        for (const [key, value] of Object.entries(migratedData)) {
          await this.storage.setObject(key, value);
        }
        
        // Update version
        await this.storage.setObject('storage_version', migration.version);
      }
    }
  }
}

// Usage
const migrationService = new StorageMigrationService(jsonStorage);

await migrationService.migrate([
  {
    version: 1,
    migrate: (data) => {
      // Convert old user format to new format
      if (data.user) {
        data.user = {
          ...data.user,
          createdAt: Date.now() // Add missing field
        };
      }
      return data;
    }
  },
  {
    version: 2,
    migrate: (data) => {
      // Rename preferences key
      if (data.user_prefs) {
        data.user_preferences = data.user_prefs;
        delete data.user_prefs;
      }
      return data;
    }
  }
]);
```

This example demonstrates how to create a robust, cross-platform storage system using the library's storage type enums and patterns. The factory pattern allows for easy platform detection and appropriate storage selection.