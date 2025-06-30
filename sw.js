// public/sw.js
const CACHE_NAME = 'stamp-maker-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에 있으면 반환, 없으면 네트워크에서 가져오기
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});