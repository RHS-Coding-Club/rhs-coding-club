'use client';

import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
}

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

export function useViewport() {
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
  });

  const [breakpoints, setBreakpoints] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewportSize({ width, height });
      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1280,
        isLargeDesktop: width >= 1280,
      });
    };

    // Initial call
    updateViewport();

    // Add event listener
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  return {
    ...viewportSize,
    ...breakpoints,
    orientation: viewportSize.width > viewportSize.height ? 'landscape' : 'portrait',
  };
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    // Initial check
    updateMatch();

    // Add listener
    mediaQuery.addEventListener('change', updateMatch);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
}

// Common breakpoint hooks
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsTouchDevice = () => useMediaQuery('(hover: none) and (pointer: coarse)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersHighContrast = () => useMediaQuery('(prefers-contrast: high)');
