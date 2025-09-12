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
- **`src/auth/`** - Authentication interfaces supporting multiple providers (wallet, social, email)
- **`src/network/`** - HTTP client interfaces with platform-agnostic request/response types
- **`src/storage/`** - Storage abstraction interfaces (localStorage, AsyncStorage, etc.)
- **`src/navigation/`** - Navigation interfaces for cross-platform routing
- **`src/notification/`** - Notification interfaces for push notifications and local alerts

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

### AI Context Markers

These markers help AI assistants understand code purpose:

```typescript
// @ai-context: Core interface for dependency injection
// @ai-pattern: Generic provider pattern
// @ai-platform: Cross-platform compatible
// @ai-test: See tests/analytics/analytics.test.ts
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

### Version Management

- **Semantic versioning** - MAJOR.MINOR.PATCH
- **Breaking changes** - Any interface change is breaking
- **Deprecation** - Use `@deprecated` JSDoc tag
- **Changelog** - Update CHANGELOG.md for all changes