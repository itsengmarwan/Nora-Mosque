// --- Global variable for the timer interval ---
let prayerTimerInterval = null;
// --- Global variable to store loaded prayer times data ---
let prayerTimesData = null;
// --- Global variable to store today's timings for timer updates ---
let todayTimings = null;
// --- Global variable for Service Worker registration ---
let swRegistration = null;
// --- Global variable for Surah list data ---
let surahListData = null; // To store fetched surah list

// --- Navigation Functions ---
function openNav() {
    // console.log("[Sidenav] openNav() called");
    try {
        const sidenavElement = document.getElementById("mySidenav");
        if (sidenavElement) {
            sidenavElement.style.width = "250px";
        } else {
            console.error("[Sidenav] Element with ID 'mySidenav' not found!");
        }
    } catch (e) {
        console.error("[Sidenav] Error in openNav:", e);
    }
}

function closeNav() {
    // console.log("[Sidenav] closeNav() called");
     try {
        const sidenavElement = document.getElementById("mySidenav");
         if (sidenavElement) {
             sidenavElement.style.width = "0";
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
        document.getElementById('home').classList.remove('hidden');
        document.getElementById('home').classList.add('active');
        tabId = 'home';
    }

    // Activate correct navigation indicator
    let itemActivated = false;
    bottomNavItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`switchTab('${tabId}')`)) { // More specific check
            item.classList.add('active');
            itemActivated = true;
        } else if (onclickAttr && onclickAttr.includes(`openNav()`) && ['about', 'library', 'azkar', 'suggestions', 'contact', 'location'].includes(tabId)) {
             // If opening sidenav for a specific page within it, mark 'More' as active
            item.classList.add('active');
             itemActivated = true; // Consider it activated via 'More'
        }
    });

    sidenavLinks.forEach(link => {
         const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`switchTab('${tabId}')`)) { link.style.backgroundColor = 'var(--light-bg)'; }
    });

    // Ensure 'More' button is not active if a main bottom nav item is selected
    if (['home', 'prayer', 'quran', 'gallery'].includes(tabId)) {
        const moreButton = document.querySelector('.bottom-nav-item[onclick*="openNav"]');
        if (moreButton) moreButton.classList.remove('active');
    }


    // Load dynamic content or manage timers
    if (tabId === 'prayer') {
        loadPrayerTimesFromJson('prayer_times.json');
        loadHijriDate();
        // ****** Initialize notification toggle state when prayer tab is loaded ******
        initializeNotificationToggle();
    } else {
        if (prayerTimerInterval) {
            clearInterval(prayerTimerInterval);
            prayerTimerInterval = null;
            // console.log("[Timer] Prayer timer cleared.");
        }
    }

     if (tabId === 'quran') {
        loadSurahList(); // Load surah list if needed
    }

    if (document.getElementById("mySidenav").style.width !== "0px" && !onclickAttr?.includes('openNav')) { // Avoid closing if 'More' was just clicked
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
     if (container) {
         container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');
         const errorElement = container.querySelector('.prayer-error-message');
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
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
             return '--:--';
        }
        const period = hour >= 12 ? 'م' : 'ص';
        hour = hour % 12;
        if (hour === 0) { hour = 12; }
        const formattedHour = String(hour);
        const formattedMinute = String(minute).padStart(2, '0');
        return `${formattedHour}:${formattedMinute} ${period}`;
    }
    return '--:--';
}

