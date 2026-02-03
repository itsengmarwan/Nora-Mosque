/* =====================
   NAVIGATION
===================== */

function switchTab(tabId) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
    tab.classList.remove('active');
  });

  // Show selected tab
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // Update bottom navigation active state
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
    const onclickAttr = item.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes(tabId)) {
      item.classList.add('active');
    }
  });

  closeNav();
  
  // Load content when switching to specific tabs
  if (tabId === 'prayer') {
    loadPrayerTimes();
  } else if (tabId === 'quran') {
    loadQuranSurahs();
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openNav() {
  const nav = document.getElementById("mySidenav");
  if (nav) nav.style.width = "280px";
}

function closeNav() {
  const nav = document.getElementById("mySidenav");
  if (nav) nav.style.width = "0";
}

/* =====================
   PRAYER TIMES
===================== */

let prayerTimesData = null;
let prayerTimesInterval = null;

async function loadPrayerTimes() {
  try {
    const response = await fetch('prayer_times.json');
    prayerTimesData = await response.json();
    updatePrayerTimes();
    updateHijriDate();
    startPrayerTimesUpdate();
    
    // Send prayer times to service worker
    if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
      serviceWorkerRegistration.active.postMessage({
        type: 'SET_PRAYER_TIMES',
        payload: prayerTimesData
      });
    }
  } catch (error) {
    console.error('Error loading prayer times:', error);
    const errorElement = document.querySelector('.prayer-error-message');
    if (errorElement) {
      errorElement.textContent = 'حدث خطأ في تحميل مواقيت الصلاة';
    }
  }
}

function updatePrayerTimes() {
  if (!prayerTimesData) return;

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  const todayTimes = prayerTimesData[month]?.[day];
  
  if (!todayTimes) {
    const errorElement = document.querySelector('.prayer-error-message');
    if (errorElement) {
      errorElement.textContent = 'لا توجد بيانات لليوم الحالي';
    }
    return;
  }

  const prayers = [
    { id: 'fajr', name: 'الفجر', time: todayTimes.fajr },
    { id: 'sunrise', name: 'الشروق', time: todayTimes.sunrise },
    { id: 'dhuhr', name: 'الظهر', time: todayTimes.dhuhr },
    { id: 'asr', name: 'العصر', time: todayTimes.asr },
    { id: 'maghrib', name: 'المغرب', time: todayTimes.maghrib },
    { id: 'isha', name: 'العشاء', time: todayTimes.isha }
  ];

  prayers.forEach(prayer => {
    const timeElement = document.getElementById(prayer.id + 'Time');
    if (timeElement) {
      timeElement.textContent = prayer.time;
    }
  });

  highlightNextPrayer(prayers);
  updateNextPrayerInfo(prayers);
  
  // Reschedule notifications when prayer times update
  if (notificationsEnabled && Notification.permission === 'granted') {
    schedulePrayerNotifications();
  }
}

function highlightNextPrayer(prayers) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  // Remove all highlights
  prayers.forEach(prayer => {
    const item = document.getElementById(prayer.id + 'Item');
    if (item) {
      item.classList.remove('next-prayer');
      const remainingSpan = item.querySelector('.time-remaining');
      if (remainingSpan) remainingSpan.textContent = '';
    }
  });

  // Find next prayer
  let nextPrayer = null;
  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      nextPrayer = { ...prayer, timeInMinutes: prayerTime };
      break;
    }
  }

  // If no prayer found today, use first prayer of next day (Fajr)
  if (!nextPrayer) {
    nextPrayer = { ...prayers[0], timeInMinutes: prayers[0].time.split(':').map(Number).reduce((h, m) => h * 60 + m) + 1440 };
  }

  // Highlight next prayer
  const nextItem = document.getElementById(nextPrayer.id + 'Item');
  if (nextItem) {
    nextItem.classList.add('next-prayer');
    updateTimeRemaining(nextItem, nextPrayer.timeInMinutes);
  }
}

function updateTimeRemaining(element, prayerTimeInMinutes) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  let remaining = prayerTimeInMinutes - currentTime;
  
  if (remaining < 0) remaining += 1440; // Next day
  
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;
  
  const remainingSpan = element.querySelector('.time-remaining');
  if (remainingSpan) {
    if (hours > 0) {
      remainingSpan.textContent = `متبقي ${hours} ساعة و ${minutes} دقيقة`;
    } else {
      remainingSpan.textContent = `متبقي ${minutes} دقيقة`;
    }
  }
}

