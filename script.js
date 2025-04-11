// --- Global variable for the timer interval ---
let prayerTimerInterval = null;
// --- Global variable to store loaded prayer times data ---
let prayerTimesData = null;
// --- Global variable to store today's timings for timer updates ---
let todayTimings = null;

// --- Navigation Functions ---
function openNav() {
    // console.log("[Sidenav] openNav() called"); // Optional logging
    try {
        const sidenavElement = document.getElementById("mySidenav");
        if (sidenavElement) {
            sidenavElement.style.width = "250px";
            // console.log("[Sidenav] Sidenav width set to 250px");
        } else {
            console.error("[Sidenav] Element with ID 'mySidenav' not found!");
        }
    } catch (e) {
        console.error("[Sidenav] Error in openNav:", e);
    }
}

function closeNav() {
    // console.log("[Sidenav] closeNav() called"); // Optional logging
     try {
        const sidenavElement = document.getElementById("mySidenav");
         if (sidenavElement) {
             sidenavElement.style.width = "0";
            //  console.log("[Sidenav] Sidenav width set to 0");
         } else {
             console.error("[Sidenav] Element with ID 'mySidenav' not found!");
         }
     } catch (e) {
         console.error("[Sidenav] Error in closeNav:", e);
     }
}

function switchTab(tabId) {
    // console.log("[Nav] Switching to tab:", tabId);
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active', 'animate__animated', 'animate__fadeIn');
        content.classList.add('hidden');
    });

    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const sidenavLinks = document.querySelectorAll('#mySidenav a');

    bottomNavItems.forEach(item => item.classList.remove('active'));
    sidenavLinks.forEach(link => link.style.backgroundColor = '');

    const activeTabElement = document.getElementById(tabId);
    if (activeTabElement) {
        activeTabElement.classList.remove('hidden');
        activeTabElement.classList.add('active');
    } else {
        console.error("[Nav] Tab content not found for ID:", tabId, ". Falling back to home.");
        // Fallback to home if target tab doesn't exist
        document.getElementById('home').classList.remove('hidden');
        document.getElementById('home').classList.add('active');
        tabId = 'home';
    }

    // Activate correct navigation indicator (bottom or side)
    let itemActivated = false;
    bottomNavItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
            item.classList.add('active');
            itemActivated = true;
        }
    });

    // If not activated in bottom nav, check sidenav and activate 'More'
    if (!itemActivated && tabId !== 'home') {
        const moreButton = document.querySelector('.bottom-nav-item[onclick*="openNav"]');
        if (moreButton) moreButton.classList.add('active');
        sidenavLinks.forEach(link => {
             const onclickAttr = link.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) { link.style.backgroundColor = 'var(--light-bg)'; }
        });
    } else if (tabId === 'home'){
         // Ensure home is active when explicitly selected or as fallback
          const homeBottomNav = document.querySelector('.bottom-nav-item[onclick*="\'home\'"]');
          if(homeBottomNav) homeBottomNav.classList.add('active');
    }

    // Load dynamic content or manage timers based on the active tab
    if (tabId === 'prayer') {
        // console.log("[Dynamic Content] Loading Prayer Times from JSON...");
        loadPrayerTimesFromJson('prayer_times.json'); // Load/refresh prayer times
        loadHijriDate(); // Load/refresh Hijri date
    } else {
        // Clear prayer timer if navigating away from the prayer tab
        if (prayerTimerInterval) {
            clearInterval(prayerTimerInterval);
            prayerTimerInterval = null;
            console.log("[Timer] Prayer timer cleared.");
        }
    }

     if (tabId === 'quran') {
        // console.log("[Dynamic Content] Loading Surah List...");
        loadSurahList(); // Load surah list if needed
    }

    // Close sidenav if it's open after handling the tab switch
    if (document.getElementById("mySidenav").style.width !== "0px") {
      closeNav();
    }
}


// --- Image Viewer Functions ---
function openImageViewer(imageSrc) {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('viewedImage');
    if(viewer && img) {
        img.src = imageSrc;
        viewer.classList.remove('hidden');
        viewer.classList.add('flex');
    } else {
        console.error("[ImageViewer] Viewer or Image element not found.");
    }
}
function closeImageViewer() {
     const viewer = document.getElementById('imageViewer');
     if(viewer) {
        viewer.classList.add('hidden');
        viewer.classList.remove('flex');
     }
}


