function openNav() {
    document.getElementById("mySidenav").style.width = "70%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function switchTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.classList.remove('active');
        // Check both href and onclick for matching tabId
        const href = item.getAttribute('href');
        const onclickAttr = item.getAttribute('onclick');
        if ((href && href.includes('#' + tabId)) || (onclickAttr && onclickAttr.includes("'" + tabId + "'"))) {
             // Check if the item's onclick corresponds to the tabId or if it's the "More" button triggering the nav
             if (onclickAttr && onclickAttr.includes("openNav") && tabId !== 'home' && tabId !== 'prayer' && tabId !== 'quran' && tabId !== 'gallery') {
                 // Special case: Keep "More" active if a tab from the sidenav is selected
                 if (item.textContent.includes('المزيد')) {
                     item.classList.add('active');
                 }
             } else if (onclickAttr && onclickAttr.includes("'" + tabId + "'")) {
                 item.classList.add('active');
             }
        }
    });

    // Activate the correct bottom nav item specifically
    const targetBottomNavItem = document.querySelector(`.bottom-nav-item[onclick*="'${tabId}'"]`);
    if (targetBottomNavItem) {
        targetBottomNavItem.classList.add('active');
    } else if (tabId === 'home') { // Handle home activation if not found by onclick
        document.querySelector(`.bottom-nav-item[onclick*="'home'"]`).classList.add('active');
    }


    const activeTabElement = document.getElementById(tabId);
    if (activeTabElement) {
        activeTabElement.classList.add('active');
    } else {
        console.error("Tab content not found for ID:", tabId);
        // Fallback to home if tab content not found
        document.getElementById('home').classList.add('active');
        document.querySelector(`.bottom-nav-item[onclick*="'home'"]`).classList.add('active');

    }


    if (tabId === 'prayer') {
        // *** Call the function to load from CSV ***
        loadPrayerTimesFromCSV('Prayer Times.xlsx - Sheet1.csv');
        // Load Hijri Date
        loadHijriDate();
    } else if (tabId === 'quran') {
        loadSurahList();
    }

    // Close sidenav after selection
    closeNav();
}


function openImageViewer(imageSrc) {
    document.getElementById('viewedImage').src = imageSrc;
    document.getElementById('imageViewer').style.display = 'flex';
}

function closeImageViewer() {
    document.getElementById('imageViewer').style.display = 'none';
}

// *** Renamed and modified function to load from CSV ***
async function loadPrayerTimesFromCSV(csvFilePath) {
    try {
        const response = await fetch(csvFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const prayerTimes = parsePrayerTimesCSV(csvText);

        if (prayerTimes) {
            document.getElementById('fajrTime').textContent = formatTime(prayerTimes.fajr) || '--:--';
            document.getElementById('sunriseTime').textContent = formatTime(prayerTimes.sunrise) || '--:--';
            document.getElementById('dhuhrTime').textContent = formatTime(prayerTimes.dhuhr) || '--:--';
            document.getElementById('asrTime').textContent = formatTime(prayerTimes.asr) || '--:--';
            document.getElementById('maghribTime').textContent = formatTime(prayerTimes.maghrib) || '--:--';
            document.getElementById('ishaTime').textContent = formatTime(prayerTimes.isha) || '--:--';
        } else {
            displayPrayerTimeError('لم يتم العثور على مواقيت صلاة اليوم.');
        }
    } catch (error) {
        console.error('Error fetching or parsing prayer times CSV:', error);
        displayPrayerTimeError('تعذر تحميل مواقيت الصلاة.');
    }
}

function parsePrayerTimesCSV(csvText) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed

    const lines = csvText.split('\n');
    let currentCSVMonth = -1;
    const monthMap = {
        "يناير": 1, "فبراير": 2, "مارس": 3, "ابريل": 4, "مايو": 5, "يونيو": 6,
        "يوليو": 7, "أغسطس": 8, "سبتمبر": 9, "اكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12
    };

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Check for month headers like " شهر يناير,,,,,"
        const monthMatch = trimmedLine.match(/^ *شهر +(\S+)/);
        if (monthMatch && monthMap[monthMatch[1]]) {
            currentCSVMonth = monthMap[monthMatch[1]];
            continue; // Skip to the next line after finding a month header
        }

        // Skip headers like "التاريخ,الفجـر,..." or empty lines or lines not starting with a number
        if (!trimmedLine || trimmedLine.startsWith('التاريخ') || !/^\d/.test(trimmedLine)) {
            continue;
        }

        // Process data lines only if we are in the correct month
        if (currentCSVMonth === currentMonth) {
            // Split by comma, trim whitespace from each part, and filter out empty strings
            const columns = trimmedLine.split(',')
                                     .map(col => col.trim())
                                     .filter(col => col !== '');

            // Expected columns: Day, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
            if (columns.length >= 7) {
                const day = parseInt(columns[0], 10);

                if (day === currentDay) {
                    // Found the prayer times for today!
                    return {
                        fajr: columns[1],
                        sunrise: columns[2],
                        dhuhr: columns[3],
                        asr: columns[4],
                        maghrib: columns[5],
                        isha: columns[6],
                    };
                }
            }
        }
    }

    return null; // Return null if today's times were not found
}

