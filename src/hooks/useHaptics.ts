'use client';
/**
 * @fileoverview useHaptics — Haptic feedback for mobile interactions (A11Y-20).
 *
 * Uses the Vibration API for tactile feedback on mobile devices.
 * Falls back silently on desktop. Respects the user's "reduce motion" preference.
 *
 * @module hooks/useHaptics
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API}
 */

import { useCallback } from 'react';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 100, 50, 100, 50],
  warning: [30, 60, 30],
};

/**
 * Provides haptic feedback helpers for mobile UI interactions.
 *
 * @example
 * const { trigger } = useHaptics();
 * <button onClick={() => trigger('success')}>Vote!</button>
 */
export function useHaptics() {
  const isSupported =
    typeof window !== 'undefined' &&
    'vibrate' in navigator &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const trigger = useCallback((pattern: HapticPattern = 'light') => {
    if (!isSupported) return;
    navigator.vibrate(PATTERNS[pattern]);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) navigator.vibrate(0);
  }, [isSupported]);

  return { trigger, stop, isSupported };
}
