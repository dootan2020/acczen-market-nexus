
// Service Worker for improved performance and offline capabilities

const CACHE_NAME = 'acczen-cache-v1';

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

// Helper: Should we cache this request?
const shouldCache = (url) => {
  // Cache static assets and API responses that should be cached
  if (url.pathname.startsWith('/assets/')) return true;
  if (url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.svg') || 
      url.pathname.endsWith('.webp')) return true;
  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) return true;
  if (url.pathname.endsWith('.woff2') || url.pathname.endsWith('.ttf')) return true;
  
  // Don't cache API calls that shouldn't be cached
  if (url.pathname.includes('/auth/') || 
      url.pathname.includes('/checkout/') ||
      url.pathname.includes('/api/order') ||
      url.pathname.includes('/api/stock')) return false;
  
  return false;
};

// Network-first strategy with cache fallback for most requests
const networkFirst = async (request) => {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Only cache valid responses
    if (networkResponse.ok) {
      const url = new URL(request.url);
      
      // Cache response if appropriate
      if (shouldCache(url)) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        console.log(`Cached: ${request.url}`);
      }
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log(`Serving from cache: ${request.url}`);
      return cachedResponse;
    }
    
    // Nothing in cache, propagate error
    throw error;
  }
};

// Cache-first strategy for static assets
const cacheFirst = async (request) => {
  // Check cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log(`Serving from cache: ${request.url}`);
    return cachedResponse;
  }
  
  // If not in cache, get from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for next time
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error(`Failed to fetch: ${request.url}`, error);
    throw error;
  }
};

// Fetch event - handle all requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle different request types with appropriate strategies
  if (event.request.method !== 'GET') {
    // For non-GET requests, go straight to network
    return;
  }
  
  // For static assets like images, CSS, JS - use cache-first
  if (shouldCache(url)) {
    event.respondWith(cacheFirst(event.request));
  } else {
    // For everything else - use network-first
    event.respondWith(networkFirst(event.request));
  }
});

// Handle background sync for offline operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  }
});

// Helper function to sync cart data when online
async function syncCart() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedRequests = await cache.keys();
    const pendingOperations = cachedRequests.filter(
      request => request.url.includes('/api/cart-sync')
    );
    
    for (const request of pendingOperations) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync operation:', error);
      }
    }
    
    console.log('Cart sync completed');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/android-chrome-192x192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        const url = event.notification.data.url;
        
        // Check if there is an open window
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no open window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
