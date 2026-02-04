/* =========================================
   1. إدارة التنقل والواجهة (Navigation & UI)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // تحميل البيانات الأساسية عند فتح الموقع
    loadPrayerTimes();
    updateHijriDate();
    
    // إعداد التنبيهات إذا كان الزر موجوداً
    if (document.getElementById('notificationToggle')) {
        initNotifications();
    }
    
    // إعداد التحميل الذكي للصور (Lazy Loading)
    setupLazyLoading();

    // التأكد من أن التبويب النشط هو "الرئيسية" عند البدء
    switchTab('home');
});

// دالة التبديل بين التبويبات (الصفحات)
function switchTab(tabId) {
    // 1. إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    
    // 2. إظهار التبويب المطلوب
    const target = document.getElementById(tabId);
    if(target) {
        target.classList.remove('hidden');
        // تأخير بسيط لتفعيل الأنيميشن
        setTimeout(() => target.classList.add('active'), 50);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. تحديث القائمة السفلية (Bottom Nav)
    updateBottomNavUI(tabId);

    // 4. تحديث حالة الروابط السريعة في الصفحة الرئيسية
    document.querySelectorAll('.quick-link-card').forEach(link => link.classList.remove('active-tab-link'));
    // (اختياري: يمكنك إضافة كلاس active-tab-link في CSS لتمييز الزر المضغوط)

    // 5. إغلاق القائمة الجانبية في حال كانت مفتوحة
    closeNav();

    // 6. تحميل خاص لقائمة السور عند فتح تبويب القرآن لأول مرة
    if (tabId === 'quran') loadQuranList();
}

// تحديث شكل القائمة السفلية بناءً على التبويب النشط
function updateBottomNavUI(tabId) {
    // إزالة التنشيط من جميع الأزرار
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    // إزالة التنشيط من الزر العائم (القرآن)
    const centerBtn = document.querySelector('.nav-center-button');
    if(centerBtn) centerBtn.style.transform = 'scale(1)';

    if (tabId === 'quran') {
        // تكبير زر القرآن قليلاً لتمييزه
        if(centerBtn) centerBtn.style.transform = 'scale(1.1)';
    } else {
        // تنشيط الزر العادي
        const activeNav = document.querySelector(`.nav-item#nav-${tabId}`);
        if(activeNav) activeNav.classList.add('active');
    }
}

// التحكم في القائمة الجانبية (SideNav)
function openNav() { document.getElementById("mySidenav").style.width = "280px"; }
function closeNav() { document.getElementById("mySidenav").style.width = "0"; }


/* =========================================
   2. مواقيت الصلاة والعد التنازلي (Prayer Times)
   ========================================= */

let prayerData = null;
let timerInterval = null;     // للتحقق كل دقيقة
let countdownInterval = null; // للعداد التنازلي بالثواني
let nextPrayerGlobal = null;  // لتخزين بيانات الصلاة القادمة

// تحميل ملف JSON الخاص بالمواقيت
async function loadPrayerTimes() {
    try {
        const response = await fetch('prayer_times.json');
        if (!response.ok) throw new Error("File not found");
        prayerData = await response.json();
        
        // تحديث الواجهة فوراً
        updatePrayerUI();
        // بدء المؤقت الرئيسي (يفحص كل دقيقة)
        startMainTimer();
    } catch (error) {
        console.error("Error loading prayers:", error);
        const container = document.getElementById('prayerTimesContainer');
        if(container) {
            container.innerHTML = '<div class="p-4 text-center text-red-500 bg-red-50 rounded-lg">تعذر تحميل ملف المواقيت. تأكد من وجود prayer_times.json</div>';
        }
    }
}

