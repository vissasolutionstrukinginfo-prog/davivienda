// Service Worker para PWA con notificaciones push y sincronización en tiempo real
const CACHE_NAME = 'davivienda-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cacheando archivos...');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Error cacheando archivos:', error);
      })
  );
  self.skipWaiting();
});

// Activación del service worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activándose...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requests para cache primero, luego red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cache app shell resources dynamically when available.
              if (event.request.url.startsWith(self.location.origin)) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('📨 Notificación push recibida:', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Tienes una nueva notificación de Davivienda',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'davivienda-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Davivienda Móvil', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Click en notificación:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Abrir la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data?.url || '/';

        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Sincronización en segundo plano (Background Sync)
self.addEventListener('sync', (event) => {
  console.log('🔄 Sincronización en segundo plano:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Función para sincronizar datos pendientes
async function syncData() {
  try {
    console.log('📡 Sincronizando datos pendientes...');

    // Aquí iría la lógica para sincronizar transacciones pendientes,
    // actualizar saldos, enviar datos locales al servidor, etc.

    // Por ejemplo:
    // await syncPendingTransactions();
    // await updateBalances();
    // await syncUserData();

    console.log('✅ Datos sincronizados correctamente');
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('💬 Mensaje recibido en SW:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'UPDATE_CACHE') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(urlsToCache);
        })
    );
  }
});

// Periodic sync (si está disponible)
if ('periodicSync' in self.registration) {
  self.registration.periodicSync.register('update-data', {
    minInterval: 24 * 60 * 60 * 1000, // 24 horas
  });
}

// Actualizaciones automáticas del service worker
self.addEventListener('updatefound', () => {
  console.log('🔄 Nueva versión del Service Worker encontrada');

  // Notificar a los clientes sobre la actualización
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SW_UPDATE_AVAILABLE'
      });
    });
  });
});