// --- Prayer Times Functions (JSON Version) ---

function displayPrayerTimeError(message) {
     const container = document.getElementById('prayerTimesContainer');
     const errorElement = container ? container.querySelector('.prayer-error-message') : null;
     if (container) {
         container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');
         if(errorElement) {
            errorElement.textContent = message;
            console.error("[PrayerTimes][Error Display] ", message);
         }
     } else {
        console.error("[PrayerTimes] Could not find container or error element to display message:", message);
     }
     const hijriDateSpan = document.getElementById('hijriDate');
     if (hijriDateSpan) hijriDateSpan.textContent = "--";
     const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
     if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = '';
}

function formatTime12Hour(timeString24) {
    if (typeof timeString24 !== 'string') return '--:--';
    const trimmedTime = timeString24.trim();
    const timeRegex = /^([0-9]{2}):([0-9]{2})$/;
    const match = trimmedTime.match(timeRegex);

    if (match) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        // Basic validation after parsing
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
             console.warn(`[FormatTime12] Invalid hour/minute values after parsing: H=${hour}, M=${minute}`);
             return '--:--';
        }
        const period = hour >= 12 ? 'م' : 'ص'; // Use م for PM, ص for AM
        hour = hour % 12;
        if (hour === 0) { hour = 12; } // Convert 0 to 12 for 12 AM
        const formattedHour = String(hour);
        const formattedMinute = String(minute).padStart(2, '0');
        return `${formattedHour}:${formattedMinute} ${period}`;
    }
    // console.warn(`[FormatTime12] Input "${timeString24}" not valid HH:MM.`);
    return '--:--';
}

async function loadPrayerTimesFromJson(jsonFilePath) {
    // console.log(`[PrayerTimes][JSON] Attempting to load from: ${jsonFilePath}`);
    const container = document.getElementById('prayerTimesContainer');
    const errorElement = container ? container.querySelector('.prayer-error-message') : null;

    if (!container) { console.error("[PrayerTimes] Container 'prayerTimesContainer' not found."); return; }
    if (errorElement) errorElement.textContent = '';
    container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');

    // Fetch JSON only if not already loaded
    if (!prayerTimesData) {
        try {
            const response = await fetch(jsonFilePath, { cache: "no-cache" });
            // console.log(`[PrayerTimes][JSON] Fetch response status for ${jsonFilePath}: ${response.status}`);
            if (!response.ok) { throw new Error(`ملف المواقيت JSON (${response.status === 404 ? 'غير موجود' : response.status})`); }
            prayerTimesData = await response.json();
            console.log("[PrayerTimes][JSON] JSON data loaded and stored successfully.");
        } catch (error) {
            console.error('[PrayerTimes][JSON] Error loading or parsing JSON file:', error);
            displayPrayerTimeError(error.message || 'حدث خطأ تحميل بيانات المواقيت.');
            return; // Stop if JSON fails
        }
    } else {
        // console.log("[PrayerTimes][JSON] Using stored JSON data.");
    }

    const today = new Date();
    const currentDay = String(today.getDate());
    const currentMonth = String(today.getMonth() + 1);

    // console.log(`[PrayerTimes][JSON] Looking for data for Month: ${currentMonth}, Day: ${currentDay}`);

    if (prayerTimesData && prayerTimesData[currentMonth] && prayerTimesData[currentMonth][currentDay]) {
        todayTimings = prayerTimesData[currentMonth][currentDay]; // Store today's timings
        // console.log("[PrayerTimes][JSON] Found timings for today:", todayTimings);

        // Update HTML with 12-hour format
        document.getElementById('fajrTime').textContent = formatTime12Hour(todayTimings.fajr);
        document.getElementById('sunriseTime').textContent = formatTime12Hour(todayTimings.sunrise);
        document.getElementById('dhuhrTime').textContent = formatTime12Hour(todayTimings.dhuhr);
        document.getElementById('asrTime').textContent = formatTime12Hour(todayTimings.asr);
        document.getElementById('maghribTime').textContent = formatTime12Hour(todayTimings.maghrib);
        document.getElementById('ishaTime').textContent = formatTime12Hour(todayTimings.isha);
        // console.log("[PrayerTimes][JSON] HTML elements updated with 12-hour format.");

        // Initial call & start timer for highlighting and remaining time
        updateNextPrayerHighlightAndTimer();
        if (prayerTimerInterval) clearInterval(prayerTimerInterval);
        prayerTimerInterval = setInterval(updateNextPrayerHighlightAndTimer, 1000); // Update every second
        // console.log("[Timer] Prayer timer interval set.");

    } else {
        console.error(`[PrayerTimes][JSON] Timings not found for Month: ${currentMonth}, Day: ${currentDay}.`);
        todayTimings = null; // Reset stored timings
        if (prayerTimerInterval) clearInterval(prayerTimerInterval); // Clear timer
        displayPrayerTimeError('لم يتم العثور على مواقيت صلاة اليوم.');
    }
}

