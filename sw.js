let prayerTimesData = null;
let notificationsEnabled = false;

/* =====================
   INSTALL & ACTIVATE
===================== */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

/* =====================
   MESSAGE HANDLER
===================== */
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SET_PRAYER_TIMES':
      prayerTimesData = payload;
      break;

    case 'SET_NOTIFICATIONS_ENABLED':
      notificationsEnabled = payload;
      break;

    case 'TRIGGER_NOTIFICATION':
      if (notificationsEnabled && payload) {
        showNotification(payload.name, payload.time);
      }
      break;
  }
});

/* =====================
   NOTIFICATION
===================== */
function showNotification(prayerName, time24) {
  const title = `حان الآن وقت صلاة ${prayerName}`;
  const body = `الأذان حسب توقيت السالمية - ${formatTime(time24)}`;

  self.registration.showNotification(title, {
    body,
    icon: 'mosque_images/icon-192.png',
    badge: 'mosque_images/icon-192.png',
    vibrate: [200, 100, 200],
    tag: `prayer-${prayerName}-${new Date().toDateString()}`,
    renotify: true
  });
}

/* =====================
   HELPERS
===================== */
function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'م' : 'ص';
  const hour = ((h + 11) % 12 + 1);
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}
