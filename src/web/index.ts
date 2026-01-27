/**
 * @johnqh/di - Web Platform Implementations
 *
 * This module provides web-specific implementations of the DI interfaces
 * using browser APIs (fetch, localStorage, History API, etc.)
 *
 * NOTE: No re-exports from base package. Import interfaces from '@sudobility/di/interfaces'
 */

// ============================================================================
// UNIFIED EXPORTS (same names as React Native for cross-platform code)
// ============================================================================

// Network - unified names
export { webNetworkClient as networkClient } from './network/network.web.js';
export { WebNetworkService as PlatformNetworkService } from './network/web-network.service.js';
export {
  getNetworkService,
  initializeNetworkService,
  resetNetworkService,
} from './network/network-singleton.js';

// Storage - unified names
export {
  webStorage as storage,
  advancedWebStorage as advancedStorage,
} from './storage/storage.web.js';
export { WebStorageService as PlatformStorageService } from './storage/web-storage.service.js';
export {
  getStorageService,
  initializeStorageService,
  resetStorageService,
} from './storage/storage-singleton.js';

// NOTE: Firebase exports removed - use @sudobility/di_web for Firebase implementations

// ============================================================================
// PLATFORM-SPECIFIC EXPORTS (web-prefixed names for explicit usage)
// ============================================================================

// Web Network implementations
export { WebNetworkClient, webNetworkClient } from './network/network.web.js';
export { WebNetworkService } from './network/web-network.service.js';
export {
  getNetworkService as getWebNetworkService,
  initializeNetworkService as initializeWebNetworkService,
  resetNetworkService as resetWebNetworkService,
} from './network/network-singleton.js';

// Web Storage implementations
export {
  WebStorage,
  AdvancedWebStorage,
  webStorage,
  advancedWebStorage,
} from './storage/storage.web.js';
export {
  WebStorageService,
  WebSerializedStorageService,
} from './storage/web-storage.service.js';
export {
  getStorageService as getWebStorageService,
  initializeStorageService as initializeWebStorageService,
  resetStorageService as resetWebStorageService,
} from './storage/storage-singleton.js';

// Web Navigation implementations
export {
  WebUINavigationService,
  createWebUINavigationService,
  webNavigationHelpers,
} from './navigation/navigation.web.js';
export type {
  UINavigationState,
  UINavigationOptions,
  UINavigationService,
  UINavigationHook,
  UILocationHook,
  UINavigationConfig,
} from './navigation/ui-navigation.js';

// NOTE: Firebase exports removed - use @sudobility/di_web for Firebase implementations
