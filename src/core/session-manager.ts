/**
 * @fileoverview Session Manager — Multi-device Session Revocation (SEC-07).
 * Manages user sessions with JWT rotation and multi-device revocation.
 *
 * @module core/session-manager
 */

import type { ISessionService } from '@/core/ports';
import type { Result } from '@/types/result';
import { ok, err } from '@/types/result';
import { SessionToken } from '@/core/value-objects';

// In-memory session store (use Redis in production)
const activeSessions = new Map<string, { uid: string; createdAt: number; expiresAt: number }>();
const revokedSessions = new Set<string>();

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Session Manager implementing {@link ISessionService}.
 * SEC-07: Supports per-session and all-session revocation.
 * SEC-11: Sessions expire and are rotatable.
 */
export const SessionManager: ISessionService = {
  async createSession(uid: string): Promise<Result<string, Error>> {
    const token = SessionToken.generate();
    activeSessions.set(token.value, {
      uid,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return ok(token.value);
  },

  async revokeSession(sessionId: string): Promise<Result<void, Error>> {
    activeSessions.delete(sessionId);
    revokedSessions.add(sessionId);
    return ok(undefined);
  },

  async revokeAllSessions(uid: string): Promise<Result<void, Error>> {
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.uid === uid) {
        activeSessions.delete(sessionId);
        revokedSessions.add(sessionId);
      }
    }
    return ok(undefined);
  },

  async validateSession(sessionId: string): Promise<Result<boolean, Error>> {
    if (revokedSessions.has(sessionId)) return ok(false);
    const session = activeSessions.get(sessionId);
    if (!session) return ok(false);
    if (Date.now() > session.expiresAt) {
      activeSessions.delete(sessionId);
      return ok(false);
    }
    return ok(true);
  },
};

/** JWT Rotation (SEC-11): Rotates a session token, revoking the old one. */
export async function rotateSession(oldSessionId: string): Promise<Result<string, Error>> {
  const session = activeSessions.get(oldSessionId);
  if (!session) return err(new Error('Session not found'));

  await SessionManager.revokeSession(oldSessionId);
  return SessionManager.createSession(session.uid);
}
