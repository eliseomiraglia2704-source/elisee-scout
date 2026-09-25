/* ELISEE SCOUT — Cache Wipe & Self-Unregister Service Worker
   Assicura che nessun asset obsoleto rimanga memorizzato nella cache del browser.
*/
const CACHE = 'elisee-scout-v20260925-analytics1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Notifica tutti i client di forzare il reload
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          try {
            client.postMessage({
              type: 'FORCE_RELOAD',
              version: '20260925_ANALYTICS1',
              updatedAt: '2026-09-25T12:10:00Z',
              ts: '20260925_121000',
              bust: 'v20260925_ANALYTICS1'
            });
          } catch (e) {}
        });
      });
    }).then(() => {
      return self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through diretto alla rete, mai servire cache obsoleta
  event.respondWith(fetch(event.request));
});