function updateNextPrayerHighlightAndTimer() {
    if (!todayTimings) { return; } // Exit if no timings loaded

    const now = new Date();
    const prayerElements = [
        { name: 'الفجر', time: todayTimings.fajr, id: 'fajrItem' },
        { name: 'الشروق', time: todayTimings.sunrise, id: 'sunriseItem' },
        { name: 'الظهر', time: todayTimings.dhuhr, id: 'dhuhrItem' },
        { name: 'العصر', time: todayTimings.asr, id: 'asrItem' },
        { name: 'المغرب', time: todayTimings.maghrib, id: 'maghribItem' },
        { name: 'العشاء', time: todayTimings.isha, id: 'ishaItem' }
    ];

    let nextPrayer = null;
    let nextPrayerTimeObj = null;

    // Convert prayer times to Date objects for today to allow comparison
    for (const prayer of prayerElements) {
        if (prayer.time && typeof prayer.time === 'string') {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                const prayerTimeObj = new Date(); // Use today's date
                prayerTimeObj.setHours(hours, minutes, 0, 0); // Set the time part

                // Find the first prayer time that is after the current time
                if (prayerTimeObj > now) {
                    nextPrayer = prayer;
                    nextPrayerTimeObj = prayerTimeObj;
                    break;
                }
             } else { console.warn(`[Timer] Invalid HH:MM format for ${prayer.name}: ${prayer.time}`); }
        } else { console.warn(`[Timer] Missing/invalid time string for ${prayer.name}: ${prayer.time}`); }
    }

    // Reset styles and text for all items first
    document.querySelectorAll('.prayer-time-item').forEach(item => {
        item.classList.remove('next-prayer');
        const remainingSpan = item.querySelector('.time-remaining');
        if (remainingSpan) remainingSpan.textContent = '';
    });
    const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
    if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = '';

    // Apply styles and calculate time for the next prayer found
    if (nextPrayer && nextPrayerTimeObj) {
        const nextPrayerElement = document.getElementById(nextPrayer.id);
        if (nextPrayerElement) {
            nextPrayerElement.classList.add('next-prayer'); // Add highlight class

            // Calculate remaining time
            const diffMs = nextPrayerTimeObj.getTime() - now.getTime();
            if (diffMs > 0) { // Only display if time is in the future
                const totalMinutes = Math.floor(diffMs / (1000 * 60));
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                // Build remaining time string (Arabic)
                let remainingText = "تبقى: ";
                if (hours > 0) remainingText += `${hours} س `;
                if (minutes > 0 || hours > 0) remainingText += `${minutes} د `;
                 // Always show seconds for live update feel
                remainingText += `${seconds} ث`;

                // Display remaining time inside the item and in the summary
                const remainingSpan = nextPrayerElement.querySelector('.time-remaining');
                if (remainingSpan) remainingSpan.textContent = remainingText;
                if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = `الصلاة القادمة: ${nextPrayer.name} (${remainingText.replace('تبقى: ','')})`;

             } else {
                 // If time difference is zero or negative (prayer time is now or just passed)
                 const remainingSpan = nextPrayerElement.querySelector('.time-remaining');
                 if (remainingSpan) remainingSpan.textContent = "حان الآن";
                 if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = `حان الآن وقت ${nextPrayer.name}`;
                 // Optional: Add logic here if you want something special to happen exactly at prayer time
            }
        } else { console.warn(`[Timer] Element with ID ${nextPrayer.id} not found.`); }
    } else {
        // Case: After Isha prayer for the day
        const fajrElement = document.getElementById('fajrItem');
        if (fajrElement) {
            fajrElement.classList.add('next-prayer'); // Highlight Fajr item
            const remainingSpan = fajrElement.querySelector('.time-remaining');
            if (remainingSpan) remainingSpan.textContent = 'الصلاة التالية'; // Simple message
            if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = `الصلاة القادمة: الفجر`;
        }
        // Optional: Clear the interval after Isha if you don't need second-by-second updates overnight
        // if (prayerTimerInterval) {
        //     clearInterval(prayerTimerInterval);
        //     prayerTimerInterval = null;
        //     console.log("[Timer] Timer stopped after Isha.");
        // }
    }
}


