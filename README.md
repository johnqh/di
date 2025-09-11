# @johnqh/di

Platform-agnostic dependency injection interfaces for React and React Native projects.

## Overview

This library provides abstract TypeScript interfaces for dependency injection patterns that work across web and React Native platforms. It contains no platform-specific code and focuses purely on defining contracts for common services.

## Features

- 🚀 **Platform Agnostic**: Works with both React and React Native
- 📱 **React Native Compatible**: No web-specific dependencies
- 🔌 **Dependency Injection**: Clean interface-based architecture
- 🎯 **TypeScript First**: Fully typed interfaces
- 🏗️ **Modular**: Import only what you need

## Installation

```bash
npm install @johnqh/di
```

## Usage

```typescript
import {
  NetworkClient,
  StorageProvider,
  AnalyticsService,
  EnvProvider
} from '@johnqh/di';

// Implement interfaces for your specific platform
class MyNetworkClient implements NetworkClient {
  // Your implementation
}
```

## Included Interfaces

### Network
- `NetworkClient` - HTTP client interface
- `NetworkResponse` - Response type
- `NetworkRequestOptions` - Request configuration

### Storage
- `StorageProvider` - Storage abstraction
- `PlatformStorage` - Basic storage interface
- `StorageService` - Enhanced storage service

### Analytics
- `AnalyticsService` - Analytics tracking interface
- `EmailAnalyticsService` - Email-specific analytics

### Environment
- `EnvProvider` - Environment configuration
- `AppConfig` - Application configuration

### Authentication
- Auth interfaces for various providers

### Navigation & Notifications
- Platform-agnostic navigation and notification interfaces

## License

MIT