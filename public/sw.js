importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

/**
 * EFF-01: Workbox Service Worker.
 * Implements advanced caching strategies:
 * - CacheFirst for images (1 year)
 * - StaleWhileRevalidate for scripts/styles
 * - NetworkFirst for API data
 */

const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/chat',
  '/map',
  '/offline.html',
  '/manifest.json'
];

if (workbox) {
  console.log('Workbox is loaded');
  
  // Precache core assets
  workbox.precaching.precacheAndRoute(PRECACHE_ASSETS.map(url => ({ url, revision: 'v2' })));

  // Cache Images
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache CSS/JS
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-resources',
    })
  );

  // Cache API data (Network First)
  workbox.routing.registerRoute(
    ({url}) => url.pathname.startsWith('/api/'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'api-responses',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 Minutes
        }),
      ],
    })
  );

  // Offline Fallback
  workbox.routing.setCatchHandler(async ({event}) => {
    if (event.request.destination === 'document') {
      return caches.match('/offline.html');
    }
    return Response.error();
  });
}
