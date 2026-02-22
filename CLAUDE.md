# di - AI Development Guide

## Overview

`@sudobility/di` is a TypeScript library that provides platform-agnostic dependency injection interfaces, abstract types, and platform-specific implementations for React (web) and React Native projects. It enables clean separation of concerns through interface-based contracts, with concrete implementations for web (browser APIs) and React Native (native modules), plus a unified Firebase integration layer. The library also ships mock implementations for testing and async utility functions.

- **Package name:** `@sudobility/di`
- **Version:** 1.5.36
- **License:** (restricted/private)
- **Package manager:** Bun
- **Module system:** ESM only (`"type": "module"`)
- **TypeScript target:** ES2020, strict mode enabled

## Project Structure

```
src/
├── index.ts                         # Main barrel export (all interfaces, mocks, utils)
├── types.ts                         # Core types: EnvironmentVariables, EnvProvider, FirebaseConfig, AppConfig, AnalyticsEventProperties
├── env.ts                           # EnvFactory, EnvUtils (re-exports from types.ts)
├── analytics/
│   ├── analytics.ts                 # AnalyticsClient, AnalyticsContextProvider, AnalyticsEventData
│   └── platform-analytics.ts        # PlatformAnalytics interface
├── firebase/
│   ├── firebase.interface.ts        # AnalyticsService, RemoteConfigService, FCMService, FirebaseService, FirebaseConfig, FirebaseInitOptions
│   ├── firebase-analytics.ts        # FirebaseAnalyticsService class (unified wrapper + singleton)
│   ├── firebase.web.ts              # WebFirebaseService implementation
│   ├── firebase.rn.ts               # RNFirebaseService implementation
│   └── index.ts                     # Firebase module exports
├── hooks/
│   ├── index.ts                     # Hooks barrel export
│   └── useApiCall.ts                # useApiCall, useApiCallStrict, useApiGroup hooks
├── info/
│   ├── info.ts                      # InfoInterface (toast/alert display)
│   ├── info-singleton.ts            # initializeInfoService / getInfoService singleton
│   └── index.ts                     # Info module exports
├── logging/
│   ├── logging.interface.ts         # LogType enum, Logger, LoggerProvider interfaces
│   └── index.ts                     # Logging module exports
├── mocks/
│   ├── index.ts                     # All mock exports
│   ├── analytics.mock.ts            # MockAnalyticsClient, MockAnalyticsContextProvider, MockPlatformAnalytics
│   ├── env.mock.ts                  # MockEnvProvider, MockEnvFactory, MockEnvUtils
│   ├── logging.mock.ts              # MockLogger, MockLoggerProvider
│   ├── navigation.mock.ts           # MockNavigationService, MockNavigationHook, MockLocationHook
│   ├── network.mock.ts              # MockPlatformNetwork, MockNetworkClient
│   ├── notification.mock.ts         # MockNotificationService, MockNotificationClient, MockPlatformNotifications
│   ├── storage.mock.ts              # MockPlatformStorage, MockStorageService, MockSerializedStorageService
│   └── theme.mock.ts                # MockPlatformTheme
├── navigation/
│   └── navigation.ts                # NavigationService, NavigationHook, LocationHook, URLService, NavigationConfig
├── network/
│   ├── index.ts                     # Note: network interfaces from @sudobility/types
│   └── platform-network.ts          # PlatformNetwork, NetworkRequestOptions interfaces
├── notification/
│   ├── notification.ts              # NotificationService, NotificationClient, NotificationContextProvider, NotificationCapabilities
│   └── platform-notifications.ts    # PlatformNotifications interface
├── storage/
│   └── storage.ts                   # PlatformStorage, AdvancedPlatformStorage, StorageProvider, StorageService, SerializedStorageService, StorageFactory, StorageConfig
├── theme/
│   └── platform-theme.ts            # PlatformTheme interface
├── utils/
│   ├── index.ts                     # Utils barrel export
│   ├── async-helpers.ts             # safeAsync, withLoadingState, safeParallel, withTimeout, withCache, debounceAsync
│   └── logger.ts                    # SimpleLogger interface, ConsoleLogger, setLogger singleton
├── rn/
│   ├── index.ts                     # React Native barrel (re-exports interfaces + RN implementations)
│   ├── types.d.ts                   # Type stubs for RN native modules (AsyncStorage, NetInfo, Notifee, Firebase RN, React Navigation)
│   ├── analytics/analytics.rn.ts    # RNAnalyticsClient
│   ├── env/env.rn.ts                # RNEnvProvider
│   ├── logging/logging.rn.ts        # RNLogger, RNLoggerProvider
│   ├── navigation/navigation.rn.ts  # RNNavigationService
│   ├── network/
│   │   ├── network.rn.ts            # RNNetworkClient, RNNetworkService
│   │   └── network-singleton.ts     # Network singleton management
│   ├── notification/notification.rn.ts # RNNotificationService
│   ├── storage/
│   │   ├── storage.rn.ts            # RNStorage, AdvancedRNStorage
│   │   └── storage-singleton.ts     # RNStorageService singleton
│   └── theme/theme.rn.ts            # RNThemeService
└── web/
    ├── index.ts                     # Web barrel (re-exports interfaces + web implementations)
    ├── types.d.ts                   # Type stubs for Firebase web SDK
    ├── navigation/
    │   ├── navigation.web.ts        # WebUINavigationService
    │   └── ui-navigation.ts         # UINavigationService, UINavigationHook, UILocationHook interfaces
    ├── network/
    │   ├── network.web.ts           # WebNetworkClient
    │   ├── web-network.service.ts   # WebNetworkService
    │   └── network-singleton.ts     # Network singleton management
    └── storage/
        ├── storage.web.ts           # WebStorage, AdvancedWebStorage
        ├── web-storage.service.ts   # WebStorageService, WebSerializedStorageService
        └── storage-singleton.ts     # Storage singleton management

tests/
├── analytics/analytics.test.ts
├── env/env.test.ts
├── integration/library.test.ts
├── logging/logging.test.ts
├── network/network.test.ts
└── types/types.test.ts
```

