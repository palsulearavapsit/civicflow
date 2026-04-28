/**
 * @fileoverview AI Moderation to prevent harassment (AI-22).
 *
 * Multi-layer content moderation pipeline:
 * 1. Client-side keyword pre-filter (fast, zero-latency)
 * 2. Gemini Safety Settings (model-level filtering)
 * 3. Post-response hallucination check
 *
 * @module utils/ai-moderation
 */

import { checkForMisinformation } from '@/lib/gemini';
import { AuditService, AUDIT_ACTIONS } from '@/services/auditService';

// ─── Banned Pattern Lists ─────────────────────────────────────────────────────

const HARASSMENT_PATTERNS = [
  /\b(kill|murder|attack|threaten|harm)\s+(voter|candidate|official|poll)/i,
  /\b(bomb|explosive|weapon)\s+/i,
];

const PERSONAL_INFO_REQUEST_PATTERNS = [
  /\bsocial security\b/i,
  /\bcredit card\b/i,
  /\bbank account\b/i,
  /\bpassword\b/i,
];

const SPAM_PATTERNS = [
  /(.)\1{10,}/,  // excessive character repetition
  /https?:\/\/[^\s]{100,}/,  // suspiciously long URLs
];

// ─── Moderation Result ────────────────────────────────────────────────────────

export type ModerationResult = {
  allowed: boolean;
  reason?: string;
  category?: 'harassment' | 'pii_request' | 'spam' | 'misinformation' | 'safe';
};

// ─── Input Moderation ─────────────────────────────────────────────────────────

/**
 * Moderates user input BEFORE sending to Gemini.
 * Fast client-side check using pattern matching.
 *
 * @param input - The user's message text
 * @param uid - Optional UID for audit logging
 */
export async function moderateInput(input: string, uid?: string): Promise<ModerationResult> {
  if (input.length > 5000) {
    return { allowed: false, reason: 'Message too long (max 5000 characters)', category: 'spam' };
  }

  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(input)) {
      if (uid) await AuditService.log(uid, AUDIT_ACTIONS.SUSPICIOUS_INPUT, { pattern: pattern.source });
      return { allowed: false, reason: 'Message contains potentially harmful content', category: 'harassment' };
    }
  }

  for (const pattern of PERSONAL_INFO_REQUEST_PATTERNS) {
    if (pattern.test(input)) {
      return { allowed: false, reason: 'Please do not share sensitive personal information', category: 'pii_request' };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(input)) {
      return { allowed: false, reason: 'Message appears to be spam', category: 'spam' };
    }
  }

  return { allowed: true, category: 'safe' };
}

/**
 * Moderates AI-generated output BEFORE displaying to the user.
 *
 * @param output - The Gemini response text
 */
export function moderateOutput(output: string): ModerationResult {
  if (!checkForMisinformation(output)) {
    return {
      allowed: false,
      reason: 'Response contained potentially misleading election information',
      category: 'misinformation',
    };
  }
  return { allowed: true, category: 'safe' };
}

// ─── AI Analytics (AI-08) ────────────────────────────────────────────────────

const queryStats = new Map<string, number>();

/**
 * Tracks AI query categories for analytics purposes.
 * No PII is stored — only the detected intent category.
 */
export function trackAIQuery(intent: string, model: string): void {
  const key = `${intent}:${model}`;
  queryStats.set(key, (queryStats.get(key) ?? 0) + 1);

  // Export to analytics in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    console.debug('[AI Analytics]', { intent, model, timestamp: new Date().toISOString() });
  }
}

/** Returns the current query statistics snapshot. */
export function getQueryStats(): Record<string, number> {
  return Object.fromEntries(queryStats);
}
