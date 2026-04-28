'use client';
/**
 * @fileoverview usePrefetch — Predictive route prefetching (EFF-20).
 *
 * Uses Intersection Observer to detect when the user's cursor hovers over
 * navigation links, triggering Next.js route prefetching before click.
 *
 * @module hooks/usePrefetch
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

const PREFETCH_DELAY_MS = 100;
const prefetched = new Set<string>();

/**
 * Returns a prefetch function and hover handlers for predictive navigation.
 *
 * @example
 * const { prefetch, hoverProps } = usePrefetch('/dashboard');
 * return <Link href="/dashboard" {...hoverProps}>Dashboard</Link>;
 */
export function usePrefetch(href: string) {
  const router = useRouter();

  const prefetch = useCallback(() => {
    if (prefetched.has(href)) return;
    prefetched.add(href);
    router.prefetch(href);
  }, [href, router]);

  let timer: ReturnType<typeof setTimeout>;

  const hoverProps = {
    onMouseEnter: () => { timer = setTimeout(prefetch, PREFETCH_DELAY_MS); },
    onMouseLeave: () => clearTimeout(timer),
    onFocus: () => prefetch(),
  };

  return { prefetch, hoverProps };
}

/**
 * Prefetches a list of routes on mount (e.g. for likely-next pages).
 *
 * @example
 * usePrefetchRoutes(['/dashboard', '/chat', '/map']);
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  // Prefetch on first render after idle
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void })
      .requestIdleCallback(() => {
        routes.forEach((r) => {
          if (!prefetched.has(r)) {
            prefetched.add(r);
            router.prefetch(r);
          }
        });
      });
  }
}
