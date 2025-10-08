/**
 * Standard service keys for dependency injection container.
 *
 * @ai-context Service key constants for type-safe service resolution
 * @ai-pattern Constant object for service registry keys
 * @ai-usage Use these keys when registering and resolving services from DI container
 *
 * @example
 * ```typescript
 * container.register(ServiceKeys.STORAGE, () => new WebStorageService());
 * const storage = container.get<PlatformStorage>(ServiceKeys.STORAGE);
 * ```
 */
export const ServiceKeys = {
  // Platform services
  STORAGE: 'storage',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications',
  THEME: 'theme',
  NETWORK: 'network',
  PERSISTENCE: 'persistence',
  FOLDER_OPERATIONS: 'folderOperations',
} as const;

/**
 * Type for service keys
 */
export type ServiceKey = (typeof ServiceKeys)[keyof typeof ServiceKeys];
