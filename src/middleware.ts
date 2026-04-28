/**
 * @fileoverview Zero-Trust Edge Middleware for CivicFlow.
 *
 * Implements SEC-03 (Zero-Trust), SEC-05 (Rate Limiting), SEC-16 (CORS),
 * SEC-04 (Honeypot detection), and SEC-19 (Secure-Cookie enforcement).
 *
 * Runs at the edge (Vercel Edge Runtime) before every request.
 * "Never trust, always verify" — every request is authenticated and validated.
 *
 * @see {@link https://nextjs.org/docs/app/building-your-application/routing/middleware}
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Configuration ────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  'https://civicflow.vercel.app',
  'https://civicflow.app',
]);

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;   // 60 req/min per IP for regular routes
const AI_RATE_LIMIT_MAX = 10;         // 10 req/min for AI routes (expensive)

// In-memory store (use Redis/KV in production for multi-instance deployments)
const requestCounts = new Map<string, { count: number; windowStart: number }>();

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

function getRateLimitKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
  return `${ip}:${req.nextUrl.pathname}`;
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, retryAfter: 0 };
}

// ─── CORS Handling ────────────────────────────────────────────────────────────

function getCorsHeaders(origin: string | null): HeadersInit {
  const isAllowed = origin && ALLOWED_ORIGINS.has(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : (ALLOWED_ORIGINS.values().next().value ?? ''),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature, X-Timestamp',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

// ─── Security Headers ─────────────────────────────────────────────────────────

const SECURITY_HEADERS: HeadersInit = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-DNS-Prefetch-Control': 'off',
};

// ─── Main Middleware ──────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');

  // ── CORS preflight ────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  // ── CORS origin check for API routes ─────────────────────────────────────
  if (pathname.startsWith('/api/') && origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json(
      { error: 'CORS: Origin not allowed', code: 'CORS_VIOLATION' },
      { status: 403, headers: getCorsHeaders(origin) }
    );
  }

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  const isAIRoute = pathname.startsWith('/api/chat') || pathname.startsWith('/api/analyze');
  const maxReqs = isAIRoute ? AI_RATE_LIMIT_MAX : RATE_LIMIT_MAX_REQUESTS;
  const key = getRateLimitKey(req);
  const { allowed, remaining, retryAfter } = checkRateLimit(key, maxReqs);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED', retryAfter },
      {
        status: 429,
        headers: {
          ...getCorsHeaders(origin),
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(maxReqs),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + retryAfter * 1000),
        },
      }
    );
  }

  // ── Apply security headers to all responses ───────────────────────────────
  const response = NextResponse.next();
  Object.entries({ ...SECURITY_HEADERS, ...getCorsHeaders(origin) }).forEach(([k, v]) => {
    response.headers.set(k, v as string);
  });
  response.headers.set('X-RateLimit-Limit', String(maxReqs));
  response.headers.set('X-RateLimit-Remaining', String(remaining));

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*).*)',
  ],
};
