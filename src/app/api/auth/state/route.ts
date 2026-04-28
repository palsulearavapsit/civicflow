/**
 * @fileoverview OAuth State Parameter implementation (SEC-14).
 * Prevents CSRF attacks on OAuth flows by validating state parameters.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SessionToken } from '@/core/value-objects';

// In-memory PKCE/state store (use Redis in production)
const pendingStates = new Map<string, { createdAt: number; redirectUri: string }>();
const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Generates a new OAuth state parameter and stores it server-side.
 * SEC-14: Anti-CSRF OAuth state validation.
 */
export async function GET(req: NextRequest) {
  const redirectUri = req.nextUrl.searchParams.get('redirect_uri') ?? '/dashboard';

  // Generate a cryptographically secure state token
  const state = SessionToken.generate().value;
  pendingStates.set(state, { createdAt: Date.now(), redirectUri });

  // Clean up expired states
  for (const [key, val] of pendingStates.entries()) {
    if (Date.now() - val.createdAt > STATE_TTL_MS) pendingStates.delete(key);
  }

  return NextResponse.json({ state, expiresIn: STATE_TTL_MS / 1000 });
}

/**
 * Validates an OAuth callback's state parameter.
 */
export async function POST(req: NextRequest) {
  const body = await req.json() as { state?: string };
  const { state } = body;

  if (!state || typeof state !== 'string') {
    return NextResponse.json({ valid: false, error: 'Missing state parameter' }, { status: 400 });
  }

  const pending = pendingStates.get(state);
  if (!pending) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired state' }, { status: 400 });
  }

  if (Date.now() - pending.createdAt > STATE_TTL_MS) {
    pendingStates.delete(state);
    return NextResponse.json({ valid: false, error: 'State parameter expired' }, { status: 400 });
  }

  // Consume the state (one-time use)
  pendingStates.delete(state);
  return NextResponse.json({ valid: true, redirectUri: pending.redirectUri });
}
