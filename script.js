/* =====================
   إدارة التنقل والواجهة
===================== */

document.addEventListener('DOMContentLoaded', () => {
    // تحميل الافتراضيات
    loadPrayerTimes();
    updateHijriDate(); // تحديث التاريخ فوراً
    
    if (document.getElementById('notificationToggle')) {
        initNotifications();
    }
    
    // التعامل مع Lazy Loading للصور
    setupLazyLoading();

    // إخفاء شاشة التحميل إذا كانت موجودة
    // setTimeout(() => document.getElementById('loader').style.display = 'none', 1000);
});

function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-img');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-img');
                    img.classList.add('animate__animated', 'animate__fadeIn');
                    observer.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback للمتصفحات القديمة
        lazyImages.forEach(img => img.src = img.dataset.src);
    }
}

function switchTab(tabId) {
    // إخفاء كل المحتويات
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    
    // إظهار المحتوى المطلوب
    const target = document.getElementById(tabId);
    if(target) {
        target.classList.remove('hidden');
        // إضافة تأخير بسيط للأنيميشن عند التبديل
        setTimeout(() => target.classList.add('active'), 50);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // تحديث القائمة السفلية الحديثة
    updateBottomNavUI(tabId);

    // تحديث الروابط السريعة في الرئيسية
    document.querySelectorAll('.quick-link-card').forEach(link => link.classList.remove('active-tab-link'));
    const activeQuickLink = document.querySelector(`.quick-link-card[onclick*="${tabId}"]`);
    if(activeQuickLink && tabId !== 'home') activeQuickLink.classList.add('active-tab-link');

    // إغلاق القائمة الجانبية
    closeNav();

    // تحميل خاص عند الحاجة
    if (tabId === 'quran') loadQuranList();
}

function updateBottomNavUI(tabId) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.nav-center-button-container').classList.remove('active');

    if (tabId === 'quran') {
        document.querySelector('.nav-center-button-container').classList.add('active');
    } else {
        const activeNav = document.querySelector(`.nav-item#nav-${tabId}`);
        if(activeNav) activeNav.classList.add('active');
    }
}

function openNav() { document.getElementById("mySidenav").style.width = "280px"; }
function closeNav() { document.getElementById("mySidenav").style.width = "0"; }

/* =====================
   مواقيت الصلاة والعد التنازلي
===================== */

let prayerData = null;
let timerInterval = null;
let countdownInterval = null;
let nextPrayerGlobal = null;

async function loadPrayerTimes() {
    try {
        const response = await fetch('prayer_times.json');
        if (!response.ok) throw new Error("File not found");
        prayerData = await response.json();
        updatePrayerUI();
        startMainTimer();
    } catch (error) {
        console.error("Error loading prayers:", error);
        document.getElementById('prayerTimesContainer').innerHTML = 
            '<div class="p-4 text-center text-red-500 bg-red-50 rounded-lg">تعذر تحميل ملف المواقيت.</div>';
        // إخفاء عداد الهيرو في حالة الخطأ
        document.getElementById('heroNextPrayer').classList.add('hidden');
    }
}