async function loadPrayerTimesFromJson(jsonFilePath) {
    const container = document.getElementById('prayerTimesContainer');
    if (!container) { console.error("[PrayerTimes] Container 'prayerTimesContainer' not found."); return; }
    const errorElement = container.querySelector('.prayer-error-message');
    if (errorElement) errorElement.textContent = '';
    container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');

    if (!prayerTimesData) {
        try {
            const response = await fetch(jsonFilePath, { cache: "no-cache" });
            if (!response.ok) { throw new Error(`ملف المواقيت JSON (${response.status === 404 ? 'غير موجود' : response.status})`); }
            prayerTimesData = await response.json();
            console.log("[PrayerTimes][JSON] JSON data loaded and stored successfully.");
            // ****** Inform service worker about new prayer times data ******
            if (swRegistration && swRegistration.active) {
                swRegistration.active.postMessage({ type: 'SET_PRAYER_TIMES', payload: prayerTimesData });
            }
        } catch (error) {
            console.error('[PrayerTimes][JSON] Error loading or parsing JSON file:', error);
            displayPrayerTimeError(error.message || 'حدث خطأ تحميل بيانات المواقيت.');
            return;
        }
    }

    const today = new Date();
    const currentDay = String(today.getDate());
    const currentMonth = String(today.getMonth() + 1);

    if (prayerTimesData && prayerTimesData[currentMonth] && prayerTimesData[currentMonth][currentDay]) {
        todayTimings = prayerTimesData[currentMonth][currentDay];
        document.getElementById('fajrTime').textContent = formatTime12Hour(todayTimings.fajr);
        document.getElementById('sunriseTime').textContent = formatTime12Hour(todayTimings.sunrise);
        document.getElementById('dhuhrTime').textContent = formatTime12Hour(todayTimings.dhuhr);
        document.getElementById('asrTime').textContent = formatTime12Hour(todayTimings.asr);
        document.getElementById('maghribTime').textContent = formatTime12Hour(todayTimings.maghrib);
        document.getElementById('ishaTime').textContent = formatTime12Hour(todayTimings.isha);

        updateNextPrayerHighlightAndTimer();
        if (prayerTimerInterval) clearInterval(prayerTimerInterval);
        prayerTimerInterval = setInterval(updateNextPrayerHighlightAndTimer, 1000);

    } else {
        console.error(`[PrayerTimes][JSON] Timings not found for Month: ${currentMonth}, Day: ${currentDay}.`);
        todayTimings = null;
        if (prayerTimerInterval) clearInterval(prayerTimerInterval);
        displayPrayerTimeError('لم يتم العثور على مواقيت صلاة اليوم.');
    }
}