function updateNextPrayerInfo(prayers) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  let nextPrayer = null;
  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      nextPrayer = prayer;
      break;
    }
  }

  const infoElement = document.getElementById('nextPrayerInfo');
  if (infoElement && nextPrayer) {
    infoElement.textContent = `الصلاة القادمة: ${nextPrayer.name} في ${nextPrayer.time}`;
  }
}

function startPrayerTimesUpdate() {
  if (prayerTimesInterval) {
    clearInterval(prayerTimesInterval);
  }
  
  prayerTimesInterval = setInterval(() => {
    updatePrayerTimes();
  }, 60000); // Update every minute
}

/* =====================
   HIJRI DATE
===================== */

function updateHijriDate() {
  const now = new Date();
  const hijriDate = convertToHijri(now);
  const hijriDateElement = document.getElementById('hijriDate');
  
  if (hijriDateElement) {
    hijriDateElement.textContent = `${hijriDate.day} ${hijriDate.monthName} ${hijriDate.year} هـ`;
  }
}

function convertToHijri(gregorianDate) {
  // Simple conversion (approximate)
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];
  
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth();
  const day = gregorianDate.getDate();
  
  // Approximate conversion (1 Hijri year ≈ 0.97 Gregorian years)
  const hijriYear = Math.floor((year - 622) * 0.97) + 1;
  const hijriMonth = Math.floor((month + day / 30) * 0.97) % 12;
  const hijriDay = Math.floor(day * 0.97);
  
  return {
    day: hijriDay || day,
    month: hijriMonth || month,
    monthName: hijriMonths[hijriMonth] || hijriMonths[month],
    year: hijriYear
  };
}

/* =====================
   QURAN
===================== */

let quranData = null;

async function loadQuranSurahs() {
  const surahListElement = document.getElementById('quranSurahList');
  if (!surahListElement) return;

  // Check if already loaded
  if (surahListElement.querySelector('.surah-item')) return;

  try {
    const response = await fetch('data/surahs.json');
    quranData = await response.json();
    
    surahListElement.innerHTML = '';
    
    quranData.chapters.forEach(surah => {
      const surahItem = document.createElement('div');
      surahItem.className = 'surah-item';
      surahItem.onclick = () => loadSurah(surah.id);
      
      surahItem.innerHTML = `
        <div class="surah-details">
          <div class="surah-number">${surah.id}</div>
          <div>
            <div style="font-weight: 600; font-size: 17px; color: var(--ios-label);">${surah.name_arabic}</div>
            <div style="font-size: 13px; color: var(--ios-secondary-label);">${surah.verses_count} آية</div>
          </div>
        </div>
      `;
      
      surahListElement.appendChild(surahItem);
    });
  } catch (error) {
    console.error('Error loading Quran surahs:', error);
    surahListElement.innerHTML = '<div class="text-center py-5 text-red-600">حدث خطأ في تحميل قائمة السور</div>';
  }
}