// --- Hijri Date Function ---
function loadHijriDate() {
    const hijriDateSpan = document.getElementById('hijriDate');
    if (!hijriDateSpan) { console.error("[HijriDate] Span element 'hijriDate' not found."); return; }
    try {
        const today = new Date();
        // Using specific options for Kuwait Hijri display
        const options = { calendar: 'islamic-umalqura', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' };
        const hijriFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic-umalqura', options);
        hijriDateSpan.textContent = hijriFormatter.format(today);
    } catch (error) {
        console.error("[HijriDate] Error formatting Hijri date (Umm al-Qura):", error.message);
         try { // Fallback
             const fallbackOptions = { calendar: 'islamic', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' };
             const fallbackFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic', fallbackOptions);
             hijriDateSpan.textContent = fallbackFormatter.format(new Date());
         } catch (fallbackError) {
             console.error("[HijriDate] Fallback Hijri date formatting also failed:", fallbackError.message);
             hijriDateSpan.textContent = "غير متوفر";
         }
    }
}

// --- Quran Functions ---

function toArabicIndicNumerals(num) {
    const arabicIndicMap = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (d) => arabicIndicMap[parseInt(d)]);
}

function loadSurahList() {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) { console.error("[Quran] Surah list container 'quranSurahList' not found."); return; }
    if (surahListContainer.children.length > 1 || (surahListContainer.children.length === 1 && !surahListContainer.firstElementChild.textContent.includes('جارٍ تحميل'))) { return; }
    // console.log("[Quran] Loading Surah list...");
    const quranData = { "chapters": [ {"id": 1, "name_arabic": "الفاتحة", "verses_count": 7}, {"id": 2, "name_arabic": "البقرة", "verses_count": 286}, {"id": 3, "name_arabic": "آل عمران", "verses_count": 200}, {"id": 4, "name_arabic": "النساء", "verses_count": 176}, {"id": 5, "name_arabic": "المائدة", "verses_count": 120}, {"id": 6, "name_arabic": "الأنعام", "verses_count": 165}, {"id": 7, "name_arabic": "الأعراف", "verses_count": 206}, {"id": 8, "name_arabic": "الأنفال", "verses_count": 75}, {"id": 9, "name_arabic": "التوبة", "verses_count": 129}, {"id": 10, "name_arabic": "يونس", "verses_count": 109}, {"id": 11, "name_arabic": "هود", "verses_count": 123}, {"id": 12, "name_arabic": "يوسف", "verses_count": 111}, {"id": 13, "name_arabic": "الرعد", "verses_count": 43}, {"id": 14, "name_arabic": "ابراهيم", "verses_count": 52}, {"id": 15, "name_arabic": "الحجر", "verses_count": 99}, {"id": 16, "name_arabic": "النحل", "verses_count": 128}, {"id": 17, "name_arabic": "الإسراء", "verses_count": 111}, {"id": 18, "name_arabic": "الكهف", "verses_count": 110}, {"id": 19, "name_arabic": "مريم", "verses_count": 98}, {"id": 20, "name_arabic": "طه", "verses_count": 135}, {"id": 21, "name_arabic": "الأنبياء", "verses_count": 112}, {"id": 22, "name_arabic": "الحج", "verses_count": 78}, {"id": 23, "name_arabic": "المؤمنون", "verses_count": 118}, {"id": 24, "name_arabic": "النور", "verses_count": 64}, {"id": 25, "name_arabic": "الفرقان", "verses_count": 77}, {"id": 26, "name_arabic": "الشعراء", "verses_count": 227}, {"id": 27, "name_arabic": "النمل", "verses_count": 93}, {"id": 28, "name_arabic": "القصص", "verses_count": 88}, {"id": 29, "name_arabic": "العنكبوت", "verses_count": 69}, {"id": 30, "name_arabic": "الروم", "verses_count": 60}, {"id": 31, "name_arabic": "لقمان", "verses_count": 34}, {"id": 32, "name_arabic": "السجدة", "verses_count": 30}, {"id": 33, "name_arabic": "الأحزاب", "verses_count": 73}, {"id": 34, "name_arabic": "سبإ", "verses_count": 54}, {"id": 35, "name_arabic": "فاطر", "verses_count": 45}, {"id": 36, "name_arabic": "يس", "verses_count": 83}, {"id": 37, "name_arabic": "الصافات", "verses_count": 182}, {"id": 38, "name_arabic": "ص", "verses_count": 88}, {"id": 39, "name_arabic": "الزمر", "verses_count": 75}, {"id": 40, "name_arabic": "غافر", "verses_count": 85}, {"id": 41, "name_arabic": "فصلت", "verses_count": 54}, {"id": 42, "name_arabic": "الشورى", "verses_count": 53}, {"id": 43, "name_arabic": "الزخرف", "verses_count": 89}, {"id": 44, "name_arabic": "الدخان", "verses_count": 59}, {"id": 45, "name_arabic": "الجاثية", "verses_count": 37}, {"id": 46, "name_arabic": "الأحقاف", "verses_count": 35}, {"id": 47, "name_arabic": "محمد", "verses_count": 38}, {"id": 48, "name_arabic": "الفتح", "verses_count": 29}, {"id": 49, "name_arabic": "الحجرات", "verses_count": 18}, {"id": 50, "name_arabic": "ق", "verses_count": 45}, {"id": 51, "name_arabic": "الذاريات", "verses_count": 60}, {"id": 52, "name_arabic": "الطور", "verses_count": 49}, {"id": 53, "name_arabic": "النجم", "verses_count": 62}, {"id": 54, "name_arabic": "القمر", "verses_count": 55}, {"id": 55, "name_arabic": "الرحمن", "verses_count": 78}, {"id": 56, "name_arabic": "الواقعة", "verses_count": 96}, {"id": 57, "name_arabic": "الحديد", "verses_count": 29}, {"id": 58, "name_arabic": "المجادلة", "verses_count": 22}, {"id": 59, "name_arabic": "الحشر", "verses_count": 24}, {"id": 60, "name_arabic": "الممتحنة", "verses_count": 13}, {"id": 61, "name_arabic": "الصف", "verses_count": 14}, {"id": 62, "name_arabic": "الجمعة", "verses_count": 11}, {"id": 63, "name_arabic": "المنافقون", "verses_count": 11}, {"id": 64, "name_arabic": "التغابن", "verses_count": 18}, {"id": 65, "name_arabic": "الطلاق", "verses_count": 12}, {"id": 66, "name_arabic": "التحريم", "verses_count": 12}, {"id": 67, "name_arabic": "الملك", "verses_count": 30}, {"id": 68, "name_arabic": "القلم", "verses_count": 52}, {"id": 69, "name_arabic": "الحاقة", "verses_count": 52}, {"id": 70, "name_arabic": "المعارج", "verses_count": 44}, {"id": 71, "name_arabic": "نوح", "verses_count": 28}, {"id": 72, "name_arabic": "الجن", "verses_count": 28}, {"id": 73, "name_arabic": "المزمل", "verses_count": 20}, {"id": 74, "name_arabic": "المدثر", "verses_count": 56}, {"id": 75, "name_arabic": "القيامة", "verses_count": 40}, {"id": 76, "name_arabic": "الانسان", "verses_count": 31}, {"id": 77, "name_arabic": "المرسلات", "verses_count": 50}, {"id": 78, "name_arabic": "النبإ", "verses_count": 40}, {"id": 79, "name_arabic": "النازعات", "verses_count": 46}, {"id": 80, "name_arabic": "عبس", "verses_count": 42}, {"id": 81, "name_arabic": "التكوير", "verses_count": 29}, {"id": 82, "name_arabic": "الإنفطار", "verses_count": 19}, {"id": 83, "name_arabic": "المطففين", "verses_count": 36}, {"id": 84, "name_arabic": "الإنشقاق", "verses_count": 25}, {"id": 85, "name_arabic": "البروج", "verses_count": 22}, {"id": 86, "name_arabic": "الطارق", "verses_count": 17}, {"id": 87, "name_arabic": "الأعلى", "verses_count": 19}, {"id": 88, "name_arabic": "الغاشية", "verses_count": 26}, {"id": 89, "name_arabic": "الفجر", "verses_count": 30}, {"id": 90, "name_arabic": "البلد", "verses_count": 20}, {"id": 91, "name_arabic": "الشمس", "verses_count": 15}, {"id": 92, "name_arabic": "الليل", "verses_count": 21}, {"id": 93, "name_arabic": "الضحى", "verses_count": 11}, {"id": 94, "name_arabic": "الشرح", "verses_count": 8}, {"id": 95, "name_arabic": "التين", "verses_count": 8}, {"id": 96, "name_arabic": "العلق", "verses_count": 19}, {"id": 97, "name_arabic": "القدر", "verses_count": 5}, {"id": 98, "name_arabic": "البينة", "verses_count": 8}, {"id": 99, "name_arabic": "الزلزلة", "verses_count": 8}, {"id": 100, "name_arabic": "العاديات", "verses_count": 11}, {"id": 101, "name_arabic": "القارعة", "verses_count": 11}, {"id": 102, "name_arabic": "التكاثر", "verses_count": 8}, {"id": 103, "name_arabic": "العصر", "verses_count": 3}, {"id": 104, "name_arabic": "الهمزة", "verses_count": 9}, {"id": 105, "name_arabic": "الفيل", "verses_count": 5}, {"id": 106, "name_arabic": "قريش", "verses_count": 4}, {"id": 107, "name_arabic": "الماعون", "verses_count": 7}, {"id": 108, "name_arabic": "الكوثر", "verses_count": 3}, {"id": 109, "name_arabic": "الكافرون", "verses_count": 6}, {"id": 110, "name_arabic": "النصر", "verses_count": 3}, {"id": 111, "name_arabic": "المسد", "verses_count": 5}, {"id": 112, "name_arabic": "الإخلاص", "verses_count": 4}, {"id": 113, "name_arabic": "الفلق", "verses_count": 5}, {"id": 114, "name_arabic": "الناس", "verses_count": 6} ]};
    renderSurahList(quranData);
}

