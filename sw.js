'use strict';

/**
 * ==========================================================================
 * SERVICE WORKER — COW ABDUCTION
 * Cacheia os arquivos essenciais para o jogo funcionar offline e ser
 * instalável como app no navegador (Android/desktop; iOS via "Adicionar à
 * Tela de Início" também respeita o manifest, mas não instala o SW).
 * ==========================================================================
 */

// Suba este número sempre que alterar algum arquivo do jogo — isso invalida
// o cache antigo e força os usuários a baixarem a versão nova.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `cow-abduction-${CACHE_VERSION}`;

// Caminhos relativos a este arquivo (sw.js vive em /paginas/)
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

/* ==========================================================================
   INSTALAÇÃO — baixa e guarda os arquivos no cache
   ========================================================================== */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting()) // ativa a nova versão imediatamente
    );
});

/* ==========================================================================
   ATIVAÇÃO — remove caches de versões antigas
   ========================================================================== */
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

/* ==========================================================================
   FETCH — estratégia "cache first, fallback para rede"
   Ideal para um jogo estático: carrega instantâneo e funciona offline.
   ========================================================================== */
self.addEventListener('fetch', (event) => {
    // Só intercepta requisições GET (evita interferir em outras chamadas)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then(networkResponse => {
                // Guarda uma cópia no cache para a próxima vez
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return networkResponse;
            });
        })
    );
});