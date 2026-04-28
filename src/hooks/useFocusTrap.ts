/**
 * @fileoverview useFocusTrap — Full focus trap for modal dialogs (A11Y-01).
 *
 * Implements WCAG 2.1 SC 2.1.2 "No Keyboard Trap":
 * - Focus cycles within the trap container when Tab/Shift+Tab is pressed
 * - Focus is restored to the trigger element when the trap is deactivated
 * - Escape key deactivates the trap
 *
 * @module hooks/useFocusTrap
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/}
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
  'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

interface UseFocusTrapOptions {
  /** Whether the trap is currently active. */
  isActive: boolean;
  /** Called when the user presses Escape. */
  onEscape?: () => void;
}

/**
 * Traps keyboard focus within a container element when `isActive` is true.
 *
 * @example
 * const containerRef = useFocusTrap({ isActive: isModalOpen, onEscape: closeModal });
 * return <div ref={containerRef} role="dialog" aria-modal="true">...</div>;
 */
export function useFocusTrap({ isActive, onEscape }: UseFocusTrapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusable = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))
      .filter((el) => !el.closest('[inert]') && getComputedStyle(el).display !== 'none');
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // Save the currently focused element to restore later
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Move focus into the container
    const focusable = getFocusable();
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) { e.preventDefault(); return; }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first) { e.preventDefault(); last.focus(); }
      } else {
        if (active === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when trap is deactivated
      previousFocusRef.current?.focus();
    };
  }, [isActive, onEscape, getFocusable]);

  return containerRef;
}
