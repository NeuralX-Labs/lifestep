const CACHE_NAME = 'lifestep-v1';

const CACHED_URLS = [
  '/',
  '/dashboard',
  '/quests',
  '/shop',
  '/profile',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Al instalarse: guarda los archivos principales en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHED_URLS))
      .then(() => self.skipWaiting())
  );
});

// Al activarse: elimina cachés de versiones antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Al recibir peticiones: intenta la red primero, si falla usa caché
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
