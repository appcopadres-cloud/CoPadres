/* CoPadres v14 — Service Worker */
const CACHE = 'copadres-v14.12';
const ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/icons.js',
  './js/ui.js',
  './js/data.js',
  './js/nav.js',
  './js/dashboard.js',
  './js/chat.js',
  './js/calendar.js',
  './js/children.js',
  './js/expenses.js',
  './js/agreements.js',
  './js/conflicts.js',
  './js/modals.js',
  './js/safety.js',
  './js/firebase-config.js',
  './js/sync.js',
  './js/analytics.js',
  './js/init.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './manifest.json'
];

const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>CoPadres — Sin conexión</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0D4D47;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}
  .card{background:rgba(255,255,255,.1);border-radius:24px;padding:32px;max-width:320px}
  h1{font-size:24px;margin-bottom:8px}
  p{opacity:.8;font-size:14px;line-height:1.5;margin-bottom:24px}
  button{background:#52C896;color:#0c3a2d;border:none;border-radius:14px;padding:14px 24px;font-size:15px;font-weight:700;cursor:pointer}
</style>
</head>
<body>
<div class="card">
  <div style="font-size:48px;margin-bottom:16px">📵</div>
  <h1>Sin conexión</h1>
  <p>No hay red disponible. Tus datos guardados siguen disponibles en la app.</p>
  <button onclick="location.reload()">Reintentar</button>
</div>
</body>
</html>`;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Don't cache external CDN requests (Leaflet, Google Fonts)
  const isExternal = url.origin !== self.location.origin;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(res => {
        if (res.ok && !isExternal) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (cached) return cached;
        if (e.request.headers.get('accept')?.includes('text/html')) {
          return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } });
        }
        return new Response('Offline', { status: 503 });
      });
      return cached || networkFetch;
    })
  );
});

// Handle deep links from manifest shortcuts
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
