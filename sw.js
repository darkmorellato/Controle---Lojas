/**
 * Service Worker - Controle de Vendas
 * Cache-first strategy com fallback offline
 * @version 2.0
 */

// Configuração de versão (incrementar em cada deploy)
const APP_VERSION = '2.0.0';
const CACHE_NAME = `controle-vendas-${APP_VERSION}`;

// Lista de assets estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js',
  '/assets/images/Prime.png',
  '/assets/images/Realme.png',
  '/assets/images/Honor.png',
  '/assets/images/kassouf.png',
  '/assets/images/Premium.png'
];

// Limite de tamanho do cache em MB (evita crescimento descontrolado)
const CACHE_SIZE_LIMIT_MB = 50;
const CACHE_SIZE_LIMIT = CACHE_SIZE_LIMIT_MB * 1024 * 1024;

// NÃO cacheamos CDNs externos - eles têm suas próprias políticas de cache
// Apenas assets locais são controlados pelo nosso SW

// Instalação - Cacheia assets estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Cacheando assets estáticos');

      // Cachear cada arquivo individualmente para lidar com erros
      for (const asset of STATIC_ASSETS) {
        try {
          const response = await fetch(asset, { mode: 'no-cors' });
          if (response.ok || response.type === 'opaque') {
            await cache.add(asset);
            console.log(`[SW] Cacheado: ${asset}`);
          } else {
            console.warn(`[SW] Falha ao cachear ${asset}: HTTP ${response.status}`);
          }
        } catch (error) {
          console.warn(`[SW] Erro ao cachear ${asset}:`, error.message);
          // Continua cacheando outros assets
        }
      }
    }).catch((error) => {
      console.error('[SW] Erro geral no cache:', error);
    })
  );

  self.skipWaiting();
});

// Ativação - Limpa caches antigos e controla tamanho
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');

  event.waitUntil(
    caches.keys().then(async (cacheNames) => {
      // Limpar caches antigos
      const oldCaches = cacheNames.filter((name) => name !== CACHE_NAME);

      if (oldCaches.length > 0) {
        console.log(`[SW] Limpando ${oldCaches.length} cache(s) antigo(s):`, oldCaches);
        await Promise.all(oldCaches.map((name) => caches.delete(name)));
      }

      // Verificar e limitar tamanho do cache atual
      await self.limitCacheSize(CACHE_NAME, CACHE_SIZE_LIMIT);
    })
  );

  self.clients.claim();
});

/**
 * Limita o tamanho do cache removendo entradas mais antigas
 * @param {string} cacheName - Nome do cache
 * @param {number} sizeLimit - Limite em bytes
 */
async function limitCacheSize(cacheName, sizeLimit) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const requests = await cache.keys();
    const cacheEntries = [];

    // Coletar entradas com metadados
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const size = await estimateResponseSize(response);
        cacheEntries.push({ request, response, size });
      }
    }

    const totalSize = cacheEntries.reduce((sum, entry) => sum + entry.size, 0);

    if (totalSize > sizeLimit) {
      console.log(`[SW] Cache ${cacheName} excedeu limite (${(totalSize / 1024 / 1024).toFixed(2)}MB). Limpando...`);

      // Ordenar por último acesso (se disponível) ou manter ordem original
      // Para simplificar, remover entradas aleatórias até ficar abaixo do limite
      const sortedBySize = cacheEntries.sort((a, b) => b.size - a.size);

      let currentSize = totalSize;
      for (const entry of sortedBySize) {
        if (currentSize <= sizeLimit * 0.9) break; // Manter 10% de margem

        await cache.delete(entry.request);
        currentSize -= entry.size;
        console.log(`[SW] Removida entrada de ${(entry.size / 1024).toFixed(2)}KB`);
      }

      console.log(`[SW]-limite final: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
    }
  } catch (error) {
    console.warn('[SW] Erro ao limitar tamanho do cache:', error);
  }
}

/**
 * Estima o tamanho de uma resposta em bytes
 * @param {Response} response - Objeto Response
 * @returns {Promise<number>} Tamanho estimado em bytes
 */
async function estimateResponseSize(response) {
  try {
    const blob = await response.clone().blob();
    return blob.size;
  } catch (error) {
    // Fallback para estimativa básica
    const headers = Array.from(response.headers.entries());
    const headersSize = headers.reduce((sum, [key, value]) => sum + key.length + value.length, 0);
    return headersSize + 1024; // Estimativa conservadora
  }
}

// Fetch - Estratégia Cache First apenas para assets locais
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não GET
  if (request.method !== 'GET') return;

  // Apenas assets do mesmo origem são cacheados
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  }
  // Não interceptamos CDNs externos - navegador gerencia próprio cache
});

/**
 * Estratégia Cache First
 * Busca no cache primeiro, se não encontrar vai à rede
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Erro ao buscar:', error);

    // Retorna página offline se for HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/index.html');
    }

    throw error;
  }
}

/**
 * Estratégia Stale While Revalidate
 * Retorna do cache imediatamente, mas atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(CACHE_NAME);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Sync em background (para quando o navegador suportar)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Sync em background');
  }
});

// Push notifications (quando implementado)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'Controle de Vendas', {
      body: data.body || 'Nova atualização disponível',
      icon: '/assets/images/Prime.png',
      badge: '/assets/images/Prime.png',
      data: data.url || '/'
    })
  );
});

// Notificação clicada
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
