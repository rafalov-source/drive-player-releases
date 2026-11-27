// Guarda la propia app (no los vídeos ni tus datos) para que abra al
// instante. Cada versión nueva usa una caché nueva.
const VERSION = '1.0.45';
const CACHE = 'drive-player-' + VERSION;
const FILES = ['./', 'index.html', 'app.css?v=' + VERSION, 'app.js?v=' + VERSION, 'config.js?v=' + VERSION,
  'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Solo los archivos de la app; Google, TMDB y los vídeos van directos.
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // La página: primero la red (para coger versiones nuevas), si no hay, la guardada.
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('./', copy));
      return res;
    }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
