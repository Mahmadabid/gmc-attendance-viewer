// public/sw.js
const STATIC_CACHE = 'static-cache-v2';
const DATA_CACHE = 'data-cache-v1';
const FETCH_URL = '/api/dummy';

// List all the URLs you need for offline — pages + public assets
const STATIC_FILES = [
  '/',
  '/settings',
  // add here any other static file paths you use (fonts, CSS, etc.)
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  // clean up old caches
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DATA_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evt => {
  const { request } = evt;
  const url = new URL(request.url);
  // 1) API requests to FETCH_URL
  if (url.pathname === FETCH_URL) {
    // Check if refresh parameter is present
    const hasRefreshParam = url.searchParams.has('refresh');    
    if (hasRefreshParam) {
      // Network-first strategy when refresh=true (refresh button was clicked)
      evt.respondWith(
        caches.open(DATA_CACHE).then(async cache => {
          // Create a normalized request without the refresh parameter for caching
          const normalizedUrl = new URL(request.url);
          normalizedUrl.searchParams.delete('refresh');
          const normalizedRequest = new Request(normalizedUrl.toString(), {
            method: request.method,
            headers: request.headers,
            mode: request.mode,
            credentials: request.credentials
          });
          
          try {
            const res = await fetch(request);
            // Store in cache using the normalized request (without refresh param)
            cache.put(normalizedRequest, res.clone());
            return res;
          } catch {
            return await
              // When network fails, try to match the normalized request
              cache.match(normalizedRequest);
          }
        })
      );    } else {
      // Cache-first strategy for normal page loads
      evt.respondWith(
        caches.open(DATA_CACHE).then(async cache => {
          // Use the normalized request format for consistent caching
          const normalizedUrl = new URL(request.url);
          normalizedUrl.searchParams.delete('refresh'); // Just in case
          const normalizedRequest = new Request(normalizedUrl.toString(), {
            method: request.method,
            headers: request.headers,
            mode: request.mode,
            credentials: request.credentials
          });
          
          // Try to match with the normalized request
          const cached = await cache.match(normalizedRequest);
          // Return cached response if exists
          if (cached) {
            return cached;
          }
          const response = await fetch(request);
          // Store using the normalized key for consistency
          cache.put(normalizedRequest, response.clone());
          return response;
        })
      );
    }
    return;
  }

  // 2) All other GET requests from our STATIC_FILES — cache-first
  if (request.method === 'GET' && STATIC_FILES.includes(url.pathname)) {
    evt.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request)
      )
    );
    return;
  }

  // 3) Let everything else go to network
  evt.respondWith(fetch(request));
});
