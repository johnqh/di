import type { Optional } from '@sudobility/types';

/**
 * HTTP response interface for high-level HTTP client operations.
 *
 * @ai-context Response interface for platform-agnostic HTTP operations
 * @ai-pattern Generic response container with status information
 * @ai-platform Universal HTTP response format
 */
export interface HttpResponse<T> {
  /** Whether the request was successful (2xx status) */
  ok: boolean;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response data */
  data: T;
  /** Response headers (optional) */
  headers?: Optional<Record<string, string>>;
}

/**
 * High-level HTTP client interface for making typed HTTP requests.
 *
 * @ai-context HTTP client interface for dependency injection
 * @ai-pattern Service interface with typed request/response methods
 * @ai-platform Universal (Web fetch, React Native fetch, axios, etc.)
 * @ai-usage Implement for any HTTP client library (fetch wrapper, axios, etc.)
 *
 * @example
 * ```typescript
 * // Web implementation using fetch
 * class FetchHttpClient implements HttpClient {
 *   async get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
 *     const response = await fetch(url, { method: 'GET', headers });
 *     return {
 *       ok: response.ok,
 *       status: response.status,
 *       statusText: response.statusText,
 *       data: await response.json()
 *     };
 *   }
 *   async post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>> {
 *     const response = await fetch(url, {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json', ...headers },
 *       body: JSON.stringify(body)
 *     });
 *     return {
 *       ok: response.ok,
 *       status: response.status,
 *       statusText: response.statusText,
 *       data: await response.json()
 *     };
 *   }
 * }
 * ```
 */
export interface HttpClient {
  /**
   * Make a GET request
   * @param url Request URL
   * @param headers Optional request headers
   * @returns Promise resolving to typed response
   */
  get<T>(
    url: string,
    headers?: Optional<Record<string, string>>
  ): Promise<HttpResponse<T>>;

  /**
   * Make a POST request
   * @param url Request URL
   * @param body Request body
   * @param headers Optional request headers
   * @returns Promise resolving to typed response
   */
  post<T>(
    url: string,
    body: unknown,
    headers?: Optional<Record<string, string>>
  ): Promise<HttpResponse<T>>;

  /**
   * Make a PUT request (optional)
   * @param url Request URL
   * @param body Request body
   * @param headers Optional request headers
   * @returns Promise resolving to typed response
   */
  put?<T>(
    url: string,
    body: unknown,
    headers?: Optional<Record<string, string>>
  ): Promise<HttpResponse<T>>;

  /**
   * Make a DELETE request (optional)
   * @param url Request URL
   * @param headers Optional request headers
   * @returns Promise resolving to typed response
   */
  delete?<T>(
    url: string,
    headers?: Optional<Record<string, string>>
  ): Promise<HttpResponse<T>>;

  /**
   * Make a PATCH request (optional)
   * @param url Request URL
   * @param body Request body
   * @param headers Optional request headers
   * @returns Promise resolving to typed response
   */
  patch?<T>(
    url: string,
    body: unknown,
    headers?: Optional<Record<string, string>>
  ): Promise<HttpResponse<T>>;
}

/**
 * Platform-agnostic network interface for HTTP requests and connectivity monitoring.
 *
 * @ai-context Network service interface for dependency injection
 * @ai-pattern Service interface for network operations
 * @ai-platform Universal (Web fetch, React Native networking)
 * @ai-usage Implement for HTTP clients, network monitoring
 *
 * @example
 * ```typescript
 * class WebNetwork implements PlatformNetwork {
 *   async request(url: string, options: RequestInit): Promise<Response> {
 *     return fetch(url, options);
 *   }
 *   isOnline(): boolean {
 *     return navigator.onLine;
 *   }
 * }
 * ```
 */
export interface PlatformNetwork {
  /**
   * Make an HTTP request
   * @param url Request URL
   * @param options Request options (method, headers, body, etc.)
   * @returns Promise resolving to the response
   */
  request(url: string, options: RequestInit): Promise<Response>;

  /**
   * Check if the device is currently online
   * @returns Whether the device has network connectivity
   */
  isOnline(): boolean;

  /**
   * Watch for network status changes
   * @param callback Function to call when network status changes
   * @returns Cleanup function to stop watching
   */
  watchNetworkStatus(callback: (isOnline: boolean) => void): () => void;
}
