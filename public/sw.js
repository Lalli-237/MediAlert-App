// MediAlert Service Worker - Background Medicine Notifications & Offline Caching
const CACHE_NAME = 'medialert-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/icon.svg',
  '/apple-touch-icon.png',
  '/favicon.ico'
];

// In-memory active schedule inside worker
let cachedSchedule = [];
let cachedPatientName = '';
let cachedLanguage = 'en';
let lastAlertedSlots = new Set(); // Key: `${medId}_${timeStr}_${dateStr}`

// Helper: current date YYYY-MM-DD
function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: current time HH:MM
function getCurrentTimeStr() {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// 1. Service Worker Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache addAll non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Service Worker Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// 3. Network / Cache Fetch Handler
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Exclude API requests
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background (stale-while-revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback to cached index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// 4. Background Dose Checker
function checkDueMedications() {
  if (!cachedSchedule || cachedSchedule.length === 0) return;

  const nowTime = getCurrentTimeStr();
  const todayStr = getTodayDateStr();

  cachedSchedule.forEach((med) => {
    if (!med.isActive) return;

    (med.scheduledTimes || []).forEach((timeStr) => {
      const slotKey = `${med.id}_${timeStr}_${todayStr}`;

      if (nowTime === timeStr && !lastAlertedSlots.has(slotKey)) {
        lastAlertedSlots.add(slotKey);

        const title = `💊 MediAlert: Time for ${med.name}`;
        const bodyText = `${med.name} (${med.dosage || 'Prescribed dose'}) is scheduled at ${timeStr}. Tap to open app and mark as taken.`;

        self.registration.showNotification(title, {
          body: bodyText,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: slotKey,
          renotify: true,
          requireInteraction: true,
          vibrate: [300, 150, 300, 150, 450],
          data: {
            medId: med.id,
            time: timeStr,
            url: `/?doseDue=${med.id}`
          },
          actions: [
            { action: 'open', title: 'Open MediAlert' },
            { action: 'snooze', title: 'Snooze 5m' }
          ]
        }).catch((err) => {
          console.warn('[SW] showNotification error:', err);
        });
      }
    });
  });

  // Clean old days from set to avoid memory growth
  if (lastAlertedSlots.size > 200) {
    lastAlertedSlots = new Set([...lastAlertedSlots].filter(k => k.includes(todayStr)));
  }
}

// Check every 15 seconds while worker process is alive
setInterval(checkDueMedications, 15000);

// 5. Periodic Sync & Background Sync (where supported by browser/OS)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'medication-reminder-check') {
    event.waitUntil(Promise.resolve(checkDueMedications()));
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'medication-sync') {
    event.waitUntil(Promise.resolve(checkDueMedications()));
  }
});

// 6. Push Event Handler (for web push or background wakeups)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '💊 MediAlert Medicine Reminder';
  const options = {
    body: data.body || 'You have a scheduled medication dose due now.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    data: data.data || { url: '/' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 7. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// 8. Communication from App (Schedule Sync & Immediate Test)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_SCHEDULE') {
    cachedSchedule = event.data.medications || [];
    cachedPatientName = event.data.patientName || '';
    cachedLanguage = event.data.language || 'en';
    // Run an immediate check
    checkDueMedications();
    event.ports && event.ports[0] && event.ports[0].postMessage({ success: true, count: cachedSchedule.length });
  }

  if (event.data.type === 'TEST_BACKGROUND_NOTIFICATION') {
    const medName = event.data.medName || 'Morning Prescription';
    self.registration.showNotification(`💊 MediAlert: Test Background Notification`, {
      body: `Background reminder active for ${medName}! You will receive notifications even when the app is minimized or running another app.`,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'test-notification',
      renotify: true,
      data: { url: '/' }
    });
  }
});
