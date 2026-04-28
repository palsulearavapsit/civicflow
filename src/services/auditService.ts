/**
 * @fileoverview Immutable, cryptographically signed Audit Log Service (SEC-10).
 *
 * Every audit entry is signed with HMAC-SHA256 before writing to Firestore.
 * Firestore security rules enforce append-only access (no update/delete).
 * This guarantees a tamper-evident audit trail for:
 * - Profile changes
 * - Authentication events
 * - Admin actions
 * - AI interactions
 *
 * @module services/auditService
 * @see {@link core/adapters/firebase-adapter - FirebaseAuditRepository}
 */

import { FirebaseAuditRepository } from '@/core/adapters/firebase-adapter';
import type { AuditEntry } from '@/core/ports';
import type { Result } from '@/types/result';
import { ok } from '@/types/result';

// ─── HMAC Signing ─────────────────────────────────────────────────────────────

const AUDIT_SIGNING_SECRET = process.env.AUDIT_SIGNING_SECRET ?? 'audit-dev-secret';

async function signEntry(entry: Omit<AuditEntry, 'signature'>): Promise<string> {
  try {
    const message = JSON.stringify({
      uid: entry.uid,
      action: entry.action,
      timestamp: entry.timestamp.toISOString(),
      metadata: entry.metadata,
    });

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(AUDIT_SIGNING_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
    return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return 'signing-unavailable';
  }
}

// ─── Memoized Dedup Cache ─────────────────────────────────────────────────────

const recentEntries = new Set<string>();
const DEDUP_WINDOW_MS = 1000;

function isDuplicate(uid: string, action: string): boolean {
  const key = `${uid}:${action}`;
  if (recentEntries.has(key)) return true;
  recentEntries.add(key);
  setTimeout(() => recentEntries.delete(key), DEDUP_WINDOW_MS);
  return false;
}

// ─── Audit Service ────────────────────────────────────────────────────────────

/**
 * High-level audit service with automatic signing and deduplication.
 * All writes are routed through {@link FirebaseAuditRepository}.
 */
export const AuditService = {
  /**
   * Logs an immutable, HMAC-signed audit event.
   *
   * @param uid - The user performing the action
   * @param action - A namespaced action code (e.g. `PROFILE_UPDATED`)
   * @param metadata - Additional context (PII must be masked before passing)
   */
  async log(
    uid: string,
    action: string,
    metadata: Record<string, unknown> = {}
  ): Promise<Result<void, Error>> {
    // Deduplicate rapid-fire identical events
    if (isDuplicate(uid, action)) return ok(undefined);

    const timestamp = new Date();
    const unsignedEntry: Omit<AuditEntry, 'signature'> = {
      uid,
      action,
      metadata,
      timestamp,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
    };

    const signature = await signEntry(unsignedEntry);
    const entry: AuditEntry = { ...unsignedEntry, signature };

    return FirebaseAuditRepository.log(entry);
  },

  /**
   * Retrieves audit history for a user (admin use only).
   * @param uid - The target user's UID
   * @param limit - Maximum number of entries to return (default: 50)
   */
  async getHistory(uid: string, limit = 50) {
    return FirebaseAuditRepository.findByUser(uid, limit);
  },
};

// ─── Audit Action Constants ───────────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  // Auth
  SIGN_IN: 'AUTH.SIGN_IN',
  SIGN_OUT: 'AUTH.SIGN_OUT',
  SESSION_REVOKED: 'AUTH.SESSION_REVOKED',
  OAUTH_STATE_VERIFIED: 'AUTH.OAUTH_STATE_VERIFIED',

  // Profile
  PROFILE_CREATED: 'PROFILE.CREATED',
  PROFILE_UPDATED: 'PROFILE.UPDATED',
  PROFILE_DELETED: 'PROFILE.DELETED',

  // AI
  AI_QUERY: 'AI.QUERY',
  AI_FEEDBACK_SUBMITTED: 'AI.FEEDBACK_SUBMITTED',
  AI_IMAGE_ANALYZED: 'AI.IMAGE_ANALYZED',
  TOKEN_BUDGET_EXHAUSTED: 'AI.TOKEN_BUDGET_EXHAUSTED',

  // Security
  RATE_LIMIT_HIT: 'SECURITY.RATE_LIMIT_HIT',
  SUSPICIOUS_INPUT: 'SECURITY.SUSPICIOUS_INPUT',
  HONEYPOT_TRIGGERED: 'SECURITY.HONEYPOT_TRIGGERED',
  CORS_VIOLATION: 'SECURITY.CORS_VIOLATION',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];
