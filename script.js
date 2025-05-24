// script.js - Updated

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
// --- Global variable to track client-side notification state ---
let notificationsEnabledClient = false; // Use a distinct name

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
    sidenavLinks.forEach(link => link.style.backgroundColor = ''); // Reset background for all sidenav links

    const activeTabElement = document.getElementById(tabId);
    if (activeTabElement) {
        activeTabElement.classList.remove('hidden');
        activeTabElement.classList.add('active');
        // Optionally re-add animation if desired each time
        // activeTabElement.classList.add('animate__animated', 'animate__fadeIn');
    } else {
        console.error("[Nav] Tab content not found for ID:", tabId, ". Falling back to home.");
        // Fallback to home if tabId doesn't exist (e.g., 'contact' was removed)
        document.getElementById('home').classList.remove('hidden');
        document.getElementById('home').classList.add('active');
        // Optionally re-add animation for fallback
        // document.getElementById('home').classList.add('animate__animated', 'animate__fadeIn');
        tabId = 'home'; // Update tabId to home for correct nav highlighting
    }

    // Activate correct navigation indicator
    let itemActivated = false;
    const sidenavTabIds = ['about', 'library', 'volunteer', 'donate', 'azkar', 'suggestions', 'location']; // Update with current sidenav tabs

    bottomNavItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        // Check if the item directly switches to the target tabId
        if (onclickAttr && onclickAttr.includes(`switchTab('${tabId}')`)) {
            item.classList.add('active');
            itemActivated = true;
        }
        // Check if the target tabId is one handled by the sidenav AND the 'More' button was likely clicked
        else if (onclickAttr && onclickAttr.includes(`openNav()`) && sidenavTabIds.includes(tabId)) {
            item.classList.add('active'); // Highlight 'More' button if a sidenav item is active
            itemActivated = true;
        }
    });

    // Highlight the active link within the sidenav itself
    sidenavLinks.forEach(link => {
         const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`switchTab('${tabId}')`)) {
            link.style.backgroundColor = 'var(--light-bg)'; // Highlight active item in sidenav
        }
    });

    // Ensure 'More' button is NOT active if a main bottom nav item (not in sidenav) is selected
    if (['home', 'prayer', 'quran', 'gallery'].includes(tabId)) {
        const moreButton = document.querySelector('.bottom-nav-item[onclick*="openNav"]');
        if (moreButton) moreButton.classList.remove('active');
    }


    // Load dynamic content or manage timers based on the active tab
    if (tabId === 'prayer') {
        // Load prayer times, hijri date, and initialize notification toggle *only* when prayer tab is active
        loadPrayerTimesFromJson('prayer_times.json');
        loadHijriDate();
        initializeNotificationToggle();
    } else {
        // Clear the prayer timer if switching away from the prayer tab
        if (prayerTimerInterval) {
            clearInterval(prayerTimerInterval);
            prayerTimerInterval = null;
            // console.log("[Timer] Prayer timer cleared.");
        }
    }

     if (tabId === 'quran') {
        // Load the surah list if the Quran tab is activated
        loadSurahList(); // Load surah list if needed
    }

    // --- Close Sidenav Automatically --- (As added previously)
    // Close the sidenav automatically if it's open after a tab is selected from it.
    if (document.getElementById("mySidenav") && document.getElementById("mySidenav").style.width !== "0px") {
      closeNav();
    }
    // --- End Close Sidenav ---
}


// --- Image Viewer Functions ---
function openImageViewer(imageSrc) {
    const viewer = document.getElementById('imageViewer');
    const img = document.getElementById('viewedImage');
    if(viewer && img) {
        img.src = imageSrc;
        viewer.classList.remove('hidden');
        viewer.classList.add('flex'); // Use flex for centering
    } else {
        console.error("[ImageViewer] Viewer or Image element not found.");
    }
}
function closeImageViewer() {
     const viewer = document.getElementById('imageViewer');
     if(viewer) {
        viewer.classList.add('hidden');
        viewer.classList.remove('flex');
        // Optional: Clear the image source to free up memory
        // const img = document.getElementById('viewedImage');
        // if (img) img.src = "";
     }
}


// --- Prayer Times Functions (JSON Version) ---

// Displays an error message in the prayer times section
function displayPrayerTimeError(message) {
     const container = document.getElementById('prayerTimesContainer');
     if (container) {
         // Reset times to placeholders
         container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');
         const errorElement = container.querySelector('.prayer-error-message');
          if(errorElement) {
            errorElement.textContent = message;
            console.error("[PrayerTimes][Error Display] ", message);
         } else {
             // Fallback if specific error element isn't there
             container.insertAdjacentHTML('beforeend', `<p class="prayer-error-message text-red-600 text-center pt-2">${message}</p>`);
         }
     } else {
        console.error("[PrayerTimes] Could not find container 'prayerTimesContainer' to display error message:", message);
     }
     // Reset related UI elements
     const hijriDateSpan = document.getElementById('hijriDate');
     if (hijriDateSpan) hijriDateSpan.textContent = "--";
     const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
     if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = '';
     // Optionally disable notification toggle on error?
     // const toggle = document.getElementById('notificationToggle');
     // if (toggle) toggle.disabled = true;
}

