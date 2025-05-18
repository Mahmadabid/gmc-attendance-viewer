// public/sw.js
const STATIC_CACHE = 'static-cache-v1';
const DATA_CACHE = 'data-cache-v1';
const FETCH_URL = '/api/dummy';

// List all the URLs you need for offline — pages + public assets
const STATIC_FILES = [
  '/',
  '/settings',
  '/logo.png',
  '/logo-144.png',
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
    // Normalize cache key: always use /api/dummy (strip refresh param)
    const cacheKeyUrl = new URL(request.url);
    cacheKeyUrl.searchParams.delete('refresh');
    const cacheKey = new Request(cacheKeyUrl, { method: request.method, headers: request.headers, credentials: request.credentials, redirect: request.redirect, referrer: request.referrer, referrerPolicy: request.referrerPolicy, mode: request.mode, cache: request.cache, integrity: request.integrity, keepalive: request.keepalive, signal: request.signal });

    // Check if refresh parameter is present
    const hasRefreshParam = url.searchParams.has('refresh');

    if (hasRefreshParam) {
      // Network-first strategy when refresh=true (refresh button was clicked)
      evt.respondWith(
        caches.open(DATA_CACHE).then(cache =>
          fetch(request)
            .then(res => {
              // clone & store in cache using normalized key
              cache.put(cacheKey, res.clone());
              return res;
            })
            .catch(() =>
              cache.match(cacheKey)
            )
        )
      );
    } else {
      // Cache-first strategy for normal page loads
      evt.respondWith(
        caches.open(DATA_CACHE).then(cache =>
          cache.match(cacheKey)
            .then(cached => {
              // Return cached response if exists
              if (cached) {
                return cached;
              }
              // Otherwise fetch from network
              return fetch(request)
                .then(response => {
                  cache.put(cacheKey, response.clone());
                  return response;
                });
            })
        )
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
