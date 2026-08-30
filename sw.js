/* ELISEE SCOUT — Service Worker sicuro
   - Network-first
   - MAI servire HTML al posto di JS/CSS (causa "Unexpected token <")
   - Fallback HTML solo per navigazioni pagina
*/
const CACHE = 'elisee-scout-v20260830-logomonteg1';
const PRECACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/public-rating-system.js',
  '/player-dash.css',
  '/dash-luxury.css',
  '/dash-real.js',
  '/player-dash.js',
  '/coach-dash.css',
  '/coach-dash.js',
  '/ds-dash.css',
  '/ds-dash.js',
  '/pres-dash.css',
  '/pres-dash.js',
  '/vice-dash.css',
  '/vice-dash.js',
  '/fisio-dash.css',
  '/fisio-dash.js',
  '/ma-dash.css',
  '/ma-dash.js',
  '/med-dash.css',
  '/med-dash.js',
  '/tifoso-dash.css',
  '/tifoso-dash.js',
  '/giorn-dash.css',
  '/giorn-dash.js',
  '/obs-dash.css',
  '/obs-dash.js',
  '/tm-dash.css',
  '/tm-dash.js',
  '/gk-dash.css',
  '/gk-dash.js',
  '/at-dash.css',
  '/at-dash.js',
  '/yg-dash.css',
  '/yg-dash.js',
  '/dg-dash.css',
  '/dg-dash.js',
  '/ag-dash.css',
  '/ag-dash.js',
  '/mk-dash.css',
  '/mk-dash.js',
  '/pr-dash.css',
  '/pr-dash.js',
  '/nu-dash.css',
  '/nu-dash.js',
  '/eq-dash.css',
  '/eq-dash.js',
  '/sg-dash.css',
  '/sg-dash.js',
  '/bt-dash.css',
  '/bt-dash.js',
  '/schede-tecniche.css',
  '/schede-tecniche.js',
  '/mercato-hub.css',
  '/mercato-hub.js',
  '/player-profile.css',
  '/player-profile.js',
  '/scopri-profili.css',
  '/scopri-profili.js',
  '/messaggi.css',
  '/messaggi.js',
  '/data/squadre/scopri-clubs.json',
  '/mappa-club.css',
  '/mappa-club.js',
  '/chi-segui.js',
  '/formazione-squadra.css',
  '/formazione-squadra.js',
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
  '/campionati-supervisors.js',
  '/squadre-select.css',
  '/squadre-select.js',
  '/minigioco-carriera.css',
  '/minigioco-carriera.js',
  '/piramide-italia.js',
  '/club-storia.js',
  '/creator-role-switcher.css',
  '/creator-role-switcher.js',
  '/role-actions-runtime.js'
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
    path.endsWith('.woff2')
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
