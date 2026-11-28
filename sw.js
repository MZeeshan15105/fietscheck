/* FietsCheck offline support. Change VERSION whenever you upload new files. */
const VERSION = 'fietscheck-v1.25.0';
const FILES = ['./', 'index.html', 'privacy.html', 'terms.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-32.png', 'icons/apple-touch-icon.png',
  'fonts/archivo-var-latin.woff2', 'img/bike-city.webp', 'img/bike-ebike.webp', 'img/wall-light.svg', 'img/wall-dark.svg', 'img/wall-hero.svg',
  'img/tiles/bg.webp', 'img/tiles/fix.webp', 'img/tiles/find.webp', 'img/tiles/warranty.webp', 'img/tiles/check.webp', 'img/tiles/example.webp', 'img/tiles/winter.webp', 'img/tiles/survey.webp'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // never cache downloads (the APK) or other big files
  if (url.pathname.includes('/download/') || /\.(apk|zip|mp4)$/i.test(url.pathname)) return;
  // pages: network first so updates show, cache when offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(VERSION).then(x => x.put(req, c)); return n; })));
});