// Formats 24-hour time string (HH:MM) to 12-hour AM/PM format (Arabic)
function formatTime12Hour(timeString24) {
    if (typeof timeString24 !== 'string') return '--:--';
    const trimmedTime = timeString24.trim();
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/; // Improved regex
    const match = trimmedTime.match(timeRegex);

    if (match) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        // This check is now less critical due to regex but good practice
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
             return '--:--';
        }
        const period = hour >= 12 ? 'م' : 'ص'; // مساءً / صباحًا
        hour = hour % 12;
        if (hour === 0) { hour = 12; } // Handle midnight (00:xx) and noon (12:xx)
        const formattedHour = String(hour); // No padding needed for hour
        const formattedMinute = String(minute).padStart(2, '0'); // Pad minute with leading zero if needed
        return `${formattedHour}:${formattedMinute} ${period}`;
    }
    // Return placeholder if format is incorrect
    return '--:--';
}

// Loads prayer times from the specified JSON file
async function loadPrayerTimesFromJson(jsonFilePath) {
    const container = document.getElementById('prayerTimesContainer');
    if (!container) { console.error("[PrayerTimes] Container 'prayerTimesContainer' not found."); return; }

    // Clear previous errors and reset times
    const errorElement = container.querySelector('.prayer-error-message');
    if (errorElement) errorElement.textContent = '';
    container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');
    container.querySelectorAll('.time-remaining').forEach(el => el.textContent = ''); // Clear remaining times too
    const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
    if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = '';


    // Only fetch if data isn't already loaded or potentially force refresh
    if (!prayerTimesData) { // Or add logic for periodic refresh if needed
        // console.log("[PrayerTimes][JSON] Fetching new data...");
        try {
            // Fetch with no-cache to ensure freshness, especially important for prayer times
            const response = await fetch(jsonFilePath, { cache: "no-cache" });
            if (!response.ok) {
                // Provide more specific error messages based on status code
                const statusText = response.status === 404 ? 'غير موجود' : `خطأ ${response.status}`;
                throw new Error(`ملف المواقيت (${statusText})`);
            }
            prayerTimesData = await response.json();
            console.log("[PrayerTimes][JSON] JSON data loaded and stored successfully.");

            // ****** Inform service worker about NEW prayer times data ******
            sendMessageToSW({ type: 'SET_PRAYER_TIMES', payload: prayerTimesData });

        } catch (error) {
            console.error('[PrayerTimes][JSON] Error loading or parsing JSON file:', error);
            displayPrayerTimeError(error.message || 'حدث خطأ تحميل بيانات المواقيت.');
            // Make sure timer is stopped if loading fails
            if (prayerTimerInterval) clearInterval(prayerTimerInterval);
            prayerTimerInterval = null;
            return; // Stop execution if loading failed
        }
    } else {
        // Data already loaded, maybe ensure SW has it (e.g., if SW restarted)
        sendMessageToSW({ type: 'SET_PRAYER_TIMES', payload: prayerTimesData });
        // console.log("[PrayerTimes][JSON] Using previously loaded data.");
    }

    // Proceed to display times using the loaded (or previously loaded) data
    const today = new Date();
    const currentDay = String(today.getDate());
    const currentMonth = String(today.getMonth() + 1); // JavaScript months are 0-indexed

    // Check if data for the current month and day exists
    if (prayerTimesData && prayerTimesData[currentMonth] && prayerTimesData[currentMonth][currentDay]) {
        todayTimings = prayerTimesData[currentMonth][currentDay];

        // Update the UI elements with the formatted times
        document.getElementById('fajrTime').textContent = formatTime12Hour(todayTimings.fajr);
        document.getElementById('sunriseTime').textContent = formatTime12Hour(todayTimings.sunrise);
        document.getElementById('dhuhrTime').textContent = formatTime12Hour(todayTimings.dhuhr);
        document.getElementById('asrTime').textContent = formatTime12Hour(todayTimings.asr);
        document.getElementById('maghribTime').textContent = formatTime12Hour(todayTimings.maghrib);
        document.getElementById('ishaTime').textContent = formatTime12Hour(todayTimings.isha);

        // Start or update the timer for the next prayer highlight and countdown
        updateNextPrayerHighlightAndTimer();
        if (prayerTimerInterval) clearInterval(prayerTimerInterval); // Clear existing timer before starting new one
        prayerTimerInterval = setInterval(updateNextPrayerHighlightAndTimer, 1000); // Update every second

    } else {
        console.error(`[PrayerTimes][JSON] Timings not found for Month: ${currentMonth}, Day: ${currentDay}.`);
        todayTimings = null; // Reset today's timings
        if (prayerTimerInterval) clearInterval(prayerTimerInterval); // Stop timer if no data
        prayerTimerInterval = null;
        displayPrayerTimeError('لم يتم العثور على مواقيت صلاة اليوم.');
    }
}