function updatePrayerUI() {
    if (!prayerData) return;

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    const times = prayerData[month]?.[day];
    if (!times) return;

    const prayers = [
        { key: 'fajr', name: 'الفجر', time: times.fajr },
        { key: 'sunrise', name: 'الشروق', time: times.sunrise },
        { key: 'dhuhr', name: 'الظهر', time: times.dhuhr },
        { key: 'asr', name: 'العصر', time: times.asr },
        { key: 'maghrib', name: 'المغرب', time: times.maghrib },
        { key: 'isha', name: 'العشاء', time: times.isha }
    ];

    const container = document.getElementById('prayerTimesContainer');
    container.innerHTML = ''; 

    prayers.forEach(p => {
        const div = document.createElement('div');
        div.className = 'prayer-time-item';
        div.id = `prayer-${p.key}`;
        // تنسيق الوقت ليكون صباحاً/مساءً (اختياري)
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

    calculateNextPrayer(prayers);
}

// دالة مساعدة لتنسيق الوقت 12 ساعة
function formatTimeAMPM(time24) {
    let [h, m] = time24.split(':');
    h = parseInt(h);
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12;
    h = h ? h : 12; // الساعة 0 تصبح 12
    return `${h}:${m} <small>${ampm}</small>`;
}

function calculateNextPrayer(prayers) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();
    const totalCurrentSeconds = currentMinutes * 60 + currentSeconds;

    let nextP = null;
    let minDiffSeconds = Infinity;

    prayers.forEach(p => {
        if(p.key === 'sunrise') return; 
        const [h, m] = p.time.split(':').map(Number);
        let prayerTotalSeconds = (h * 60 + m) * 60;
        
        let diffSeconds = prayerTotalSeconds - totalCurrentSeconds;
        if (diffSeconds < 0) diffSeconds += (24 * 3600); // لليوم التالي

        if (diffSeconds < minDiffSeconds) {
            minDiffSeconds = diffSeconds;
            nextP = { ...p, targetSeconds: prayerTotalSeconds };
        }
    });

    nextPrayerGlobal = nextP;
    updateNextPrayerHighlights();
    
    // بدء العداد التنازلي بالثواني
    if (countdownInterval) clearInterval(countdownInterval);
    updateCountdown(); // تحديث فوري
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateNextPrayerHighlights() {
    // إزالة التظليل القديم
    document.querySelectorAll('.prayer-time-item').forEach(el => {
        el.classList.remove('next-prayer');
        el.querySelector('.time-remaining-badge').classList.add('hidden');
    });

    const heroContainer = document.getElementById('heroNextPrayer');

    if (nextPrayerGlobal) {
        // تظليل في قائمة الصلوات
        const el = document.getElementById(`prayer-${nextPrayerGlobal.key}`);
        if (el) {
            el.classList.add('next-prayer');
            el.querySelector('.time-remaining-badge').classList.remove('hidden');
        }
        // إظهار عداد الهيرو
        heroContainer.classList.remove('hidden');
        document.getElementById('heroPrayerName').textContent = nextPrayerGlobal.name;
    } else {
         heroContainer.classList.add('hidden');
    }
}

function updateCountdown() {
    if (!nextPrayerGlobal) return;

    const now = new Date();
    const totalCurrentSeconds = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();
    
    let diff = nextPrayerGlobal.targetSeconds - totalCurrentSeconds;
    if (diff < 0) diff += (24 * 3600);

    // تحويل الثواني إلى س:د:ث
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    const formattedCountdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    // تحديث عداد الهيرو
    document.getElementById('heroCountdown').textContent = formattedCountdown;

    // تحديث بادج القائمة (بدون ثواني)
    const el = document.querySelector('.prayer-time-item.next-prayer .time-remaining-badge');
    if (el) {
        let text = 'متبقي ';
        if (h > 0) text += `${h} ساعة و `;
        text += `${m} دقيقة`;
         // إذا تبقى أقل من دقيقة
        if (h===0 && m===0 && s>0) text = "حان الوقت تقريباً";
        el.textContent = text;
    }
}

function startMainTimer() {
    // تحديث البيانات الرئيسية كل دقيقة (للتحقق من دخول وقت جديد أو تغير اليوم)
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        updatePrayerUI();
        checkNotifications();
        updateHijriDate();
    }, 60000); 
}

function updateHijriDate() {
    const now = new Date();
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-civil', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(now);
    const el = document.getElementById('hijriDate');
    if(el) el.textContent = hijri;
}

/* =====================
   القرآن الكريم (المحدث)
===================== */

let isQuranLoaded = false;
async function loadQuranList() {
    if (isQuranLoaded) return;
    const list = document.getElementById('quranSurahList');
    
    try {
        const res = await fetch('data/surahs.json');
        const data = await res.json();
        
        list.innerHTML = '';
        data.chapters.forEach(surah => {
            const div = document.createElement('div');
            div.className = 'surah-item';
            div.onclick = () => loadSurahText(surah.id);
            div.innerHTML = `
                <div class="flex items-center">
                    <div class="surah-number-box font-tajawal">${surah.id}</div>
                    <div class="mr-4">
                        <div class="font-bold text-emerald-800 font-kufi">${surah.name_arabic}</div>
                        <div class="text-xs text-emerald-600 opacity-70 font-tajawal">${surah.verses_count} آية - ${surah.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</div>
                    </div>
                </div>
                <i class="fas fa-chevron-left text-emerald-200 text-sm"></i>
            `;
            list.appendChild(div);
        });
        isQuranLoaded = true;
    } catch (e) {
        list.innerHTML = '<div class="p-6 text-center text-red-500 bg-red-50 rounded-xl mx-4">فشل تحميل قائمة السور. يرجى التحقق من الاتصال.</div>';
    }
}