## Key Interfaces

### Core Types (`src/types.ts`)
| Interface | Purpose |
|---|---|
| `EnvironmentVariables` | Typed environment variable map with `NODE_ENV` |
| `EnvProvider` | Access and validate environment configuration (get, isDevelopment, isProduction, isTest, getAll) |
| `FirebaseConfig` | Firebase project configuration (apiKey, authDomain, projectId, etc.) |
| `AppConfig` | Centralized app config (WildDuck backend, indexer, RevenueCat, WalletConnect, Privy, Firebase, Cloudflare) |
| `AnalyticsEventProperties` | Flexible key-value analytics event metadata |

### Environment (`src/env.ts`)
| Interface | Purpose |
|---|---|
| `EnvFactory` | Factory for creating EnvProvider instances with platform detection |
| `EnvUtils` | Utility interface for environment detection and variable access |

### Analytics (`src/analytics/`)
| Interface | Purpose |
|---|---|
| `AnalyticsClient` | Core analytics: trackEvent, setUserProperties, setUserId, setAnalyticsEnabled, setCurrentScreen |
| `AnalyticsContextProvider` | Automatic context injection into analytics events (getCurrentContext) |
| `PlatformAnalytics` | Simplified analytics: trackEvent, setUserProperty, setUserId, isEnabled |
| `AnalyticsEventData` | Event data object with AnalyticsEvent enum and optional parameters |

### Firebase (`src/firebase/`)
| Interface | Purpose |
|---|---|
| `AnalyticsService` | Firebase analytics: logEvent, setUserProperties, setUserId, isSupported |
| `RemoteConfigService` | Firebase Remote Config: fetchAndActivate, getValue, getAll, isSupported |
| `FCMService` | Firebase Cloud Messaging: requestPermission, getToken, onMessage, isSupported |
| `FirebaseService` | Composite Firebase service (analytics + remoteConfig + messaging) |
| `FirebaseInitOptions` | Firebase initialization flags (enableAnalytics, enableRemoteConfig, etc.) |

### Navigation (`src/navigation/`)
| Interface | Purpose |
|---|---|
| `NavigationService` | Full navigation: navigate, goBack, goForward, replace, getCurrentState, addListener |
| `NavigationHook` | React hook interface for navigation (navigate, goBack, replace, currentPath, params) |
| `LocationHook` | React hook for URL location (pathname, search, searchParams, hash, state) |
| `URLService` | URL manipulation without page reload (removeQueryParam, getQueryParam, setQueryParam) |
| `NavigationConfig` | Platform-specific navigation config (gestures, animations, analytics) |

### Network (`src/network/`)
| Interface | Purpose |
|---|---|
| `PlatformNetwork` | HTTP operations: request, get, post, put, delete, isOnline, watchNetworkStatus |
| `NetworkRequestOptions` | Options for convenience HTTP methods (headers, signal) |