function updateNextPrayerHighlightAndTimer() {
    if (!todayTimings) { return; }

    const now = new Date();
    const prayerElements = [
        { name: 'الفجر', time: todayTimings.fajr, id: 'fajrItem' },
        { name: 'الشروق', time: todayTimings.sunrise, id: 'sunriseItem', isSunrise: true }, // Mark sunrise
        { name: 'الظهر', time: todayTimings.dhuhr, id: 'dhuhrItem' },
        { name: 'العصر', time: todayTimings.asr, id: 'asrItem' },
        { name: 'المغرب', time: todayTimings.maghrib, id: 'maghribItem' },
        { name: 'العشاء', time: todayTimings.isha, id: 'ishaItem' }
    ];

    let nextPrayer = null;
    let nextPrayerTimeObj = null;
    let isNextPrayerFound = false;

    for (const prayer of prayerElements) {
         if (prayer.time && typeof prayer.time === 'string') {
            const [hours, minutes] = prayer.time.split(':').map(Number);
             if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                const prayerTimeObj = new Date();
                 prayerTimeObj.setHours(hours, minutes, 0, 0);

                 if (prayerTimeObj > now) {
                     // Skip highlighting Sunrise itself as 'next prayer'
                     if (!prayer.isSunrise) {
                         nextPrayer = prayer;
                         nextPrayerTimeObj = prayerTimeObj;
                         isNextPrayerFound = true;
                     } else if (!nextPrayer) {
                         // If sunrise is next but no prayer found yet, note its time for later
                         nextPrayer = prayer; // Temporarily set to sunrise
                         nextPrayerTimeObj = prayerTimeObj;
                         // Continue loop to find the actual *next prayer* (Dhuhr)
                         continue;
                     }
                      if (isNextPrayerFound && !nextPrayer.isSunrise) break; // Stop if we found a real prayer
                 }
             } else { console.warn(`[Timer] Invalid HH:MM format for ${prayer.name}: ${prayer.time}`); }
         } else { console.warn(`[Timer] Missing/invalid time string for ${prayer.name}: ${prayer.time}`); }
    }

    // If loop finishes and nextPrayer is still Sunrise, it means Dhuhr is the actual next prayer.
    if (nextPrayer && nextPrayer.isSunrise) {
       const dhuhr = prayerElements.find(p => p.name === 'الظهر');
       if (dhuhr && dhuhr.time) {
           const [h, m] = dhuhr.time.split(':').map(Number);
            if (!isNaN(h) && !isNaN(m)) {
                 const dhuhrTimeObj = new Date();
                 dhuhrTimeObj.setHours(h, m, 0, 0);
                 nextPrayer = dhuhr;
                 nextPrayerTimeObj = dhuhrTimeObj;
            } else { nextPrayer = null; } // Fallback if Dhuhr time is invalid
       } else { nextPrayer = null; } // Fallback if Dhuhr data is missing
    }

    // Reset styles and text
    document.querySelectorAll('.prayer-time-item').forEach(item => {
        item.classList.remove('next-prayer');
        const remainingSpan = item.querySelector('.time-remaining');
        if (remainingSpan) remainingSpan.textContent = '';
    });
    const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
    if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = '';


    // Apply styles and calculate time for the next prayer
    if (nextPrayer && nextPrayerTimeObj) {
        const nextPrayerElement = document.getElementById(nextPrayer.id);
        if (nextPrayerElement) {
            nextPrayerElement.classList.add('next-prayer');

            const diffMs = nextPrayerTimeObj.getTime() - now.getTime();
            if (diffMs > 0) {
                const totalMinutes = Math.floor(diffMs / (1000 * 60));
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

                let remainingText = "تبقى: ";
                if (hours > 0) remainingText += `${hours} س `;
                if (minutes > 0 || hours > 0) remainingText += `${minutes} د `;
                remainingText += `${seconds} ث`;

                const remainingSpan = nextPrayerElement.querySelector('.time-remaining');
                if (remainingSpan) remainingSpan.textContent = remainingText;
                if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = `الصلاة القادمة: ${nextPrayer.name} (${remainingText.replace('تبقى: ','')})`;

             } else {
                 const remainingSpan = nextPrayerElement.querySelector('.time-remaining');
                 if (remainingSpan) remainingSpan.textContent = "حان الآن";
                 if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = `حان الآن وقت ${nextPrayer.name}`;
            }
        } else { console.warn(`[Timer] Element with ID ${nextPrayer.id} not found.`); }
    } else {
        // After Isha
        const fajrElement = document.getElementById('fajrItem');
        if (fajrElement) {
            fajrElement.classList.add('next-prayer');
            const remainingSpan = fajrElement.querySelector('.time-remaining');
            if (remainingSpan) remainingSpan.textContent = 'الصلاة التالية';
            if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = `الصلاة القادمة: الفجر`;
        }
    }
}


