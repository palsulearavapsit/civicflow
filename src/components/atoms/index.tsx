/**
 * @fileoverview Atomic Design — Atoms: Button, Badge, Input, ErrorMessage, Caption
 *
 * Atoms are the smallest, indivisible UI components.
 * Each atom:
 * - Adheres to design tokens from {@link tokens}
 * - Has full ARIA labelling (A11Y-13, A11Y-14)
 * - Has minimum 44px touch targets (A11Y-18)
 * - Supports keyboard interaction
 *
 * @module components/atoms
 */

'use client';

import React from 'react';
import { clsx } from 'clsx';
import { useHaptics } from '@/hooks/useHaptics';

// ─── Button Atom ──────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/** Primary interactive atom. Enforces 44px minimum touch target (A11Y-18). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, onClick, className, disabled, ...props }, ref) => {
    const { trigger } = useHaptics();

    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
      ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 focus:ring-slate-400',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-2 text-sm min-h-[2.75rem] min-w-[2.75rem]',  // 44px
      md: 'px-4 py-2.5 text-sm min-h-[2.75rem]',
      lg: 'px-6 py-3 text-base min-h-[3rem]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        onClick={(e) => { trigger('light'); onClick?.(e); }}
        className={clsx(
          'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {!loading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ─── Badge Atom ───────────────────────────────────────────────────────────────

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  /** Screen reader text if badge content is not self-explanatory (A11Y-05). */
  srText?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, srText }) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-700 text-slate-200',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };

  return (
    <span
      className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variantClasses[variant])}
      aria-label={srText}
    >
      {children}
      {srText && <span className="sr-only">{srText}</span>}
    </span>
  );
};

// ─── Input Atom ───────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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

// ─── Caption Atom (A11Y-10) ───────────────────────────────────────────────────

interface CaptionProps {
  children: React.ReactNode;
  lang?: string;
}

/** Provides text captions for media content (A11Y-10). */
export const Caption: React.FC<CaptionProps> = ({ children, lang }) => (
  <figcaption
    className="mt-2 text-sm text-slate-400 text-center"
    lang={lang}
    aria-live="polite"
  >
    {children}
  </figcaption>
);

// ─── SkipLink Atom (A11Y-16) ─────────────────────────────────────────────────

/** Skip-to-main-content link for keyboard users. */
export const SkipLink: React.FC<{ href?: string }> = ({ href = '#main-content' }) => (
  <a
    href={href}
    accessKey="m"
    title="Skip to main content (Alt+M)"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999] bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
  >
    Skip to main content
  </a>
);

// ─── LoadingSpinner Atom ──────────────────────────────────────────────────────

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; label?: string }> = ({
  size = 'md',
  label = 'Loading…',
}) => {
  const sizeClass = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center">
      <svg className={clsx('animate-spin text-blue-500', sizeClass)} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};
