const CACHE_NAME = 'attendance-cache-v1';
const API_URL = '/api/dummy';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method === 'GET' && new URL(request.url).pathname === API_URL) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          // Try network first
          const networkResponse = await fetch(request);
          // Clone and store in cache
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          // If offline or fetch fails, try cache
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If not in cache, return a fallback response
          return new Response(JSON.stringify({ loggedIn: false, attendance: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
  } else {
    // For all other requests, use default fetch
    event.respondWith(fetch(request));
  }
});