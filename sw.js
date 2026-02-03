let prayerTimesData = null;
let notificationsEnabled = false;

/* =====================
   INSTALL & ACTIVATE
===================== */
const CACHE_NAME = 'nora-mosque-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/mosque_images/mosque-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* Fetch handler - cache first for navigation and static assets */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Network-first for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // Cache-first for other same-origin requests
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => {
        // fallback to offline page or nothing
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

/* =====================
   MESSAGE HANDLER
===================== */
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SET_PRAYER_TIMES':
      prayerTimesData = payload;
      scheduleNotifications();
      break;

    case 'SET_NOTIFICATIONS_ENABLED':
      notificationsEnabled = payload;
      if (notificationsEnabled && prayerTimesData) {
        scheduleNotifications();
      }
      break;

    case 'TRIGGER_NOTIFICATION':
      if (notificationsEnabled && payload) {
        showNotification(payload.name, payload.time);
      }
      break;
  }
});

/* =====================
   NOTIFICATION SCHEDULING
===================== */
function scheduleNotifications() {
  if (!notificationsEnabled || !prayerTimesData) return;
  
  // Clear existing notifications
  self.registration.getNotifications().then(notifications => {
    notifications.forEach(notification => {
      if (notification.tag && notification.tag.startsWith('prayer-')) {
        notification.close();
      }
    });
  });
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  const todayTimes = prayerTimesData[month]?.[day];
  if (!todayTimes) return;
  
  const prayers = [
    { name: 'الفجر', time: todayTimes.fajr },
    { name: 'الظهر', time: todayTimes.dhuhr },
    { name: 'العصر', time: todayTimes.asr },
    { name: 'المغرب', time: todayTimes.maghrib },
    { name: 'العشاء', time: todayTimes.isha }
  ];
  
  prayers.forEach(prayer => {
    scheduleNotificationForPrayer(prayer.name, prayer.time, now);
  });
}

function scheduleNotificationForPrayer(prayerName, prayerTime, referenceDate) {
  const [hours, minutes] = prayerTime.split(':').map(Number);
  const notificationTime = new Date(referenceDate);
  notificationTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (notificationTime <= referenceDate) {
    notificationTime.setDate(notificationTime.getDate() + 1);
    
    // Get tomorrow's times
    const tomorrow = new Date(referenceDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowMonth = tomorrow.getMonth() + 1;
    const tomorrowDay = tomorrow.getDate();
    const tomorrowTimes = prayerTimesData[tomorrowMonth]?.[tomorrowDay];
    
    if (tomorrowTimes && prayerName === 'الفجر') {
      const [tomorrowHours, tomorrowMinutes] = tomorrowTimes.fajr.split(':').map(Number);
      notificationTime.setHours(tomorrowHours, tomorrowMinutes, 0, 0);
    }
  }
  
  const timeUntilPrayer = notificationTime.getTime() - referenceDate.getTime();
  
  // Schedule notification at prayer time (not before)
  if (timeUntilPrayer > 0) {
    const title = `حان الآن وقت صلاة ${prayerName}`;
    const body = `الأذان حسب توقيت السالمية - الكويت\nالوقت: ${prayerTime}`;
    
    // Use setTimeout for scheduling (works in service worker context)
    setTimeout(() => {
      if (notificationsEnabled) {
        showNotification(prayerName, prayerTime);
        // Reschedule for next day
        scheduleNotifications();
      }
    }, timeUntilPrayer);
  }
}

/* =====================
   NOTIFICATION
===================== */
function showNotification(prayerName, time24) {
  const title = `حان الآن وقت صلاة ${prayerName}`;
  const body = `الأذان حسب توقيت السالمية - الكويت\nالوقت: ${time24}`;

  self.registration.showNotification(title, {
    body,
    icon: '/mosque_images/mosque-logo.png',
    badge: '/mosque_images/mosque-logo.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: `prayer-${prayerName}-${new Date().toDateString()}`,
    renotify: true,
    requireInteraction: false,
    silent: false
  });
}

/* =====================
   PERIODIC SYNC (for background updates)
===================== */
self.addEventListener('sync', event => {
  if (event.tag === 'prayer-notifications') {
    event.waitUntil(scheduleNotifications());
  }
});

/* =====================
   HELPERS
===================== */
function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'م' : 'ص';
  const hour = ((h + 11) % 12 + 1);
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
