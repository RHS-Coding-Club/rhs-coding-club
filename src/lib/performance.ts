/**
 * Performance utilities for optimizing webapp rendering
 */

// Define types for browser APIs
interface NavigatorConnection {
  saveData?: boolean;
  effectiveType?: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
  mozConnection?: NavigatorConnection;
  webkitConnection?: NavigatorConnection;
}

interface PerformanceMemory {
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Check if device is capable of handling heavy graphics
 * TEMPORARILY DISABLED - All devices will show effects
 * Uncomment the checks below to re-enable device filtering
 */
export function isCapableDevice(): boolean {
  // Temporarily return true for all devices to test pixel blast
  return true;

  /* COMMENTED OUT - Uncomment to re-enable device capability checks
  if (typeof window === 'undefined') return false;

  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  if (isMobile) return false;

  // Check for slow connection
  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (
    connection &&
    (connection.saveData ||
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g')
  ) {
    return false;
  }

  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  // Check available memory (Chrome/Edge)
  const perf = performance as PerformanceWithMemory;
  const memory = perf.memory;
  if (memory && memory.jsHeapSizeLimit < 1000000000) {
    // Less than ~1GB available
    return false;
  }

  return true;
  */
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Idle Callback with fallback
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  // Fallback for Safari
  return setTimeout(callback, 1);
}

/**
 * Cancel Idle Callback with fallback
 */
export function cancelIdleCallback(id: number) {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
}