async function loadSurah(surahId) {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/ar.asad`);
    const data = await response.json();
    
    if (data.code === 200 && data.data) {
      displaySurah(data.data);
    } else {
      alert('حدث خطأ في تحميل السورة');
    }
  } catch (error) {
    console.error('Error loading surah:', error);
    alert('حدث خطأ في تحميل السورة. يرجى المحاولة لاحقاً.');
  }
}

function displaySurah(surahData) {
  const viewer = document.getElementById('quranViewer');
  const title = document.getElementById('quranViewerTitle');
  const content = document.getElementById('quranViewerContent');
  
  if (!viewer || !title || !content) return;
  
  title.textContent = `سورة ${surahData.name} (${surahData.englishName})`;
  
  content.innerHTML = '';
  
  surahData.ayahs.forEach(ayah => {
    const ayahDiv = document.createElement('p');
    ayahDiv.className = 'quran-ayah';
    ayahDiv.innerHTML = `
      <span class="inline">${ayah.text}</span>
      <span class="ayah-number">${ayah.numberInSurah}</span>
    `;
    content.appendChild(ayahDiv);
  });
  
  viewer.classList.remove('hidden');
  viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeQuranViewer() {
  const viewer = document.getElementById('quranViewer');
  if (viewer) {
    viewer.classList.add('hidden');
  }
}

/* =====================
   IMAGE VIEWER
===================== */

function openImageViewer(imageSrc) {
  const viewer = document.getElementById('imageViewer');
  const img = document.getElementById('viewedImage');
  
  if (viewer && img) {
    img.src = imageSrc;
    viewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeImageViewer() {
  const viewer = document.getElementById('imageViewer');
  if (viewer) {
    viewer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/* =====================
   ADMIN PANEL (SIMPLE CLIENT-SIDE)
   NOTE: Client-side password is not secure. This provides basic protection.
===================== */
function openAdminPanel() {
  const modal = document.getElementById('adminModal');
  const pwdInput = document.getElementById('adminPasswordInput');
  const adminError = document.getElementById('adminError');
  const adminPanel = document.getElementById('adminPanel');
  if (!modal) return;
  modal.classList.remove('hidden');
  adminError.classList.add('hidden');
  adminPanel.classList.add('hidden');
  if (pwdInput) pwdInput.value = '';
}

function closeAdminPanel() {
  const modal = document.getElementById('adminModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function checkAdminPassword() {
  const pwdInput = document.getElementById('adminPasswordInput');
  const adminError = document.getElementById('adminError');
  const adminPanel = document.getElementById('adminPanel');
  if (!pwdInput || !adminPanel || !adminError) return;
  const password = pwdInput.value || '';
  // Call server login
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password })
  }).then(r => r.json())
    .then(data => {
      if (data && data.token) {
        sessionStorage.setItem('adminToken', data.token);
        adminError.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        // load admin data
        loadAdminNews();
      } else {
        adminError.classList.remove('hidden');
        adminPanel.classList.add('hidden');
      }
    }).catch(err => {
      console.error('Login error', err);
      adminError.classList.remove('hidden');
      adminPanel.classList.add('hidden');
    });
}

// ======================
// NEWS (Client)
// ======================
let editingNewsId = null;

async function fetchAndRenderNews() {
  try {
    const res = await fetch('/api/news');
    const news = await res.json();
    renderNewsList(news);
  } catch (e) {
    console.error('Error loading news', e);
    const list = document.getElementById('newsList');
    if (list) list.innerHTML = '<div class="text-red-600 text-center py-4">تعذر تحميل الأخبار</div>';
  }
}

function renderNewsList(news) {
  const list = document.getElementById('newsList');
  const controls = document.getElementById('newsControls');
  const token = sessionStorage.getItem('adminToken');
  if (!list) return;
  if (token) {
    controls.classList.remove('hidden');
  } else {
    controls.classList.add('hidden');
  }
  if (!news || news.length === 0) {
    list.innerHTML = '<div class="text-center py-6 text-gray-500">لا توجد أخبار حالياً</div>';
    return;
  }
  list.innerHTML = '';
  news.forEach(item => {
    const el = document.createElement('div');
    el.className = 'border p-4 rounded-md bg-white';
    el.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-semibold text-lg">${item.title}</h4>
          <div class="text-xs text-gray-500">${new Date(item.createdAt).toLocaleString()}</div>
        </div>
        <div id="newsActions-${item.id}"></div>
      </div>
      ${item.image ? `<div class="mt-3"><img src="${item.image}" alt="" style="max-width:100%;border-radius:8px;"></div>` : ''}
      <p class="mt-3 text-gray-700">${item.content}</p>
    `;
    list.appendChild(el);
    if (token) {
      const actions = document.getElementById(`newsActions-${item.id}`);
      if (actions) {
        actions.innerHTML = `<button class="action-button" onclick="openEditNews(${item.id})" style="padding:6px 10px;margin-left:6px;">تعديل</button>
                             <button class="action-button" onclick="deleteNews(${item.id})" style="background:#ff6b6b;padding:6px 10px;">حذف</button>`;
      }
    }
  });
}