// Updates the UI highlight for the next prayer and shows the countdown timer
function updateNextPrayerHighlightAndTimer() {
    if (!todayTimings) {
        // console.log("[Timer] No timings available for timer update.");
        // Optionally ensure the "next prayer" info is cleared
        const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
         if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = '';
        return; // Exit if no timings data for today
    }

    const now = new Date();
    // Define prayer objects with names, times, and associated element IDs
    const prayerElements = [
        { name: 'الفجر', time: todayTimings.fajr, id: 'fajrItem', key: 'fajr' },
        { name: 'الشروق', time: todayTimings.sunrise, id: 'sunriseItem', isSunrise: true, key: 'sunrise' }, // Mark sunrise
        { name: 'الظهر', time: todayTimings.dhuhr, id: 'dhuhrItem', key: 'dhuhr' },
        { name: 'العصر', time: todayTimings.asr, id: 'asrItem', key: 'asr' },
        { name: 'المغرب', time: todayTimings.maghrib, id: 'maghribItem', key: 'maghrib' },
        { name: 'العشاء', time: todayTimings.isha, id: 'ishaItem', key: 'isha' }
    ];

    let nextPrayer = null;
    let nextPrayerTimeObj = null;
    let currentPrayerTimeObj = null; // To check if we are currently within a prayer time
    let currentPrayerName = null;

    // Find the next upcoming prayer
    for (const prayer of prayerElements) {
         if (prayer.time && typeof prayer.time === 'string') {
            const [hours, minutes] = prayer.time.split(':').map(Number);
             if (!isNaN(hours) && !isNaN(minutes)) { // Basic validation
                const prayerTimeObj = new Date(now); // Create date based on 'now' to handle day changes
                 prayerTimeObj.setHours(hours, minutes, 0, 0);

                 // Check if this prayer time has passed
                 if (prayerTimeObj <= now) {
                      currentPrayerTimeObj = prayerTimeObj;
                      if (!prayer.isSunrise) { // Don't consider sunrise as 'current prayer'
                           currentPrayerName = prayer.name;
                      }
                 }
                 // Check if this prayer time is in the future
                 else if (prayerTimeObj > now && !nextPrayer) {
                     // If it's sunrise, note it but keep looking for the *next actual prayer* (Dhuhr)
                     if (prayer.isSunrise) {
                         // We found sunrise as the chronologically next event, but we want the next *prayer*
                         continue; // Look for Dhuhr
                     } else {
                          // Found the first upcoming prayer (that isn't sunrise)
                         nextPrayer = prayer;
                         nextPrayerTimeObj = prayerTimeObj;
                         // break; // Found the next prayer, no need to check further in this loop
                     }
                 }
             } else { console.warn(`[Timer] Invalid HH:MM format for ${prayer.name}: ${prayer.time}`); }
         } else { console.warn(`[Timer] Missing/invalid time string for ${prayer.name}: ${prayer.time}`); }
    }

    // If the loop finishes and nextPrayer is still null, it means Isha has passed.
    // The next prayer is Fajr tomorrow.
    if (!nextPrayer) {
        const fajrTomorrow = prayerElements.find(p => p.key === 'fajr');
        if (fajrTomorrow && fajrTomorrow.time) {
             const [h, m] = fajrTomorrow.time.split(':').map(Number);
             if (!isNaN(h) && !isNaN(m)) {
                nextPrayerTimeObj = new Date(now);
                nextPrayerTimeObj.setDate(now.getDate() + 1); // Set to tomorrow
                nextPrayerTimeObj.setHours(h, m, 0, 0);
                nextPrayer = fajrTomorrow;
             }
        }
    }

    // Reset styles and text for all prayer items first
    document.querySelectorAll('.prayer-time-item').forEach(item => {
        item.classList.remove('next-prayer', 'current-prayer'); // Remove both classes
        const remainingSpan = item.querySelector('.time-remaining');
        if (remainingSpan) remainingSpan.textContent = '';
    });
    const nextPrayerInfoDiv = document.getElementById('nextPrayerInfo');
    if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = ''; // Clear the summary info

    // Apply 'current-prayer' style if applicable (optional)
    // if (currentPrayerName) {
    //     const currentPrayerElem = prayerElements.find(p => p.name === currentPrayerName);
    //     if (currentPrayerElem && currentPrayerElem.id) {
    //         const elem = document.getElementById(currentPrayerElem.id);
    //         // if (elem) elem.classList.add('current-prayer'); // Add a distinct style if desired
    //     }
    // }

    // Apply styles and calculate time for the identified 'next' prayer
    if (nextPrayer && nextPrayerTimeObj) {
        const nextPrayerElement = document.getElementById(nextPrayer.id);
        if (nextPrayerElement) {
            nextPrayerElement.classList.add('next-prayer'); // Highlight the next prayer item

            const diffMs = nextPrayerTimeObj.getTime() - now.getTime();
            const remainingSpan = nextPrayerElement.querySelector('.time-remaining');
            let infoText = `الصلاة القادمة: ${nextPrayer.name}`;

            if (diffMs > 0) {
                // Calculate remaining hours, minutes, seconds
                const totalSeconds = Math.floor(diffMs / 1000);
                const seconds = totalSeconds % 60;
                const totalMinutes = Math.floor(totalSeconds / 60);
                const minutes = totalMinutes % 60;
                const hours = Math.floor(totalMinutes / 60);

                let remainingText = "تبقى: ";
                if (hours > 0) remainingText += `${hours} س `;
                if (minutes > 0 || hours > 0) remainingText += `${minutes} د `; // Show minutes if hours > 0
                remainingText += `${seconds} ث`;

                if (remainingSpan) remainingSpan.textContent = remainingText;
                infoText += ` (${remainingText.replace('تبقى: ','')})`; // Add countdown to summary

             } else if (diffMs <= 0 && diffMs > -60000) { // If within 1 minute past time
                 if (remainingSpan) remainingSpan.textContent = "حان الآن";
                 infoText = `حان الآن وقت ${nextPrayer.name}`;
            } else {
                 // Time has passed significantly, clear specific countdown
                 if (remainingSpan) remainingSpan.textContent = "";
                 // Info text remains 'Next prayer is...'
            }
            if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = infoText; // Update summary info

        } else { console.warn(`[Timer] Element with ID ${nextPrayer.id} not found for next prayer.`); }
    } else {
        // Should typically not happen due to the Fajr tomorrow logic, but as a fallback:
         if(nextPrayerInfoDiv) nextPrayerInfoDiv.textContent = 'لا توجد مواقيت تالية محددة.';
         console.warn("[Timer] Could not determine the next prayer.");
    }
}