// تحديث واجهة المواقيت (القائمة + العداد)
function updatePrayerUI() {
    if (!prayerData) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // جلب مواقيت اليوم الحالي
    const times = prayerData[month]?.[day];
    if (!times) return;

    // تعريف الصلوات
    const prayers = [
        { key: 'fajr', name: 'الفجر', time: times.fajr },
        { key: 'sunrise', name: 'الشروق', time: times.sunrise },
        { key: 'dhuhr', name: 'الظهر', time: times.dhuhr },
        { key: 'asr', name: 'العصر', time: times.asr },
        { key: 'maghrib', name: 'المغرب', time: times.maghrib },
        { key: 'isha', name: 'العشاء', time: times.isha }
    ];

    const container = document.getElementById('prayerTimesContainer');
    if(container) {
        container.innerHTML = ''; // مسح القائمة القديمة

        prayers.forEach(p => {
            const div = document.createElement('div');
            div.className = 'prayer-time-item';
            div.id = `prayer-${p.key}`;
            
            // تحويل الوقت لنظام 12 ساعة للعرض
            const formattedTime = formatTimeAMPM(p.time);
            
            div.innerHTML = `
                <div class="prayer-info">
                    <div class="prayer-name">${p.name}</div>
                    <div class="time-remaining-badge hidden font-tajawal"></div>
                </div>
                <div class="prayer-time" dir="ltr">${formattedTime}</div>
            `;
            container.appendChild(div);
        });
    }

    // حساب الصلاة القادمة لتشغيل العداد
    calculateNextPrayer(prayers);
}

// تحويل الوقت من 24 ساعة إلى 12 ساعة
function formatTimeAMPM(time24) {
    if(!time24) return "--:--";
    let [h, m] = time24.split(':');
    h = parseInt(h);
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12;
    h = h ? h : 12; 
    return `${h}:${m} <small class="text-xs">${ampm}</small>`;
}

// منطق حساب الصلاة القادمة
function calculateNextPrayer(prayers) {
    const now = new Date();
    // تحويل الوقت الحالي لثواني منذ بداية اليوم
    const currentSecondsTotal = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();

    let nextP = null;
    let minDiff = Infinity;

    prayers.forEach(p => {
        if(p.key === 'sunrise') return; // تجاهل الشروق كصلاة قادمة للأذان

        const [h, m] = p.time.split(':').map(Number);
        const prayerSecondsTotal = (h * 3600) + (m * 60);
        
        let diff = prayerSecondsTotal - currentSecondsTotal;
        
        // إذا كان الفرق سالباً، فهذا يعني أن الصلاة غداً (نضيف 24 ساعة)
        if (diff < 0) diff += (24 * 3600);

        if (diff < minDiff) {
            minDiff = diff;
            nextP = { ...p, targetSeconds: prayerSecondsTotal };
        }
    });

    nextPrayerGlobal = nextP;
    updateNextPrayerHighlights();
    
    // إعادة تشغيل العداد التنازلي
    if (countdownInterval) clearInterval(countdownInterval);
    updateCountdown(); // تحديث فوري
    countdownInterval = setInterval(updateCountdown, 1000);
}

// تظليل الصلاة القادمة في القائمة وإظهار قسم الهيرو
function updateNextPrayerHighlights() {
    // إزالة التظليل القديم
    document.querySelectorAll('.prayer-time-item').forEach(el => {
        el.classList.remove('next-prayer');
        const badge = el.querySelector('.time-remaining-badge');
        if(badge) badge.classList.add('hidden');
    });

    const heroContainer = document.getElementById('heroNextPrayer');

    if (nextPrayerGlobal) {
        // 1. تظليل في القائمة
        const el = document.getElementById(`prayer-${nextPrayerGlobal.key}`);
        if (el) {
            el.classList.add('next-prayer');
            const badge = el.querySelector('.time-remaining-badge');
            if(badge) badge.classList.remove('hidden');
        }

        // 2. تحديث قسم الهيرو
        if(heroContainer) {
            heroContainer.classList.remove('hidden');
            const nameEl = document.getElementById('heroPrayerName');
            if(nameEl) nameEl.textContent = nextPrayerGlobal.name;
        }
    } else {
        if(heroContainer) heroContainer.classList.add('hidden');
    }
}

// دالة العداد التنازلي (تعمل كل ثانية)
function updateCountdown() {
    if (!nextPrayerGlobal) return;

    const now = new Date();
    const currentSecondsTotal = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
    
    let diff = nextPrayerGlobal.targetSeconds - currentSecondsTotal;
    if (diff < 0) diff += (24 * 3600);

    // تحويل الثواني المتبقية إلى (ساعة:دقيقة:ثانية)
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    const formattedCountdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    // 1. تحديث العداد في الهيرو
    const heroCountEl = document.getElementById('heroCountdown');
    if(heroCountEl) heroCountEl.textContent = formattedCountdown;

    // 2. تحديث البادج الصغير في القائمة (بدون ثواني)
    const listBadge = document.querySelector('.prayer-time-item.next-prayer .time-remaining-badge');
    if (listBadge) {
        if (h === 0 && m === 0 && s < 60) {
            listBadge.textContent = "حان الوقت الآن";
            listBadge.classList.add('animate-pulse'); // وميض عند حلول الوقت
        } else {
            listBadge.classList.remove('animate-pulse');
            let text = 'متبقي ';
            if (h > 0) text += `${h}س و `;
            text += `${m}د`;
            listBadge.textContent = text;
        }
    }
}