function displayPrayerTimeError(message) {
     const container = document.getElementById('prayerTimesContainer');
     if (container) {
         container.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
     }
}


function formatTime(timeString) {
    if (!timeString || typeof timeString !== 'string') return null;
    // Remove extra spaces and split
    const parts = timeString.replace(/\s+/g, '').split(/[:.]/); // Split by colon or dot
    if (parts.length >= 2) {
        const hour = parts[0].padStart(2, '0');
        const minute = parts[1].padStart(2, '0');
        return `${hour}:${minute}`;
    }
    return timeString; // Return original if format is unexpected
}

// --- Quran Functions ---
function loadSurahList() {
    const surahListContainer = document.getElementById('quranSurahList');
    if (!surahListContainer.innerHTML) { // Load only if not already loaded
        // Simulate fetching data (replace with actual fetch if you have a JSON file)
        const quranData = {
             "chapters": [
                {"id": 1, "name_arabic": "الفاتحة", "name_simple": "Al-Fatihah"},
                {"id": 2, "name_arabic": "البقرة", "name_simple": "Al-Baqarah"},
                 // Add all other surahs here...
                {"id": 114, "name_arabic": "الناس", "name_simple": "An-Nas"}
            ]
        };
         renderSurahList(quranData);

        // // --- OR Fetch from a JSON file (if you have one) ---
        // fetch('quran_arabic.json') // Make sure you have this file
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }
        //         return response.json();
        //     })
        //     .then(data => {
        //         renderSurahList(data);
        //     })
        //     .catch(error => {
        //         console.error('Error loading Quran surah list:', error);
        //         surahListContainer.innerHTML = '<p>تعذر تحميل قائمة السور.</p>';
        //     });
    }
}

function renderSurahList(data) {
    const surahListContainer = document.getElementById('quranSurahList');
    surahListContainer.innerHTML = ''; // Clear previous content
    if (data && data.chapters) {
        data.chapters.forEach(surah => {
            const surahDiv = document.createElement('div');
            surahDiv.classList.add('surah-item');
            // Added surah number display
            surahDiv.innerHTML = `
                <div class="surah-details">
                    <span class="surah-number">${surah.id}</span>
                    <a href="javascript:void(0)" onclick="openSurah(${surah.id})">${surah.name_arabic} (${surah.name_simple})</a>
                </div>
                <i class="fas fa-chevron-left"></i>`; // Example icon
            surahListContainer.appendChild(surahDiv);
        });
    } else {
         surahListContainer.innerHTML = '<p>لا توجد بيانات لعرضها.</p>';
    }
}


function openSurah(surahId) {
    // يمكنك هنا إضافة كود لفتح صفحة أو جزء لعرض السورة المحددة
    alert(`سيتم عرض سورة رقم ${surahId} قريبًا.`);
    // Example: window.location.href = `/quran/surah/${surahId}`;
}

// --- Hijri Date Function ---
function loadHijriDate() {
    const hijriDateSpan = document.getElementById('hijriDate');
    if (hijriDateSpan) {
        try {
            // Use Intl API for Hijri calendar
            const today = new Date();
            const options = {
                calendar: 'islamic-umalqura', // Or 'islamic-civil', 'islamic-tbla'
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Asia/Kuwait' // Set timezone relevant to Kuwait
            };
            const hijriFormatter = new Intl.DateTimeFormat('ar-KW-u-ca-islamic-umalqura', options);
            hijriDateSpan.textContent = hijriFormatter.format(today);
        } catch (error) {
            console.error("Error formatting Hijri date:", error);
            hijriDateSpan.textContent = "--"; // Fallback
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Set 'home' as active on initial load
    switchTab('home');
});