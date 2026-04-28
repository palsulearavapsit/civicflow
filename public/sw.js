// Service Worker for CivicFlow
const CACHE_NAME = 'civicflow-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/offline'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-offline-votes') {
    event.waitUntil(syncOfflineVotes());
  }
});

async function syncOfflineVotes() {
  // Logic to read from IndexedDB and push to Firebase
  console.log('Background Sync: Uploading offline votes...');
}
