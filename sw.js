/* =====================
   إعدادات الخدمة (Service Worker)
===================== */

// 1. تحديث اسم الكاش لإجبار المتصفح على تحميل التصميم الجديد
const CACHE_NAME = 'nora-mosque-v3-burgundy';

// 2. إضافة ملفات البيانات الجديدة للقائمة
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './prayer_times.json',    // هام جداً للمواقيت
  './data/surahs.json',     // هام جداً للقرآن
  './mosque_images/mosque-logo.png',
  './placeholder.svg'
  // يمكنك إضافة مسارات الصور الهامة هنا أيضاً إذا أردت
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll(ASSETS_TO_CACHE))
    .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

/* استراتيجية الكاش: Cache First ثم الشبكة */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // استثناء طلبات API الخارجية (مثل صوت الأذان أو نص الآيات)
  if (url.origin !== location.origin) {
     return; 
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      // إذا وجدنا الملف في الكاش نعيده
      if (cached) return cached;
      
      // وإلا نطلبه من الشبكة ونخزنه للمرة القادمة
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});

// (تم إزالة منطق التنبيهات المعقد من هنا لأننا نستخدم script.js الآن للتبسيط)
