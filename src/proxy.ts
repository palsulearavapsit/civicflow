import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // CSP with Nonce - the ultimate protection for modern web apps
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googleapis.com *.gstatic.com;
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

  // Extract geo-location from headers (provided by hosting like Vercel)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const country = (request as any).geo?.country || 'US';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const city = (request as any).geo?.city || 'Unknown';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const region = (request as any).geo?.region || 'Unknown';


  response.headers.set('x-civicflow-geo-country', country);
  response.headers.set('x-civicflow-geo-city', city);
  response.headers.set('x-civicflow-geo-region', region);
  
  // Performance Optimization: Geo-detection cookie for initial state
  response.cookies.set('x-user-geo', `${country}-${region}`, { path: '/', maxAge: 3600 });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

