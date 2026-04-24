import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Extract geo-location from headers (provided by hosting like Vercel)
  const country = (request as any).geo?.country || 'US';
  const city = (request as any).geo?.city || 'Unknown';
  const region = (request as any).geo?.region || 'Unknown';

  // Set a custom header for the app to consume
  response.headers.set('x-civicflow-geo-country', country);
  response.headers.set('x-civicflow-geo-city', city);
  response.headers.set('x-civicflow-geo-region', region);

  // Security: Add basic rate limiting signal (can be expanded)
  // For this hackathon, we'll just log the request
  console.log(`[Middleware] Request from ${city}, ${region} (${country})`);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
