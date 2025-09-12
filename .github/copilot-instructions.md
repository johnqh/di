# GitHub Copilot Instructions for @johnqh/di

## Project Overview
You are working on @johnqh/di, a TypeScript interface-only library for dependency injection in React and React Native projects.

## Critical Rules
1. **NO IMPLEMENTATIONS** - Only interfaces, types, and enums in src/
2. **NO DEPENDENCIES** - Zero runtime dependencies
3. **PLATFORM AGNOSTIC** - Must work on web, iOS, and Android
4. **STRICT TYPESCRIPT** - Always maintain type safety
5. **95% TEST COVERAGE** - Never reduce coverage

## Code Patterns to Follow

### ✅ Correct Interface Pattern
```typescript
export interface Provider<T> {
  get(key: string): Promise<T>;
  set(key: string, value: T): Promise<void>;
}
```

### ❌ Incorrect Implementation
```typescript
// NEVER do this in src/
export class ConcreteProvider {
  // No implementations!
}
```

## When Suggesting Code

### For New Interfaces
- Use generics for flexibility
- Keep single responsibility
- Add JSDoc comments
- Export from index.ts

### For Tests
- Create mock implementations
- Test interface contracts
- Cover edge cases
- Use Jest patterns

## Common Tasks

### Adding a new domain:
1. Create `src/[domain]/[domain].interface.ts`
2. Export from `src/index.ts`
3. Add tests in `tests/[domain]/`
4. Update documentation

### Fixing type issues:
- Replace `any` with `unknown` or generics
- Use proper type constraints
- Maintain backward compatibility

## Commands to Suggest
- `npm run typecheck` - Check types
- `npm test` - Run tests
- `npm run lint:fix` - Fix style
- `npm run test:coverage` - Check coverage

## Never Suggest
- Adding npm packages
- Creating classes in src/
- Platform-specific imports
- Reducing type safety
- Breaking changes without discussion

## Context for Better Suggestions
- This is an INTERFACE library
- Used by React and React Native apps
- Zero runtime overhead goal
- Maximum type safety priority
- Developer experience focused