function openCreateNews() {
  editingNewsId = null;
  const modal = document.getElementById('newsModal');
  const title = document.getElementById('newsTitle');
  const content = document.getElementById('newsContent');
  const modalTitle = document.getElementById('newsModalTitle');
  if (!modal || !title || !content || !modalTitle) return;
  modalTitle.textContent = 'إنشاء خبر';
  title.value = '';
  content.value = '';
  const imageInput = document.getElementById('newsImage');
  if (imageInput) imageInput.value = '';
  const preview = document.getElementById('newsImagePreview');
  if (preview) preview.classList.add('hidden');
  modal.classList.remove('hidden');
}

function closeNewsModal() {
  const modal = document.getElementById('newsModal');
  if (modal) modal.classList.add('hidden');
}

async function openEditNews(id) {
  try {
    const res = await fetch('/api/news');
    const news = await res.json();
    const item = news.find(n => n.id === id);
    if (!item) return alert('الخبر غير موجود');
    editingNewsId = id;
    const modal = document.getElementById('newsModal');
    const title = document.getElementById('newsTitle');
    const content = document.getElementById('newsContent');
    const imageInput = document.getElementById('newsImage');
    const preview = document.getElementById('newsImagePreview');
    const modalTitle = document.getElementById('newsModalTitle');
    modalTitle.textContent = 'تعديل خبر';
    title.value = item.title;
    content.value = item.content;
    if (imageInput) imageInput.value = item.image || '';
    if (item.image && preview) {
      const img = document.getElementById('newsPreviewImg');
      img.src = item.image;
      preview.classList.remove('hidden');
    } else if (preview) preview.classList.add('hidden');
    modal.classList.remove('hidden');
  } catch (e) {
    console.error(e);
    alert('خطأ في فتح الخبر');
  }
}

async function submitNews() {
  const title = document.getElementById('newsTitle')?.value?.trim();
  const content = document.getElementById('newsContent')?.value?.trim();
  const image = document.getElementById('newsImage')?.value?.trim();
  const errorEl = document.getElementById('newsModalError');
  if (!title || !content) {
    if (errorEl) { errorEl.textContent = 'يرجى إدخال عنوان ومحتوى'; errorEl.classList.remove('hidden'); }
    return;
  }
  const token = sessionStorage.getItem('adminToken');
  if (!token) { alert('غير مصرح'); return; }
  try {
    const url = editingNewsId ? `/api/news/${editingNewsId}` : '/api/news';
    const method = editingNewsId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ title, content, image })
    });
    if (!res.ok) throw new Error('Request failed');
    closeNewsModal();
    await fetchAndRenderNews();
    if (typeof loadAdminNews === 'function') loadAdminNews();
  } catch (e) {
    console.error(e);
    if (errorEl) { errorEl.textContent = 'حدث خطأ أثناء الحفظ'; errorEl.classList.remove('hidden'); }
  }
}

async function deleteNews(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
  const token = sessionStorage.getItem('adminToken');
  if (!token) { alert('غير مصرح'); return; }
  try {
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) throw new Error('delete failed');
    await fetchAndRenderNews();
  } catch (e) {
    console.error(e);
    alert('فشل حذف الخبر');
  }
}

async function loadAdminNews() {
  // ensure controls visible and refresh list
  const controls = document.getElementById('newsControls');
  if (controls) controls.classList.remove('hidden');
  await fetchAndRenderNews();
}

function logoutAdmin() {
  sessionStorage.removeItem('adminToken');
  const controls = document.getElementById('newsControls');
  if (controls) controls.classList.add('hidden');
  alert('تم تسجيل الخروج');
}

// change admin password
async function changeAdminPassword() {
  const newPwd = document.getElementById('newAdminPassword')?.value;
  const msg = document.getElementById('changePwdMsg');
  const token = sessionStorage.getItem('adminToken');
  if (!token) { if (msg) msg.textContent = 'غير مصرح'; return; }
  if (!newPwd || newPwd.length < 4) { if (msg) msg.textContent = 'كلمة المرور قصيرة'; return; }
  try {
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ newPassword: newPwd })
    });
    if (!res.ok) throw new Error('failed');
    if (msg) { msg.textContent = 'تم تغيير كلمة المرور بنجاح'; msg.style.color = 'green'; }
  } catch (e) {
    console.error(e);
    if (msg) { msg.textContent = 'فشل تغيير كلمة المرور'; msg.style.color = 'red'; }
  }
}

