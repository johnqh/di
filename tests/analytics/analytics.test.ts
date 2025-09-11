/**
 * Tests for analytics interfaces and implementation compliance
 */

import {
  AnalyticsClient,
  AnalyticsContextProvider,
  AnalyticsEventData,
  AnalyticsEvent,
} from '../../src/analytics/analytics';

// Mock implementations for testing interface compliance
class MockAnalyticsClient implements AnalyticsClient {
  private events: Array<{ event: AnalyticsEvent; parameters?: Record<string, any> }> = [];
  private userProperties: Record<string, any> = {};
  private userId: string | null = null;
  private enabled = true;
  private currentScreen = '';

  trackEvent(event: AnalyticsEvent | AnalyticsEventData): void {
    if (typeof event === 'string') {
      this.events.push({ event });
    } else {
      this.events.push({ event: event.event, parameters: event.parameters });
    }
  }

  setUserProperties(properties: Record<string, any>): void {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setCurrentScreen(screenName: string, screenClass?: string): void {
    this.currentScreen = screenName;
  }

  // Test helper methods
  getEvents() { return this.events; }
  getUserProperties() { return this.userProperties; }
  getUserId() { return this.userId; }
  isEnabled() { return this.enabled; }
  getCurrentScreen() { return this.currentScreen; }
}

class MockAnalyticsContextProvider implements AnalyticsContextProvider {
  private context: Record<string, any> = {};

  getCurrentContext(): Record<string, any> {
    return this.context;
  }

  // Test helper method
  setContext(context: Record<string, any>) {
    this.context = context;
  }
}

describe('AnalyticsClient Interface', () => {
  let client: MockAnalyticsClient;

  beforeEach(() => {
    client = new MockAnalyticsClient();
  });

  test('should track events with AnalyticsEvent enum', () => {
    client.trackEvent(AnalyticsEvent.USER_LOGIN);
    
    const events = client.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe(AnalyticsEvent.USER_LOGIN);
    expect(events[0].parameters).toBeUndefined();
  });

  test('should track events with AnalyticsEventData object', () => {
    const eventData: AnalyticsEventData = {
      event: AnalyticsEvent.EMAIL_SENT,
      parameters: {
        recipient: 'test@example.com',
        subject: 'Test Email',
      },
    };

    client.trackEvent(eventData);
    
    const events = client.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe(AnalyticsEvent.EMAIL_SENT);
    expect(events[0].parameters).toEqual({
      recipient: 'test@example.com',
      subject: 'Test Email',
    });
  });

  test('should set user properties', () => {
    const properties = {
      plan: 'premium',
      region: 'us-east-1',
      feature_flag_beta: true,
    };

    client.setUserProperties(properties);
    
    expect(client.getUserProperties()).toEqual(properties);
  });

  test('should merge user properties on multiple calls', () => {
    client.setUserProperties({ plan: 'premium' });
    client.setUserProperties({ region: 'us-east-1' });
    
    expect(client.getUserProperties()).toEqual({
      plan: 'premium',
      region: 'us-east-1',
    });
  });

  test('should set user ID', () => {
    client.setUserId('user-123');
    expect(client.getUserId()).toBe('user-123');
    
    client.setUserId(null);
    expect(client.getUserId()).toBeNull();
  });

  test('should enable/disable analytics', () => {
    expect(client.isEnabled()).toBe(true);
    
    client.setAnalyticsEnabled(false);
    expect(client.isEnabled()).toBe(false);
    
    client.setAnalyticsEnabled(true);
    expect(client.isEnabled()).toBe(true);
  });

  test('should set current screen', () => {
    client.setCurrentScreen('HomeScreen');
    expect(client.getCurrentScreen()).toBe('HomeScreen');
    
    client.setCurrentScreen('ProfileScreen', 'UserProfile');
    expect(client.getCurrentScreen()).toBe('ProfileScreen');
  });
});

describe('AnalyticsContextProvider Interface', () => {
  let provider: MockAnalyticsContextProvider;

  beforeEach(() => {
    provider = new MockAnalyticsContextProvider();
  });

  test('should provide current context', () => {
    const context = {
      userId: 'user-123',
      sessionId: 'session-456',
      version: '1.0.0',
    };
    
    provider.setContext(context);
    expect(provider.getCurrentContext()).toEqual(context);
  });

  test('should return empty object when no context is set', () => {
    expect(provider.getCurrentContext()).toEqual({});
  });
});

describe('AnalyticsEventData Interface', () => {
  test('should be properly typed', () => {
    const eventData: AnalyticsEventData = {
      event: AnalyticsEvent.PAGE_VIEW,
      parameters: {
        page_title: 'Home',
        page_url: '/home',
        user_id: 'user-123',
      },
    };

    expect(eventData.event).toBe(AnalyticsEvent.PAGE_VIEW);
    expect(eventData.parameters?.page_title).toBe('Home');
    expect(eventData.parameters?.page_url).toBe('/home');
  });

  test('should work without parameters', () => {
    const eventData: AnalyticsEventData = {
      event: AnalyticsEvent.USER_LOGOUT,
    };

    expect(eventData.event).toBe(AnalyticsEvent.USER_LOGOUT);
    expect(eventData.parameters).toBeUndefined();
  });
});

describe('Analytics Interface Integration', () => {
  test('should work together in a complete analytics flow', () => {
    const client = new MockAnalyticsClient();
    const contextProvider = new MockAnalyticsContextProvider();

    // Set up context
    contextProvider.setContext({
      userId: 'user-123',
      sessionId: 'session-456',
    });

    // Set up analytics client
    client.setUserId('user-123');
    client.setUserProperties({ plan: 'premium' });
    client.setCurrentScreen('Dashboard');

    // Track an event with context
    const context = contextProvider.getCurrentContext();
    const eventData: AnalyticsEventData = {
      event: AnalyticsEvent.PAGE_VIEW,
      parameters: {
        ...context,
        page_name: 'Dashboard',
      },
    };

    client.trackEvent(eventData);

    // Verify the complete flow
    const events = client.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe(AnalyticsEvent.PAGE_VIEW);
    expect(events[0].parameters).toEqual({
      userId: 'user-123',
      sessionId: 'session-456',
      page_name: 'Dashboard',
    });

    expect(client.getUserId()).toBe('user-123');
    expect(client.getUserProperties()).toEqual({ plan: 'premium' });
    expect(client.getCurrentScreen()).toBe('Dashboard');
  });
});