# CLAUDE.md - AI Assistant Context

This file provides comprehensive guidance for AI assistants (Claude Code, GitHub Copilot, Cursor, etc.) when working with this repository. It contains essential context, patterns, and instructions to enable effective AI-assisted development.

## Project Overview

This is `@johnqh/di` - a TypeScript library providing platform-agnostic dependency injection interfaces for React and React Native projects. The library contains **no implementations**, only abstract interfaces and type definitions that enable clean dependency injection patterns across platforms.

## Architecture

### Core Design Philosophy
- **Interface-only library**: Contains no platform-specific code or implementations
- **Cross-platform compatibility**: All interfaces work on web, React Native, and Node.js
- **Dependency injection focus**: Enables clean separation of concerns through abstract contracts

### Module Structure
The library is organized into domain-specific modules:

- **`src/types.ts`** - Core type definitions, enums, and foundational interfaces
- **`src/env.ts`** - Environment configuration interfaces (`EnvProvider`, `AppConfig`)
- **`src/analytics/`** - Analytics tracking interfaces with event-driven patterns
- **`src/network/`** - HTTP client interfaces with platform-agnostic request/response types
- **`src/storage/`** - Storage abstraction interfaces (localStorage, AsyncStorage, etc.)
- **`src/navigation/`** - Navigation interfaces for cross-platform routing
- **`src/notification/`** - Notification interfaces for push notifications and local alerts
- **`src/theme/`** - Theme and appearance interfaces for dark mode and styling
- **`src/hooks/`** - React hooks for API call management and async operations
- **`src/utils/`** - Utility functions for async operations and error handling
- **`src/service-keys.ts`** - Standard service keys for dependency injection containers

### Key Patterns
1. **Interface segregation**: Each domain has focused, single-purpose interfaces
2. **Generic typing**: Heavy use of TypeScript generics for type safety
3. **Platform detection**: Enums and types that work across React/React Native boundaries
4. **Event-driven**: Analytics and other services use event enum patterns

## Development Commands

### Building & Type Checking
```bash
npm run build              # Compile TypeScript to dist/
npm run build:watch        # Watch mode compilation
npm run typecheck          # Type check without emitting files
npm run clean              # Remove dist/ directory
```

### Testing
```bash
npm test                   # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
npm run test:ci            # CI-friendly test run
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix ESLint issues
npm run format             # Format code with Prettier
```

### Publishing
```bash
npm run prepublishOnly     # Runs clean -> test -> build (automatic on publish)
```

### CI/CD Pipeline
The repository uses GitHub Actions for automated testing and deployment:

- **Triggers**: Push to main branch or merged PRs
- **Test Matrix**: Node.js 20.x and 22.x
- **Quality Gates**: TypeScript checking, linting, full test suite with coverage
- **Deployment**: Automatic npm publishing and GitHub releases
- **Skip Releases**: Add `[skip ci]` or `[skip-ci]` to commit messages to skip deployment

## Testing Architecture

The test suite is comprehensive with 60+ tests across 5 categories:

- **`tests/types/`** - Enum validation and interface type checking
- **`tests/analytics/`** - Analytics interface compliance testing
- **`tests/env/`** - Environment provider interface testing
- **`tests/network/`** - Network client interface testing  
- **`tests/integration/`** - End-to-end library integration tests

### Test Patterns
- **Mock implementations**: Tests use concrete mock classes implementing interfaces
- **Type safety validation**: Tests verify TypeScript interface contracts
- **Cross-platform scenarios**: Tests validate platform-agnostic patterns

### Running Specific Tests
```bash
npm test -- tests/analytics/          # Run analytics tests only
npm test -- --testNamePattern="Enum"  # Run tests matching pattern
npm test -- --coverage --silent       # Quiet coverage run
```

## Key Configuration Files

### TypeScript Configuration
- **Target**: ES2020 with DOM support for cross-platform compatibility
- **Module**: ESNext with bundler resolution for modern tooling
- **Strict mode**: Enabled with selective unused parameter allowance for interfaces

### Jest Configuration
- **ES Modules**: Full ESM support with ts-jest transformation
- **Coverage**: 95% threshold on statements, branches, functions, and lines
- **Exclusions**: Interface files and pure export files excluded from coverage

### ESLint Configuration
- **Interface-friendly**: Unused parameters ignored in interface definitions (`args: 'none'`)
- **Global types**: FormData, Blob, AbortSignal available for network interfaces
- **Any types**: Warnings allowed for necessary interface flexibility

## Working with This Codebase

### Adding New Interfaces
1. Create interface files in appropriate domain directory
2. Export from domain's main file and `src/index.ts`
3. Add corresponding test file with mock implementation
4. Ensure 95% test coverage threshold is maintained