async function loadSurahText(id) {
    const viewer = document.getElementById('quranViewer');
    const content = document.getElementById('quranViewerContent');
    const title = document.getElementById('quranViewerTitle');
    
    viewer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // منع التمرير الخلفي
    content.innerHTML = '<div class="flex flex-col items-center justify-center h-full text-emerald-600"><i class="fas fa-spinner fa-spin fa-3x mb-4"></i><span class="font-tajawal">جارٍ تحميل الآيات...</span></div>';
    
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}`);
        const data = await res.json();
        
        title.textContent = `سورة ${data.data.name}`;
        content.innerHTML = '';
        
        if (id !== 9) {
            const basmalah = document.createElement('div');
            basmalah.className = 'text-center text-2xl mb-8 font-quran text-emerald-800 pt-4';
            basmalah.innerHTML = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
            content.appendChild(basmalah);
        }

        let fullSurahText = "";
        data.data.ayahs.forEach(ayah => {
            let text = ayah.text;
            if (id !== 1 && id !== 9 && ayah.numberInSurah === 1) {
                text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").trim();
            }
            // استخدام رمز Unicode لنهاية الآية
            fullSurahText += `${text} <span class="ayah-end-symbol">۝</span><span class="text-sm text-emerald-500 ml-1 mr-2">${ayah.numberInSurah.toLocaleString('ar-EG')}</span> `;
        });
        
        const textContainer = document.createElement('div');
        textContainer.className = 'leading-loose pb-10';
        textContainer.innerHTML = fullSurahText;
        content.appendChild(textContainer);
        
    } catch (e) {
        content.innerHTML = '<div class="p-6 text-center text-red-500 bg-red-50 rounded-xl m-4 font-tajawal">تعذر تحميل نص السورة. حاول مرة أخرى.</div>';
    }
}

function closeQuranViewer() {
    document.getElementById('quranViewer').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/* =====================
   المرافق (صور، تنبيهات)
===================== */
function openImageViewer(src) {
    const v = document.getElementById('imageViewer');
    document.getElementById('viewedImage').src = src;
    v.classList.remove('hidden');
}
function closeImageViewer() {
    document.getElementById('imageViewer').classList.add('hidden');
}

// (نظام التنبيهات يبقى كما هو في الكود السابق)
let notifEnabled = localStorage.getItem('notifEnabled') === 'true';
function initNotifications() {
    const toggle = document.getElementById('notificationToggle');
    toggle.checked = notifEnabled;
    updateNotifStatus();

    toggle.addEventListener('change', async (e) => {
        if (e.target.checked) {
            if ('Notification' in window) {
                 const perm = await Notification.requestPermission();
                 if (perm === 'granted') {
                     notifEnabled = true;
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
    el.textContent = notifEnabled ? 'التنبيهات مفعلة حالياً' : 'اضغط لتفعيل التنبيه الصوتي عند وقت الصلاة';
}

function checkNotifications() {
    if (!notifEnabled || !prayerData) return;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    // نحتاج الدقيقة الحالية بالضبط لمقارنة وقت JSON
    
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const times = prayerData[month]?.[day];
    if (!times) return;

    // نتحقق إذا كان الوقت الحالي يطابق أي وقت صلاة
    Object.entries(times).forEach(([key, time]) => {
        if (key === 'sunrise') return;
        if (time === currentTime && now.getSeconds() < 2) { // ضمان التشغيل مرة واحدة في الدقيقة
            new Notification("حان الآن وقت الصلاة", {
                body: `الساعة الآن ${time}، حي على الصلاة`,
                icon: 'mosque_images/mosque-logo.png' // تأكد من وجود أيقونة
            });
            playAdhan();
        }
    });
}

function playAdhan(silent = false) {
    const audio = document.getElementById('adhanAudio');
    if(silent) {
        audio.volume = 0;
        audio.play().then(()=> { setTimeout(()=>audio.pause(), 500); audio.volume = 1; })
             .catch(()=>{});
    } else {
        audio.volume = 1;
        audio.play().catch(e => console.log("Adhan play blocked: " + e));
    }
}