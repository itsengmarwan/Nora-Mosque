// --- Navigation Functions ---
function openNav() {
    document.getElementById("mySidenav").style.width = "250px"; // Use a fixed width or percentage
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function switchTab(tabId) {
    console.log("Switching to tab:", tabId); // Debugging
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active', 'animate__animated', 'animate__fadeIn'); // Remove active and animation classes
        content.classList.add('hidden'); // Hide inactive tabs using utility class
    });

    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const sidenavLinks = document.querySelectorAll('#mySidenav a');

    // Deactivate all navigation items first
    bottomNavItems.forEach(item => item.classList.remove('active'));
    sidenavLinks.forEach(link => link.style.backgroundColor = ''); // Reset background for sidenav

    // Activate the target tab content
    const activeTabElement = document.getElementById(tabId);
    if (activeTabElement) {
        activeTabElement.classList.remove('hidden'); // Show the active tab
        activeTabElement.classList.add('active');
        // Optionally re-add animation class if you want fade-in on each switch
        // activeTabElement.classList.add('animate__animated', 'animate__fadeIn');
    } else {
        console.error("Tab content not found for ID:", tabId);
        // Fallback to home if tab content not found
        document.getElementById('home').classList.remove('hidden');
        document.getElementById('home').classList.add('active');
        tabId = 'home'; // Ensure tabId reflects the fallback
    }

    // Activate the corresponding navigation item (bottom or side)
    let itemActivated = false;
    bottomNavItems.forEach(item => {
        const onclickAttr = item.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
            item.classList.add('active');
            itemActivated = true;
        }
    });

    // If the tab is not in the bottom nav, activate "More" and the specific item in sidenav
    if (!itemActivated) {
        const moreButton = document.querySelector('.bottom-nav-item[onclick*="openNav"]');
        if (moreButton) moreButton.classList.add('active');

        // Highlight the active link in the sidenav
        sidenavLinks.forEach(link => {
             const onclickAttr = link.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes(`'${tabId}'`)) {
                 link.style.backgroundColor = 'var(--light-bg)'; // Use a subtle highlight
            }
        });
    }

    // Special handling for the "More" button itself if clicked
    if (tabId === 'openNavTrigger') { // We don't have a tab with this ID, this logic triggers when 'More' is clicked
        const moreButton = document.querySelector('.bottom-nav-item[onclick*="openNav"]');
        if (moreButton) moreButton.classList.add('active'); // Keep 'More' active when opening nav
    }

    // Load dynamic content if needed
    if (tabId === 'prayer') {
        loadPrayerTimesFromCSV('Prayer Times.xlsx - Sheet1.csv'); // Ensure this filename matches exactly
        loadHijriDate();
    } else if (tabId === 'quran') {
        loadSurahList();
    }

    // Close sidenav after selection (if open)
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
        viewer.classList.add('flex'); // Ensure it's displayed as flex
    }
}

function closeImageViewer() {
     const viewer = document.getElementById('imageViewer');
     if(viewer) {
        viewer.classList.add('hidden');
        viewer.classList.remove('flex');
     }
}