### Interface Design Guidelines
- Use generic types for flexibility: `NetworkResponse<T>`, `StorageProvider<K, V>`
- Include platform detection enums where relevant
- Prefix internal interfaces with underscore, export clean names
- Use `any` sparingly and only where interface flexibility is essential

### Common Pitfalls
- Interface files generate no coverage - exclude them in Jest config
- ES modules require careful Jest configuration for TypeScript
- Cross-platform types need DOM lib for web APIs (FormData, Blob, etc.)
- Unused parameters in interface methods are expected - configure ESLint accordingly

## AI Assistant Instructions

### Quick Start for AI Assistants
1. **Read this file first** - Contains all project context and patterns
2. **Check existing interfaces** - Always look at existing code before creating new interfaces
3. **Follow conventions** - Match existing code style and patterns exactly
4. **Test everything** - Run `npm test` after any changes
5. **Type safety first** - This is a TypeScript-first library

### Code Generation Guidelines

#### When Creating New Interfaces
```typescript
// ✅ GOOD: Generic, flexible interface
export interface DataProvider<T> {
  get(id: string): Promise<T>;
  set(id: string, value: T): Promise<void>;
  delete(id: string): Promise<void>;
}

// ❌ BAD: Too specific, not flexible
export interface UserDataProvider {
  getUser(id: string): Promise<User>;
  setUser(id: string, user: User): Promise<void>;
}
```

#### When Adding Platform-Specific Types
```typescript
// ✅ GOOD: Platform-agnostic with detection
export enum Platform {
  Web = 'web',
  iOS = 'ios',
  Android = 'android',
}

export interface PlatformProvider {
  platform: Platform;
  isWeb(): boolean;
  isMobile(): boolean;
}

// ❌ BAD: Platform-specific implementation
import { Platform } from 'react-native';
// Never import platform-specific libraries
```

### Common AI Tasks and Solutions

#### Task: Add a new domain interface
**Solution**: 
1. Create new directory under `src/` (e.g., `src/cache/`)
2. Create interface file (e.g., `cache.interface.ts`)
3. Export from `src/index.ts`
4. Add tests in `tests/cache/cache.test.ts`
5. Update this CLAUDE.md file

#### Task: Fix type errors
**Solution**:
1. Run `npm run typecheck` to see all errors
2. Check if using `any` - replace with `unknown` or generic
3. Ensure all interfaces use proper generics
4. Verify imports are from correct paths

#### Task: Improve test coverage
**Solution**:
1. Run `npm run test:coverage` to see gaps
2. Focus on mock implementations, not interfaces
3. Test edge cases and error scenarios
4. Ensure 95% coverage threshold

### AI Context Markers and Documentation Standards

The codebase uses standardized AI context markers to help AI assistants understand code purpose, patterns, and usage. These markers are embedded in JSDoc comments throughout the codebase.

#### Standard AI Context Markers

```typescript
/**
 * Interface description
 * 
 * @ai-context Core interface for dependency injection
 * @ai-pattern Generic provider pattern  
 * @ai-platform Cross-platform compatible (Web, React Native, Node.js)
 * @ai-usage Implement this interface to create services for Firebase, etc.
 * @ai-test See tests/analytics/analytics.test.ts
 * @ai-interface-type Service Provider | Data Container | Configuration
 * @ai-domain Email applications | Blockchain integration | Analytics
 * @ai-security Contains sensitive data - handle securely
 * @ai-cross-platform Works across web and mobile platforms
 * @ai-runtime-value Enum values available at runtime
 * @ai-generics Uses generic constraints for type safety
 * 
 * @example
 * ```typescript
 * class MyImplementation implements MyInterface {
 *   // Implementation details
 * }
 * ```
 */
```

#### Test Documentation Standards

```typescript
/**
 * @ai-test-suite Description of test suite purpose
 * @ai-test-category Category of tests being run
 * @ai-test-pattern Type of testing pattern used
 * @ai-purpose Specific purpose of this test
 * @ai-coverage What this test covers
 * @ai-use-case Real-world usage scenario being tested
 */
```

#### Enum Documentation Standards

```typescript
/**
 * @ai-enum-type Purpose of the enumeration
 * @ai-pattern How this enum should be used
 * @ai-runtime-value Available as values at runtime
 * @ai-categories Functional categories within the enum
 */
export enum ExampleEnum {
  /** Detailed description of each enum value */
  VALUE_ONE = 'value-one',
}
```

### Project Invariants (Never Change These)

1. **No implementations** - This library contains ONLY interfaces
2. **No dependencies** - Zero runtime dependencies allowed
3. **Platform agnostic** - Must work on web, iOS, and Android
4. **95% test coverage** - Never reduce coverage threshold
5. **Strict TypeScript** - Keep strict mode enabled
6. **ESM only** - Module type is ESM, no CommonJS