function renderSurahList(data) {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) return;
    surahListContainer.innerHTML = '';
    if (data && data.chapters && data.chapters.length > 0) {
        data.chapters.forEach(surah => {
            const surahDiv = document.createElement('div');
            surahDiv.className = 'surah-item flex justify-between items-center py-2 px-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer';
            surahDiv.onclick = () => openSurah(surah.id, surah.name_arabic); // Pass ID and Arabic name
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'surah-details flex items-center';
            const numberSpan = document.createElement('span');
            numberSpan.className = 'surah-number w-8 h-8 flex justify-center items-center bg-gray-200 rounded-full text-sm font-semibold text-gray-700 ml-3';
            numberSpan.textContent = toArabicIndicNumerals(surah.id); // Use Arabic numerals for Surah number display
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${surah.name_arabic} (${toArabicIndicNumerals(surah.verses_count)} آيات)`; // Use Arabic numerals for count
            nameSpan.className = 'text-gray-800';
            detailsDiv.appendChild(numberSpan);
            detailsDiv.appendChild(nameSpan);
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-left text-gray-400';
            surahDiv.appendChild(detailsDiv);
            surahDiv.appendChild(icon);
            surahListContainer.appendChild(surahDiv);
        });
    } else {
         surahListContainer.innerHTML = '<p class="text-center text-gray-500 py-4">قائمة السور غير متوفرة حالياً.</p>';
    }
}

async function openSurah(surahId, surahName) {
     console.log(`[Quran] Opening Surah: ${surahId} - ${surahName}`);
     const viewer = document.getElementById('quranViewer');
     const title = document.getElementById('quranViewerTitle');
     const content = document.getElementById('quranViewerContent');

     if(!viewer || !title || !content) { console.error("[Quran] Viewer elements not found!"); alert(`خطأ: لم يتم العثور على عناصر عرض السورة.`); return; }

     title.textContent = `سورة ${surahName}`;
     content.innerHTML = '<div class="loading-spinner"></div><p class="text-center text-gray-500">جارٍ تحميل نص السورة...</p>';
     viewer.classList.remove('hidden');
     const quranTab = document.getElementById('quran');
     if(quranTab) quranTab.scrollTo({ top: quranTab.scrollHeight, behavior: 'smooth' });

     const apiUrl = `https://api.alquran.cloud/v1/surah/${surahId}`;
     console.log(`[Quran] Fetching from: ${apiUrl}`);

     try {
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error(`فشل تحميل السورة (Status: ${response.status})`); }
        const data = await response.json();
        // console.log("[Quran] API Data Received:", data);

        if (data.code === 200 && data.data && data.data.ayahs) {
            content.innerHTML = ''; // Clear loading message/spinner

            // Add Bismillah conditionally
            if (surahId !== 1 && surahId !== 9) {
                const bismillah = document.createElement('p');
                bismillah.textContent = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
                bismillah.style.textAlign = 'center';
                bismillah.style.fontWeight = 'bold';
                bismillah.style.fontSize = '1.4rem'; // Larger Bismillah
                bismillah.style.marginBottom = '15px';
                bismillah.style.fontFamily = "'Noto Naskh Arabic', 'Amiri Quran', serif"; // Ensure font
                content.appendChild(bismillah);
            }

            // Display Ayahs
            data.data.ayahs.forEach(ayah => {
                const ayahText = document.createElement('span'); // Use span for inline flow with number
                 // Simple clean-up: remove potential existing number markers like [1] etc.
                ayahText.textContent = ayah.text.replace(/ \[\d+\]$/, '');

                const ayahNumSpan = document.createElement('span');
                ayahNumSpan.className = 'ayah-number';
                ayahNumSpan.textContent = toArabicIndicNumerals(ayah.numberInSurah);

                const paragraph = document.createElement('p'); // Put each ayah in its own paragraph
                paragraph.appendChild(ayahText);
                paragraph.appendChild(ayahNumSpan);
                content.appendChild(paragraph);
            });
             // console.log(`[Quran] Rendered ${data.data.ayahs.length} ayahs for Surah ${surahId}.`);
        } else {
            console.error("[Quran] Invalid data structure from API:", data);
            throw new Error("بيانات السورة المستلمة غير صالحة.");
        }
     } catch (error) {
          console.error("[Quran] Error fetching or displaying Surah:", error);
          content.innerHTML = `<p class="text-center text-red-600 py-5">عذراً، حدث خطأ أثناء تحميل نص السورة: ${error.message}</p>`;
     }
}

function closeQuranViewer() {
     const viewer = document.getElementById('quranViewer');
     if(viewer) {
         viewer.classList.add('hidden');
         const content = document.getElementById('quranViewerContent');
         if(content) content.innerHTML = ''; // Clear content
         // console.log("[Quran] Closed Quran viewer.");
     }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init Final] DOM fully loaded and parsed.");
    switchTab('home'); // Initial tab
     const suggestionsForm = document.getElementById('suggestionsForm');
     const statusMessage = document.getElementById('suggestionStatus');
     if (suggestionsForm && statusMessage) {
         suggestionsForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const suggestion = document.getElementById('suggestion').value;
            if (!suggestion.trim()) { statusMessage.textContent = 'يرجى كتابة اقتراحك أو رأيك.'; statusMessage.className = 'text-red-600 text-sm mt-3'; return; }
            console.log("[Suggestions Final] Form submitted:", { name, suggestion });
            // Placeholder for actual submission
            statusMessage.textContent = `شكراً ${name || 'لك'} على اقتراحك! تم الإرسال بنجاح.`;
            statusMessage.className = 'text-green-600 text-sm mt-3';
            suggestionsForm.reset();
            setTimeout(() => { statusMessage.textContent = ''; }, 5000);
         });
     } else {
        console.warn("[Init Final] Suggestions form or status element not found.");
     }
});