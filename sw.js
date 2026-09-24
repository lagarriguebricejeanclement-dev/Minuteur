// Fonctionnement hors ligne : l'app est gardée dans le téléphone.
// Au lancement, la copie gardée s'affiche tout de suite ; s'il y a du réseau,
// la dernière version est téléchargée en arrière-plan et servira au lancement suivant.
const CACHE = 'minuteur';
const FILES = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(caches.open(CACHE).then(async c => {
    const saved = await c.match(key, { ignoreSearch: true });
    const fresh = fetch(req, { cache: 'no-cache' })
      .then(r => { if (r.ok) c.put(key, r.clone()); return r; })
      .catch(() => saved);
    if (saved) { e.waitUntil(fresh); return saved; }
    return fresh;
  }));
});