// upload file
async function uploadFile() {
  const input = document.getElementById('uploadFileInput');
  const msg = document.getElementById('uploadMsg');
  const token = sessionStorage.getItem('adminToken');
  if (!token) { if (msg) msg.textContent = 'غير مصرح'; return; }
  if (!input || !input.files || input.files.length === 0) { if (msg) msg.textContent = 'اختر ملفاً'; return; }
  const file = input.files[0];
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form
    });
    if (!res.ok) throw new Error('upload failed');
    const data = await res.json();
    if (msg) { msg.textContent = 'تم الرفع: ' + data.url; msg.style.color = 'green'; }
  } catch (e) {
    console.error(e);
    if (msg) { msg.textContent = 'فشل الرفع'; msg.style.color = 'red'; }
  }
}

/* =====================
   NOTIFICATIONS
===================== */

/* =====================
   NOTIFICATIONS
===================== */

let notificationsEnabled = false;
let notificationTimeouts = [];
let serviceWorkerRegistration = null;

async function initNotifications() {
  const toggle = document.getElementById('notificationToggle');
  const statusElement = document.getElementById('notificationStatus');
  
  if (!toggle) return;
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.ready;
    } catch (error) {
      console.log('Service Worker not ready:', error);
    }
  }
  
  // Load saved preference
  const saved = localStorage.getItem('prayerNotifications');
  notificationsEnabled = saved === 'true';
  toggle.checked = notificationsEnabled;
  updateNotificationStatus();
  
  // Check notification permission
  if (Notification.permission === 'granted' && notificationsEnabled) {
    schedulePrayerNotifications();
  }
  
  toggle.addEventListener('change', async (e) => {
    if (e.target.checked) {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        notificationsEnabled = true;
        localStorage.setItem('prayerNotifications', 'true');
        updateNotificationStatus();
        
        // Send to service worker
        if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
          serviceWorkerRegistration.active.postMessage({
            type: 'SET_NOTIFICATIONS_ENABLED',
            payload: true
          });
        }
        
        // Schedule notifications
        schedulePrayerNotifications();
      } else {
        e.target.checked = false;
        notificationsEnabled = false;
        updateNotificationStatus();
        alert('يرجى السماح بالإشعارات من إعدادات المتصفح');
      }
    } else {
      // Cancel all scheduled notifications
      cancelAllNotifications();
      notificationsEnabled = false;
      localStorage.setItem('prayerNotifications', 'false');
      updateNotificationStatus();
      
      // Send to service worker
      if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
        serviceWorkerRegistration.active.postMessage({
          type: 'SET_NOTIFICATIONS_ENABLED',
          payload: false
        });
      }
    }
  });
}

function schedulePrayerNotifications() {
  // Clear existing notifications
  cancelAllNotifications();
  
  if (!prayerTimesData || !notificationsEnabled) return;
  
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
  
  // Schedule for tomorrow's Fajr if all prayers passed
  const lastPrayer = prayers[prayers.length - 1];
  const [lastHour, lastMinute] = lastPrayer.time.split(':').map(Number);
  const lastPrayerTime = new Date(now);
  lastPrayerTime.setHours(lastHour, lastMinute, 0, 0);
  
  if (now > lastPrayerTime) {
    // Schedule tomorrow's Fajr
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowMonth = tomorrow.getMonth() + 1;
    const tomorrowDay = tomorrow.getDate();
    const tomorrowTimes = prayerTimesData[tomorrowMonth]?.[tomorrowDay];
    
    if (tomorrowTimes) {
      scheduleNotificationForPrayer('الفجر', tomorrowTimes.fajr, tomorrow);
    }
  }
}

