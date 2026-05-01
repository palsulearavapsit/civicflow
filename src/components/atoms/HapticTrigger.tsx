"use client";

import React from 'react';
import { useHaptics } from '@/hooks/useHaptics';

interface HapticTriggerProps {
  children: React.ReactNode;
  pattern?: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning';
  className?: string;
}

/**
 * ATOM-22: Haptic Design System Atom.
 * Provides tactile feedback for touch interactions.
 * Helps visually impaired users confirm actions.
 */
export const HapticTrigger: React.FC<HapticTriggerProps> = ({ children, pattern = 'light', className }) => {
  const { trigger } = useHaptics();

  const handleClick = (e: React.MouseEvent) => {
    // Standard haptic patterns
    switch (pattern) {
      case 'success':
        trigger('medium');
        setTimeout(() => trigger('light'), 100);
        break;
      case 'error':
        trigger('heavy');
        setTimeout(() => trigger('heavy'), 150);
        break;
      case 'warning':
        trigger('medium');
        break;
      default:
        trigger(pattern as any);
    }
  };

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
};
