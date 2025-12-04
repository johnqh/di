/**
 * Mock implementations for navigation interfaces.
 *
 * @ai-context Test mocks for NavigationService, NavigationHook, LocationHook
 * @ai-usage Use in unit tests to mock navigation and routing
 */

import type { Optional } from '@sudobility/types';
import type {
  NavigationService,
  NavigationOptions,
  NavigationState,
  NavigationHook,
  LocationHook,
} from '../navigation/navigation.js';

/**
 * Recorded navigation event for testing assertions.
 */
export interface RecordedNavigation {
  type: 'navigate' | 'goBack' | 'goForward' | 'replace';
  path?: string | undefined;
  options?: NavigationOptions | undefined;
  timestamp: number;
}

/**
 * Mock implementation of NavigationService for testing.
 *
 * @example
 * ```typescript
 * const nav = new MockNavigationService();
 * nav.navigate('/home');
 * expect(nav.getCurrentPath()).toBe('/home');
 * expect(nav.getNavigationHistory()).toHaveLength(1);
 * ```
 */
export class MockNavigationService implements NavigationService {
  private history: string[] = ['/'];
  private historyIndex: number = 0;
  private params: Record<string, string> = {};
  private searchParams: Record<string, string> = {};
  private state: unknown = null;
  private listeners: Set<(state: NavigationState) => void> = new Set();
  private supported: boolean = true;
  private navigationEvents: RecordedNavigation[] = [];

  navigate(path: string, options?: Optional<NavigationOptions>): void {
    this.navigationEvents.push({
      type: 'navigate',
      path,
      options: options ?? undefined,
      timestamp: Date.now(),
    });

    if (options?.replace) {
      this.history[this.historyIndex] = path;
    } else {
      // Remove forward history if we're not at the end
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(path);
      this.historyIndex = this.history.length - 1;
    }

    if (options?.state !== undefined) {
      this.state = options.state;
    }

    this.notifyListeners();
  }

  goBack(fallbackPath?: Optional<string>): void {
    this.navigationEvents.push({
      type: 'goBack',
      path: fallbackPath ?? undefined,
      timestamp: Date.now(),
    });

    if (this.historyIndex > 0) {
      this.historyIndex--;
    } else if (fallbackPath) {
      this.navigate(fallbackPath);
      return;
    }

    this.notifyListeners();
  }

  goForward(): void {
    this.navigationEvents.push({
      type: 'goForward',
      timestamp: Date.now(),
    });

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
    }

