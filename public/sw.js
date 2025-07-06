/**
 * Service Worker for Push Notifications
 * خدمة العامل للإشعارات المنبثقة
 * 
 * Handles push notifications and background sync
 */

const CACHE_NAME = 'spsa-notifications-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg',
  '/assets/images/logo.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        console.log('Service Worker: Caching files');

        // Cache files individually to handle failures gracefully
        const cachePromises = urlsToCache.map(async (url) => {
          try {
            await cache.add(url);
            console.log(`Service Worker: Cached ${url}`);
          } catch (error) {
            console.warn(`Service Worker: Failed to cache ${url}:`, error);
            // Continue with other files even if one fails
          }
        });

        await Promise.allSettled(cachePromises);
        console.log('Service Worker: Cache installation completed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
        // Don't prevent installation, just log the error
        return self.skipWaiting();
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip external requests that might cause CSP violations
  const url = new URL(event.request.url);
  const isExternal = url.origin !== self.location.origin;
  const isUnsplash = url.hostname.includes('unsplash.com');
  const isFonts = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isCDN = url.hostname.includes('cdnjs.cloudflare.com');

  // Let browser handle external resources normally
  if (isExternal && (isUnsplash || isFonts || isCDN)) {
    return;
  }

  // Handle same-origin requests with caching
  if (!isExternal) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          if (response) {
            return response;
          }

          // Check if this is a backend API request
          const isBackendApi = event.request.url.includes('localhost:3001') ||
                              event.request.url.includes('/api/');

          if (isBackendApi) {
            // For backend API requests, fail silently and return a proper error response
            return new Response(JSON.stringify({
              error: 'Backend unavailable',
              fallback: true
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          return fetch(event.request);
        })
        .catch((error) => {
          // Only log non-backend errors to reduce noise
          const isBackendApi = event.request.url.includes('localhost:3001') ||
                              event.request.url.includes('/api/');

          if (!isBackendApi) {
            console.warn('SW: Fetch failed:', error);
          }

          // Return offline page if available for document requests
          if (event.request.destination === 'document') {
            return caches.match('/offline.html').catch(() => {
              // Return basic offline response if no offline page
              return new Response('Offline', { status: 503 });
            });
          }

          // For API requests, return proper error response
          if (isBackendApi) {
            return new Response(JSON.stringify({
              error: 'Service unavailable',
              fallback: true
            }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          // For other requests, let them fail naturally
          throw error;
        })
    );
  }
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received', event);
  
  let notificationData = {
    title: 'إشعار جديد',
    body: 'لديك إشعار جديد من الجمعية السعودية للعلوم السياسية',
    icon: '/favicon.ico',
    badge: '/badge.png',
    tag: 'spsa-notification',
    data: {
      url: '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'عرض',
        icon: '/icons/view.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق',
        icon: '/icons/dismiss.png'
      }
    ],
    requireInteraction: false,
    silent: false
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('Service Worker: Error parsing push data', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Show notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      timestamp: notificationData.data.timestamp || Date.now(),
      dir: 'rtl', // Right-to-left for Arabic
      lang: 'ar'
    }).then(() => {
      console.log('Service Worker: Notification shown successfully');
      
      // Track notification display
      if (notificationData.data && notificationData.data.trackingUrl) {
        fetch(notificationData.data.trackingUrl, {
          method: 'POST',
          body: JSON.stringify({
            event: 'notification_displayed',
            notificationId: notificationData.data.notificationId,
            timestamp: Date.now()
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch((error) => {
          console.error('Service Worker: Failed to track notification display', error);
        });
      }
    }).catch((error) => {
      console.error('Service Worker: Failed to show notification', error);
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  // Close notification
  notification.close();

  // Handle different actions
  if (action === 'dismiss') {
    console.log('Service Worker: Notification dismissed');
    return;
  }

  // Default action or 'view' action
  const urlToOpen = data.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          console.log('Service Worker: Focusing existing window');
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        console.log('Service Worker: Opening new window', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    }).then(() => {
      // Track notification click
      if (data.trackingUrl) {
        fetch(data.trackingUrl, {
          method: 'POST',
          body: JSON.stringify({
            event: 'notification_clicked',
            action: action || 'default',
            notificationId: data.notificationId,
            timestamp: Date.now()
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch((error) => {
          console.error('Service Worker: Failed to track notification click', error);
        });
      }
    }).catch((error) => {
      console.error('Service Worker: Error handling notification click', error);
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event);
  
  const notification = event.notification;
  const data = notification.data || {};

  // Track notification close
  if (data.trackingUrl) {
    event.waitUntil(
      fetch(data.trackingUrl, {
        method: 'POST',
        body: JSON.stringify({
          event: 'notification_closed',
          notificationId: data.notificationId,
          timestamp: Date.now()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch((error) => {
        console.error('Service Worker: Failed to track notification close', error);
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      syncNotifications()
    );
  }
});

// Sync notifications function
async function syncNotifications() {
  try {
    console.log('Service Worker: Syncing notifications...');
    
    // Get pending notifications from IndexedDB or localStorage
    const pendingNotifications = await getPendingNotifications();
    
    if (pendingNotifications.length > 0) {
      console.log(`Service Worker: Found ${pendingNotifications.length} pending notifications`);
      
      // Process each pending notification
      for (const notification of pendingNotifications) {
        try {
          await processNotification(notification);
          await removePendingNotification(notification.id);
        } catch (error) {
          console.error('Service Worker: Failed to process notification', error);
        }
      }
    }
    
    console.log('Service Worker: Notification sync completed');
  } catch (error) {
    console.error('Service Worker: Notification sync failed', error);
  }
}

// Get pending notifications (placeholder - implement with IndexedDB)
async function getPendingNotifications() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

// Process notification (placeholder)
async function processNotification(notification) {
  // This would typically send the notification to the server
  console.log('Service Worker: Processing notification', notification);
}

// Remove pending notification (placeholder)
async function removePendingNotification(notificationId) {
  // This would typically remove from IndexedDB
  console.log('Service Worker: Removing pending notification', notificationId);
}

// Message event - Handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        type: 'VERSION',
        version: CACHE_NAME
      });
      break;
      
    case 'CACHE_NOTIFICATION':
      // Cache notification for offline use
      cacheNotification(data);
      break;
      
    default:
      console.log('Service Worker: Unknown message type', type);
  }
});

// Cache notification function
async function cacheNotification(notification) {
  try {
    const cache = await caches.open(CACHE_NAME);
    
    // Cache notification assets if any
    if (notification.icon) {
      await cache.add(notification.icon);
    }
    if (notification.badge) {
      await cache.add(notification.badge);
    }
    
    console.log('Service Worker: Notification assets cached');
  } catch (error) {
    console.error('Service Worker: Failed to cache notification assets', error);
  }
}

// Error event
self.addEventListener('error', (event) => {
  // Only log non-backend related errors to reduce noise
  const isBackendRelated = event.error &&
    (event.error.message?.includes('Failed to fetch') ||
     event.error.message?.includes('localhost:3001') ||
     event.error.message?.includes('ERR_CONNECTION_REFUSED'));

  if (!isBackendRelated) {
    console.error('Service Worker: Error occurred', event);
  }
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
  // Only log non-backend related rejections to reduce noise
  const isBackendRelated = event.reason &&
    (event.reason.message?.includes('Failed to fetch') ||
     event.reason.message?.includes('localhost:3001') ||
     event.reason.message?.includes('ERR_CONNECTION_REFUSED'));

  if (!isBackendRelated) {
    console.error('Service Worker: Unhandled promise rejection', event);
  }

  // Prevent the default behavior (logging to console)
  event.preventDefault();
});

console.log('Service Worker: Script loaded successfully');
