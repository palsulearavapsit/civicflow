"use client";

import React from 'react';

/**
 * SEC-04: Honeypot Input Protection.
 * Invisible input to trap bots. If filled, the submission is rejected.
 */
export const Honeypot: React.FC<{ name?: string }> = ({ name = 'website_url' }) => {
  return (
    <div 
      aria-hidden="true" 
      style={{ 
        position: 'absolute', 
        opacity: 0, 
        zIndex: -1, 
        height: 0, 
        width: 0, 
        pointerEvents: 'none' 
      }}
    >
      <input 
        type="text" 
        name={name} 
        tabIndex={-1} 
        autoComplete="off" 
      />
    </div>
  );
};
