import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // CSP with Nonce - the ultimate protection for modern web apps
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' *.google.com *.googleapis.com *.gstatic.com;
    style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com;
    img-src 'self' data: *.google.com *.googleapis.com *.gstatic.com *.flaticon.com *.googleusercontent.com;
    connect-src 'self' *.google.com *.googleapis.com *.firebaseio.com;
    font-src 'self' *.gstatic.com;
    frame-src *.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-XSS-Protection', '1; mode=block');

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. Performance Optimization: Geo-detection for initial state
  // We can inject a cookie or header with the user's estimated state to speed up hydration
  const country = request.geo?.country || 'US';
  const state = request.geo?.region || 'CA';
  response.cookies.set('x-user-geo', `${country}-${state}`, { path: '/', maxAge: 3600 });

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
