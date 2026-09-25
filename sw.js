// Calistenia · service worker (v32)
// Primero la red: así siempre se carga la última versión subida a GitHub.
// Si no hay conexión, usa la copia guardada para poder entrenar igualmente.
const CACHE = 'calistenia-v32';

self.addEventListener('install', () => self.skipWaiting());

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
  if (url.origin !== self.location.origin) return;   // YouTube, vídeos, etc.: no se tocan
  e.respondWith(
    fetch(e.request.url, { cache: 'no-store' })
      .then(resp => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
