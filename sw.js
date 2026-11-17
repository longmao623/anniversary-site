// 版本号变更会让浏览器丢弃旧缓存，确保用户拿到部署后的新页面
const CACHE_NAME = 'anniversary-v2';
const PRECACHE_ASSETS = [
  './',
  './fonts/fonts.css',
  './js/dotlottie-player.js',
  './js/timeline-data.js',
  './js/timeline-logic.js',
  './js/timeline-render.js',
  './images/icon-192.png',
  './images/icon-512.png'
];

// Install: precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external requests
  if (request.method !== 'GET' || !url.pathname.startsWith('/')) {
    return;
  }

  const path = url.pathname;

  // HTML: network-first, fallback to cache
  if (path.endsWith('.html') || path === '/') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets (fonts, images, js, photos, lottie): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Revalidate in background
        fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
          }
        }).catch(() => {});
        return cached;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Return empty response for failed non-critical assets
        return new Response('', { status: 404 });
      });
    })
  );
});
