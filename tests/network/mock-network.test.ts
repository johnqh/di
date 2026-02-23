import { describe, it, expect, beforeEach } from 'vitest';
import { MockNetworkClient } from '../../src/mocks/network.mock.js';

describe('MockNetworkClient enhanced capabilities', () => {
  let client: MockNetworkClient;

  beforeEach(() => {
    client = new MockNetworkClient();
  });

  describe('simulateOffline / simulateOnline', () => {
    it('should throw when offline', async () => {
      client.simulateOffline();
      await expect(client.get('/api/test')).rejects.toThrow(
        'Network request failed: offline'
      );
    });

    it('should work again after simulateOnline', async () => {
      client.simulateOffline();
      client.simulateOnline();
      const response = await client.get('/api/test');
      expect(response.ok).toBe(true);
    });

    it('should throw for all HTTP methods when offline', async () => {
      client.simulateOffline();
      await expect(client.get('/api/test')).rejects.toThrow('offline');
      await expect(client.post('/api/test', {})).rejects.toThrow('offline');
      await expect(client.put('/api/test', {})).rejects.toThrow('offline');
      await expect(client.delete('/api/test')).rejects.toThrow('offline');
    });
  });

  describe('setLatency', () => {
    it('should add delay to requests', async () => {
      client.setLatency(50);
      const start = Date.now();
      await client.get('/api/test');
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(40);
    });

    it('should combine with per-response delay', async () => {
      client.setLatency(30);
      client.setMockResponse('/api/test', { data: 'ok', delay: 30 });
      const start = Date.now();
      await client.get('/api/test');
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(50);
    });
  });

  describe('setErrorRate', () => {
    it('should not throw when error rate is 0', async () => {
      client.setErrorRate(0);
      for (let i = 0; i < 10; i++) {
        const response = await client.get('/api/test');
        expect(response.ok).toBe(true);
      }
    });

    it('should always throw when error rate is 1', async () => {
      client.setErrorRate(1);
      await expect(client.get('/api/test')).rejects.toThrow(
        'Simulated random network error'
      );
    });

    it('should clamp error rate to [0, 1]', async () => {
      client.setErrorRate(-0.5);
      // Should not throw since rate is clamped to 0
      await expect(client.get('/api/test')).resolves.toBeDefined();

      client.setErrorRate(1.5);
      // Should always throw since rate is clamped to 1
      await expect(client.get('/api/test')).rejects.toThrow();
    });
  });

  describe('reset', () => {
    it('should clear all enhanced settings', async () => {
      client.simulateOffline();
      client.setLatency(100);
      client.setErrorRate(1);
      client.setMockResponse('/api/test', { data: 'custom' });
      await expect(client.get('/api/test')).rejects.toThrow();

      client.reset();

      const response = await client.get('/api/test');
      expect(response.ok).toBe(true);
      expect(client.getRequests()).toHaveLength(1);
    });
  });
});