// --- Hijri Date Function ---
function loadHijriDate() {
    const hijriDateSpan = document.getElementById('hijriDate');
    if (!hijriDateSpan) { console.error("[HijriDate] Span element 'hijriDate' not found."); return; }

    try {
        const today = new Date();
        // Use Umm al-Qura calendar, Arabic locale for Kuwait, specify time zone
        const options = { calendar: 'islamic-umalqura', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' };
        // Ensure the locale includes the calendar specification '-u-ca-islamic-umalqura'
        const hijriFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic-umalqura', options);
        hijriDateSpan.textContent = hijriFormatter.format(today);
    } catch (error) {
        console.error("[HijriDate] Error formatting Hijri date (Umm al-Qura):", error);
        // Fallback to default Islamic calendar if Umm al-Qura fails
         try {
             const fallbackOptions = { calendar: 'islamic', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' };
             const fallbackFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic', fallbackOptions);
             hijriDateSpan.textContent = fallbackFormatter.format(new Date());
             console.log("[HijriDate] Using fallback Islamic calendar.");
         } catch (fallbackError) {
             console.error("[HijriDate] Fallback Hijri date formatting also failed:", fallbackError);
             hijriDateSpan.textContent = "غير متوفر"; // Final fallback text
         }
    }
}

// --- Quran Functions ---

// Converts standard digits to Arabic-Indic digits
function toArabicIndicNumerals(num) {
    if (num === null || num === undefined) return '';
    const arabicIndicMap = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/[0-9]/g, (d) => arabicIndicMap[parseInt(d)]);
}

// Loads the list of Surahs from the JSON file
async function loadSurahList() {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) { console.error("[Quran] Surah list container 'quranSurahList' not found."); return; }

    // Avoid reloading if list is already populated (basic check)
    if (surahListContainer.children.length > 1 || (surahListContainer.children.length === 1 && !surahListContainer.firstElementChild?.classList.contains('loading-placeholder'))) {
        // console.log("[Quran] Surah list already loaded.");
        return;
    }

    // Show loading indicator
    surahListContainer.innerHTML = '<p class="text-center py-5 text-gray-500 loading-placeholder">جارٍ تحميل قائمة السور...</p>';

    // Fetch only if surahListData is not already populated
    if (!surahListData) {
        // console.log("[Quran] Fetching Surah list data...");
        try {
            // Fetch from the local JSON file, cache heavily as it rarely changes
            const response = await fetch('data/surahs.json', { cache: 'force-cache' });
            if (!response.ok) { throw new Error(`ملف السور (${response.status})`); }
            const data = await response.json();
            if (!data || !data.chapters) { throw new Error("تنسيق ملف السور غير صحيح."); }
            surahListData = data; // Store fetched data globally
            console.log("[Quran] Surah list loaded from JSON successfully.");
        } catch (error) {
            console.error('[Quran] Error loading or parsing Surah list JSON:', error);
            surahListContainer.innerHTML = `<p class="text-center text-red-600 py-4">فشل تحميل قائمة السور: ${error.message}</p>`;
            return; // Stop if loading fails
        }
    } else {
        // console.log("[Quran] Using stored Surah list data.");
    }

    // Render the list using stored or newly fetched data
    renderSurahList(surahListData);
}


