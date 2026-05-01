'use client';

import React from 'react';
import { clsx } from 'clsx';
import { useHaptics } from '@/hooks/useHaptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
