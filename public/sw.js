const CACHE_NAME = 'gmc-attendance-cache-v1';
const APP_SHELL = [
  '/',
  '/settings',
  '/manifest.webmanifest',
  '/logo.png',
  '/logo-144.png',
  // Add more static assets if needed
];

// Precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: cache API data
async function cacheApiData(request) {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
}

// Helper: clear all caches
async function clearAllCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

// Listen for messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_ATTENDANCE') {
    cacheApiData(new Request('/api/data', { credentials: 'include' }));
  } else if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    clearAllCaches();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // App shell: try cache first, then network
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // API: /api/data - try cache, then network (if offline, serve cache)
  if (url.pathname === '/api/data') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Try network in background, but serve cache immediately
          fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response.clone());
                });
              }
            })
            .catch(() => {}); // Ignore network errors
          return cached;
        } else {
          // No cache, try network
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response.clone());
                });
              }
              return response;
            })
            .catch(() => new Response(JSON.stringify({ error: 'Offline and no cached data available', loggedIn: false }), { status: 503, headers: { 'Content-Type': 'application/json' } }));
        }
      })
    );
    return;
  }

  // Fallback: try network, fallback to cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});