// Renders the Surah list in the UI
function renderSurahList(data) {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) return;
    surahListContainer.innerHTML = ''; // Clear previous content (like loading message)

    if (data && data.chapters && data.chapters.length > 0) {
        data.chapters.forEach(surah => {
            // Create Surah item container
            const surahDiv = document.createElement('div');
            surahDiv.className = 'surah-item flex justify-between items-center py-2 px-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-150';
            surahDiv.onclick = () => openSurah(surah.id, surah.name_arabic); // Set click handler

            // Create container for number and name
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'surah-details flex items-center gap-2.5'; // Tailwind gap

            // Surah number circle
            const numberSpan = document.createElement('span');
            numberSpan.className = 'surah-number w-8 h-8 flex-shrink-0 flex justify-center items-center bg-gray-200 dark:bg-gray-600 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200';
            numberSpan.textContent = toArabicIndicNumerals(surah.id);

            // Surah name and verse count
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${surah.name_arabic} (${toArabicIndicNumerals(surah.verses_count)} آيات)`;
            nameSpan.className = 'text-gray-800 dark:text-gray-100';

            // Append number and name to details container
            detailsDiv.appendChild(numberSpan);
            detailsDiv.appendChild(nameSpan);

            // Chevron icon (indicator for action)
            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-left text-gray-400 dark:text-gray-500'; // Use FontAwesome icon

            // Append details and icon to the main Surah item container
            surahDiv.appendChild(detailsDiv);
            surahDiv.appendChild(icon);

            // Append the Surah item to the list container
            surahListContainer.appendChild(surahDiv);
        });
    } else {
         surahListContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">قائمة السور غير متوفرة حالياً.</p>';
    }
}

// Fetches and displays the content of a specific Surah
async function openSurah(surahId, surahName) {
     // console.log(`[Quran] Opening Surah: ${surahId} - ${surahName}`);
     const viewer = document.getElementById('quranViewer');
     const title = document.getElementById('quranViewerTitle');
     const content = document.getElementById('quranViewerContent');

     if(!viewer || !title || !content) {
         console.error("[Quran] Viewer elements not found!");
         alert(`خطأ: لم يتم العثور على عناصر عرض السورة.`);
         return;
     }

     // Prepare the viewer
     title.textContent = `سورة ${surahName}`;
     content.innerHTML = '<div class="loading-spinner mx-auto my-4"></div><p class="text-center text-gray-500 dark:text-gray-400">جارٍ تحميل نص السورة...</p>'; // Show loading spinner
     viewer.classList.remove('hidden'); // Make viewer visible

     // Scroll the main container down to show the viewer if it was hidden at the bottom
     const mainContainer = document.querySelector('.main-container');
     if(mainContainer) {
         // Scroll slightly past the start of the viewer for better visibility
         const viewerTopOffset = viewer.offsetTop - (document.querySelector('.navbar')?.offsetHeight || 60); // Adjust for navbar height
          mainContainer.scrollTo({ top: viewerTopOffset, behavior: 'smooth' });
     }


     // Define the API URL (using alquran.cloud)
     const apiUrl = `https://api.alquran.cloud/v1/surah/${surahId}`;
     // console.log(`[Quran] Fetching from: ${apiUrl}`);

     try {
        // Fetch Surah data from the API
        const response = await fetch(apiUrl);
        if (!response.ok) { throw new Error(`فشل تحميل السورة (Status: ${response.status})`); }
        const data = await response.json();

        // Check if the response structure is valid
        if (data.code === 200 && data.data && data.data.ayahs) {
            content.innerHTML = ''; // Clear loading indicator

            // Add Bismillah for all Surahs except Al-Fatiha (1) and At-Tawbah (9)
            if (surahId !== 1 && surahId !== 9) {
                const bismillah = document.createElement('p');
                bismillah.textContent = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
                // Apply appropriate styling (using Tailwind or custom CSS)
                bismillah.className = 'text-center font-bold text-lg mb-4 font-quran text-gray-800 dark:text-gray-100';
                content.appendChild(bismillah);
            }

            // Process and display each Ayah
            data.data.ayahs.forEach(ayah => {
                // Ayah Text Span
                const ayahText = document.createElement('span');
                // Remove ayah number in brackets if present in text (some APIs include it)
                ayahText.textContent = ayah.text.replace(/ \[\d+\]$/, '');
                ayahText.className = 'inline font-quran text-xl md:text-2xl leading-loose text-gray-900 dark:text-gray-50'; // Adjust font size and line height

                // Ayah Number Span (styled circle)
                const ayahNumSpan = document.createElement('span');
                ayahNumSpan.className = 'ayah-number'; // Use the class defined in style.css
                ayahNumSpan.textContent = toArabicIndicNumerals(ayah.numberInSurah);

                // Paragraph container for block display and spacing
                const paragraph = document.createElement('p');
                paragraph.className = 'mb-3 text-justify'; // Margin between ayahs, justify text
                paragraph.appendChild(ayahText);
                paragraph.appendChild(ayahNumSpan); // Add number after text
                content.appendChild(paragraph);
            });
             content.scrollTop = 0; // Scroll viewer content area to the top after loading
        } else {
            console.error("[Quran] Invalid data structure from API:", data);
            throw new Error("بيانات السورة المستلمة غير صالحة.");
        }
     } catch (error) {
          console.error("[Quran] Error fetching or displaying Surah:", error);
          content.innerHTML = `<p class="text-center text-red-600 py-5">عذراً، حدث خطأ أثناء تحميل نص السورة: ${error.message}</p>`;
     }
}

// Closes the Quran viewer section
function closeQuranViewer() {
     const viewer = document.getElementById('quranViewer');
     if(viewer) {
         viewer.classList.add('hidden'); // Hide the viewer
         // Optional: Clear content to free memory
         const content = document.getElementById('quranViewerContent');
         if(content) content.innerHTML = '';
          const title = document.getElementById('quranViewerTitle');
          if(title) title.textContent = '';
     }
}

// --- Suggestions Form Handler (Formspree Async) ---
async function handleSuggestionSubmit(event) {
    event.preventDefault(); // Prevent default browser form submission behavior
    const form = event.target;
    const statusMessage = document.getElementById('suggestionStatus');
    const submitButton = form.querySelector('button[type="submit"]'); // More specific selector
    const formData = new FormData(form);

    // Basic validation (optional, Formspree handles some)
    const email = formData.get('email');
    const suggestion = formData.get('suggestion');
    if (!suggestion || (email && !email.includes('@'))) { // Very basic check
         statusMessage.textContent = 'يرجى إدخال بريد إلكتروني صالح ونص الاقتراح.';
         statusMessage.className = 'text-red-600 text-sm mt-3';
        return;
    }


    // Disable button and show loading message
    statusMessage.textContent = 'جارٍ الإرسال...';
    statusMessage.className = 'text-blue-600 text-sm mt-3'; // Indicate loading
    if (submitButton) submitButton.disabled = true;

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json' // Request JSON response from Formspree
            }
        });

        if (response.ok) {
            // const responseData = await response.json(); // Optional: if you need response data
            statusMessage.textContent = 'شكراً لك! تم استلام اقتراحك بنجاح.';
            statusMessage.className = 'text-green-600 text-sm mt-3'; // Success style
            form.reset(); // Clear the form fields
        } else {
            // Try to get detailed error message from Formspree response
            let errorMsg = 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.'; // Default error
             try {
                const responseData = await response.json();
                if (responseData && responseData.errors && responseData.errors.length > 0) {
                    // Display the first specific error message from Formspree
                     errorMsg = `خطأ: ${responseData.errors.map(err => err.message).join(', ')}`;
                }
                 console.error("Formspree submission error response:", responseData);
             } catch (jsonError) {
                 console.error("Could not parse Formspree error response:", jsonError);
                 // Use the default error message if JSON parsing fails
             }
             statusMessage.textContent = errorMsg;
             statusMessage.className = 'text-red-600 text-sm mt-3'; // Error style
        }
    } catch (error) {
        // Handle network errors or other exceptions during fetch
        console.error("Network or other error during form submission:", error);
        statusMessage.textContent = 'حدث خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
        statusMessage.className = 'text-red-600 text-sm mt-3'; // Error style
    } finally {
         // Re-enable the submit button regardless of success or failure
         if (submitButton) submitButton.disabled = false;
         // Optional: Clear status message after a few seconds
         // setTimeout(() => { if(statusMessage) statusMessage.textContent = ''; }, 7000);
    }
}

