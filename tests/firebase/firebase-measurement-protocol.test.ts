import { describe, expect, it, vi } from 'vitest';
import {
  MeasurementProtocolAnalyticsService,
  MEASUREMENT_PROTOCOL_CLIENT_ID_KEY,
  MEASUREMENT_PROTOCOL_DEBUG_ENDPOINT,
  MEASUREMENT_PROTOCOL_ENDPOINT,
  type MeasurementProtocolStorage,
} from '../../src/firebase/firebase.measurement-protocol';
import { FirebaseAnalyticsService } from '../../src/firebase/firebase-analytics';
import { hashUserIdForAnalytics } from '../../src/firebase/firebase-utils';

type Sent = { url: string; body: Record<string, any> };

function setup(
  overrides: Partial<
    ConstructorParameters<typeof MeasurementProtocolAnalyticsService>[0]
  > = {}
) {
  const sent: Sent[] = [];
  let clock = 1_700_000_000_000;
  const fetch = vi.fn(async (url: string, init: { body: string }) => {
    sent.push({ url, body: JSON.parse(init.body) });
    return new Response('{}');
  });
  const service = new MeasurementProtocolAnalyticsService({
    measurementId: 'G-TEST',
    apiSecret: 'secret',
    fetch: fetch as unknown as typeof globalThis.fetch,
    now: () => clock,
    ...overrides,
  });
  return {
    service,
    sent,
    fetch,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  const storage: MeasurementProtocolStorage = {
    getItem: vi.fn(async (key: string) => data[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      data[key] = value;
    }),
  };
  return { storage, data };
}

describe('MeasurementProtocolAnalyticsService', () => {
  it('is supported only with both a measurement id and an API secret', () => {
    expect(setup().service.isSupported()).toBe(true);
    expect(setup({ apiSecret: '' }).service.isSupported()).toBe(false);
    expect(setup({ measurementId: '' }).service.isSupported()).toBe(false);
  });

  it('sends nothing when not configured', async () => {
    const { service, fetch } = setup({ apiSecret: '' });
    service.logEvent('screen_view', { screen_name: 'Home' });
    await service.flush();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('posts queued events together to the collect endpoint for its stream', async () => {
    const { service, sent } = setup();
    service.logEvent('screen_view', { screen_name: 'Home' });
    service.logEvent('button_click_save', { button_name: 'save' });
    await service.flush();
    expect(sent).toHaveLength(1);
    expect(sent[0]!.url).toBe(
      `${MEASUREMENT_PROTOCOL_ENDPOINT}?measurement_id=G-TEST&api_secret=secret`
    );
    expect(sent[0]!.body.events.map((e: { name: string }) => e.name)).toEqual([
      'screen_view',
      'button_click_save',
    ]);
    expect(sent[0]!.body.client_id).toMatch(/^\d+\.\d+$/);
  });

  it('sends on its own after the flush interval', async () => {
    vi.useFakeTimers();
    try {
      const { service, fetch } = setup({ flushIntervalMs: 500 });
      service.logEvent('screen_view');
      expect(fetch).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(500);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('gives every event a session and engagement time, so GA counts users', async () => {
    const { service, sent } = setup();
    service.logEvent('screen_view');
    await service.flush();
    const params = sent[0]!.body.events[0].params;
    expect(params.session_id).toBe(1_700_000_000);
    expect(params.engagement_time_msec).toBeGreaterThan(0);
  });

  it('starts a new session after 30 minutes without an event, and not before', async () => {
    const { service, sent, advance } = setup();
    service.logEvent('a');
    advance(29 * 60 * 1000);
    service.logEvent('b');
    advance(31 * 60 * 1000);
    service.logEvent('c');
    await service.flush();
    const ids = sent[0]!.body.events.map(
      (e: { params: { session_id: number } }) => e.params.session_id
    );
    expect(ids[0]).toBe(ids[1]);
    expect(ids[2]).toBeGreaterThan(ids[1]);
  });

  it('keeps the client id in storage, so a relaunch is the same user', async () => {
    const { storage, data } = memoryStorage();
    const first = setup({ storage });
    first.service.logEvent('a');
    await first.service.flush();
    const id = first.sent[0]!.body.client_id;
    expect(data[MEASUREMENT_PROTOCOL_CLIENT_ID_KEY]).toBe(id);

    const second = setup({ storage });
    second.service.logEvent('b');
    await second.service.flush();
    expect(second.sent[0]!.body.client_id).toBe(id);
  });

  it('still sends when storage fails', async () => {
    const storage: MeasurementProtocolStorage = {
      getItem: async () => {
        throw new Error('no storage');
      },
      setItem: async () => {
        throw new Error('no storage');
      },
    };
    const { service, sent } = setup({ storage });
    service.logEvent('a');
    await service.flush();
    expect(sent).toHaveLength(1);
  });

  it('sends the user id hashed, as the web backend does', async () => {
    const { service, sent } = setup();
    service.setUserId('firebase-uid');
    service.logEvent('a');
    await service.flush();
    const hashed = hashUserIdForAnalytics('firebase-uid');
    expect(sent[0]!.body.user_id).toBe(hashed);
    expect(sent[0]!.body.user_properties).toEqual({
      user_hash: { value: hashed },
    });
  });

  it('makes names and values fit GA4: valid names, strings cut, nothing undefined', async () => {
    const { service, sent } = setup();
    service.logEvent('button_click_sign-in', {
      'file-size': 10,
      long: 'x'.repeat(150),
      flag: true,
      missing: undefined,
      empty: null,
      nested: { a: 1 },
    });
    await service.flush();
    const event = sent[0]!.body.events[0];
    expect(event.name).toBe('button_click_sign_in');
    expect(event.params.file_size).toBe(10);
    expect(event.params.long).toHaveLength(100);
    expect(event.params.flag).toBe('true');
    expect(event.params.nested).toBe('{"a":1}');
    expect('missing' in event.params).toBe(false);
    expect('empty' in event.params).toBe(false);
  });

  it('keeps at most 25 parameters an event, the session pair included', async () => {
    const { service, sent } = setup();
    const many = Object.fromEntries(
      Array.from({ length: 40 }, (_, i) => [`p${i}`, i])
    );
    service.logEvent('a', many);
    await service.flush();
    expect(Object.keys(sent[0]!.body.events[0].params)).toHaveLength(25);
  });

  it('sends at most 25 events a request', async () => {
    const { service, sent } = setup();
    for (let i = 0; i < 30; i++) service.logEvent(`e${i}`);
    await service.flush();
    expect(sent.map((s) => s.body.events.length)).toEqual([25, 5]);
  });

  it('never throws when the network fails', async () => {
    const { service } = setup({
      fetch: (async () => {
        throw new Error('offline');
      }) as unknown as typeof globalThis.fetch,
    });
    service.logEvent('a');
    await expect(service.flush()).resolves.toBeUndefined();
  });

  it('uses the validation endpoint in debug mode', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const { service, sent } = setup({ debug: true });
      service.logEvent('a');
      await service.flush();
      expect(sent[0]!.url.startsWith(MEASUREMENT_PROTOCOL_DEBUG_ENDPOINT)).toBe(
        true
      );
    } finally {
      log.mockRestore();
    }
  });

  it('works under FirebaseAnalyticsService, as the phones use it', async () => {
    const { service, sent } = setup();
    const analytics = new FirebaseAnalyticsService(() => service);
    analytics.trackScreenView('SettingsScreen');
    analytics.trackButtonClick('sign_out');
    await service.flush();
    const events = sent[0]!.body.events;
    expect(events[0].name).toBe('screen_view');
    expect(events[0].params.screen_name).toBe('SettingsScreen');
    expect(events[1].name).toBe('button_click_sign_out');
  });
});