// --- Hijri Date Function ---
function loadHijriDate() {
    const hijriDateSpan = document.getElementById('hijriDate');
    if (!hijriDateSpan) { console.error("[HijriDate] Span element 'hijriDate' not found."); return; }
    try {
        const today = new Date();
        const options = { calendar: 'islamic-umalqura', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' };
        const hijriFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic-umalqura', options);
        hijriDateSpan.textContent = hijriFormatter.format(today);
    } catch (error) {
        console.error("[HijriDate] Error formatting Hijri date (Umm al-Qura):", error.message);
         try {
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

// ****** Load Surah List from JSON file ******
async function loadSurahList() {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) { console.error("[Quran] Surah list container 'quranSurahList' not found."); return; }

    // Avoid reloading if list is already populated
    if (surahListContainer.children.length > 1 || (surahListContainer.children.length === 1 && !surahListContainer.firstElementChild?.classList.contains('loading-placeholder'))) {
        // console.log("[Quran] Surah list already loaded.");
        return;
    }

    surahListContainer.innerHTML = '<p class="text-center py-5 text-gray-500 loading-placeholder">جارٍ تحميل قائمة السور...</p>';

    // Fetch only if not already loaded
    if (!surahListData) {
        try {
            // ****** Fetch from the new JSON file ******
            const response = await fetch('data/surahs.json', { cache: 'force-cache' }); // Cache heavily
            if (!response.ok) { throw new Error(`ملف السور JSON (${response.status})`); }
            const data = await response.json();
            if (!data || !data.chapters) { throw new Error("تنسيق ملف السور غير صحيح."); }
            surahListData = data; // Store fetched data
            console.log("[Quran] Surah list loaded from JSON successfully.");
        } catch (error) {
            console.error('[Quran] Error loading or parsing Surah list JSON:', error);
            surahListContainer.innerHTML = `<p class="text-center text-red-600 py-4">فشل تحميل قائمة السور: ${error.message}</p>`;
            return; // Stop if loading fails
        }
    } else {
        // console.log("[Quran] Using stored Surah list data.");
    }

    renderSurahList(surahListData); // Render using stored or newly fetched data
}


function renderSurahList(data) {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) return;
    surahListContainer.innerHTML = ''; // Clear previous content (like loading message)

    if (data && data.chapters && data.chapters.length > 0) {
        data.chapters.forEach(surah => {
            const surahDiv = document.createElement('div');
            surahDiv.className = 'surah-item flex justify-between items-center py-2 px-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer';
            surahDiv.onclick = () => openSurah(surah.id, surah.name_arabic);
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'surah-details flex items-center gap-2.5'; // Tailwind gap
            const numberSpan = document.createElement('span');
            numberSpan.className = 'surah-number w-8 h-8 flex-shrink-0 flex justify-center items-center bg-gray-200 rounded-full text-sm font-semibold text-gray-700';
            numberSpan.textContent = toArabicIndicNumerals(surah.id);
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${surah.name_arabic} (${toArabicIndicNumerals(surah.verses_count)} آيات)`;
            nameSpan.className = 'text-gray-800';
            detailsDiv.appendChild(numberSpan);
            detailsDiv.appendChild(nameSpan);
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-left text-gray-400'; // Use FontAwesome icon
            surahDiv.appendChild(detailsDiv);
            surahDiv.appendChild(icon);
            surahListContainer.appendChild(surahDiv);
        });
    } else {
         surahListContainer.innerHTML = '<p class="text-center text-gray-500 py-4">قائمة السور غير متوفرة حالياً.</p>';
    }
}

async function openSurah(surahId, surahName) {
     // console.log(`[Quran] Opening Surah: ${surahId} - ${surahName}`);
     const viewer = document.getElementById('quranViewer');
     const title = document.getElementById('quranViewerTitle');
     const content = document.getElementById('quranViewerContent');

     if(!viewer || !title || !content) { console.error("[Quran] Viewer elements not found!"); alert(`خطأ: لم يتم العثور على عناصر عرض السورة.`); return; }

     title.textContent = `سورة ${surahName}`;
     content.innerHTML = '<div class="loading-spinner"></div><p class="text-center text-gray-500">جارٍ تحميل نص السورة...</p>';
     viewer.classList.remove('hidden');
     const quranTab = document.getElementById('quran');
     // Scroll the main container, not just the tab itself
     const mainContainer = document.querySelector('.main-container');
     if(mainContainer) mainContainer.scrollTo({ top: mainContainer.scrollHeight, behavior: 'smooth' });


     const apiUrl = `https://api.alquran.cloud/v1/surah/${surahId}`;
     // console.log(`[Quran] Fetching from: ${apiUrl}`);

     try {
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error(`فشل تحميل السورة (Status: ${response.status})`); }
        const data = await response.json();

        if (data.code === 200 && data.data && data.data.ayahs) {
            content.innerHTML = ''; // Clear loading

            if (surahId !== 1 && surahId !== 9) {
                const bismillah = document.createElement('p');
                bismillah.textContent = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
                bismillah.className = 'text-center font-bold text-lg mb-4 font-quran'; // Use specific font class if needed
                content.appendChild(bismillah);
            }

            data.data.ayahs.forEach(ayah => {
                const ayahText = document.createElement('span');
                ayahText.textContent = ayah.text.replace(/ \[\d+\]$/, '');
                ayahText.className = 'inline font-quran text-xl md:text-2xl leading-loose'; // Font and size

                const ayahNumSpan = document.createElement('span');
                ayahNumSpan.className = 'ayah-number';
                ayahNumSpan.textContent = toArabicIndicNumerals(ayah.numberInSurah);

                const paragraph = document.createElement('p'); // Use p for block display
                paragraph.className = 'mb-2'; // Margin between ayahs
                paragraph.appendChild(ayahText);
                paragraph.appendChild(ayahNumSpan);
                content.appendChild(paragraph);
            });
             content.scrollTop = 0; // Scroll viewer content to top
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
         if(content) content.innerHTML = '';
     }
}

// --- Suggestions Form Handler (Formspree Async) ---
async function handleSuggestionSubmit(event) {
    event.preventDefault(); // Prevent default browser submission
    const form = event.target;
    const statusMessage = document.getElementById('suggestionStatus');
    const submitButton = document.getElementById('suggestionSubmitButton');
    const formData = new FormData(form);

    statusMessage.textContent = 'جارٍ الإرسال...';
    statusMessage.className = 'text-blue-600 text-sm mt-3'; // Indicate loading
    submitButton.disabled = true;

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json' // Request JSON response from Formspree
            }
        });

        if (response.ok) {
            // const responseData = await response.json(); // Optional: if you need data from Formspree
            statusMessage.textContent = 'شكراً لك! تم استلام اقتراحك بنجاح.';
            statusMessage.className = 'text-green-600 text-sm mt-3'; // Success
            form.reset(); // Clear the form
        } else {
            // Try to get error details from Formspree response
            const responseData = await response.json();
            if (responseData && responseData.errors && responseData.errors.length > 0) {
                // Display the first error message from Formspree
                 statusMessage.textContent = `خطأ: ${responseData.errors[0].message}`;
            } else {
                 statusMessage.textContent = 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.';
            }
             statusMessage.className = 'text-red-600 text-sm mt-3'; // Error
            console.error("Formspree submission error:", responseData);
        }
    } catch (error) {
        console.error("Network or other error during form submission:", error);
        statusMessage.textContent = 'حدث خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
        statusMessage.className = 'text-red-600 text-sm mt-3'; // Error
    } finally {
         submitButton.disabled = false; // Re-enable button
         // Optional: Clear status message after a delay
         // setTimeout(() => { statusMessage.textContent = ''; }, 7000);
    }
}

// --- Service Worker Registration ---
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }) // Ensure scope is root
            .then(registration => {
                console.log('[Service Worker] Registered successfully with scope:', registration.scope);
                swRegistration = registration; // Store registration for later use (e.g., notifications)

                 // ****** Send initial prayer times data if already loaded ******
                 if (prayerTimesData && swRegistration.active) {
                     swRegistration.active.postMessage({ type: 'SET_PRAYER_TIMES', payload: prayerTimesData });
                 }

                // Optional: Listen for updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New content is available; please refresh.
                                    console.log('[Service Worker] New content is available and will be used when all tabs for this scope are closed.');
                                    // Optional: Show a toast/message to the user prompting them to refresh.
                                } else {
                                    // Content is cached for offline use.
                                    console.log('[Service Worker] Content is cached for offline use.');
                                }
                            }
                        };
                    }
                };

            }).catch(error => {
                console.error('[Service Worker] Registration failed:', error);
            });

         // Listen for messages from the service worker (e.g., confirmation of notification setup)
          navigator.serviceWorker.addEventListener('message', event => {
              console.log('[Client] Received message from SW:', event.data);
               if (event.data && event.data.type === 'NOTIFICATION_STATUS') {
                   const statusElement = document.getElementById('notificationStatus');
                   if (statusElement) {
                       statusElement.textContent = event.data.message;
                   }
               }
          });

    } else {
        console.log('[Service Worker] Not supported by this browser.');
    }
}

