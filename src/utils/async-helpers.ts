/**
 * Common async operation patterns and helpers.
 * Reduces boilerplate code for common async operations.
 *
 * @ai-context Async utility functions for error handling and state management
 * @ai-pattern Functional utilities for async operations
 * @ai-platform Universal (Web, React Native, Node.js)
 * @ai-usage Use these helpers for standardized async error handling
 *
 * @example
 * ```typescript
 * const result = await safeAsync(async () => {
 *   return await fetchData();
 * });
 *
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */

import type { Optional } from '@sudobility/types';
import { logger } from './logger.js';

/**
 * Result type for safe async operations.
 *
 * @ai-context Result wrapper for async operations with error handling
 */
export type AsyncResult<T> = {
  data?: T;
  error?: Error;
  success: boolean;
};

/**
 * Safely execute an async operation with error handling.
 * Returns a result object instead of throwing.
 *
 * @param operation Async operation to execute
 * @param context Optional context for error logging
 * @returns Result object with data or error
 *
 * @ai-context Safe async wrapper that never throws
 * @ai-pattern Try-catch wrapper with result object return
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<AsyncResult<T>> => {
  try {
    const data = await operation();
    return { data, success: true };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error(`Async operation failed: ${errorObj.message}`, context, error);
    return { error: errorObj, success: false };
  }
};

/**
 * Execute async operation with loading state tracking.
 * Used by hooks to manage loading and error states.
 *
 * @param operation Async operation to execute
 * @param setLoading Loading state setter
 * @param setError Error state setter
 * @param context Optional context for error logging
 * @returns Operation result or undefined on error
 *
 * @ai-context Helper for React hooks to manage loading/error state
 * @ai-pattern State management wrapper for async operations
 */
export const withLoadingState = async <T>(
  operation: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setError: (error: Optional<string>) => void,
  context?: string
): Promise<Optional<T>> => {
  setLoading(true);
  setError(null);

  try {
    const result = await operation();
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    setError(errorMessage);
    logger.error(`Operation failed: ${errorMessage}`, context, error);
    return undefined;
  } finally {
    setLoading(false);
  }
};

/**
 * Execute multiple async operations in parallel with error handling.
 *
 * @param operations Array of async operations
 * @param context Optional context for error logging
 * @returns Result object with all results or error
 *
 * @ai-context Parallel execution wrapper with unified error handling
 * @ai-pattern Promise.all wrapper with error safety
 */
export const safeParallel = async <T extends readonly unknown[]>(
  operations: readonly [...{ [K in keyof T]: () => Promise<T[K]> }],
  context?: string
): Promise<AsyncResult<T>> => {
  try {
    const results = await Promise.all(operations.map((op) => op()));
    return { data: results as unknown as T, success: true };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error(
      `Parallel operations failed: ${errorObj.message}`,
      context,
      error
    );
    return { error: errorObj, success: false };
  }
};

/**
 * Execute async operation with timeout.
 *
 * @param operation Async operation to execute
 * @param timeoutMs Timeout in milliseconds
 * @param context Optional context for error logging
 * @returns Operation result
 * @throws Error if operation times out
 *
 * @ai-context Timeout wrapper for async operations
 * @ai-pattern Promise.race with timeout promise
 */
export const withTimeout = async <T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  context?: string
): Promise<T> => {
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(controller.signal), timeoutPromise]);
  } catch (error) {
    logger.error(`Timeout operation failed`, context, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Cache storage for async operation results.
 *
 * @ai-context Internal cache for withCache function
 */
const cache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

/**
 * Cache async operation results with TTL.
 *
 * @param key Cache key
 * @param operation Async operation to execute
 * @param ttlMs Time to live in milliseconds (default: 5 minutes)
 * @returns Cached or fresh operation result
 *
 * @ai-context Caching wrapper for expensive async operations
 * @ai-pattern Memoization with TTL expiration
 */
export const withCache = async <T>(
  key: string,
  operation: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }

  const result = await operation();
  cache.set(key, { data: result, timestamp: now, ttl: ttlMs });
  return result;
};

/**
 * Clear expired cache entries.
 * Call periodically to prevent memory leaks.
 *
 * @ai-context Cache cleanup utility
 * @ai-pattern Periodic cleanup for memory management
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp >= entry.ttl) {
      cache.delete(key);
    }
  }
};

/**
 * Timeout storage for debounced operations.
 *
 * @ai-context Internal storage for debounceAsync function
 */
const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Debounce async operations.
 * Useful for search inputs and other high-frequency operations.
 *
 * @param fn Async function to debounce
 * @param delay Delay in milliseconds
 * @param key Unique key for this debounced operation
 * @returns Debounced function
 *
 * @ai-context Debouncing wrapper for async operations
 * @ai-pattern Debounce with cancellation support
 */
export const debounceAsync = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number,
  key: string
): ((...args: T) => Promise<Optional<R>>) => {
  return (...args: T): Promise<Optional<R>> => {
    return new Promise((resolve) => {
      const existingTimeout = debounceMap.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      const timeout = setTimeout(async () => {
        debounceMap.delete(key);
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          logger.error(`Debounced operation failed`, key, error);
          resolve(undefined);
        }
      }, delay);

      debounceMap.set(key, timeout);
    });
  };
};
