# Improvement Plans for @sudobility/di

## Priority 1 - High Impact

### 1. ~~Add JSDoc to All Interfaces~~ ✅ DONE
- Added comprehensive JSDoc to `firebase.interface.ts` (all interfaces and methods)
- Added comprehensive JSDoc to `web/navigation/ui-navigation.ts` (all 5 interfaces)

### 2. ~~Reduce Duplicated Hash Function~~ ✅ DONE
- Extracted `hashUserIdForAnalytics()` to `src/firebase/firebase-utils.ts`
- Updated `firebase.web.ts` and `firebase.rn.ts` to import from shared utility
- Added tests in `tests/firebase/firebase-utils.test.ts`

### 3. ~~Add Integration Tests for Singleton Management~~ ✅ DONE
- Added `tests/integration/singleton.test.ts` with 11 tests
- Tests cover info singleton and firebase analytics singleton lifecycle (init/get/reset)

## Priority 2 - Medium Impact

### 4. ~~Type-Safe Firebase Configuration~~ ✅ DONE
- Replaced `this.config as unknown as Record<string, unknown>` with destructured spread in `firebase.web.ts`
- `const { vapidKey: _, ...firebaseAppConfig } = this.config` excludes non-Firebase fields type-safely

### 5. Extract Web and RN to Separate Packages
- The `di` package ships web, RN, and mock code in a single package
- Consider splitting into `@sudobility/di` (interfaces only), `@sudobility/di-web`, `@sudobility/di-rn`
- This would reduce bundle sizes for platform-specific consumers

### 6. ~~Add Timeout Configuration to withTimeout Utility~~ ✅ DONE
- Added `AbortController` support: `withTimeout` now passes `AbortSignal` to the operation
- Fixed timer leak by adding `clearTimeout` in `finally` block
- Updated function signature: `operation: (signal: AbortSignal) => Promise<T>`

## Priority 3 - Nice to Have

### 7. ~~Improve Mock Implementations~~ ✅ DONE
- Added `setLatency()`, `setErrorRate()`, `simulateOffline()`, `simulateOnline()` to `MockNetworkClient`
- Added tests in `tests/network/mock-network.test.ts`

### 8. Add Performance Benchmarks
- Benchmark singleton initialization time
- Measure memory overhead of observable pattern (Set<Listener>)
- Track Firebase initialization latency

### 9. ~~Add .js Extension Validation to CI~~ ✅ DONE
- Fixed missing `.js` extensions in `storage-singleton.ts` and `network-singleton.ts`
- Added `eslint-plugin-import-x` with `import-x/extensions` rule to catch future violations
