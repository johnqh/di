/**
 * Network dependency injection interfaces for HTTP client abstraction.
 *
 * @ai-context Network client interfaces defined in external dependency
 * @ai-pattern Network interfaces are provided by @sudobility/types peer dependency
 * @ai-platform Universal HTTP client interfaces (fetch, axios, custom implementations)
 * @ai-usage Import network interfaces directly from @sudobility/types
 *
 * @example
 * ```typescript
 * import { NetworkClient, NetworkRequestOptions, NetworkResponse } from '@sudobility/types';
 *
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

// Network interfaces are provided by @sudobility/types peer dependency
// Import them directly from @sudobility/types when needed
