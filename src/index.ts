/**
 * @johnqh/di - Platform-agnostic dependency injection interfaces
 *
 * This library provides abstract TypeScript interfaces for dependency injection
 * patterns that work across web and React Native platforms.
 */

// Core types and enums
export * from './types.js';

// Environment interfaces
export * from './env.js';

// Analytics interfaces
export * from './analytics/analytics.js';
// Analytics service interfaces are now exported from @johnqh/types
export {
  type AnalyticsService,
  type AnalyticsConfig,
  type EmailAnalyticsService,
  AnalyticsEventBuilder,
} from '@johnqh/types';

// Navigation interfaces
export * from './navigation/navigation.js';

// Network interfaces
export * from './network/index.js';

// Notification interfaces
export * from './notification/notification.js';

// Storage interfaces
export * from './storage/storage.js';

// Logging interfaces
export * from './logging/index.js';
