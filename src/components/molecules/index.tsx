/**
 * @fileoverview Atomic Design — Molecules: Breadcrumbs, AIFeedback, SearchBar, StatCard
 *
 * Molecules are simple combinations of atoms that form functional UI units.
 *
 * @module components/molecules
 */

'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button, Badge } from '@/components/atoms';
import { CommandBus, SubmitAIFeedbackCommand } from '@/core/commands';
import { useHaptics } from '@/hooks/useHaptics';

// ─── Breadcrumbs (A11Y-12) ───────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumb navigation for complex page hierarchies (A11Y-12).
 * Uses structured data markup for SEO.
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-4">
    <ol
      className="flex items-center gap-2 text-sm text-slate-400"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      {items.map((item, index) => (
        <li
          key={item.label}
          className="flex items-center gap-2"
          itemScope
          itemType="https://schema.org/ListItem"
          itemProp="itemListElement"
        >
          {index > 0 && <span aria-hidden="true" className="text-slate-600">/</span>}
          {item.href && index < items.length - 1 ? (
            <a
              href={item.href}
              className="hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
              title={`Go to ${item.label}`}  // A11Y-11: Descriptive link titles
              itemProp="item"
            >
              <span itemProp="name">{item.label}</span>
            </a>
          ) : (
            <span
              aria-current="page"
              className="text-white font-medium"
              itemProp="name"
            >
              {item.label}
            </span>
          )}
          <meta itemProp="position" content={String(index + 1)} />
        </li>
      ))}
    </ol>
  </nav>
);

// ─── AI Feedback Loop (AI-16) ────────────────────────────────────────────────

interface AIFeedbackProps {
  interactionId: string;
  uid?: string;
  onFeedbackSubmitted?: (rating: 'positive' | 'negative') => void;
}

/**
 * Thumbs up/down feedback component for AI responses (AI-16).
 * Submits via the {@link SubmitAIFeedbackCommand} command pattern.
 */
export const AIFeedback: React.FC<AIFeedbackProps> = ({
  interactionId,
  uid = 'anonymous',
  onFeedbackSubmitted,
}) => {
  const [submitted, setSubmitted] = useState<'positive' | 'negative' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { trigger } = useHaptics();

  const handleFeedback = async (rating: 'positive' | 'negative') => {
    if (submitted || isLoading) return;
    setIsLoading(true);
    trigger(rating === 'positive' ? 'success' : 'medium');

    const command = new SubmitAIFeedbackCommand(uid, interactionId, rating);
    await CommandBus.dispatch(command);

    setSubmitted(rating);
    setIsLoading(false);
    onFeedbackSubmitted?.(rating);
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-2 text-sm text-slate-400"
      >
        <span aria-hidden="true">{submitted === 'positive' ? '👍' : '👎'}</span>
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3"
      role="group"
      aria-label="Rate this AI response"
    >
      <span className="text-xs text-slate-500">Was this helpful?</span>
      <button
        onClick={() => handleFeedback('positive')}
        disabled={isLoading}
        aria-label="This response was helpful"
        title="Helpful"
        className={clsx(
          'p-2 rounded-lg transition-all duration-150 min-h-[2.75rem] min-w-[2.75rem]',
          'hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500',
          'disabled:opacity-50'
        )}
      >
        <span aria-hidden="true">👍</span>
      </button>
      <button
        onClick={() => handleFeedback('negative')}
        disabled={isLoading}
        aria-label="This response was not helpful"
        title="Not helpful"
        className={clsx(
          'p-2 rounded-lg transition-all duration-150 min-h-[2.75rem] min-w-[2.75rem]',
          'hover:bg-red-500/20 hover:text-red-400 text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-red-500',
          'disabled:opacity-50'
        )}
      >
        <span aria-hidden="true">👎</span>
      </button>
    </div>
  );
};

// ─── StatCard Molecule ────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  badge?: { text: string; variant: 'success' | 'warning' | 'error' | 'info' };
  icon?: React.ReactNode;
  description?: string;
}

/**
 * A metric card combining a label, value, and optional badge.
 * Used in the admin cost tracking dashboard (AI-23).
 */
export const StatCard: React.FC<StatCardProps> = ({ label, value, badge, icon, description }) => (
  <article
    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2"
    aria-label={`${label}: ${value}`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      {icon && <span aria-hidden="true" className="text-slate-500">{icon}</span>}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-white">{value}</span>
      {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
    </div>
    {description && <p className="text-xs text-slate-500">{description}</p>}
  </article>
);

// ─── ARIALiveRegion (A11Y-02) ─────────────────────────────────────────────────

interface ARIALiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  className?: string;
}

/**
 * ARIA live region for announcing AI streaming updates to screen readers (A11Y-02).
 * Use `assertive` for urgent updates, `polite` for background updates.
 */
export const ARIALiveRegion: React.FC<ARIALiveRegionProps> = ({
  message,
  politeness = 'polite',
  className,
}) => (
  <div
    aria-live={politeness}
    aria-atomic="false"
    aria-relevant="additions text"
    className={clsx('sr-only', className)}
  >
    {message}
  </div>
);
