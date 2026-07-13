const CACHE='sis-flight-mobile-v4';
const ASSETS=['./','index.html','styles.css','app.js','config.js','contacts.js','manifest.webmanifest',
'assets/plan-background.png','assets/icon-192.png','assets/icon-512.png','vendor/jspdf.umd.min.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request))));