// المؤقت الرئيسي (يفحص كل دقيقة لتحديث البيانات والتنبيهات)
function startMainTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        updatePrayerUI();    // قد يكون دخل يوم جديد أو تغيرت الصلاة
        checkNotifications(); // هل حان وقت الأذان؟
        updateHijriDate();   // تحديث التاريخ
    }, 60000); 
}

// التاريخ الهجري
function updateHijriDate() {
    const now = new Date();
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-civil', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(now);
    
    const el = document.getElementById('hijriDate');
    if(el) el.textContent = hijri;
}


/* =========================================
   3. القرآن الكريم (Quran)
   ========================================= */

let isQuranLoaded = false;

// تحميل قائمة السور من ملف JSON محلي
async function loadQuranList() {
    if (isQuranLoaded) return;
    const list = document.getElementById('quranSurahList');
    if(!list) return;
    
    try {
        // تأكد من مسار الملف الصحيح
        const res = await fetch('data/surahs.json'); 
        const data = await res.json();
        
        list.innerHTML = '';
        data.chapters.forEach(surah => {
            const div = document.createElement('div');
            div.className = 'surah-item';
            div.onclick = () => loadSurahText(surah.id); // عند الضغط حمل النص
            
            div.innerHTML = `
                <div class="flex items-center">
                    <div class="surah-number-box font-tajawal">${surah.id}</div>
                    <div class="mr-4">
                        <div class="font-bold text-lg font-kufi" style="color:var(--primary-dark)">${surah.name_arabic}</div>
                        <div class="text-xs text-gray-500 font-tajawal">${surah.verses_count} آية - ${surah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</div>
                    </div>
                </div>
                <i class="fas fa-chevron-left text-gray-300 text-sm"></i>
            `;
            list.appendChild(div);
        });
        isQuranLoaded = true;
    } catch (e) {
        console.error(e);
        list.innerHTML = '<div class="p-6 text-center text-red-500 bg-red-50 rounded-xl mx-4 font-tajawal">فشل تحميل قائمة السور. يرجى التحقق من ملف data/surahs.json</div>';
    }
}

// جلب نص السورة من API
async function loadSurahText(id) {
    const viewer = document.getElementById('quranViewer');
    const content = document.getElementById('quranViewerContent');
    const title = document.getElementById('quranViewerTitle');
    
    if(!viewer || !content) return;

    // إظهار النافذة المنبثقة
    viewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // منع السكرول في الخلفية
    
    // مؤشر تحميل
    content.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-gray-500">
            <i class="fas fa-spinner fa-spin fa-3x mb-4" style="color:var(--primary)"></i>
            <span class="font-tajawal">جارٍ تحميل الآيات...</span>
        </div>`;
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}`);
        const data = await res.json();
        
        if(title) title.textContent = `سورة ${data.data.name}`;
        content.innerHTML = '';
        
        // البسملة (إلا في التوبة رقم 9)
        if (id !== 9) {
            const basmalah = document.createElement('div');
            basmalah.className = 'text-center text-2xl mb-8 font-quran pt-4';
            basmalah.style.color = 'var(--primary-dark)';
            basmalah.innerHTML = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
            content.appendChild(basmalah);
        }

        let fullSurahText = "";
        data.data.ayahs.forEach(ayah => {
            let text = ayah.text;
            // إزالة البسملة من نص الآية الأولى لأننا عرضناها منفصلة
            if (id !== 1 && id !== 9 && ayah.numberInSurah === 1) {
                text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
            }
            
            // إضافة النص مع رمز نهاية الآية
            fullSurahText += `${text} <span class="ayah-end-symbol">۝</span><span class="text-sm ml-1 mr-2" style="color:var(--primary); font-family:sans-serif">${ayah.numberInSurah.toLocaleString('ar-EG')}</span> `;
        });
        
        const textContainer = document.createElement('div');
        textContainer.className = 'leading-loose pb-10';
        textContainer.innerHTML = fullSurahText;
        content.appendChild(textContainer);
        
    } catch (e) {
        content.innerHTML = '<div class="p-6 text-center text-red-500 bg-red-50 rounded-xl m-4 font-tajawal">تعذر تحميل نص السورة. يرجى التحقق من اتصال الإنترنت.</div>';
    }
}

