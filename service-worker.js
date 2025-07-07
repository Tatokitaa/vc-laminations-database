// Service Worker para VC Laminations Database
// Versión 1.0.0

const CACHE_NAME = 'vc-laminations-v1.0.0';
const OFFLINE_CACHE = 'vc-laminations-offline-v1.0.0';

// Archivos críticos para cache
const CRITICAL_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/logo.jpg',
  '/logo.svg',
  '/manifest.json'
];

// Datos importantes para cache offline
const API_CACHE = 'vc-laminations-api-v1.0.0';

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache de archivos críticos
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Cacheando archivos críticos...');
        return cache.addAll(CRITICAL_FILES);
      }),
      // Cache offline
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('[SW] Preparando cache offline...');
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('[SW] Service Worker instalado correctamente');
      // Forzar activación inmediata
      return self.skipWaiting();
    })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        const validCaches = [CACHE_NAME, OFFLINE_CACHE, API_CACHE];
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!validCaches.includes(cacheName)) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediato
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker activado y en control');
    })
  );
});

// Interceptar requests (estrategia Cache First para recursos estáticos)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) return;
  
  // Estrategias diferentes según el tipo de request
  if (request.url.includes('/api/')) {
    // API requests: Network First con fallback a cache
    event.respondWith(handleAPIRequest(request));
  } else if (CRITICAL_FILES.some(file => request.url.includes(file))) {
    // Archivos críticos: Cache First
    event.respondWith(handleCriticalFiles(request));
  } else {
    // Otros recursos: Network First
    event.respondWith(handleOtherRequests(request));
  }
});

// Manejo de requests de API
async function handleAPIRequest(request) {
  const cacheName = API_CACHE;
  
  try {
    // Intentar red primero
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Si la respuesta es exitosa, guardar en cache
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible para API, buscando en cache...');
    
    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Respuesta servida desde cache:', request.url);
      return cachedResponse;
    }
    
    // Si no hay cache, devolver respuesta offline personalizada
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        message: 'No hay conexión a internet y no hay datos en cache',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejo de archivos críticos
async function handleCriticalFiles(request) {
  try {
    // Cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no está en cache, ir a la red
    const networkResponse = await fetch(request);
    
    // Actualizar cache
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Error cargando archivo crítico:', request.url);
    
    // Fallback para página principal
    if (request.url.includes('index.html') || request.url.endsWith('/')) {
      const cachedIndex = await caches.match('/index.html');
      if (cachedIndex) return cachedIndex;
    }
    
    throw error;
  }
}

// Manejo de otros requests
async function handleOtherRequests(request) {
  try {
    // Network first
    const networkResponse = await fetch(request);
    
    // Cache recursos exitosos
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Manejo de sincronización en background
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Ejecutando sincronización en background...');
    event.waitUntil(syncData());
  }
});

// Función de sincronización
async function syncData() {
  try {
    // Aquí podrías sincronizar datos pendientes
    console.log('[SW] Sincronización completada');
  } catch (error) {
    console.error('[SW] Error en sincronización:', error);
  }
}

// Manejo de notificaciones push (preparado para futuro)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      tag: 'vc-laminations',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Abrir App'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[SW] Service Worker cargado correctamente');
