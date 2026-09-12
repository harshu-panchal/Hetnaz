import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Universal ScrollToTop component
 * Ensures that whenever navigating between routes, the page immediately
 * resets scroll position to (0, 0) instead of retaining the previous page's scroll offset.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    // Disable browser native automatic scroll restoration on navigation
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // Reset any inner scroll containers
      const containers = document.querySelectorAll<HTMLElement>(
        '.overflow-y-auto, .overflow-y-scroll, [data-scroll-container]'
      );
      containers.forEach((c) => {
        c.scrollTop = 0;
      });
    };

    // 1. Immediate synchronous reset before paint
    resetScroll();

    // 2. Next animation frame (handles concurrent React rendering passes)
    const rafId = requestAnimationFrame(() => {
      resetScroll();
    });

    // 3. Short timeout fallback for async loaded content / Suspense fallbacks
    const timeoutId = setTimeout(() => {
      resetScroll();
    }, 20);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [pathname, search]);

  return null;
};
