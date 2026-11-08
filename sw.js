// Höj versionen vid varje ändring av appfilerna så att iPaden hämtar nya filer.
const CACHE = 'hallskarm-v5';

const SHELL = [
  './',
  './index.html',
  './styles.css',
  './config.js',
  './installningar.js',
  './tid.js',
  './vader.js',
  './sl.js',
  './ljud.js',
  './flyg.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// Bibliotek och typsnitt: cache först
const CDN_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

// Kartrutor i egen cache så att kartan syns även vid kort avbrott
const TILE_CACHE = 'hallskarm-tiles';
const TILE_MAX = 800;
const isTile = (host) => host === 'server.arcgisonline.com';

async function trimTiles() {
  const c = await caches.open(TILE_CACHE);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - TILE_MAX; i++) await c.delete(keys[i]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== TILE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') { const kopia = res.clone(); caches.open(CACHE).then((c) => c.put(req, kopia)); }
        return res;
      }))
    );
    return;
  }

  if (isTile(url.hostname)) {
    event.respondWith(
      caches.open(TILE_CACHE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trimTiles(); }
        return res;
      })))
    );
    return;
  }

  // Data-API:er (väder, SL, flyg) går alltid direkt till nätet
  if (url.origin !== self.location.origin) return;

  // Testrapporten ska aldrig cachas eller blandas ihop med appen
  if (url.pathname.includes('/rapport/')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const kopia = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', kopia)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Egna filer: nätet först så att nya versioner alltid används
  event.respondWith(
    fetch(req)
      .then((res) => { if (res.ok) { const kopia = res.clone(); caches.open(CACHE).then((c) => c.put(req, kopia)); } return res; })
      .catch(() => caches.match(req))
  );
});
