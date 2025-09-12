# Analytics Implementation Example

This example shows how to implement the analytics interfaces for different platforms and providers.

## Basic Analytics Service Implementation

### Firebase Analytics Implementation

```typescript
import { 
  AnalyticsService, 
  AnalyticsConfig, 
  AnalyticsEvent, 
  AnalyticsEventProperties 
} from '@johnqh/di';
import { analytics } from 'firebase/analytics';
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';

/**
 * Firebase Analytics implementation of AnalyticsService
 * 
 * @ai-implementation Firebase Analytics service provider
 * @ai-platform Web and React Native (with Firebase SDK)
 */
class FirebaseAnalyticsService implements AnalyticsService {
  private analytics: Analytics | null = null;
  private enabled = true;

  async initialize(config: AnalyticsConfig): Promise<void> {
    try {
      // Initialize Firebase Analytics
      this.analytics = getAnalytics();
      this.enabled = config.enabled;
      
      if (config.userId) {
        await this.setUserId(config.userId);
      }
      
      console.log('Firebase Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Analytics:', error);
      throw error;
    }
  }

  trackEvent(event: AnalyticsEvent | string, properties?: AnalyticsEventProperties): void {
    if (!this.analytics || !this.enabled) return;

    try {
      logEvent(this.analytics, event, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  setUserProperty(key: string, value: string): void {
    if (!this.analytics || !this.enabled) return;

    const properties = { [key]: value };
    setUserProperties(this.analytics, properties);
  }

  setUserId(userId: string): void {
    if (!this.analytics || !this.enabled) return;

    setUserId(this.analytics, userId);
  }

  setUserProperties(properties: Record<string, string>): void {
    if (!this.analytics || !this.enabled) return;

    setUserProperties(this.analytics, properties);
  }

  trackScreen(screenName: string, properties?: AnalyticsEventProperties): void {
    this.trackEvent(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties
    });
  }

  trackError(error: Error, context?: AnalyticsEventProperties): void {
    this.trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }

  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.trackEvent('timing', {
      category,
      variable,
      time,
      label
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  resetUser(): void {
    if (!this.analytics) return;
    
    setUserId(this.analytics, null);
    // Clear user properties by setting them to null
    setUserProperties(this.analytics, {});
  }
}
```

### Mixpanel Analytics Implementation

```typescript
import { AnalyticsService, AnalyticsConfig, AnalyticsEvent, AnalyticsEventProperties } from '@johnqh/di';

/**
 * Mixpanel Analytics implementation
 * 
 * @ai-implementation Mixpanel analytics service provider
 * @ai-platform Web (with Mixpanel SDK)
 */
class MixpanelAnalyticsService implements AnalyticsService {
  private mixpanel: any = null;
  private enabled = true;

  async initialize(config: AnalyticsConfig): Promise<void> {
    // Dynamic import for Mixpanel
    const mixpanelLib = await import('mixpanel-browser');
    
    this.mixpanel = mixpanelLib.init(config.apiKey!, {
      debug: config.debugMode,
      track_pageview: false
    });
    
    this.enabled = config.enabled;
    
    if (config.userId) {
      this.setUserId(config.userId);
    }
  }

  trackEvent(event: AnalyticsEvent | string, properties?: AnalyticsEventProperties): void {
    if (!this.mixpanel || !this.enabled) return;

    this.mixpanel.track(event, properties);
  }

  setUserProperty(key: string, value: string): void {
    if (!this.mixpanel || !this.enabled) return;

    this.mixpanel.people.set({ [key]: value });
  }

  setUserId(userId: string): void {
    if (!this.mixpanel || !this.enabled) return;

    this.mixpanel.identify(userId);
  }

  setUserProperties(properties: Record<string, string>): void {
    if (!this.mixpanel || !this.enabled) return;

    this.mixpanel.people.set(properties);
  }

  trackScreen(screenName: string, properties?: AnalyticsEventProperties): void {
    this.trackEvent(AnalyticsEvent.PAGE_VIEW, {
      page_name: screenName,
      ...properties
    });
  }

  trackError(error: Error, context?: AnalyticsEventProperties): void {
    this.trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
      error: error.message,
      ...context
    });
  }

  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.trackEvent('timing_event', {
      category,
      variable,
      duration: time,
      label
    });
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  resetUser(): void {
    if (!this.mixpanel) return;
    
    this.mixpanel.reset();
  }
}
```

