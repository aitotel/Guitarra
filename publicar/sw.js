// Service worker mínimo: permite instalar la app y abrirla sin conexión (el vídeo de YouTube sí necesita Internet).
// Estrategia "red primero": si hay conexión se usa siempre la versión más reciente; si no, la guardada.
const CACHE = 'guitarra-v1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // YouTube y demás: directo a la red
  e.respondWith(
    fetch(r).then(resp => { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); return resp; })
      .catch(() => caches.match(r).then(x => x || caches.match('./index.html')))
  );
});