// --- Service Worker Registration & Related Functions --- (Updated)

// Registers the service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }) // Ensure scope is root '/'
            .then(registration => {
                console.log('[Service Worker] Registered successfully with scope:', registration.scope);
                swRegistration = registration; // Store registration globally

                // --- Send initial state to SW upon registration/activation ---
                const initialEnabledState = localStorage.getItem('prayerNotificationsEnabled') === 'true';

                // Function to send initial messages once SW is active
                const sendInitialMessages = () => {
                    if (swRegistration.active) {
                        // 1. Send Notification Enabled status FIRST
                        swRegistration.active.postMessage({ type: 'SET_NOTIFICATIONS_ENABLED', payload: initialEnabledState });
                         console.log('[Client] Sent initial notification state to SW:', initialEnabledState);
                        // 2. Send Prayer Times if already loaded
                        if (prayerTimesData) {
                            swRegistration.active.postMessage({ type: 'SET_PRAYER_TIMES', payload: prayerTimesData });
                             console.log('[Client] Sent initial prayer times to SW.');
                        }
                    } else {
                        console.warn("[Client] SW registration active is null, cannot send initial messages yet.");
                    }
                };

                // If SW is already active, send immediately
                if (swRegistration.active) {
                     sendInitialMessages();
                } else {
                    // If SW not active yet, wait for it to activate
                     // Use controllerchange event as a reliable way to know when an active worker takes control
                     navigator.serviceWorker.addEventListener('controllerchange', () => {
                         console.log('[Client] Controller changed, likely new SW activated.');
                         // Ensure we're interacting with the *new* active worker
                         if (navigator.serviceWorker.controller) {
                             swRegistration = navigator.serviceWorker.controller; // Update registration reference potentially
                             sendInitialMessages();
                         }
                    });
                    // Fallback/alternative: listen on the registration object too
                     swRegistration.addEventListener('updatefound', () => {
                        const newWorker = swRegistration.installing;
                         if (newWorker) {
                             newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                                      console.log('[Client] New SW activated via updatefound.');
                                      swRegistration = navigator.serviceWorker.controller;
                                      sendInitialMessages();
                                }
                             });
                         }
                     });
                }

                // Optional: Listen for updates to the service worker file itself
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New SW available, prompt user to refresh?
                                    console.log('[Service Worker] New content available, please refresh.');
                                    // Example: showToast("New version available! Please refresh.");
                                } else {
                                    // Content cached for offline use by the new worker
                                    console.log('[Service Worker] Content cached for offline use.');
                                }
                            }
                        };
                    }
                };

            }).catch(error => {
                console.error('[Service Worker] Registration failed:', error);
                // Display error to user in notification status area?
                 const statusElement = document.getElementById('notificationStatus');
                 if (statusElement) statusElement.textContent = 'خطأ: فشل تفعيل خدمة التنبيهات.';
            });

         // Listen for messages FROM the service worker (e.g., confirmations, status updates)
          navigator.serviceWorker.addEventListener('message', event => {
              console.log('[Client] Received message from SW:', event.data);
               // Example: Handle specific message types from SW if needed later
               // if (event.data && event.data.type === 'SW_STATUS_UPDATE') { ... }
          });

    } else {
        console.warn('[Service Worker] Not supported by this browser.');
        // Disable notification toggle if SW is not supported
        const toggle = document.getElementById('notificationToggle');
        const statusElement = document.getElementById('notificationStatus');
        if(toggle) toggle.disabled = true;
        if(statusElement) statusElement.textContent = 'المتصفح لا يدعم التنبيهات.';
    }
}

