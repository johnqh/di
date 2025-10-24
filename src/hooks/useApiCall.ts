/**
 * Custom hook for standardizing API call patterns.
 * Reduces boilerplate in API-related hooks.
 *
 * @ai-context React hooks for API call management and state handling
 * @ai-pattern Custom React hooks for async operations
 * @ai-platform React and React Native
 * @ai-usage Use in components that need to manage API call state
 *
 * @example
 * ```typescript
 * const MyComponent = () => {
 *   const { execute, isLoading, error } = useApiCall();
 *
 *   const handleClick = execute(async () => {
 *     return await fetchData();
 *   });
 *
 *   return <button onClick={handleClick} disabled={isLoading}>Fetch</button>;
 * };
 * ```
 */

import { useCallback, useState } from 'react';
import type { Optional } from '@sudobility/types';
import { withLoadingState } from '../utils/async-helpers.js';

/**
 * Options for configuring API call behavior.
 *
 * @ai-context Configuration interface for useApiCall hook
 */
export interface UseApiCallOptions {
  /** Error handler callback */
  onError?: (error: Error) => void;
  /** Context string for error logging */
  context?: string;
}

/**
 * Return type for useApiCall hook.
 *
 * @ai-context Hook return interface with loading state and execution methods
 */
export interface UseApiCallReturn {
  /** Whether an API call is in progress */
  isLoading: boolean;
  /** Error message from last failed call */
  error: Optional<string>;
  /** Clear the current error state */
  clearError: () => void;
  /** Execute an async operation with automatic state management */
  executeAsync: <T>(operation: () => Promise<T>) => Promise<Optional<T>>;
  /** Create a wrapped function that executes with automatic state management */
  execute: <T, TArgs extends unknown[]>(
    operation: (...args: TArgs) => Promise<T>
  ) => (...args: TArgs) => Promise<Optional<T>>;
}

/**
 * Hook for managing API call state and error handling.
 * Returns undefined on error instead of throwing.
 *
 * @param options Configuration options
 * @returns API call utilities with loading and error state
 *
 * @ai-context Main hook for API call management with error suppression
 * @ai-pattern Hook with loading state and error boundaries
 */
export const useApiCall = (
  options: UseApiCallOptions = {}
): UseApiCallReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Optional<string>>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(
    async <T>(operation: () => Promise<T>): Promise<Optional<T>> => {
      return withLoadingState(
        operation,
        setIsLoading,
        setError,
        options.context
      );
    },
    [options.context]
  );

  const execute = useCallback(
    <T, TArgs extends unknown[]>(operation: (...args: TArgs) => Promise<T>) => {
      return async (...args: TArgs): Promise<Optional<T>> => {
        return executeAsync(() => operation(...args));
      };
    },
    [executeAsync]
  );

  return {
    isLoading,
    error,
    clearError,
    executeAsync,
    execute,
  };
};

/**
 * Hook for API calls that throw errors instead of returning undefined.
 * Use when you need strict error handling.
 *
 * @param options Configuration options
 * @returns API call utilities that throw on error
 *
 * @ai-context Strict variant that propagates errors instead of suppressing
 * @ai-pattern Hook with error throwing behavior
 */
export const useApiCallStrict = (options: UseApiCallOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Optional<string>>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeAsync = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await operation();
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Operation failed';
        setError(errorMessage);

        if (options.onError) {
          options.onError(err instanceof Error ? err : new Error(errorMessage));
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options.onError]
  );

  const execute = useCallback(
    <T, TArgs extends unknown[]>(operation: (...args: TArgs) => Promise<T>) => {
      return (...args: TArgs): Promise<T> => {
        return executeAsync(() => operation(...args));
      };
    },
    [executeAsync]
  );

  return {
    isLoading,
    error,
    clearError,
    executeAsync,
    execute,
  };
};

/**
 * Hook for multiple related API calls with shared loading state.
 * Useful for services or components that manage multiple API operations.
 *
 * @param options Configuration options
 * @returns API group utilities with shared state
 *
 * @ai-context Hook for managing multiple API calls with shared loading state
 * @ai-pattern Factory hook that creates wrapped methods
 */
export const useApiGroup = (options: UseApiCallOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Optional<string>>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createMethod = useCallback(
    <T, TArgs extends unknown[]>(
      operation: (...args: TArgs) => Promise<T>,
      throwOnError: boolean = true
    ) => {
      return async (...args: TArgs): Promise<Optional<T>> => {
        if (throwOnError) {
          setIsLoading(true);
          setError(null);

          try {
            const result = await operation(...args);
            return result;
          } catch (err) {
            const errorMessage =
              err instanceof Error ? err.message : 'Operation failed';
            setError(errorMessage);
            throw err;
          } finally {
            setIsLoading(false);
          }
        } else {
          return withLoadingState(
            () => operation(...args),
            setIsLoading,
            setError,
            options.context
          );
        }
      };
    },
    [options.context]
  );

  return {
    isLoading,
    error,
    clearError,
    createMethod,
  };
};