// --- Prayer Times Functions ---
async function loadPrayerTimesFromCSV(csvFilePath) {
    const container = document.getElementById('prayerTimesContainer');
    const errorElement = container ? container.querySelector('.prayer-error-message') : null;

    // Clear previous error message
    if (errorElement) errorElement.textContent = '';

    try {
        console.log(`Workspaceing prayer times from: ${csvFilePath}`);
        const response = await fetch(csvFilePath, { cache: "no-cache" }); // Disable cache for daily updates
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. Failed to fetch ${csvFilePath}`);
        }
        const csvText = await response.text();
        console.log("CSV data fetched successfully.");
        const prayerTimes = parsePrayerTimesCSV(csvText);

        if (prayerTimes) {
            console.log("Prayer times parsed:", prayerTimes);
            document.getElementById('fajrTime').textContent = formatTime(prayerTimes.fajr);
            document.getElementById('sunriseTime').textContent = formatTime(prayerTimes.sunrise);
            document.getElementById('dhuhrTime').textContent = formatTime(prayerTimes.dhuhr);
            document.getElementById('asrTime').textContent = formatTime(prayerTimes.asr);
            document.getElementById('maghribTime').textContent = formatTime(prayerTimes.maghrib);
            document.getElementById('ishaTime').textContent = formatTime(prayerTimes.isha);
            console.log("Prayer times updated in HTML.");
        } else {
            console.error('Could not find prayer times for today in the CSV.');
            displayPrayerTimeError('لم يتم العثور على مواقيت صلاة اليوم في الملف.');
        }
    } catch (error) {
        console.error('Error fetching or parsing prayer times CSV:', error);
        displayPrayerTimeError(`حدث خطأ: ${error.message}`);
    }
}

function parsePrayerTimesCSV(csvText) {
    const today = new Date();
    // --- *** Force Date for Testing (REMOVE FOR PRODUCTION) *** ---
    // const today = new Date(2025, 3, 12); // April 12, 2025 (Month is 0-indexed)
    // --- *** --- --- *** ---

    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed

    const lines = csvText.split('\n');
    let currentCSVMonth = -1;
    const monthMap = {
        "يناير": 1, "فبراير": 2, "مارس": 3, "ابريل": 4, "مايو": 5, "يونيو": 6,
        "يوليو": 7, "أغسطس": 8, "سبتمبر": 9, "اكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12
    };

    console.log(`Searching for Day: ${currentDay}, Month: ${currentMonth}`);

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Check for month headers like " شهر يناير,,,,,"
        const monthMatch = trimmedLine.match(/^ *شهر +(\S+)/);
        if (monthMatch && monthMap[monthMatch[1]]) {
            currentCSVMonth = monthMap[monthMatch[1]];
            // console.log(`Found Month Header: ${monthMatch[1]}, Month Number: ${currentCSVMonth}`);
            continue;
        }

        // Skip irrelevant lines
        if (!trimmedLine || trimmedLine.startsWith('التاريخ') || trimmedLine.startsWith('[source:') || !/^\d/.test(trimmedLine)) {
            continue;
        }

        // Process data lines only if we are in the correct month
        if (currentCSVMonth === currentMonth) {
             const columns = trimmedLine.split(',')
                                      .map(col => col.trim())
                                      .filter(col => col !== ''); // Filter out empty strings from ,,

            // Ensure the first column is a number (the day) and we have enough columns
            if (columns.length >= 7 && !isNaN(parseInt(columns[0], 10))) {
                const day = parseInt(columns[0], 10);

                if (day === currentDay) {
                    console.log(`Found match for Day ${currentDay} in Month ${currentMonth}. Raw data: ${columns.join(', ')}`);
                    return { // Indices based on observed format Day, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
                        fajr:    columns[1],
                        sunrise: columns[2],
                        dhuhr:   columns[3],
                        asr:     columns[4],
                        maghrib: columns[5],
                        isha:    columns[6],
                    };
                }
            }
        }
    }
    console.log(`Finished parsing CSV. Prayer times for Day ${currentDay}, Month ${currentMonth} not found.`);
    return null; // Return null if today's times were not found
}

function displayPrayerTimeError(message) {
     const container = document.getElementById('prayerTimesContainer');
     const errorElement = container ? container.querySelector('.prayer-error-message') : null;
     if (container) {
         // Clear existing times display placeholders
         container.querySelectorAll('.prayer-time').forEach(el => el.textContent = '--:--');
          // Display error message
         if(errorElement) {
            errorElement.textContent = message;
            console.error("Prayer Time Error Displayed:", message);
         }
     } else {
        console.error("Could not find prayer times container to display error.");
     }
}

function formatTime(timeString) {
    const placeholder = '--:--';
    if (!timeString || typeof timeString !== 'string') {
        return placeholder;
    }

    const trimmedTime = timeString.trim();
    let parts = [];

    // Try splitting by common separators: ':', ' ', '.'
    if (trimmedTime.includes(':')) {
        parts = trimmedTime.split(':');
    } else if (trimmedTime.includes('.')) {
        parts = trimmedTime.split('.');
    } else if (trimmedTime.includes(' ')) {
        // Replace multiple spaces with one, then split
        parts = trimmedTime.replace(/\s+/g, ' ').split(' ');
    } else if (trimmedTime.length >= 3 && trimmedTime.length <= 4 && !isNaN(parseInt(trimmedTime))) {
         // Handle "518" -> "5:18" or "1151" -> "11:51"
         const len = trimmedTime.length;
         const hourPart = trimmedTime.substring(0, len - 2);
         const minPart = trimmedTime.substring(len - 2);
         if (!isNaN(parseInt(hourPart)) && !isNaN(parseInt(minPart))) {
            parts = [hourPart, minPart];
         }
    }

    if (parts.length >= 2) {
        const hourStr = parts[0].trim();
        const minuteStr = parts[1].trim();
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            const formattedHour = String(hour).padStart(2, '0');
            const formattedMinute = String(minute).padStart(2, '0');
            return `${formattedHour}:${formattedMinute}`;
        }
    }

    // If parsing failed, return placeholder
    console.warn(`Unexpected time format encountered, returning placeholder: "${timeString}"`);
    return placeholder;
}

// --- Hijri Date Function ---
function loadHijriDate() {
    const hijriDateSpan = document.getElementById('hijriDate');
    if (hijriDateSpan) {
        try {
            const today = new Date();
            const options = {
                calendar: 'islamic-umalqura', // Umm al-Qura
                day: 'numeric', month: 'long', year: 'numeric',
                timeZone: 'Asia/Kuwait' // Kuwait Timezone
            };
            const hijriFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic-umalqura', options);
            hijriDateSpan.textContent = hijriFormatter.format(today);
        } catch (error) {
            console.error("Error formatting Hijri date (Umm al-Qura):", error);
             try { // Fallback to standard Islamic calendar
                 const fallbackOptions = { calendar: 'islamic', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuwait' };
                 const fallbackFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic', fallbackOptions);
                 hijriDateSpan.textContent = fallbackFormatter.format(new Date());
             } catch (fallbackError) {
                 console.error("Fallback Hijri date formatting also failed:", fallbackError);
                 hijriDateSpan.textContent = "غير متوفر";
             }
        }
    }
}

// --- Quran Functions ---
function loadSurahList() {
    const surahListContainer = document.getElementById('quranSurahList');
    // Load only if the container is empty or just has the loading message
    if (!surahListContainer || (surahListContainer.children.length > 1) || (surahListContainer.children.length === 1 && !surahListContainer.firstElementChild.textContent.includes('جارٍ تحميل'))) {
        // console.log("Surah list already loaded or container not found.");
        return;
    }
     console.log("Loading Surah list...");

    // Using the provided Surah data structure
    const quranData = {
         "chapters": [
                {"id": 1, "name_arabic": "الفاتحة", "verses_count": 7}, {"id": 2, "name_arabic": "البقرة", "verses_count": 286},
                {"id": 3, "name_arabic": "آل عمران", "verses_count": 200},{"id": 4, "name_arabic": "النساء", "verses_count": 176},
                {"id": 5, "name_arabic": "المائدة", "verses_count": 120},{"id": 6, "name_arabic": "الأنعام", "verses_count": 165},
                {"id": 7, "name_arabic": "الأعراف", "verses_count": 206},{"id": 8, "name_arabic": "الأنفال", "verses_count": 75},
                {"id": 9, "name_arabic": "التوبة", "verses_count": 129},{"id": 10, "name_arabic": "يونس", "verses_count": 109},
                {"id": 11, "name_arabic": "هود", "verses_count": 123},{"id": 12, "name_arabic": "يوسف", "verses_count": 111},
                {"id": 13, "name_arabic": "الرعد", "verses_count": 43},{"id": 14, "name_arabic": "ابراهيم", "verses_count": 52},
                {"id": 15, "name_arabic": "الحجر", "verses_count": 99},{"id": 16, "name_arabic": "النحل", "verses_count": 128},
                {"id": 17, "name_arabic": "الإسراء", "verses_count": 111},{"id": 18, "name_arabic": "الكهف", "verses_count": 110},
                {"id": 19, "name_arabic": "مريم", "verses_count": 98},{"id": 20, "name_arabic": "طه", "verses_count": 135},
                {"id": 21, "name_arabic": "الأنبياء", "verses_count": 112},{"id": 22, "name_arabic": "الحج", "verses_count": 78},
                {"id": 23, "name_arabic": "المؤمنون", "verses_count": 118},{"id": 24, "name_arabic": "النور", "verses_count": 64},
                {"id": 25, "name_arabic": "الفرقان", "verses_count": 77},{"id": 26, "name_arabic": "الشعراء", "verses_count": 227},
                {"id": 27, "name_arabic": "النمل", "verses_count": 93},{"id": 28, "name_arabic": "القصص", "verses_count": 88},
                {"id": 29, "name_arabic": "العنكبوت", "verses_count": 69},{"id": 30, "name_arabic": "الروم", "verses_count": 60},
                {"id": 31, "name_arabic": "لقمان", "verses_count": 34},{"id": 32, "name_arabic": "السجدة", "verses_count": 30},
                {"id": 33, "name_arabic": "الأحزاب", "verses_count": 73},{"id": 34, "name_arabic": "سبإ", "verses_count": 54},
                {"id": 35, "name_arabic": "فاطر", "verses_count": 45},{"id": 36, "name_arabic": "يس", "verses_count": 83},
                {"id": 37, "name_arabic": "الصافات", "verses_count": 182},{"id": 38, "name_arabic": "ص", "verses_count": 88},
                {"id": 39, "name_arabic": "الزمر", "verses_count": 75},{"id": 40, "name_arabic": "غافر", "verses_count": 85},
                {"id": 41, "name_arabic": "فصلت", "verses_count": 54},{"id": 42, "name_arabic": "الشورى", "verses_count": 53},
                {"id": 43, "name_arabic": "الزخرف", "verses_count": 89},{"id": 44, "name_arabic": "الدخان", "verses_count": 59},
                {"id": 45, "name_arabic": "الجاثية", "verses_count": 37},{"id": 46, "name_arabic": "الأحقاف", "verses_count": 35},
                {"id": 47, "name_arabic": "محمد", "verses_count": 38},{"id": 48, "name_arabic": "الفتح", "verses_count": 29},
                {"id": 49, "name_arabic": "الحجرات", "verses_count": 18},{"id": 50, "name_arabic": "ق", "verses_count": 45},
                {"id": 51, "name_arabic": "الذاريات", "verses_count": 60},{"id": 52, "name_arabic": "الطور", "verses_count": 49},
                {"id": 53, "name_arabic": "النجم", "verses_count": 62},{"id": 54, "name_arabic": "القمر", "verses_count": 55},
                {"id": 55, "name_arabic": "الرحمن", "verses_count": 78},{"id": 56, "name_arabic": "الواقعة", "verses_count": 96},
                {"id": 57, "name_arabic": "الحديد", "verses_count": 29},{"id": 58, "name_arabic": "المجادلة", "verses_count": 22},
                {"id": 59, "name_arabic": "الحشر", "verses_count": 24},{"id": 60, "name_arabic": "الممتحنة", "verses_count": 13},
                {"id": 61, "name_arabic": "الصف", "verses_count": 14},{"id": 62, "name_arabic": "الجمعة", "verses_count": 11},
                {"id": 63, "name_arabic": "المنافقون", "verses_count": 11},{"id": 64, "name_arabic": "التغابن", "verses_count": 18},
                {"id": 65, "name_arabic": "الطلاق", "verses_count": 12},{"id": 66, "name_arabic": "التحريم", "verses_count": 12},
                {"id": 67, "name_arabic": "الملك", "verses_count": 30},{"id": 68, "name_arabic": "القلم", "verses_count": 52},
                {"id": 69, "name_arabic": "الحاقة", "verses_count": 52},{"id": 70, "name_arabic": "المعارج", "verses_count": 44},
                {"id": 71, "name_arabic": "نوح", "verses_count": 28},{"id": 72, "name_arabic": "الجن", "verses_count": 28},
                {"id": 73, "name_arabic": "المزمل", "verses_count": 20},{"id": 74, "name_arabic": "المدثر", "verses_count": 56},
                {"id": 75, "name_arabic": "القيامة", "verses_count": 40},{"id": 76, "name_arabic": "الانسان", "verses_count": 31},
                {"id": 77, "name_arabic": "المرسلات", "verses_count": 50},{"id": 78, "name_arabic": "النبإ", "verses_count": 40},
                {"id": 79, "name_arabic": "النازعات", "verses_count": 46},{"id": 80, "name_arabic": "عبس", "verses_count": 42},
                {"id": 81, "name_arabic": "التكوير", "verses_count": 29},{"id": 82, "name_arabic": "الإنفطار", "verses_count": 19},
                {"id": 83, "name_arabic": "المطففين", "verses_count": 36},{"id": 84, "name_arabic": "الإنشقاق", "verses_count": 25},
                {"id": 85, "name_arabic": "البروج", "verses_count": 22},{"id": 86, "name_arabic": "الطارق", "verses_count": 17},
                {"id": 87, "name_arabic": "الأعلى", "verses_count": 19},{"id": 88, "name_arabic": "الغاشية", "verses_count": 26},
                {"id": 89, "name_arabic": "الفجر", "verses_count": 30},{"id": 90, "name_arabic": "البلد", "verses_count": 20},
                {"id": 91, "name_arabic": "الشمس", "verses_count": 15},{"id": 92, "name_arabic": "الليل", "verses_count": 21},
                {"id": 93, "name_arabic": "الضحى", "verses_count": 11},{"id": 94, "name_arabic": "الشرح", "verses_count": 8},
                {"id": 95, "name_arabic": "التين", "verses_count": 8},{"id": 96, "name_arabic": "العلق", "verses_count": 19},
                {"id": 97, "name_arabic": "القدر", "verses_count": 5},{"id": 98, "name_arabic": "البينة", "verses_count": 8},
                {"id": 99, "name_arabic": "الزلزلة", "verses_count": 8},{"id": 100, "name_arabic": "العاديات", "verses_count": 11},
                {"id": 101, "name_arabic": "القارعة", "verses_count": 11},{"id": 102, "name_arabic": "التكاثر", "verses_count": 8},
                {"id": 103, "name_arabic": "العصر", "verses_count": 3},{"id": 104, "name_arabic": "الهمزة", "verses_count": 9},
                {"id": 105, "name_arabic": "الفيل", "verses_count": 5},{"id": 106, "name_arabic": "قريش", "verses_count": 4},
                {"id": 107, "name_arabic": "الماعون", "verses_count": 7},{"id": 108, "name_arabic": "الكوثر", "verses_count": 3},
                {"id": 109, "name_arabic": "الكافرون", "verses_count": 6},{"id": 110, "name_arabic": "النصر", "verses_count": 3},
                {"id": 111, "name_arabic": "المسد", "verses_count": 5},{"id": 112, "name_arabic": "الإخلاص", "verses_count": 4},
                {"id": 113, "name_arabic": "الفلق", "verses_count": 5},{"id": 114, "name_arabic": "الناس", "verses_count": 6}
            ]
        };
    renderSurahList(quranData);
}

function renderSurahList(data) {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer) {
        console.error("Surah list container not found!");
        return;
    }
    surahListContainer.innerHTML = ''; // Clear previous content (like loading message)
    if (data && data.chapters) {
        data.chapters.forEach(surah => {
            const surahDiv = document.createElement('div');
            surahDiv.className = 'surah-item flex justify-between items-center py-2 px-3 border-b border-gray-200 hover:bg-gray-100 cursor-pointer';
            surahDiv.onclick = () => openSurah(surah.id, surah.name_arabic); // Pass name for viewer title

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'surah-details flex items-center';

            const numberSpan = document.createElement('span');
            numberSpan.className = 'surah-number w-8 h-8 flex justify-center items-center bg-gray-200 rounded-full text-sm font-semibold text-gray-700 ml-3';
            numberSpan.textContent = surah.id;

            const nameSpan = document.createElement('span'); // Changed from link to span
            nameSpan.textContent = `${surah.name_arabic} (${surah.verses_count} آيات)`;
            nameSpan.className = 'text-gray-800';

            detailsDiv.appendChild(numberSpan);
            detailsDiv.appendChild(nameSpan);

            const icon = document.createElement('i');
            icon.className = 'fas fa-chevron-left text-gray-400';

            surahDiv.appendChild(detailsDiv);
            surahDiv.appendChild(icon);
            surahListContainer.appendChild(surahDiv);
        });
        console.log(`Rendered ${data.chapters.length} surahs.`);
    } else {
         surahListContainer.innerHTML = '<p class="text-center text-gray-500 py-4">لا توجد بيانات لعرضها.</p>';
    }
}

// Placeholder for actually displaying Surah content
function openSurah(surahId, surahName) {
     console.log(`Opening Surah: ${surahId} - ${surahName}`);
     const viewer = document.getElementById('quranViewer');
     const title = document.getElementById('quranViewerTitle');
     const content = document.getElementById('quranViewerContent'); // Placeholder content area

     if(viewer && title && content) {
         title.textContent = `سورة ${surahName}`;
         // TODO: Add logic here to fetch and display the actual Surah text
         // For now, just show a message
         content.innerHTML = `<p class="text-center py-5 text-gray-600">عرض محتوى سورة ${surahName} (رقم ${surahId}) غير متاح حالياً...</p>`;
         viewer.classList.remove('hidden'); // Show the viewer section
     } else {
        // Fallback if viewer elements aren't found
        alert(`سيتم عرض سورة ${surahName} (رقم ${surahId}) قريبًا.`);
     }
}

function closeQuranViewer() {
     const viewer = document.getElementById('quranViewer');
     if(viewer) {
         viewer.classList.add('hidden');
     }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Set 'home' as active tab and nav item on initial load
    switchTab('home');

     // Add submit handler for suggestions form
     const suggestionsForm = document.getElementById('suggestionsForm');
     const statusMessage = document.getElementById('suggestionStatus');

     if (suggestionsForm && statusMessage) {
         suggestionsForm.addEventListener('submit', (event) => {
             event.preventDefault(); // Prevent default form submission
             const name = document.getElementById('name').value;
             const suggestion = document.getElementById('suggestion').value;

             // Basic validation
             if (!suggestion.trim()) {
                 statusMessage.textContent = 'يرجى كتابة اقتراحك أو رأيك.';
                 statusMessage.style.color = 'red';
                 return;
             }

             // --- Placeholder for sending data (e.g., using fetch to an API) ---
             console.log("Suggestion submitted:", { name, suggestion });
             // ---

             statusMessage.textContent = `شكراً ${name || 'لك'} على اقتراحك! تم الإرسال بنجاح.`;
             statusMessage.style.color = 'green'; // Use Tailwind class 'text-green-600' if preferred
             suggestionsForm.reset(); // Clear the form

             // Optionally clear the message after a few seconds
             setTimeout(() => { statusMessage.textContent = ''; }, 5000);
         });
     } else {
        console.warn("Suggestions form or status element not found.");
     }
});