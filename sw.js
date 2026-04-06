const CACHE_NAME = 'kiip-korean-v5';
const PRECACHE_URLS = [
  '/HanwhaOcean_Level1_Index.html',
  '/HanwhaOcean_Level2_Index.html',
  '/HanwhaOcean_Certificate.html',
  '/manifest.json',
  '/images/og-hanwha-level1.png',
  '/images/og-hanwha-level2.png',
  '/images/icon-192.svg',
  '/images/icon-512.svg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('elimg.com')) return;

  const isHtml = url.pathname.endsWith('.html') || url.pathname.includes('HanwhaOcean_') || url.pathname.includes('KIIP_');
  const isStaticAsset = url.pathname.startsWith('/images/') || url.pathname === '/manifest.json';

  if (isHtml) {
    // Network-first for lesson HTML: always fetch fresh, fall back to cache offline
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/HanwhaOcean_Level1_Index.html');
          }
        });
      })
    );
  } else if (isStaticAsset) {
    // Cache-first for images and manifest (infrequently changed)
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200 && response.type !== 'opaque') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        });
      })
    );
  }
});
