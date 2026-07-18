'use strict';

const CACHE_VERSION = 'v1';
const CACHE_NAME = `cow-abduction-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
    './index.html',
    './manifest.json',
    'css/style.css',
    'js/script.js',
    'img/favicon.png',
    'img/icon-192.png',
    'img/icon-512.png',
    'img/icon-maskable-512.png'
];
   
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting()) 
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name.startsWith('cow-abduction-') && name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
  
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
            
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            });
        })
    );
});