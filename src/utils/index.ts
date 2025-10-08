/**
 * Utility functions for async operations and error handling.
 *
 * @ai-context Export module for utility functions
 * @ai-platform Universal (Web, React Native, Node.js)
 */

export {
  safeAsync,
  withLoadingState,
  safeParallel,
  withTimeout,
  withCache,
  clearExpiredCache,
  debounceAsync,
  type AsyncResult,
} from './async-helpers.js';

export { logger, setLogger, type SimpleLogger } from './logger.js';
