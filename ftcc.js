// 1. Increment this version name whenever you update any files
const CACHE_NAME = '1FTCC03';

const ASSETS = [
  '1FTCC.html',
  'ftcc.json',
  'FTCCMusic1.png'
];

// Install Event: Cache assets and bypass the waiting phase immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event: Claim clients immediately and purge older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Purging legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first strategy for HTML/Data, falling back to cache if offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Update the cache dynamically with the fresh server copy
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), fall back to cached copy
        return caches.match(event.request);
      })
  );
});
