/**
 * Mock implementations for network interfaces.
 *
 * @ai-context Test mocks for PlatformNetwork
 * @ai-usage Use in unit tests to mock network requests
 */

import type { PlatformNetwork } from '../network/platform-network.js';

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

  async request(url: string, options: RequestInit): Promise<Response> {
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
