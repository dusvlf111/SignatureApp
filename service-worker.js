// public/service-worker.js

const CACHE_NAME = 'my-app-cache-v1'; // 배포 시 버전만 올리면 캐시 강제 갱신
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/css/main.chunk.css',
  // 필요하면 static/media/* 추가
];

// 앱 설치 시: 모든 리소스 캐시에 저장
self.addEventListener('install', event => {
  console.log('[Service Worker] Installed');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching all files');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // 즉시 활성화
});

// 요청 처리: 캐시된 파일 우선 제공, 없으면 네트워크 요청
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 캐시 정리: 새로운 버전이 오면 구버전 캐시 삭제
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