## Email Analytics Implementation

```typescript
import { 
  EmailAnalyticsService, 
  AnalyticsEvent, 
  AnalyticsEventProperties,
  AnalyticsEventBuilder 
} from '@johnqh/di';

/**
 * Email-specific analytics implementation extending base analytics
 * 
 * @ai-implementation Email application analytics with domain-specific methods
 * @ai-domain Email client and communication applications
 */
class EmailAnalyticsProvider extends FirebaseAnalyticsService implements EmailAnalyticsService {
  
  trackEmailAction(action: string, emailId: string, properties?: AnalyticsEventProperties): void {
    const emailProperties = AnalyticsEventBuilder.emailAction(action, emailId);
    
    this.trackEvent(AnalyticsEvent.EMAIL_CLICKED, {
      ...emailProperties,
      ...properties
    });
  }

  trackNavigation(from: string, to: string, properties?: AnalyticsEventProperties): void {
    this.trackEvent('navigation', {
      from_screen: from,
      to_screen: to,
      navigation_type: 'user_initiated',
      ...properties
    });
  }

  trackSubscription(action: string, planType?: string, properties?: AnalyticsEventProperties): void {
    const subscriptionProperties = AnalyticsEventBuilder.subscription(action, planType);
    
    this.trackEvent('subscription_event', {
      ...subscriptionProperties,
      ...properties
    });
  }

  trackSearch(query: string, resultsCount: number, properties?: AnalyticsEventProperties): void {
    this.trackEvent('search', {
      search_query: query,
      results_count: resultsCount,
      search_context: 'email',
      ...properties
    });
  }

  trackABTest(testName: string, variant: string, action: 'viewed' | 'converted', conversionType?: string): void {
    this.trackEvent('ab_test_interaction', {
      test_name: testName,
      variant,
      action,
      conversion_type: conversionType,
      timestamp: Date.now()
    });
  }
}
```

## Usage Example with Dependency Injection

```typescript
import { AnalyticsService } from '@johnqh/di';

/**
 * Service container for dependency injection
 */
class ServiceContainer {
  private analytics: AnalyticsService | null = null;

  async initializeAnalytics(provider: 'firebase' | 'mixpanel', config: AnalyticsConfig) {
    switch (provider) {
      case 'firebase':
        this.analytics = new FirebaseAnalyticsService();
        break;
      case 'mixpanel':
        this.analytics = new MixpanelAnalyticsService();
        break;
    }

    if (this.analytics) {
      await this.analytics.initialize(config);
    }
  }

  getAnalytics(): AnalyticsService {
    if (!this.analytics) {
      throw new Error('Analytics service not initialized');
    }
    return this.analytics;
  }
}

// Usage in application
const container = new ServiceContainer();

await container.initializeAnalytics('firebase', {
  enabled: true,
  debugMode: process.env.NODE_ENV === 'development',
  apiKey: 'your-firebase-config-key'
});

const analytics = container.getAnalytics();

// Track user events
analytics.trackEvent(AnalyticsEvent.USER_LOGIN, { method: 'email' });
analytics.trackEvent(AnalyticsEvent.EMAIL_OPENED, { email_id: 'msg-123' });
```

## React Hook Pattern

```typescript
import { useContext, createContext } from 'react';
import { AnalyticsService } from '@johnqh/di';

// Create analytics context
const AnalyticsContext = createContext<AnalyticsService | null>(null);

// Provider component
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [analytics] = useState<AnalyticsService>(() => {
    const service = new FirebaseAnalyticsService();
    // Initialize async
    service.initialize({
      enabled: true,
      debugMode: false,
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY!
    });
    return service;
  });

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook for using analytics
export const useAnalytics = () => {
  const analytics = useContext(AnalyticsContext);
  if (!analytics) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return analytics;
};

// Usage in components
function LoginComponent() {
  const analytics = useAnalytics();

  const handleLogin = () => {
    // Track login event
    analytics.trackEvent(AnalyticsEvent.USER_LOGIN, {
      method: 'email',
      timestamp: Date.now()
    });
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

This example demonstrates how to implement analytics services while maintaining type safety and cross-platform compatibility. The interfaces ensure consistent API surface across different analytics providers.