// --- Notification Functions ---
let notificationsEnabled = false; // Track state

function initializeNotificationToggle() {
    const toggle = document.getElementById('notificationToggle');
    const statusElement = document.getElementById('notificationStatus');

    if (!toggle || !statusElement) return;

     // Check current permission status
    if ('Notification' in window && Notification.permission === 'granted') {
        // Check if user previously enabled it (using localStorage)
        notificationsEnabled = localStorage.getItem('prayerNotificationsEnabled') === 'true';
        toggle.checked = notificationsEnabled;
         statusElement.textContent = notificationsEnabled ? 'التنبيهات مفعلة.' : 'التنبيهات معطلة.';
         // Send current state to SW
         if (swRegistration && swRegistration.active) {
            swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: notificationsEnabled });
         }
    } else if ('Notification' in window && Notification.permission === 'denied') {
        toggle.checked = false;
        toggle.disabled = true; // Can't change if denied
        statusElement.textContent = 'تم رفض إذن الإشعارات.';
         notificationsEnabled = false;
         localStorage.setItem('prayerNotificationsEnabled', 'false');
          // Send current state to SW
         if (swRegistration && swRegistration.active) {
            swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
         }
    } else {
         toggle.checked = false;
         statusElement.textContent = 'انقر لتفعيل التنبيهات.';
          notificationsEnabled = false;
         localStorage.setItem('prayerNotificationsEnabled', 'false');
          // Send current state to SW
         if (swRegistration && swRegistration.active) {
            swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
         }
    }

    toggle.onchange = handleNotificationToggle;
}