function scheduleNotificationForPrayer(prayerName, prayerTime, referenceDate) {
  const [hours, minutes] = prayerTime.split(':').map(Number);
  const notificationTime = new Date(referenceDate);
  notificationTime.setHours(hours, minutes, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (notificationTime <= referenceDate) {
    notificationTime.setDate(notificationTime.getDate() + 1);
  }
  
  const timeUntilPrayer = notificationTime.getTime() - referenceDate.getTime();
  
  // Schedule notification 1 minute before prayer time
  const notificationDelay = Math.max(0, timeUntilPrayer - 60000);
  
  const timeoutId = setTimeout(() => {
    sendPrayerNotification(prayerName, prayerTime);
  }, notificationDelay);
  
  notificationTimeouts.push(timeoutId);
  
  console.log(`Scheduled notification for ${prayerName} at ${prayerTime}, delay: ${Math.round(notificationDelay / 1000 / 60)} minutes`);
}

function sendPrayerNotification(prayerName, prayerTime) {
  if (!notificationsEnabled) return;
  
  const title = `حان الآن وقت صلاة ${prayerName}`;
  const body = `الأذان حسب توقيت السالمية - الكويت\nالوقت: ${prayerTime}`;
  
  // Try to use service worker first (works even when app is closed)
  if (serviceWorkerRegistration && serviceWorkerRegistration.active) {
    serviceWorkerRegistration.active.postMessage({
      type: 'TRIGGER_NOTIFICATION',
      payload: {
        name: prayerName,
        time: prayerTime
      }
    });
  }
  
  // Also show browser notification if available (for immediate feedback)
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: body,
        icon: '/mosque_images/mosque-logo.png',
        badge: '/mosque_images/mosque-logo.png',
        tag: `prayer-${prayerName}-${new Date().toDateString()}`,
        requireInteraction: false,
        vibrate: [200, 100, 200, 100, 200],
        silent: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
  
  // Play adhan audio in-page if visible
  try {
    if (document.visibilityState === 'visible') {
      const adhan = document.getElementById('adhanAudio');
      if (adhan && typeof adhan.play === 'function') {
        adhan.currentTime = 0;
        adhan.play().catch(err => console.log('Audio play prevented:', err));
      }
    }
  } catch (e) {
    console.error('Error playing adhan:', e);
  }

  // Reschedule for next day after a short delay
  setTimeout(() => {
    if (notificationsEnabled) {
      schedulePrayerNotifications();
    }
  }, 120000); // Check again after 2 minutes
}

function cancelAllNotifications() {
  notificationTimeouts.forEach(timeoutId => {
    clearTimeout(timeoutId);
  });
  notificationTimeouts = [];
}

function updateNotificationStatus() {
  const statusElement = document.getElementById('notificationStatus');
  if (statusElement) {
    if (notificationsEnabled && Notification.permission === 'granted') {
      statusElement.textContent = 'التنبيهات مفعلة - سيتم إرسال إشعار قبل كل صلاة بدقيقة';
      statusElement.style.color = 'var(--ios-blue)';
    } else if (notificationsEnabled && Notification.permission !== 'granted') {
      statusElement.textContent = 'يرجى السماح بالإشعارات من إعدادات المتصفح';
      statusElement.style.color = 'var(--ios-secondary-label)';
    } else {
      statusElement.textContent = 'التنبيهات معطلة';
      statusElement.style.color = 'var(--ios-secondary-label)';
    }
  }
}

/* =====================
   SERVICE WORKER
===================== */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      serviceWorkerRegistration = registration;
      
      // Initialize notifications after service worker is ready
      if (document.getElementById('notificationToggle')) {
        initNotifications();
      }
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  });
}

/* =====================
   INITIALIZATION
===================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize lazy loading for images
  const images = document.querySelectorAll("img[data-src]");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "200px"
  });
  images.forEach(img => observer.observe(img));
  
  // Load initial content
  loadPrayerTimes();
  // Load news
  fetchAndRenderNews();
  // Initialize notifications (will be called again after service worker is ready)
  if (document.getElementById('notificationToggle')) {
    initNotifications();
  }
  
  // Mark body as loaded for animations
  document.body.classList.add('loaded');
  
  // Set active tab on load
  const activeTab = document.querySelector('.tab-content.active');
  if (activeTab) {
    const tabId = activeTab.id;
    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      const onclickAttr = item.getAttribute('onclick');
      if (onclickAttr && onclickAttr.includes(tabId)) {
        item.classList.add('active');
      }
    });
  }
  
  // Listen for visibility change to reschedule notifications
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && notificationsEnabled && Notification.permission === 'granted') {
      schedulePrayerNotifications();
    }
  });
});
