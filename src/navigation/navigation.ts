/**
 * Platform-agnostic navigation interfaces for cross-platform routing and navigation.
 *
 * @ai-context Navigation service and hook interfaces for dependency injection
 * @ai-pattern Service provider with state management, event listening, and React hooks integration
 * @ai-platform Universal (Web History API, React Router, React Navigation, custom routers)
 * @ai-usage Implement for React Router (web), React Navigation (React Native), or custom navigation
 * @ai-cross-platform Web uses History API, React Native uses navigation libraries
 *
 * @example
 * ```typescript
 * // Web implementation using History API
 * class WebNavigationService implements NavigationService {
 *   navigate(path: string, options?: NavigationOptions) {
 *     if (options?.replace) {
 *       window.history.replaceState(options.state, '', path);
 *     } else {
 *       window.history.pushState(options.state, '', path);
 *     }
 *   }
 * }
 *
 * // React Native implementation using React Navigation
 * class RNNavigationService implements NavigationService {
 *   navigate(path: string, options?: NavigationOptions) {
 *     if (options?.replace) {
 *       this.navigator.replace(path, options);
 *     } else {
 *       this.navigator.navigate(path, options);
 *     }
 *   }
 * }
 * ```
 */

/**
 * Navigation options for controlling navigation behavior.
 *
 * @ai-context Configuration object for navigation operations
 * @ai-pattern Options parameter pattern with boolean flags and state data
 * @ai-usage Pass to navigation methods to control behavior (replace vs push, scroll reset, etc.)
 */
interface NavigationOptions {
  /** Replace current entry instead of pushing new one */
  replace?: boolean;
  /** State data to associate with navigation */
  state?: unknown;
  /** Prevent scroll reset on navigation (web-specific) */
  preventScrollReset?: boolean;
}

/**
 * Current navigation state information.
 *
 * @ai-context State object containing current navigation information
 * @ai-pattern State container with path, parameters, and history information
 * @ai-usage Access current navigation context for conditional rendering or logic
 */
interface NavigationState {
  /** Current active path */
  currentPath: string;
  /** Previous path in navigation history */
  previousPath?: string;
  /** Path parameters (e.g., /user/:id -> {id: '123'}) */
  params: Record<string, string>;
  /** URL search/query parameters */
  searchParams: Record<string, string>;
}

/**
 * Platform-agnostic navigation service interface for routing operations.
 *
 * @ai-context Core navigation service interface for dependency injection
 * @ai-pattern Service interface with navigation operations, state management, and event handling
 * @ai-platform Abstracts web History API, React Navigation, and custom routing solutions
 * @ai-usage Primary interface for implementing navigation services across platforms
 *
 * @example
 * ```typescript
 * class AppNavigationService implements NavigationService {
 *   navigate(path: string, options?: NavigationOptions): void {
 *     // Platform-specific navigation implementation
 *   }
 * }
 * ```
 */
interface NavigationService {
  /**
   * Navigate to a specific path
   * @param path Target path
   * @param options Navigation options
   */
  navigate(path: string, options?: NavigationOptions): void;

  /**
   * Go back to previous route
   * @param fallbackPath Fallback path if no history
   */
  goBack(fallbackPath?: string): void;

  /**
   * Go forward in navigation history
   */
  goForward(): void;

  /**
   * Replace current route
   * @param path Target path
   * @param options Navigation options
   */
  replace(path: string, options?: NavigationOptions): void;

  /**
   * Get current navigation state
   */
  getCurrentState(): NavigationState;

  /**
   * Get current path
   */
  getCurrentPath(): string;

  /**
   * Get search parameters
   */
  getSearchParams(): Record<string, string>;

  /**
   * Get path parameters
   */
  getParams(): Record<string, string>;

  /**
   * Check if can go back
   */
  canGoBack(): boolean;

  /**
   * Check if can go forward
   */
  canGoForward(): boolean;

  /**
   * Add navigation listener
   * @param listener Function to call on navigation changes
   * @returns Cleanup function
   */
  addListener(listener: (state: NavigationState) => void): () => void;

  /**
   * Check if navigation is supported
   */
  isSupported(): boolean;
}

/**
 * Navigation hook interface for React components.
 *
 * @ai-context React hook interface for navigation operations
 * @ai-pattern React hook pattern with imperative methods and reactive state
 * @ai-usage Use in React components for navigation operations and state access
 *
 * @example
 * ```typescript
 * const useNavigation = (): NavigationHook => {
 *   const navigate = useCallback((path: string) => {...}, []);
 *   return { navigate, currentPath, ... };
 * };
 * ```
 */
interface NavigationHook {
  navigate: (path: string, options?: NavigationOptions) => void;
  goBack: (fallbackPath?: string) => void;
  replace: (path: string, options?: NavigationOptions) => void;
  currentPath: string;
  searchParams: Record<string, string>;
  params: Record<string, string>;
  canGoBack: boolean;
  isSupported: boolean;
}

/**
 * Location hook interface for accessing current URL information.
 *
 * @ai-context React hook interface for URL location information
 * @ai-pattern React hook pattern with reactive URL state properties
 * @ai-usage Use in React components to access current URL details
 *
 * @example
 * ```typescript
 * const useLocation = (): LocationHook => {
 *   const location = window.location;
 *   return { pathname: location.pathname, ... };
 * };
 * ```
 */
interface LocationHook {
  pathname: string;
  search: string;
  searchParams: Record<string, string>;
  hash: string;
  state: unknown;
  key: string;
}

/**
 * Navigation configuration for platform-specific features.
 *
 * @ai-context Configuration interface for navigation behavior customization
 * @ai-pattern Configuration object with platform-specific optional settings
 * @ai-platform Web supports analytics and fallbacks, React Native adds gestures and animations
 * @ai-usage Configure navigation behavior for different platforms and use cases
 *
 * @example
 * ```typescript
 * const webConfig: NavigationConfig = {
 *   enableAnalytics: true,
 *   fallbackPath: '/home'
 * };
 *
 * const mobileConfig: NavigationConfig = {
 *   enableBackGesture: true,
 *   animationType: 'slide',
 *   enableAnalytics: true
 * };
 * ```
 */
interface NavigationConfig {
  enableBackGesture?: boolean; // React Native specific
  enableSwipeGesture?: boolean; // React Native specific
  animationType?: 'slide' | 'fade' | 'none'; // React Native specific
  enableAnalytics?: boolean; // Track navigation events
  fallbackPath?: string; // Default fallback path
}

export {
  type NavigationOptions,
  type NavigationState,
  type NavigationService,
  type NavigationHook,
  type LocationHook,
  type NavigationConfig,
};
