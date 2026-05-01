"use client";

import React from 'react';

/**
 * ATOM-10: Skip-to-Content Link.
 * Standard accessibility pattern for keyboard users to bypass navigation.
 */
export const SkipLink: React.FC<{ targetId: string }> = ({ targetId }) => {
  return (
    <a 
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl transition-all border-2 border-white/20 backdrop-blur-md"
    >
      Skip to main content
    </a>
  );
};
