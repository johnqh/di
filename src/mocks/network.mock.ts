/**
 * Mock implementations for network interfaces.
 *
 * @ai-context Test mocks for PlatformNetwork and NetworkClient
 * @ai-usage Use in unit tests to mock network requests
 */

import type { PlatformNetwork } from '../network/platform-network.js';
import type {
  NetworkClient,
  NetworkResponse,
  NetworkRequestOptions,
} from '@sudobility/types';

/**
 * Recorded network request for testing assertions.
 */
export interface RecordedRequest {
  url: string;
  options: RequestInit;
  timestamp: number;
}

/**
 * Mock response configuration.
 */
export interface MockResponseConfig {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
  delay?: number;
  error?: Error;
}

/**
 * Mock implementation of PlatformNetwork for testing.
 *
 * @example
 * ```typescript
 * const network = new MockPlatformNetwork();
 * network.setMockResponse('/api/users', { body: [{ id: 1 }] });
 * const response = await network.request('/api/users', {});
 * const data = await response.json();
 * expect(data).toEqual([{ id: 1 }]);
 * ```
 */
export class MockPlatformNetwork implements PlatformNetwork {
  private online: boolean = true;
  private requests: RecordedRequest[] = [];
  private mockResponses: Map<string, MockResponseConfig> = new Map();
  private defaultResponse: MockResponseConfig = { status: 200, body: {} };
  private networkStatusListeners: Set<(isOnline: boolean) => void> = new Set();

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    this.requests.push({ url, options, timestamp: Date.now() });

    // Check for URL-specific mock
    const mockConfig = this.mockResponses.get(url) || this.defaultResponse;

    // Handle error simulation
    if (mockConfig.error) {
      throw mockConfig.error;
    }

    // Handle delay simulation
    if (mockConfig.delay) {
      await new Promise((resolve) => setTimeout(resolve, mockConfig.delay));
    }

    // Create mock response
    const responseBody =
      typeof mockConfig.body === 'string'
        ? mockConfig.body
        : JSON.stringify(mockConfig.body ?? {});

    const response = new Response(responseBody, {
      status: mockConfig.status ?? 200,
      statusText: mockConfig.statusText ?? 'OK',
      headers: new Headers(mockConfig.headers ?? {}),
    });

    return response;
  }

  // Convenience methods for common HTTP verbs
  async get(
    url: string,
    options?: { headers?: Record<string, string>; signal?: AbortSignal }
  ): Promise<Response> {
    const init: RequestInit = { method: 'GET' };
    if (options?.headers) init.headers = options.headers;
    if (options?.signal) init.signal = options.signal;
    return this.request(url, init);
  }

  async post(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string>; signal?: AbortSignal }
  ): Promise<Response> {
    const init: RequestInit = { method: 'POST' };
    if (options?.headers) init.headers = options.headers;
    if (body) init.body = JSON.stringify(body);
    if (options?.signal) init.signal = options.signal;
    return this.request(url, init);
  }

  async put(
    url: string,
    body?: unknown,
    options?: { headers?: Record<string, string>; signal?: AbortSignal }
  ): Promise<Response> {
    const init: RequestInit = { method: 'PUT' };
    if (options?.headers) init.headers = options.headers;
    if (body) init.body = JSON.stringify(body);
    if (options?.signal) init.signal = options.signal;
    return this.request(url, init);
  }

  async delete(
    url: string,
    options?: { headers?: Record<string, string>; signal?: AbortSignal }
  ): Promise<Response> {
    const init: RequestInit = { method: 'DELETE' };
    if (options?.headers) init.headers = options.headers;
    if (options?.signal) init.signal = options.signal;
    return this.request(url, init);
  }

  isOnline(): boolean {
    return this.online;
  }

  watchNetworkStatus(callback: (isOnline: boolean) => void): () => void {
    this.networkStatusListeners.add(callback);
    return () => {
      this.networkStatusListeners.delete(callback);
    };
  }

  // Test helper methods

  /**
   * Set the online status
   */
  setOnline(online: boolean): void {
    this.online = online;
    this.networkStatusListeners.forEach((listener) => listener(online));
  }

  /**
   * Set a mock response for a specific URL
   */
  setMockResponse(url: string, config: MockResponseConfig): void {
    this.mockResponses.set(url, config);
  }

  /**
   * Set the default response for unmocked URLs
   */
  setDefaultResponse(config: MockResponseConfig): void {
    this.defaultResponse = config;
  }

  /**
   * Clear a specific mock response
   */
  clearMockResponse(url: string): void {
    this.mockResponses.delete(url);
  }

  /**
   * Clear all mock responses
   */
  clearAllMockResponses(): void {
    this.mockResponses.clear();
  }

  /**
   * Get all recorded requests
   */
  getRequests(): RecordedRequest[] {
    return [...this.requests];
  }

  /**
   * Get requests to a specific URL
   */
  getRequestsByUrl(url: string): RecordedRequest[] {
    return this.requests.filter((r) => r.url === url);
  }

  /**
   * Get the last request
   */
  getLastRequest(): RecordedRequest | undefined {
    return this.requests[this.requests.length - 1];
  }

  /**
   * Check if a URL was called
   */
  wasUrlCalled(url: string): boolean {
    return this.requests.some((r) => r.url === url);
  }

  /**
   * Get request count for a URL
   */
  getRequestCount(url: string): number {
    return this.requests.filter((r) => r.url === url).length;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.online = true;
    this.requests = [];
    this.mockResponses.clear();
    this.defaultResponse = { status: 200, body: {} };
    this.networkStatusListeners.clear();
  }
}

