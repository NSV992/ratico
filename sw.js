// Ratico: guarda todo en el dispositivo para jugar sin internet.
// Cuando cambies la app, sube el número de VERSION para que los dispositivos descarguen la nueva.
const VERSION = 'ratico-v2';
const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap';
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "maskable-512.png",
  "apple-180.png",
  "lib/d3-array.min.js",
  "lib/d3-geo.min.js",
  "lib/topojson-client.min.js",
  "data/countries.json",
  "data/countries-lo.json",
  "data/cities.json",
  "data/marine.json",
  "data/adm1.json"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES).then(() => c.add(new Request(FONTS_CSS, { mode: 'cors' })).catch(() => {}))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const cacheable = url => url.origin === location.origin || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!cacheable(url)) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: url.origin === location.origin }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => url.origin === location.origin ? caches.match('index.html') : Response.error()))
  );
});
