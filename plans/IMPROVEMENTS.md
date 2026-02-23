# Improvement Plans for @sudobility/di

## Priority 1 - High Impact

### 1. Add JSDoc to All Interfaces
- `firebase.interface.ts` has many interfaces lacking JSDoc (`AnalyticsService`, `RemoteConfigService`, `FCMService`, etc.)
- `web/navigation/ui-navigation.ts` interfaces need documentation
- Mock classes should document their behavior for test authors

### 2. Reduce Duplicated Hash Function
- `hashUserId()` appears in multiple files; extract to a shared utility
- Use a single implementation imported across analytics modules

### 3. Add Integration Tests for Singleton Management
- Test `initialize*()` / `get*()` / `reset*()` lifecycle across all services
- Verify that `reset()` properly calls `dispose()` and cleans up listeners
- Test singleton auto-creation behavior in `get*()` functions

## Priority 2 - Medium Impact

### 4. Type-Safe Firebase Configuration
- Replace `any` types in Firebase initialization options with strict types
- Add runtime validation for required Firebase config fields
- Consider Zod schemas for AppConfig validation

### 5. Extract Web and RN to Separate Packages
- The `di` package ships web, RN, and mock code in a single package
- Consider splitting into `@sudobility/di` (interfaces only), `@sudobility/di-web`, `@sudobility/di-rn`
- This would reduce bundle sizes for platform-specific consumers

### 6. Add Timeout Configuration to withTimeout Utility
- Document that `withTimeout` does not cancel the underlying Promise
- Consider adding AbortController support for proper cancellation

## Priority 3 - Nice to Have

### 7. Improve Mock Implementations
- Add configurable behavior to mock classes (e.g., `MockNetworkClient` with predefined responses)
- Add `MockPlatformNetwork.setOnline(boolean)` for testing network state transitions
- Document mock usage patterns in CLAUDE.md

### 8. Add Performance Benchmarks
- Benchmark singleton initialization time
- Measure memory overhead of observable pattern (Set<Listener>)
- Track Firebase initialization latency

### 9. Add .js Extension Validation to CI
- Ensure all imports use `.js` extensions (required for ESM)
- Add lint rule or build check to catch missing extensions