/**
 * Recorded HTTP request for MockNetworkClient.
 */
export interface RecordedHttpRequest {
  method: string;
  url: string;
  body?: unknown;
  options?: Partial<NetworkRequestOptions>;
  timestamp: number;
}

/**
 * Mock response for MockNetworkClient.
 */
export interface MockHttpResponse<T = unknown> {
  data?: T;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  ok?: boolean;
  error?: Error;
  delay?: number;
}

/**
 * Mock implementation of NetworkClient for testing HTTP requests.
 *
 * @example
 * ```typescript
 * const client = new MockNetworkClient();
 * client.setMockResponse('/api/users', { data: [{ id: 1, name: 'John' }] });
 * const response = await client.get<User[]>('/api/users');
 * expect(response.data).toEqual([{ id: 1, name: 'John' }]);
 * expect(client.getRequests()).toHaveLength(1);
 * ```
 */
export class MockNetworkClient implements NetworkClient {
  private requests: RecordedHttpRequest[] = [];
  private mockResponses: Map<string, MockHttpResponse> = new Map();
  private defaultResponse: MockHttpResponse = {
    data: {},
    status: 200,
    ok: true,
  };
  private latencyMs: number = 0;
  private errorRate: number = 0;
  private offline: boolean = false;

  async request<T = unknown>(
    url: string,
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    const method = options.method ?? 'GET';
    this.requests.push({
      method,
      url,
      body: options.body,
      options,
      timestamp: Date.now(),
    });

    if (this.offline) {
      throw new Error('Network request failed: offline');
    }

    if (this.errorRate > 0 && Math.random() < this.errorRate) {
      throw new Error('Simulated random network error');
    }

    const mockKey = `${method}:${url}`;
    const mockConfig =
      this.mockResponses.get(mockKey) ??
      this.mockResponses.get(url) ??
      this.defaultResponse;

    if (mockConfig.error) {
      throw mockConfig.error;
    }

    const totalDelay = (mockConfig.delay ?? 0) + this.latencyMs;
    if (totalDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }

    return {
      data: mockConfig.data as T,
      status: mockConfig.status ?? 200,
      statusText: mockConfig.statusText ?? 'OK',
      headers: mockConfig.headers ?? {},
      ok: mockConfig.ok ?? true,
      success: mockConfig.ok ?? true,
      timestamp: new Date().toISOString(),
    };
  }

  async get<T = unknown>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<NetworkRequestOptions, 'method'>
  ): Promise<NetworkResponse<T>> {
    const bodyStr =
      typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined;
    return this.request<T>(url, { ...options, method: 'POST', body: bodyStr });
  }

  async put<T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<NetworkRequestOptions, 'method'>
  ): Promise<NetworkResponse<T>> {
    const bodyStr =
      typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined;
    return this.request<T>(url, { ...options, method: 'PUT', body: bodyStr });
  }

  async delete<T = unknown>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  // Test helper methods

  /**
   * Set a mock response for a URL (optionally with method)
   */
  setMockResponse<T = unknown>(
    url: string,
    response: MockHttpResponse<T>,
    method?: string
  ): void {
    const key = method ? `${method}:${url}` : url;
    this.mockResponses.set(key, response as MockHttpResponse);
  }

  /**
   * Set the default response for unmocked URLs
   */
  setDefaultResponse<T = unknown>(response: MockHttpResponse<T>): void {
    this.defaultResponse = response as MockHttpResponse;
  }

  /**
   * Clear a mock response
   */
  clearMockResponse(url: string, method?: string): void {
    const key = method ? `${method}:${url}` : url;
    this.mockResponses.delete(key);
  }

  /**
   * Clear all mock responses
   */
  clearAllMockResponses(): void {
    this.mockResponses.clear();
  }

  /**
   * Get all recorded requests
   */
  getRequests(): RecordedHttpRequest[] {
    return [...this.requests];
  }

  /**
   * Get requests by method
   */
  getRequestsByMethod(method: string): RecordedHttpRequest[] {
    return this.requests.filter((r) => r.method === method);
  }

  /**
   * Get requests to a specific URL
   */
  getRequestsByUrl(url: string): RecordedHttpRequest[] {
    return this.requests.filter((r) => r.url === url);
  }

  /**
   * Get the last request
   */
  getLastRequest(): RecordedHttpRequest | undefined {
    return this.requests[this.requests.length - 1];
  }

  /**
   * Check if a URL was called
   */
  wasUrlCalled(url: string, method?: string): boolean {
    return this.requests.some(
      (r) => r.url === url && (!method || r.method === method)
    );
  }

  /**
   * Set simulated latency added to every request
   * @param ms - Latency in milliseconds (0 to disable)
   */
  setLatency(ms: number): void {
    this.latencyMs = ms;
  }

  /**
   * Set random error rate for requests
   * @param rate - Error probability between 0 (never) and 1 (always)
   */
  setErrorRate(rate: number): void {
    this.errorRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Simulate going offline - all requests will throw
   */
  simulateOffline(): void {
    this.offline = true;
  }

  /**
   * Simulate going back online
   */
  simulateOnline(): void {
    this.offline = false;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.requests = [];
    this.mockResponses.clear();
    this.defaultResponse = { data: {}, status: 200, ok: true };
    this.latencyMs = 0;
    this.errorRate = 0;
    this.offline = false;
  }
}