### Notification (`src/notification/`)
| Interface | Purpose |
|---|---|
| `NotificationService` | Full notification service: showNotification, requestPermission, closeNotification, getCapabilities |
| `NotificationClient` | Simplified facade wrapping service + config |
| `NotificationContextProvider` | React context provider for notification state |
| `NotificationCapabilities` | Platform capability flags (supportsActions, supportsIcon, supportsBadge, etc.) |
| `PlatformNotifications` | Simple notifications: showNotification, requestPermission, scheduleNotification |

### Storage (`src/storage/`)
| Interface | Purpose |
|---|---|
| `PlatformStorage` | Low-level storage (setItem, getItem, removeItem, clear, getAllKeys) |
| `AdvancedPlatformStorage` | Extended storage with TTL, hasItem, clearPattern |
| `StorageProvider` | Facade with simplified get/set/remove/clear |
| `StorageService` | High-level storage with isAvailable, getType (StorageType enum) |
| `SerializedStorageService` | Object storage with automatic JSON serialization (getObject, setObject) |
| `StorageFactory` | Factory for creating storage services by type |
| `StorageConfig` | Storage configuration (prefix, encryption, compression, ttl) |

### Theme (`src/theme/`)
| Interface | Purpose |
|---|---|
| `PlatformTheme` | Theme management: applyTheme, applyFontSize, getCurrentTheme, watchSystemTheme |

### Info (`src/info/`)
| Interface | Purpose |
|---|---|
| `InfoInterface` | User-facing info display: show(title, text, type, interval) |

### Logging (`src/logging/`)
| Interface | Purpose |
|---|---|
| `Logger` | Logging service with type property and log() method |
| `LoggerProvider` | Factory for creating/switching Logger instances (getLogger, setLogType) |
| `LogType` | Enum: None, Console, File |

### Hooks (`src/hooks/`)
| Interface/Hook | Purpose |
|---|---|
| `useApiCall` | Hook managing API call state (loading, error) that returns undefined on error |
| `useApiCallStrict` | Hook that throws errors instead of suppressing |
| `useApiGroup` | Hook for multiple related API calls with shared loading state |
| `UseApiCallOptions` | Config: onError callback, context string |
| `UseApiCallReturn` | Return type: isLoading, error, clearError, executeAsync, execute |

### Utilities (`src/utils/`)
| Function/Type | Purpose |
|---|---|
| `safeAsync<T>` | Try-catch wrapper returning AsyncResult (never throws) |
| `withLoadingState<T>` | Async wrapper managing React loading/error state |
| `safeParallel<T>` | Promise.all wrapper with error safety |
| `withTimeout<T>` | Promise.race timeout wrapper |
| `withCache<T>` | Memoization with TTL expiration |
| `clearExpiredCache` | Periodic cache cleanup |
| `debounceAsync` | Debounce wrapper for async operations |
| `SimpleLogger` | Logger interface used by async helpers |
| `setLogger` | Replace default ConsoleLogger singleton |

## Development Commands

```bash
# Install dependencies
bun install

# Build (TypeScript compilation to dist/)
bun run build
bun run build:watch

# Type checking
bun run typecheck

# Testing (Vitest)
bun run test                 # Run all tests
bun run test:watch           # Watch mode
bun run test:coverage        # With coverage report
bun run test:ci              # CI-friendly with coverage

# Code quality
bun run lint                 # ESLint
bun run lint:fix             # Auto-fix
bun run format               # Prettier

# Clean build artifacts
bun run clean

# Publish (runs clean -> test -> build automatically)
bun run prepublishOnly
```

### Running Specific Tests

```bash
bun test -- tests/analytics/
bun test -- --testNamePattern="Enum"
```

## Architecture / Patterns

### Interface-Based Dependency Injection
The core of the library defines abstract TypeScript interfaces that decouple application logic from platform-specific implementations. Consuming projects import interfaces and either use the provided web/RN implementations or write their own.

### Three-Layer Export Structure
The package exposes multiple entry points via `exports` in package.json:
- **`@sudobility/di/interfaces`** (`src/index.ts`) -- All interfaces, types, mocks, and utils
- **`@sudobility/di/web`** (`src/web/index.ts`) -- Web implementations + all interfaces
- **`@sudobility/di/rn`** (`src/rn/index.ts`) -- React Native implementations + all interfaces
- **`@sudobility/di/mocks`** -- Mock implementations for testing
- **Domain-specific subpaths** (`/analytics`, `/env`, `/logging`, `/navigation`, `/network`, `/notification`, `/storage`, `/types`, `/hooks`, `/utils`, `/info`, `/firebase`)

