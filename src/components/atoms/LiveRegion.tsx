"use client";

import React from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * ATOM-08: ARIA-Live Region.
 * Announces dynamic updates (like AI response status) to screen readers.
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ message, politeness = 'polite' }) => {
  return (
    <div 
      aria-live={politeness} 
      className="sr-only" 
      role="status"
    >
      {message}
    </div>
  );
};