async function handleNotificationToggle() {
    const toggle = document.getElementById('notificationToggle');
    const statusElement = document.getElementById('notificationStatus');

    if (toggle.checked) { // User wants to enable
        if (!('Notification' in window)) {
            statusElement.textContent = 'المتصفح لا يدعم الإشعارات.';
            toggle.checked = false;
            return;
        }

        if (Notification.permission === 'granted') {
            notificationsEnabled = true;
            localStorage.setItem('prayerNotificationsEnabled', 'true');
            statusElement.textContent = 'التنبيهات مفعلة.';
            // Inform Service Worker
             if (swRegistration && swRegistration.active) {
                 swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: true });
                 // Optional: Ask SW to schedule notifications immediately
                 swRegistration.active.postMessage({ type: 'SCHEDULE_NOTIFICATIONS' });
             }
        } else if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    notificationsEnabled = true;
                     localStorage.setItem('prayerNotificationsEnabled', 'true');
                    statusElement.textContent = 'التنبيهات مفعلة.';
                     // Inform Service Worker
                     if (swRegistration && swRegistration.active) {
                         swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: true });
                         swRegistration.active.postMessage({ type: 'SCHEDULE_NOTIFICATIONS' });
                     }
                } else {
                    notificationsEnabled = false;
                    localStorage.setItem('prayerNotificationsEnabled', 'false');
                    statusElement.textContent = 'لم يتم منح إذن الإشعارات.';
                    toggle.checked = false;
                     // Inform Service Worker
                      if (swRegistration && swRegistration.active) {
                         swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
                     }
                }
            } catch (error) {
                 console.error("Error requesting notification permission:", error);
                 statusElement.textContent = 'خطأ أثناء طلب إذن الإشعارات.';
                 toggle.checked = false;
            }
        } else { // Permission was denied
             statusElement.textContent = 'تم رفض إذن الإشعارات سابقًا.';
             toggle.checked = false;
             toggle.disabled = true;
        }
    } else { // User wants to disable
        notificationsEnabled = false;
        localStorage.setItem('prayerNotificationsEnabled', 'false');
        statusElement.textContent = 'التنبيهات معطلة.';
         // Inform Service Worker to disable/clear notifications
         if (swRegistration && swRegistration.active) {
             swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
         }
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] DOM fully loaded and parsed.");
    registerServiceWorker(); // ****** Register the Service Worker ******
    switchTab('home'); // Initial tab

    // Attach Formspree handler to the suggestions form
     const suggestionsForm = document.getElementById('suggestionsForm');
     if (suggestionsForm) {
         suggestionsForm.addEventListener('submit', handleSuggestionSubmit);
     } else {
        console.warn("[Init] Suggestions form element not found.");
     }

     // Initialize other things if needed
});