### Unified Platform Names
Both `web/index.ts` and `rn/index.ts` export platform services under unified names (e.g., `PlatformNetworkService`, `PlatformStorageService`, `networkClient`, `storage`) so cross-platform code can import from either without changing import names.

### Singleton Pattern
Platform implementations use a singleton pattern with `initialize*`, `get*`, and `reset*` functions (e.g., `initializeNetworkService()`, `getNetworkService()`, `resetNetworkService()`). The `reset*` variants are for testing.

### Internal Naming Convention
Internal interfaces use underscore prefix (`_AnalyticsClient`) and are re-exported with clean names (`AnalyticsClient`).

### Type Stubs for Native Modules
`src/rn/types.d.ts` and `src/web/types.d.ts` contain `declare module` stubs for native packages (AsyncStorage, NetInfo, Notifee, Firebase RN/Web SDK, React Navigation) so the library compiles without requiring those packages to be installed.

### Peer Dependencies as Optional
All platform-specific packages (react-native, AsyncStorage, Firebase, Notifee, NetInfo) are declared as optional peer dependencies, since only the relevant platform's packages need to be installed.

### Key Design Rules
1. **Interface-only core** -- `src/index.ts` exports only interfaces, types, enums, mocks, and utils (no platform code)
2. **Platform code lives in `src/web/` and `src/rn/`** -- Concrete implementations separated by platform
3. **Zero required runtime dependencies** -- All dependencies are peer or dev
4. **Strict TypeScript** -- Full strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`
5. **ESM only** -- No CommonJS output
6. **95% test coverage threshold** -- Enforced globally on statements, branches, functions, and lines

## Common Tasks

### Adding a New Service Interface

1. Create a new directory under `src/` (e.g., `src/cache/`).
2. Define the interface file (e.g., `src/cache/cache.ts`):
   ```typescript
   import type { Optional } from '@sudobility/types';

   export interface CacheService {
     get<T>(key: string): Promise<Optional<T>>;
     set<T>(key: string, value: T, ttl?: number): Promise<void>;
     delete(key: string): Promise<void>;
     clear(): Promise<void>;
   }
   ```
3. Export from `src/index.ts`:
   ```typescript
   export * from './cache/cache.js';
   ```
4. Add a mock in `src/mocks/cache.mock.ts` and export from `src/mocks/index.ts`.
5. Add tests in `tests/cache/cache.test.ts` with mock implementations.
6. Add the subpath export to `package.json` under `"exports"`.
7. Maintain 95% test coverage.

### Adding a Platform Implementation

1. Create the implementation file under `src/web/` or `src/rn/` (e.g., `src/web/cache/cache.web.ts`).
2. Implement the interface using platform APIs.
3. Add a singleton with `initialize*`, `get*`, `reset*` functions.
4. Export from the platform's `index.ts` under both unified and platform-specific names.

### Adding Type Stubs for Native Modules

If a new native module dependency is needed, add `declare module` stubs in:
- `src/rn/types.d.ts` for React Native packages
- `src/web/types.d.ts` for web-specific Firebase/browser packages

## Peer / Key Dependencies

### Required Peer
| Package | Version |
|---|---|
| `@sudobility/types` | ^1.9.51 |
| `react` | >=18.0.0 |

### Optional Peers (React Native)
| Package | Version |
|---|---|
| `react-native` | >=0.70.0 |
| `@react-native-async-storage/async-storage` | >=1.19.0 |
| `@react-native-community/netinfo` | >=9.0.0 |
| `@notifee/react-native` | >=7.0.0 |
| `@react-native-firebase/app` | >=18.0.0 |
| `@react-native-firebase/analytics` | >=18.0.0 |
| `@react-native-firebase/messaging` | >=18.0.0 |
| `@react-native-firebase/remote-config` | >=18.0.0 |

### Optional Peers (Web)
| Package | Version |
|---|---|
| `firebase` | >=11.0.0 |

### Key Dev Dependencies
| Package | Purpose |
|---|---|
| `typescript` | ^5.9.2 |
| `vitest` | ^3.2.4 (test runner) |
| `@vitest/coverage-v8` | ^3.2.4 (coverage) |
| `eslint` | ^9.36.0 |
| `prettier` | ^3.6.2 |