    this.notifyListeners();
  }

  replace(path: string, options?: Optional<NavigationOptions>): void {
    this.navigationEvents.push({
      type: 'replace',
      path,
      options: options ?? undefined,
      timestamp: Date.now(),
    });

    this.history[this.historyIndex] = path;

    if (options?.state !== undefined) {
      this.state = options.state;
    }

    this.notifyListeners();
  }

  getCurrentState(): NavigationState {
    const state: NavigationState = {
      currentPath: this.history[this.historyIndex] ?? '/',
      params: { ...this.params },
      searchParams: { ...this.searchParams },
    };
    if (this.historyIndex > 0) {
      state.previousPath = this.history[this.historyIndex - 1];
    }
    return state;
  }

  getCurrentPath(): string {
    return this.history[this.historyIndex] ?? '/';
  }

  getSearchParams(): Record<string, string> {
    return { ...this.searchParams };
  }

  getParams(): Record<string, string> {
    return { ...this.params };
  }

  canGoBack(): boolean {
    return this.historyIndex > 0;
  }

  canGoForward(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  addListener(listener: (state: NavigationState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  isSupported(): boolean {
    return this.supported;
  }

  private notifyListeners(): void {
    const state = this.getCurrentState();
    this.listeners.forEach((listener) => listener(state));
  }

  // Test helper methods

  /**
   * Set path parameters for testing
   */
  setParams(params: Record<string, string>): void {
    this.params = params;
  }

  /**
   * Set search parameters for testing
   */
  setSearchParams(searchParams: Record<string, string>): void {
    this.searchParams = searchParams;
  }

  /**
   * Set navigation state for testing
   */
  setState(state: unknown): void {
    this.state = state;
  }

  /**
   * Get the current navigation state
   */
  getState(): unknown {
    return this.state;
  }

  /**
   * Set supported flag for testing
   */
  setSupported(supported: boolean): void {
    this.supported = supported;
  }

  /**
   * Get all navigation events
   */
  getNavigationHistory(): RecordedNavigation[] {
    return [...this.navigationEvents];
  }

  /**
   * Get the full URL history
   */
  getUrlHistory(): string[] {
    return [...this.history];
  }

  /**
   * Get the current history index
   */
  getHistoryIndex(): number {
    return this.historyIndex;
  }

  /**
   * Get the number of registered listeners
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.history = ['/'];
    this.historyIndex = 0;
    this.params = {};
    this.searchParams = {};
    this.state = null;
    this.listeners.clear();
    this.supported = true;
    this.navigationEvents = [];
  }
}

/**
 * Mock implementation of NavigationHook for testing.
 *
 * @example
 * ```typescript
 * const hook = new MockNavigationHook();
 * hook.navigate('/dashboard');
 * expect(hook.currentPath).toBe('/dashboard');
 * ```
 */
export class MockNavigationHook implements NavigationHook {
  currentPath: string = '/';
  searchParams: Record<string, string> = {};
  params: Record<string, string> = {};
  canGoBack: boolean = false;
  isSupported: boolean = true;

  private navigationHistory: RecordedNavigation[] = [];

  navigate = (path: string, options?: Optional<NavigationOptions>): void => {
    this.navigationHistory.push({
      type: 'navigate',
      path,
      options: options ?? undefined,
      timestamp: Date.now(),
    });
    this.currentPath = path;
    this.canGoBack = true;
  };

  goBack = (fallbackPath?: Optional<string>): void => {
    this.navigationHistory.push({
      type: 'goBack',
      path: fallbackPath ?? undefined,
      timestamp: Date.now(),
    });
    this.canGoBack = false;
  };

  replace = (path: string, options?: Optional<NavigationOptions>): void => {
    this.navigationHistory.push({
      type: 'replace',
      path,
      options: options ?? undefined,
      timestamp: Date.now(),
    });
    this.currentPath = path;
  };

  // Test helper methods

  /**
   * Set current path for testing
   */
  setCurrentPath(path: string): void {
    this.currentPath = path;
  }

  /**
   * Set search params for testing
   */
  setSearchParams(params: Record<string, string>): void {
    this.searchParams = params;
  }

  /**
   * Set path params for testing
   */
  setParams(params: Record<string, string>): void {
    this.params = params;
  }

  /**
   * Set canGoBack for testing
   */
  setCanGoBack(canGoBack: boolean): void {
    this.canGoBack = canGoBack;
  }

  /**
   * Set isSupported for testing
   */
  setIsSupported(supported: boolean): void {
    this.isSupported = supported;
  }

  /**
   * Get navigation history
   */
  getNavigationHistory(): RecordedNavigation[] {
    return [...this.navigationHistory];
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.currentPath = '/';
    this.searchParams = {};
    this.params = {};
    this.canGoBack = false;
    this.isSupported = true;
    this.navigationHistory = [];
  }
}

/**
 * Mock implementation of LocationHook for testing.
 *
 * @example
 * ```typescript
 * const location = new MockLocationHook('/users?page=1#section');
 * expect(location.pathname).toBe('/users');
 * expect(location.search).toBe('?page=1');
 * expect(location.hash).toBe('#section');
 * ```
 */
export class MockLocationHook implements LocationHook {
  pathname: string = '/';
  search: string = '';
  searchParams: Record<string, string> = {};
  hash: string = '';
  state: unknown = null;
  key: string = 'default';

  constructor(url?: string) {
    if (url) {
      this.setFromUrl(url);
    }
  }

  // Test helper methods

  /**
   * Set location from a URL string
   */
  setFromUrl(url: string): void {
    // Parse pathname
    const pathMatch = url.match(/^([^?#]*)/);
    this.pathname = pathMatch?.[1] ?? '/';

    // Parse search
    const searchMatch = url.match(/\?([^#]*)/);
    this.search = searchMatch ? '?' + searchMatch[1] : '';

    // Parse search params
    if (searchMatch) {
      this.searchParams = {};
      const params = new URLSearchParams(searchMatch[1]);
      params.forEach((value, key) => {
        this.searchParams[key] = value;
      });
    } else {
      this.searchParams = {};
    }

    // Parse hash
    const hashMatch = url.match(/#(.*)/);
    this.hash = hashMatch ? '#' + hashMatch[1] : '';

    // Generate new key
    this.key = Math.random().toString(36).substring(7);
  }

  /**
   * Set pathname for testing
   */
  setPathname(pathname: string): void {
    this.pathname = pathname;
  }

  /**
   * Set search for testing
   */
  setSearch(search: string): void {
    this.search = search;
    // Also update searchParams
    if (search.startsWith('?')) {
      const params = new URLSearchParams(search.substring(1));
      this.searchParams = {};
      params.forEach((value, key) => {
        this.searchParams[key] = value;
      });
    }
  }

  /**
   * Set search params for testing
   */
  setSearchParams(params: Record<string, string>): void {
    this.searchParams = params;
    // Also update search string
    const urlParams = new URLSearchParams(params);
    this.search = urlParams.toString() ? '?' + urlParams.toString() : '';
  }

  /**
   * Set hash for testing
   */
  setHash(hash: string): void {
    this.hash = hash ? (hash.startsWith('#') ? hash : '#' + hash) : '';
  }

  /**
   * Set state for testing
   */
  setState(state: unknown): void {
    this.state = state;
  }

  /**
   * Set key for testing
   */
  setKey(key: string): void {
    this.key = key;
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.pathname = '/';
    this.search = '';
    this.searchParams = {};
    this.hash = '';
    this.state = null;
    this.key = 'default';
  }
}
