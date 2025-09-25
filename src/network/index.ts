/**
 * Network dependency injection interfaces for HTTP client abstraction.
 *
 * @ai-context Network client interfaces exported from external dependency
 * @ai-pattern Re-export pattern for network interfaces defined in @johnqh/types
 * @ai-platform Universal HTTP client interfaces (fetch, axios, custom implementations)
 * @ai-usage Network interfaces are defined in @johnqh/types - implement for fetch, axios, or custom clients
 *
 * @example
 * ```typescript
 * // Implementation using fetch API
 * class FetchNetworkClient implements NetworkClient {
 *   async request<T>(options: NetworkRequestOptions): Promise<NetworkResponse<T>> {
 *     const response = await fetch(options.url, {
 *       method: options.method,
 *       headers: options.headers,
 *       body: options.body
 *     });
 *     return { data: await response.json(), status: response.status };
 *   }
 * }
 * ```
 */

// Network interfaces are now exported from @johnqh/types
export {
  type NetworkClient,
  type NetworkResponse,
  type NetworkRequestOptions,
  NetworkError,
} from '@johnqh/types';
