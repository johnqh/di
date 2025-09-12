# Usage Examples and Implementation Guides

This directory contains practical examples and implementation guides for using the `@johnqh/di` interfaces.

**Important Note**: This library contains **ONLY interfaces and types** - no implementations. These examples show how to implement the interfaces in your own projects.

## Available Examples

### Core Patterns
- [**Analytics Implementation**](./analytics-example.md) - Complete analytics service implementation
- [**Storage Implementation**](./storage-example.md) - Cross-platform storage service implementation  
- [**Environment Provider**](./env-example.md) - Environment configuration management

### Integration Examples
- [**Firebase Integration**](./firebase-example.md) - Complete Firebase services integration
- [**React Native Example**](./react-native-example.md) - Mobile app dependency injection setup
- [**Web Application Example**](./web-example.md) - Browser-based dependency injection

### Advanced Patterns
- [**Multi-Chain Wallet Integration**](./wallet-example.md) - Cryptocurrency wallet connection patterns
- [**Email Client Architecture**](./email-example.md) - Email application service architecture

## Quick Start

1. Install the library:
```bash
npm install @johnqh/di
```

2. Import the interfaces you need:
```typescript
import { AnalyticsService, StorageType, EnvProvider } from '@johnqh/di';
```

3. Implement the interfaces for your platform:
```typescript
class MyAnalyticsService implements AnalyticsService {
  // Your implementation here
}
```

4. Use dependency injection patterns to wire services together.

## Implementation Guidelines

### 1. Interface-Only Library
This library provides **only TypeScript interfaces** - you must implement them:

```typescript
// ❌ This won't work - no implementations provided
import { AnalyticsService } from '@johnqh/di';
const analytics = new AnalyticsService(); // ERROR

// ✅ Correct usage - implement the interface
import { AnalyticsService } from '@johnqh/di';

class FirebaseAnalytics implements AnalyticsService {
  initialize() { /* your Firebase setup */ }
  trackEvent() { /* your tracking logic */ }
  // ... implement all required methods
}

const analytics = new FirebaseAnalytics();
```

### 2. Cross-Platform Design
All interfaces work across platforms:

```typescript
import { StorageType } from '@johnqh/di';

// Runtime enum values work everywhere
const webStorage = StorageType.LOCAL_STORAGE;    // 'localStorage'
const mobileStorage = StorageType.ASYNC_STORAGE; // 'asyncStorage'
```

### 3. Type Safety
Leverage TypeScript's type system:

```typescript
import { AnalyticsEvent } from '@johnqh/di';

// ✅ Use provided enums for consistency
analytics.trackEvent(AnalyticsEvent.USER_LOGIN, { method: 'email' });

// ⚠️ Custom events are allowed but less type-safe
analytics.trackEvent('custom_event', { data: 'value' });
```

## AI-Assisted Development

This library is optimized for AI code generation and assistance:

- **Rich JSDoc Documentation** - Every interface includes comprehensive documentation
- **AI Context Markers** - `@ai-*` markers help AI understand code purpose
- **Practical Examples** - Real-world usage patterns in documentation
- **Pattern Recognition** - Consistent naming and structure for AI pattern matching

When working with AI assistants, refer to the CLAUDE.md file for detailed AI optimization information.