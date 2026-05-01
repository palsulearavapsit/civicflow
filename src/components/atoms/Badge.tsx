import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
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
