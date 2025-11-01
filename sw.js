self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './sqlite-loader.js',
        './ui-handler.js',
        './style.css',
        'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.7.0/sql-wasm.js'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