// --- Notification Functions --- (Updated)

// Initializes the state of the notification toggle switch based on permissions and stored preferences
function initializeNotificationToggle() {
    const toggle = document.getElementById('notificationToggle');
    const statusElement = document.getElementById('notificationStatus');

    if (!toggle || !statusElement) {
         console.error("[Notifications] Toggle or Status element not found.");
         return;
    }

    // Reset state before checking
    toggle.disabled = false;
    toggle.checked = false;
    statusElement.textContent = '';


    // Check if Notifications API and SW are supported
    if (!('Notification' in window) || !navigator.serviceWorker) {
        toggle.disabled = true;
        statusElement.textContent = 'المتصفح لا يدعم التنبيهات.';
        return;
    }

     // Check current browser permission status
    const currentPermission = Notification.permission;
    // Get user preference from localStorage
    notificationsEnabledClient = localStorage.getItem('prayerNotificationsEnabled') === 'true';

    if (currentPermission === 'granted') {
        toggle.checked = notificationsEnabledClient; // Set toggle based on stored preference
        statusElement.textContent = notificationsEnabledClient ? 'التنبيهات مفعلة.' : 'التنبيهات معطلة.';
        // Note: SW state should be synced during registration/activation
    } else if (currentPermission === 'denied') {
        toggle.checked = false;
        toggle.disabled = true; // User cannot change if denied in browser settings
        statusElement.textContent = 'تم رفض إذن الإشعارات من المتصفح.';
        notificationsEnabledClient = false;
        localStorage.setItem('prayerNotificationsEnabled', 'false'); // Ensure storage reflects denied state
         // Ensure SW knows the state (important if it wasn't denied previously)
         sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
    } else { // 'default' permission - user hasn't decided or dismissed prompt
         toggle.checked = false; // Keep toggle off until permission is granted
         statusElement.textContent = 'انقر لتفعيل التنبيهات.';
         notificationsEnabledClient = false;
         localStorage.setItem('prayerNotificationsEnabled', 'false'); // Store as disabled until granted
          // Ensure SW knows the state
          sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
    }

    // Ensure the event listener is attached
    toggle.onchange = handleNotificationToggle;
}