function closeQuranViewer() {
    const viewer = document.getElementById('quranViewer');
    if(viewer) viewer.classList.add('hidden');
    document.body.style.overflow = 'auto'; // إعادة السكرول
}


/* =========================================
   4. معرض الصور (Gallery & Lightbox)
   ========================================= */

// إعداد Lazy Loading للصور لتحسين الأداء
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-img');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // نقل المسار من data-src إلى src
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-img');
                    // تأثير ظهور جميل
                    img.classList.add('animate__animated', 'animate__fadeIn');
                    observer.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // للمتصفحات القديمة جداً: حمل الصور مباشرة
        lazyImages.forEach(img => img.src = img.dataset.src);
    }
}

// فتح الصورة في وضع التكبير
function openImageViewer(src) {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('viewedImage');
    if(viewer && img) {
        img.src = src;
        viewer.classList.remove('hidden');
    }
}

// إغلاق عارض الصور
function closeImageViewer() {
    const viewer = document.getElementById('imageViewer');
    if(viewer) viewer.classList.add('hidden');
}


/* =========================================
   5. نظام التنبيهات (Notifications)
   ========================================= */

let notifEnabled = localStorage.getItem('notifEnabled') === 'true';

function initNotifications() {
    const toggle = document.getElementById('notificationToggle');
    if(!toggle) return;

    toggle.checked = notifEnabled;
    updateNotifStatus();

    toggle.addEventListener('change', async (e) => {
        if (e.target.checked) {
            // طلب إذن المتصفح
            if ('Notification' in window) {
                 const perm = await Notification.requestPermission();
                 if (perm === 'granted') {
                     notifEnabled = true;
                     // تشغيل صوت صامت لتفعيل "محرك الصوت" في المتصفح
                     playAdhan(true); 
                 } else {
                     notifEnabled = false;
                     e.target.checked = false;
                     alert('يجب السماح بالإشعارات من إعدادات المتصفح لتفعيل هذه الميزة.');
                 }
            } else {
                alert('متصفحك لا يدعم التنبيهات.');
                e.target.checked = false;
            }
        } else {
            notifEnabled = false;
        }
        localStorage.setItem('notifEnabled', notifEnabled);
        updateNotifStatus();
    });
}

function updateNotifStatus() {
    const el = document.getElementById('notificationStatus');
    if(el) {
        el.textContent = notifEnabled ? 'التنبيهات مفعلة حالياً' : 'اضغط لتفعيل التنبيه الصوتي';
        el.style.color = notifEnabled ? 'var(--primary)' : 'gray';
    }
}

// التحقق مما إذا حان وقت الصلاة
function checkNotifications() {
    if (!notifEnabled || !prayerData) return;
    
    const now = new Date();
    // تنسيق الوقت الحالي HH:MM
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const times = prayerData[month]?.[day];

    if (!times) return;

    // مقارنة الوقت الحالي بأوقات الصلاة
    Object.entries(times).forEach(([key, time]) => {
        if (key === 'sunrise') return; // لا نؤذن للشروق
        
        // التأكد من أننا في نفس الدقيقة ولم يمر التنبيه
        if (time === currentTime && now.getSeconds() < 2) {
            // إشعار سطح المكتب
            new Notification("حان الآن وقت الصلاة", {
                body: `الساعة الآن ${time}، حي على الصلاة`,
                icon: 'mosque_images/mosque-logo.png'
            });
            // تشغيل الصوت
            playAdhan();
        }
    });
}

// تشغيل ملف الصوت
function playAdhan(silent = false) {
    const audio = document.getElementById('adhanAudio');
    if(!audio) return;

    if(silent) {
        // تشغيل وإيقاف سريع للتحايل على سياسات المتصفح
        audio.volume = 0;
        audio.play().then(()=> { 
            setTimeout(()=> { audio.pause(); audio.currentTime = 0; audio.volume = 1; }, 100); 
        }).catch(()=>{});
    } else {
        audio.volume = 1;
        audio.play().catch(e => console.log("Adhan play blocked by browser: " + e));
    }
}