### Frequently Asked Questions for AI

**Q: Can I add a new npm dependency?**
A: No. This is an interface-only library with zero runtime dependencies.

**Q: Should I add implementation code?**
A: No. Only interfaces, types, and enums. Implementations belong in consuming projects.

**Q: How do I handle platform-specific types?**
A: Use enums and type unions. Never import platform-specific libraries.

**Q: What about utility functions?**
A: Only type utilities are allowed (e.g., type guards), no runtime utilities.

**Q: How detailed should interfaces be?**
A: Detailed enough for type safety, generic enough for multiple implementations.

### Performance Considerations for AI

- **Keep interfaces small** - Single responsibility principle
- **Use generics liberally** - Flexibility without runtime cost
- **Avoid deep nesting** - Flat interface hierarchies perform better
- **Minimize re-exports** - Direct imports are more efficient

### Security Considerations

- **No secrets** - Never include API keys or credentials
- **Type-safe APIs** - Interfaces should encourage secure patterns
- **Validation hints** - Include JSDoc comments for validation requirements

## AI-Assisted Development Optimizations

This project has been specifically optimized for AI-assisted development with the following enhancements:

### 1. Comprehensive JSDoc Documentation

Every interface, enum, and significant code element includes detailed JSDoc documentation with:
- Purpose and usage descriptions
- Parameter explanations with types and examples
- Return value documentation
- Cross-platform compatibility notes
- Security considerations
- Practical usage examples

### 2. AI Context Markers

Standardized `@ai-*` markers throughout the codebase provide context to AI assistants:
- `@ai-context` - Overall purpose of the code
- `@ai-pattern` - Design patterns being used
- `@ai-platform` - Platform compatibility information
- `@ai-usage` - How to implement or use the code
- `@ai-example` - Practical examples
- `@ai-security` - Security considerations
- `@ai-test-*` - Testing-related context

### 3. Enhanced Test Patterns

Test files include AI-friendly patterns:
- Descriptive test categorization with `@ai-test-category`
- Clear purpose statements with `@ai-purpose`
- Pattern identification with `@ai-test-pattern`
- Real-world usage examples in test scenarios
- Comprehensive edge case coverage

### 4. Runtime-Accessible Enums

All enums are designed for runtime access:
- Converted from type unions to proper enums
- String values for integration with external APIs
- Comprehensive documentation for each enum value
- Usage examples showing runtime iteration and switching

### 5. Type Safety with Flexibility

Interfaces balance strict typing with necessary flexibility:
- Generic type parameters where appropriate
- Optional properties clearly marked and documented
- Union types for legitimate variants
- Index signatures for extensible configurations

### AI Assistant Best Practices

When working with this codebase, AI assistants should:

1. **Read Documentation First** - Always check existing JSDoc and AI context markers
2. **Follow Established Patterns** - Use the same documentation and naming conventions
3. **Maintain Type Safety** - Preserve strict TypeScript typing while adding flexibility
4. **Include Examples** - Provide practical usage examples in all documentation
5. **Cross-Platform Awareness** - Consider web, React Native, and Node.js compatibility
6. **Test Coverage** - Maintain comprehensive test coverage with descriptive patterns

### Code Generation Guidelines for AI

When generating code:

```typescript
// ✅ GOOD: Comprehensive interface with AI markers
/**
 * Service for managing user notifications across platforms.
 * 
 * @ai-context Notification service interface for dependency injection
 * @ai-pattern Service provider with async operations
 * @ai-platform Works on web (Web Notifications API) and mobile (push notifications)
 * @ai-usage Implement for Firebase, OneSignal, or custom notification services
 * 
 * @example
 * ```typescript
 * class FirebaseNotifications implements NotificationService {
 *   async send(message: string, options?: NotificationOptions) {
 *     // Implementation using Firebase Cloud Messaging
 *   }
 * }
 * ```
 */
interface NotificationService {
  /**
   * Send a notification to the user.
   * 
   * @param message Notification message content
   * @param options Optional notification configuration
   * @returns Promise resolving when notification is queued
   * 
   * @ai-pattern Async service method with options parameter
   */
  send(message: string, options?: NotificationOptions): Promise<void>;
}

// ❌ BAD: Minimal interface without context
interface NotificationService {
  send(message: string): Promise<void>;
}
```

### Version Management

- **Semantic versioning** - MAJOR.MINOR.PATCH
- **Breaking changes** - Any interface change is breaking
- **Deprecation** - Use `@deprecated` JSDoc tag
- **Changelog** - Update CHANGELOG.md for all changes