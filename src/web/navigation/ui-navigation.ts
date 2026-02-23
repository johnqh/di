/**
 * UI-level navigation state interface for the main project
 * This is separate from the library's NavigationState which is for email app navigation
 */

/** Snapshot of the current UI navigation state */
export interface UINavigationState {
  /** Current URL path */
  currentPath: string;
  /** Previous URL path before the last navigation */
  previousPath?: string;
  /** Route parameters (e.g., `{ lang: "en" }`) */
  params: Record<string, string>;
  /** URL search/query parameters */
  searchParams: Record<string, string>;
}

/** Options passed to navigation and replace methods */
export interface UINavigationOptions {
  /** Replace the current history entry instead of pushing */
  replace?: boolean;
  /** Arbitrary state to attach to the history entry */
  state?: Record<string, unknown>;
  /** Prevent resetting the scroll position after navigation */
  preventScrollReset?: boolean;
}

/** Imperative navigation service for programmatic route changes */
export interface UINavigationService {
  /** Navigate to a path, optionally replacing the current entry */
  navigate(path: string, options?: UINavigationOptions): void;
  /** Go back in history, falling back to `fallbackPath` if there is no previous entry */
  goBack(fallbackPath?: string): void;
  /** Go forward in history */
  goForward(): void;
  /** Replace the current history entry with a new path */
  replace(path: string, options?: UINavigationOptions): void;
  /** Get the full current navigation state */
  getCurrentState(): UINavigationState;
  /** Get just the current path string */
  getCurrentPath(): string;
  /** Get URL search/query parameters */
  getSearchParams(): Record<string, string>;
  /** Get route parameters */
  getParams(): Record<string, string>;
  /** Whether there is a previous history entry to go back to */
  canGoBack(): boolean;
  /** Whether there is a forward history entry to go to */
  canGoForward(): boolean;
  /** Subscribe to navigation state changes; returns an unsubscribe function */
  addListener(listener: (state: UINavigationState) => void): () => void;
  /** Whether the navigation service is available on this platform */
  isSupported(): boolean;
}

/** React hook interface exposing navigation actions and state */
export interface UINavigationHook {
  /** Navigate to a path */
  navigate: (path: string, options?: UINavigationOptions) => void;
  /** Go back in history */
  goBack: (fallbackPath?: string) => void;
  /** Replace the current history entry */
  replace: (path: string, options?: UINavigationOptions) => void;
  /** Current URL path */
  currentPath: string;
  /** URL search/query parameters */
  searchParams: Record<string, string>;
  /** Route parameters */
  params: Record<string, string>;
  /** Whether the browser can go back */
  canGoBack: boolean;
  /** Whether navigation is available */
  isSupported: boolean;
}

/** React hook interface for reading the current URL location */
export interface UILocationHook {
  /** Current URL pathname */
  pathname: string;
  /** Raw search string including leading `?` */
  search: string;
  /** Parsed search/query parameters */
  searchParams: Record<string, string>;
  /** URL hash fragment */
  hash: string;
  /** History state object */
  state: Record<string, unknown>;
  /** Unique key for this history entry */
  key: string;
}

/** Platform-specific navigation configuration */
export interface UINavigationConfig {
  /** Enable back swipe gesture (React Native) */
  enableBackGesture?: boolean;
  /** Enable swipe navigation gesture (React Native) */
  enableSwipeGesture?: boolean;
  /** Screen transition animation type (React Native) */
  animationType?: 'slide' | 'fade' | 'none';
  /** Track navigation events in analytics */
  enableAnalytics?: boolean;
  /** Default fallback path when history is empty */
  fallbackPath?: string;
}
