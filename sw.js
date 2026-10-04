/* ELISEE SCOUT — Cache Wipe & Self-Unregister Service Worker
   Assicura che nessun asset obsoleto rimanga memorizzato nella cache del browser.
*/
const CACHE = 'elisee-scout-v20261004-fix34';

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
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        return Promise.all(clients.map((client) => {
          try {
            client.postMessage({
              type: 'FORCE_RELOAD',
              version: '20261004_FIX34',
              updatedAt: '2026-10-04T18:50:00Z',
              ts: '20261004_185000',
              bust: 'v20261004_FIX34'
            });
          } catch (e) {}
          try {
            if (client.navigate && client.url) {
              var next = new URL(client.url);
              next.searchParams.set('_es', Date.now().toString(36));
              return client.navigate(next.href);
            }
          } catch (e) {}
          return null;
        }));
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
