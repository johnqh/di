/**
 * Tests for network interfaces and type validation
 */

import {
  NetworkClient,
  NetworkRequestOptions,
  NetworkResponse,
} from '@sudobility/types';

// Mock implementation for testing interface compliance
class MockNetworkClient implements NetworkClient {
  private mockResponses: Map<string, NetworkResponse<any>> = new Map();
  private requestHistory: Array<{ url: string; options?: NetworkRequestOptions }> = [];

  async request<T = any>(
    url: string,
    options?: NetworkRequestOptions
  ): Promise<NetworkResponse<T>> {
    this.requestHistory.push({ url, options });

    const mockResponse = this.mockResponses.get(url);
    if (mockResponse) {
      return mockResponse as NetworkResponse<T>;
    }

    // Default response for unmocked URLs
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      data: { message: 'Mock response' } as T,
      headers: { 'content-type': 'application/json' },
    };
  }

  async get<T = any>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  async put<T = any>(
    url: string,
    data?: any,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  async delete<T = any>(
    url: string,
    options?: Omit<NetworkRequestOptions, 'method'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  async patch<T = any>(
    url: string,
    data?: any,
    options?: Omit<NetworkRequestOptions, 'method' | 'body'>
  ): Promise<NetworkResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }

  // Test helper methods
  setMockResponse(url: string, response: NetworkResponse<any>) {
    this.mockResponses.set(url, response);
  }

  getRequestHistory() {
    return this.requestHistory;
  }

  clearHistory() {
    this.requestHistory = [];
  }
}

describe('NetworkClient Interface', () => {
  let client: MockNetworkClient;

  beforeEach(() => {
    client = new MockNetworkClient();
  });

  test('should make basic GET requests', async () => {
    const response = await client.request('https://api.example.com/users');

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    expect(response.data).toEqual({ message: 'Mock response' });
    expect(response.headers).toEqual({ 'content-type': 'application/json' });
  });

  test('should make requests with options', async () => {
    const options: NetworkRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123',
      },
      body: JSON.stringify({ name: 'John Doe' }),
      timeout: 5000,
    };

    await client.request('https://api.example.com/users', options);

    const history = client.getRequestHistory();
    expect(history).toHaveLength(1);
    expect(history[0].url).toBe('https://api.example.com/users');
    expect(history[0].options).toEqual(options);
  });

  test('should handle different HTTP methods', async () => {
    const methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'> = [
      'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
    ];

    for (const method of methods) {
      await client.request(`https://api.example.com/${method.toLowerCase()}`, { method });
    }

    const history = client.getRequestHistory();
    expect(history).toHaveLength(5);
    
    methods.forEach((method, index) => {
      expect(history[index].options?.method).toBe(method);
    });
  });

  test('should handle request body with different types', async () => {
    // String body
    await client.request('https://api.example.com/string', {
      method: 'POST',
      body: 'plain text',
    });

    // FormData body (mocked)
    const formData = new FormData();
    formData.append('file', 'test-content');
    await client.request('https://api.example.com/form', {
      method: 'POST',
      body: formData,
    });

    const history = client.getRequestHistory();
    expect(history).toHaveLength(2);
    expect(history[0].options?.body).toBe('plain text');
    expect(history[1].options?.body).toBeInstanceOf(FormData);
  });

  test('should handle custom headers', async () => {
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': 'api-key-123',
      'User-Agent': 'TestClient/1.0',
    };

    await client.request('https://api.example.com/data', { headers });

    const history = client.getRequestHistory();
    expect(history[0].options?.headers).toEqual(headers);
  });

  test('should handle abort signals', async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    await client.request('https://api.example.com/data', { signal });

    const history = client.getRequestHistory();
    expect(history[0].options?.signal).toBe(signal);
  });

  test('should handle timeout option', async () => {
    await client.request('https://api.example.com/data', { timeout: 10000 });

    const history = client.getRequestHistory();
    expect(history[0].options?.timeout).toBe(10000);
  });
});

describe('NetworkRequestOptions Interface', () => {
  test('should be properly typed', () => {
    const options: NetworkRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      },
      body: JSON.stringify({ test: 'data' }),
      timeout: 5000,
    };

    expect(options.method).toBe('POST');
    expect(options.headers?.['Content-Type']).toBe('application/json');
    expect(options.timeout).toBe(5000);
  });

  test('should work with minimal options', () => {
    const options: NetworkRequestOptions = {};
    expect(options).toBeDefined();
  });

  test('should support all HTTP methods', () => {
    const methods: Array<NetworkRequestOptions['method']> = [
      'GET', 'POST', 'PUT', 'DELETE', 'PATCH'
    ];

    methods.forEach(method => {
      const options: NetworkRequestOptions = { method };
      expect(options.method).toBe(method);
    });
  });
});

describe('NetworkResponse Interface', () => {
  test('should be properly typed', () => {
    const response: NetworkResponse<{ id: number; name: string }> = {
      ok: true,
      status: 200,
      statusText: 'OK',
      data: { id: 1, name: 'John Doe' },
      headers: { 'content-type': 'application/json' },
    };

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(1);
    expect(response.data.name).toBe('John Doe');
  });

  test('should handle error responses', () => {
    const errorResponse: NetworkResponse<null> = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      data: null,
      headers: { 'content-type': 'text/plain' },
    };

    expect(errorResponse.ok).toBe(false);
    expect(errorResponse.status).toBe(404);
    expect(errorResponse.data).toBeNull();
  });

  test('should work with any data type', () => {
    const stringResponse: NetworkResponse<string> = {
      ok: true,
      status: 200,
      statusText: 'OK',
      data: 'plain text response',
      headers: { 'content-type': 'text/plain' },
    };

    const arrayResponse: NetworkResponse<number[]> = {
      ok: true,
      status: 200,
      statusText: 'OK',
      data: [1, 2, 3, 4, 5],
      headers: { 'content-type': 'application/json' },
    };

    expect(stringResponse.data).toBe('plain text response');
    expect(arrayResponse.data).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Network Interface Integration', () => {
  test('should work in a complete HTTP client scenario', async () => {
    const client = new MockNetworkClient();

    // Mock a successful response
    client.setMockResponse('https://api.example.com/users/1', {
      ok: true,
      status: 200,
      statusText: 'OK',
      data: { id: 1, name: 'John Doe', email: 'john@example.com' },
      headers: { 'content-type': 'application/json' },
    });

    // Mock an error response
    client.setMockResponse('https://api.example.com/users/999', {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      data: { error: 'User not found' },
      headers: { 'content-type': 'application/json' },
    });

    // Test successful request
    const successResponse = await client.request('https://api.example.com/users/1');
    expect(successResponse.ok).toBe(true);
    expect(successResponse.data).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });

    // Test error request
    const errorResponse = await client.request('https://api.example.com/users/999');
    expect(errorResponse.ok).toBe(false);
    expect(errorResponse.status).toBe(404);
    expect(errorResponse.data.error).toBe('User not found');

    // Verify request history
    const history = client.getRequestHistory();
    expect(history).toHaveLength(2);
    expect(history[0].url).toBe('https://api.example.com/users/1');
    expect(history[1].url).toBe('https://api.example.com/users/999');
  });
});