/**
 * @fileoverview Token Budget Manager for AI sessions (AI-13).
 *
 * Enforces per-session token limits to control AI costs and prevent abuse.
 * Integrates with the Zustand store for UI reactivity.
 *
 * @module core/token-budget
 * @see {@link store}
 */

import { useCivicStore } from '@/store';
import { estimateTokens } from '@/lib/gemini';
import { TokenBudgetExhaustedError } from '@/core/errors';
import type { Result } from '@/types/result';
import { ok, err } from '@/types/result';

/** Default session budget: 10,000 tokens (~7,500 words) */
const DEFAULT_SESSION_BUDGET = 10_000;

/** Tiers for premium users */
const TIER_BUDGETS: Record<string, number> = {
  free: 10_000,
  standard: 50_000,
  admin: 500_000,
};

export const TokenBudgetManager = {
  /**
   * Checks if the session has enough budget for the given text,
   * then deducts the estimated token count.
   *
   * @param text - The text about to be sent
   * @param model - The model to use for estimation
   * @returns `ok(estimatedTokens)` or `err(TokenBudgetExhaustedError)`
   */
  consume(text: string, model = 'gemini-2.0-flash'): Result<number, TokenBudgetExhaustedError> {
    const store = useCivicStore.getState();
    if (store.isTokenBudgetExhausted()) {
      return err(new TokenBudgetExhaustedError());
    }
    const tokens = estimateTokens(text, model);
    store.consumeTokens(tokens);
    return ok(tokens);
  },

  /** Returns remaining tokens in the current session. */
  getRemaining(): number {
    const { sessionTokensUsed, sessionTokenBudget } = useCivicStore.getState().ai;
    return Math.max(0, sessionTokenBudget - sessionTokensUsed);
  },

  /** Returns usage percentage (0–100). */
  getUsagePercent(): number {
    const { sessionTokensUsed, sessionTokenBudget } = useCivicStore.getState().ai;
    return Math.min(100, (sessionTokensUsed / sessionTokenBudget) * 100);
  },

  /** Sets the budget for a user tier. */
  setBudgetForTier(tier: keyof typeof TIER_BUDGETS): void {
    const budget = TIER_BUDGETS[tier] ?? DEFAULT_SESSION_BUDGET;
    // Direct store access
    useCivicStore.setState((s) => {
      s.ai.sessionTokenBudget = budget;
    });
  },

  /** Resets the session budget (call on new chat session). */
  reset(): void {
    useCivicStore.getState().resetTokenBudget();
  },
};