// Handles the change event of the notification toggle switch
async function handleNotificationToggle() {
    const toggle = document.getElementById('notificationToggle');
    const statusElement = document.getElementById('notificationStatus');

    // Ensure SW is active before trying to interact
    if (!swRegistration || !navigator.serviceWorker.controller) { //!swRegistration.active) {
         statusElement.textContent = 'خطأ: خدمة التنبيهات غير جاهزة بعد.';
         toggle.checked = !toggle.checked; // Revert toggle state
         console.error("[Notifications] Cannot handle toggle change, SW not active.");
         // Try re-registering or notifying user?
         return;
    }

    if (toggle.checked) { // User wants to ENABLE notifications
        const currentPermission = Notification.permission;

        if (currentPermission === 'granted') {
            // Permission already granted, just enable in storage and tell SW
            notificationsEnabledClient = true;
            localStorage.setItem('prayerNotificationsEnabled', 'true');
            statusElement.textContent = 'التنبيهات مفعلة.';
            sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: true });
            // Optionally ask SW to schedule immediately if needed (e.g., if data just arrived)
            // sendMessageToSW({ type: 'SCHEDULE_NOTIFICATIONS' });
        } else if (currentPermission === 'default') {
            // Permission not yet granted or denied, request it
            statusElement.textContent = 'يرجى منح إذن الإشعارات...';
            try {
                // Request permission from the user
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    // Permission granted! Enable in storage and tell SW
                    notificationsEnabledClient = true;
                    localStorage.setItem('prayerNotificationsEnabled', 'true');
                    statusElement.textContent = 'التنبيهات مفعلة.';
                    sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: true });
                    // Ask SW to schedule now that permission is granted
                    sendMessageToSW({ type: 'SCHEDULE_NOTIFICATIONS' });
                } else { // Permission denied by user prompt
                    notificationsEnabledClient = false;
                    localStorage.setItem('prayerNotificationsEnabled', 'false');
                    statusElement.textContent = 'لم يتم منح إذن الإشعارات.';
                    toggle.checked = false; // Revert toggle to off state
                    sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false }); // Inform SW it's disabled
                }
            } catch (error) {
                 // Handle errors during permission request (rare)
                 console.error("Error requesting notification permission:", error);
                 statusElement.textContent = 'خطأ أثناء طلب إذن الإشعارات.';
                 toggle.checked = false; // Revert toggle
                 // Ensure storage and SW are updated about the failed state?
                 localStorage.setItem('prayerNotificationsEnabled', 'false');
                 sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
            }
        } else { // Permission was 'denied' previously in browser settings
             statusElement.textContent = 'تم رفض إذن الإشعارات سابقًا بالمتصفح.';
             toggle.checked = false; // Cannot enable, revert toggle
             toggle.disabled = true; // Disable the toggle as user action is needed in browser settings
        }
    } else { // User wants to DISABLE notifications
        notificationsEnabledClient = false;
        localStorage.setItem('prayerNotificationsEnabled', 'false');
        statusElement.textContent = 'التنبيهات معطلة.';
        // Inform Service Worker to disable/cancel any scheduled notifications
        sendMessageToSW({ type: 'SET_NOTIFICATIONS_ENABLED', payload: false });
    }
}

// Helper function to safely send messages to the active Service Worker
function sendMessageToSW(message) {
    // Check if SW registration exists and if there's an active controlling worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
        // console.log("[Client] Message sent to SW:", message);
    } else {
         console.warn("[Client] Cannot send message. Service Worker not active or not controlling.", message);
         // Provide feedback if critical (like enabling notifications)
         const statusElement = document.getElementById('notificationStatus');
         if (statusElement && message.type === 'SET_NOTIFICATIONS_ENABLED' && message.payload === true) {
             statusElement.textContent = "خطأ: خدمة التنبيهات غير جاهزة.";
         }
         // Optionally queue message or try registration again?
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("[Init] DOM fully loaded and parsed.");

    registerServiceWorker(); // Register the Service Worker FIRST - It needs to be ready

    switchTab('home'); // Set the initial visible tab

    // Attach Formspree handler to the suggestions form
     const suggestionsForm = document.getElementById('suggestionsForm');
     if (suggestionsForm) {
         // Ensure you replace {your_formspree_id} in index.html with your actual ID
         const formAction = suggestionsForm.getAttribute('action');
         if(formAction && !formAction.includes('{your_formspree_id}')) {
             suggestionsForm.addEventListener('submit', handleSuggestionSubmit);
         } else {
              console.warn("[Formspree] Form action URL is missing your Formspree ID or placeholder is still present.");
              const submitBtn = document.getElementById('suggestionSubmitButton');
              if(submitBtn) submitBtn.disabled = true;
              const statusMsg = document.getElementById('suggestionStatus');
               if(statusMsg) statusMsg.textContent = "نموذج الاقتراحات غير مفعّل حالياً.";
         }
     } else {
        console.warn("[Init] Suggestions form element not found.");
     }

     // Note: Notification toggle initialization happens inside switchTab when the 'prayer' tab is loaded.
     // Other initializations if needed...
});