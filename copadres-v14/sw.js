/* CoPadres v14 — Service Worker */
const CACHE = 'copadres-v14';
const ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/icons.js',
  '/js/data.js',
  '/js/nav.js',
  '/js/dashboard.js',
  '/js/chat.js',
  '/js/calendar.js',
  '/js/children.js',
  '/js/expenses.js',
  '/js/agreements.js',
  '/js/conflicts.js',
  '/js/modals.js',
  '/js/safety.js',
  '/js/init.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});
