# @sudobility/di

Platform-agnostic dependency injection for React and React Native with automatic platform detection.

## Overview

This library provides unified DI services that work identically on Web and React Native. The bundler automatically selects the correct platform implementation, so you write the same code for both platforms.

## Features

- **Unified API**: Same code works on Web and React Native
- **Automatic Platform Detection**: Bundler selects correct implementation
- **TypeScript First**: Fully typed interfaces and implementations
- **Lazy Loading**: Native modules loaded only when used
- **Singleton Management**: Built-in service lifecycle management
- **Modular**: Import only what you need

## Installation

```bash
npm install @sudobility/di
```

### Optional Peer Dependencies

**Web:**
```bash
npm install firebase
```

**React Native:**
```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install @react-native-firebase/app @react-native-firebase/analytics
npm install @react-native-firebase/remote-config @react-native-firebase/messaging
npm install @notifee/react-native
```

## Quick Start

### 1. Initialize Services

```typescript
// main.tsx or App.tsx
import {
  initializeStorageService,
  initializeNetworkService,
  initializeFirebaseService,
} from '@sudobility/di';

// Call before rendering app
initializeStorageService();
initializeNetworkService();
initializeFirebaseService(firebaseConfig);
```

### 2. Use Services

```typescript
import {
  getStorageService,
  getNetworkService,
  getFirebaseService,
  networkClient,
} from '@sudobility/di';

// Storage
const storage = getStorageService();
await storage.setItem('token', 'abc123');
const token = await storage.getItem('token');

// Network requests
const response = await networkClient.get<User>('/api/user');

// Network status
const network = getNetworkService();
const isOnline = network.isOnline();

// Firebase
const firebase = getFirebaseService();
firebase.analytics.logEvent('screen_view', { screen: 'Home' });
```

## API Reference

### Storage

```typescript
import { getStorageService, storage } from '@sudobility/di';

const storageService = getStorageService();

// Basic operations
await storageService.setItem('key', 'value');
const value = await storageService.getItem('key');
await storageService.removeItem('key');
await storageService.clear();
const keys = await storageService.getAllKeys();
```

### Network Requests

```typescript
import { networkClient } from '@sudobility/di';

// GET
const response = await networkClient.get<User>('/api/user');
if (response.ok) {
  console.log(response.data);
}

// POST with body
const result = await networkClient.post<Result>('/api/submit', {
  name: 'John',
  email: 'john@example.com'
});

// PUT and DELETE
await networkClient.put('/api/user/1', { name: 'Jane' });
await networkClient.delete('/api/user/1');

// With options
const response = await networkClient.get('/api/data', {
  headers: { 'Authorization': 'Bearer token' },
  timeout: 5000,
});
```

### Network Status

```typescript
import { getNetworkService } from '@sudobility/di';

const network = getNetworkService();

// Check connection
const isOnline = network.isOnline();

// Watch for changes
const unsubscribe = network.watchNetworkStatus((online) => {
  console.log('Connection:', online ? 'Online' : 'Offline');
});

// Cleanup when done
unsubscribe();
```

### Firebase

```typescript
import { getFirebaseService } from '@sudobility/di';

const firebase = getFirebaseService();

// Analytics
firebase.analytics.logEvent('purchase', { item: 'premium', price: 9.99 });
firebase.analytics.setUserId('user123');
firebase.analytics.setUserProperties({ plan: 'pro' });

// Remote Config
await firebase.remoteConfig.fetchAndActivate();
const showFeature = firebase.remoteConfig.getValue('new_feature').asBoolean();
const apiUrl = firebase.remoteConfig.getValue('api_url').asString();
const maxItems = firebase.remoteConfig.getValue('max_items').asNumber();

// Messaging (FCM)
const granted = await firebase.messaging.requestPermission();
if (granted) {
  const token = await firebase.messaging.getToken();
  console.log('FCM Token:', token);
}

const unsubscribe = firebase.messaging.onMessage((message) => {
  console.log('Push notification:', message.notification?.title);
});
```

### React Native Only Services

```typescript
import {
  getThemeService,
  getNavigationService,
  getNotificationService,
} from '@sudobility/di';

// Theme
const theme = getThemeService();
const isDark = theme.isDarkMode();
theme.applyTheme('dark'); // 'light' | 'dark' | 'system'
theme.watchSystemTheme((mode) => {
  console.log('System theme:', mode);
});

// Navigation (call setNavigationRef first in App.tsx)
const nav = getNavigationService();
nav.navigate('Profile', { userId: '123' });
nav.goBack();
nav.replace('Home');

// Notifications
const notifications = getNotificationService();
await notifications.requestPermission();
await notifications.showNotification('Hello', {
  body: 'You have a new message',
  data: { screen: 'inbox' }
});
await notifications.setBadgeCount(5);
```

## Import Paths

```typescript
// Auto-detect platform (recommended)
import { ... } from '@sudobility/di';

// Explicit web imports
import { ... } from '@sudobility/di/web';

// Explicit React Native imports
import { ... } from '@sudobility/di/rn';

// Interfaces only (no implementations)
import type { ... } from '@sudobility/di/interfaces';

// Mocks for testing
import { MockStorageService, MockNetworkClient } from '@sudobility/di/mocks';
```

## Unified Exports

These exports work identically on both platforms:

| Export | Description |
|--------|-------------|
| `networkClient` | Pre-configured network client instance |
| `storage` | Basic storage instance |
| `advancedStorage` | Storage with TTL support |
| `getStorageService()` | Get storage service singleton |
| `getNetworkService()` | Get network service singleton |
| `getFirebaseService()` | Get Firebase service singleton |
| `initializeStorageService()` | Initialize storage singleton |
| `initializeNetworkService()` | Initialize network singleton |
| `initializeFirebaseService()` | Initialize Firebase singleton |
| `StorageService` | Storage service class |
| `NetworkService` | Network service class |
| `FirebaseService` | Firebase service class |

## Platform-Specific Exports

### Web Only
- `WebStorageService`, `WebNetworkService`, `WebFirebaseService`
- `webStorage`, `webNetworkClient`
- `WebUINavigationService`

### React Native Only
- `RNStorageService`, `RNNetworkService`, `RNFirebaseService`
- `rnStorage`, `rnNetworkClient`
- `getThemeService()`, `getNavigationService()`, `getNotificationService()`
- `RNThemeService`, `RNNavigationService`, `RNNotificationService`

## Testing with Mocks

```typescript
import {
  MockStorageService,
  MockNetworkClient,
  MockAnalyticsClient,
} from '@sudobility/di/mocks';

// In your tests
const mockStorage = new MockStorageService();
await mockStorage.setItem('key', 'value');
expect(await mockStorage.getItem('key')).toBe('value');

const mockNetwork = new MockNetworkClient();
// Configure mock responses...
```

## License

MIT
