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
/**
 * Options for convenience methods (get, post, put, delete)
 */
export interface NetworkRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface PlatformNetwork {
  /**
   * Make an HTTP request
   * @param url Request URL
   * @param options Request options (method, headers, body, etc.)
   * @returns Promise resolving to the response
   */
  request(url: string, options?: RequestInit): Promise<Response>;

  /**
   * Make a GET request
   * @param url Request URL
   * @param options Optional headers and signal
   * @returns Promise resolving to the response
   */
  get(url: string, options?: NetworkRequestOptions): Promise<Response>;

  /**
   * Make a POST request
   * @param url Request URL
   * @param body Request body (will be JSON stringified if object)
   * @param options Optional headers and signal
   * @returns Promise resolving to the response
   */
  post(url: string, body?: unknown, options?: NetworkRequestOptions): Promise<Response>;

  /**
   * Make a PUT request
   * @param url Request URL
   * @param body Request body (will be JSON stringified if object)
   * @param options Optional headers and signal
   * @returns Promise resolving to the response
   */
  put(url: string, body?: unknown, options?: NetworkRequestOptions): Promise<Response>;

  /**
   * Make a DELETE request
   * @param url Request URL
   * @param options Optional headers and signal
   * @returns Promise resolving to the response
   */
  delete(url: string, options?: NetworkRequestOptions): Promise<Response>;

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
