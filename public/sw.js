
// Service Worker for improved performance and offline capabilities

const CACHE_NAME = 'digital-deals-cache-v1';

// Assets to pre-cache for immediate use
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/placeholder.svg',
];

// Install event - precache important resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Force activation on all clients
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      console.log(`${CACHE_NAME} now ready to handle fetches!`);
      return self.clients.claim(); // Take control of clients immediately
    })
  );
});

// Giảm thiểu số lượng requests được cache để tránh xung đột
const shouldCache = (url) => {
  // Chỉ cache assets tĩnh cơ bản và quan trọng
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) return true;
  if (url.pathname.endsWith('.woff2') || url.pathname.endsWith('.ttf')) return true;
  
  // Không cache API calls và tài nguyên động
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/auth/')) return false;
  
  return false;
};

// Simplified fetch strategy - network first only for important assets
self.addEventListener('fetch', (event) => {
  // Chỉ xử lý GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Nếu là asset cần cache
  if (shouldCache(url)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Nếu response ok, cache lại
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Nếu network fail, thử từ cache
          return caches.match(event.request);
        })
    );
  }
});
