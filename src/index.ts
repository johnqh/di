/**
 * @johnqh/di - Platform-agnostic dependency injection interfaces
 *
 * This library provides abstract TypeScript interfaces for dependency injection
 * patterns that work across web and React Native platforms.
 */

// Core types and enums
export * from './types';

// Environment interfaces
export * from './env';

// Analytics interfaces
export * from './analytics/analytics';
// Analytics service interfaces are now exported from @johnqh/types
export {
  type AnalyticsService,
  type AnalyticsConfig,
  type EmailAnalyticsService,
  AnalyticsEventBuilder,
} from '@johnqh/types';

// Navigation interfaces
export * from './navigation/navigation';

// Network interfaces
export * from './network';

// Notification interfaces
export * from './notification/notification';

// Storage interfaces
export * from './storage/storage';
