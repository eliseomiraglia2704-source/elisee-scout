/* ELISEE SCOUT — Service Worker sicuro
   - Network-first
   - MAI servire HTML al posto di JS/CSS (causa "Unexpected token <")
   - Fallback HTML solo per navigazioni pagina
*/
const CACHE = 'elisee-scout-shell-v6-safe';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/i18n.js',
  '/integrazioni.css',
  '/integrazioni-runtime.js',
  '/autopilot.css',
  '/autopilot-runtime.js',
  '/agents-runtime.js',
  '/cookie-profiling.js',
  '/ai-gdpr-monitor.js',
  '/war-room-runtime.js',
  '/campionati-agents.js',
  '/campionati-supervisors.js'
];

function isHtmlPath(path) {
  return path === '/' || path.endsWith('.html') || path.endsWith('/');
}

function isAssetPath(path) {
  return (
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.svg') ||
    path.endsWith('.webp') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.json')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  const path = url.pathname;
  const isNavigate = req.mode === 'navigate' || isHtmlPath(path);
  const isAsset = isAssetPath(path);

  // Navigazione HTML: network-first, fallback cache HTML
  if (isNavigate) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put('/index.html', copy).catch(() => {}));
          }
          return res || caches.match('/index.html');
        })
        .catch(async () => {
          return (
            (await caches.match('/index.html')) ||
            (await caches.match('/')) ||
            new Response(
              '<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>ELISEE SCOUT</title></head><body style="background:#050810;color:#e2e8f0;font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center"><div><h1>ELISEE SCOUT</h1><p>Connessione in ripristino…</p><button onclick="location.reload()">Riprova</button></div><script>setTimeout(function(){location.reload()},1000)<\/script></body></html>',
              { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            )
          );
        })
    );
    return;
  }

  // JS/CSS/asset: network-first, fallback SOLO stessa risorsa in cache (mai index.html)
  if (isAsset) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => {
              c.put(req, copy).catch(() => {});
              // cache anche senza querystring
              try {
                const clean = path;
                c.put(clean, res.clone()).catch(() => {});
              } catch (e) {}
            });
            return res;
          }
          // risposta non ok: prova cache, mai HTML
          return caches.match(req).then((hit) => hit || caches.match(path) || res);
        })
        .catch(async () => {
          const hit = (await caches.match(req)) || (await caches.match(path));
          if (hit) return hit;
          // 503 testo, NON html (evita Unexpected token <)
          return new Response('/* offline: ' + path + ' */', {
            status: 503,
            headers: { 'Content-Type': path.endsWith('.css') ? 'text/css' : 'application/javascript' }
          });
        })
    );
    return;
  }
});
