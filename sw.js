// GutiPilot 3.0.6 — Service Worker de limpieza.
// Se autodesinstala y elimina cachés antiguas para evitar versiones retenidas.
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.registration.unregister();
    const clientsList = await self.clients.matchAll({ type: 'window' });
    clientsList.forEach(client => client.navigate(client.url));
  })());
});
self.addEventListener('fetch', () => {});
