// public/sw.js
const STATIC_CACHE = 'static-cache-v0.2';
const DATA_CACHE = 'data-cache-v1';

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

  // Handle static files
  evt.respondWith(
    caches.match(request).then(cachedRes => {
      return cachedRes || fetch(request);
    })
  );
});
