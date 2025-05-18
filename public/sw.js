const CACHE_NAME = 'gmc-attendance-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/settings',
  '/logo.png',
  '/logo-144.png',
  // add more static assets if needed
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Skip screenshot files
  if (url.pathname.startsWith('/screenshot')) {
    return;
  }

  // Stale-while-revalidate for /api/dummy
  if (url.pathname === '/api/dummy') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
            // Notify clients to update UI
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({ type: 'API_DUMMY_UPDATED' });
              });
            });
          }
          return networkResponse;
        });
        // Serve cache first, then update in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: cache-first for app shell
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response || fetch(event.request).then((fetchResponse) => {
          return fetchResponse;
        })
      );
    })
  );
});