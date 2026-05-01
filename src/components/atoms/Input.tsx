'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
}

/** Accessible input with required label, error state, and ARIA attributes (A11Y-13, A11Y-14). */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftAddon, id, className, ...props }, ref) => {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1">
        {/* A11Y-13: Explicit label for every input */}
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          {props.required && <span className="sr-only"> (required)</span>}
        </label>

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none" aria-hidden="true">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={clsx(error && errorId, helperText && helperId)}
            aria-invalid={!!error}
            className={clsx(
              'w-full rounded-lg border bg-slate-800/50 text-white placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 transition-colors duration-150',
              'min-h-[2.75rem] px-3 py-2 text-sm',  // A11Y-18: 44px touch target
              leftAddon && 'pl-10',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-600 focus:ring-blue-500 hover:border-slate-500',
              className
            )}
            {...props}
          />
        </div>

        {/* A11Y-14: ARIA-compliant error messaging */}
        {error && (
          <p id={errorId} role="alert" aria-live="polite" className="text-sm text-red-400 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
