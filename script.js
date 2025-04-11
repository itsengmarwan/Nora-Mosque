        // Splash Screen
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                document.getElementById('splashScreen').style.opacity = '0';
                setTimeout(function() {
                    document.getElementById('splashScreen').style.display = 'none';
                }, 1000);
            }, 2000);
            
            // Initialize app
            initPrayerTimes();
            initQuranList();
            
            // Generate app manifest
            generateManifest();
        });
        
        // Side Navigation
        function openNav() {
            document.getElementById("mySidenav").style.width = "250px";
        }
        
        function closeNav() {
            document.getElementById("mySidenav").style.width = "0";
        }
        
        // Tab Switching
        function switchTab(tabId) {
            // Hide all tabs
            var tabs = document.getElementsByClassName('tab-content');
            for (var i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove('active');
            }
            
            // Show selected tab
            document.getElementById(tabId).classList.add('active');
            
            // Update bottom nav
            var navItems = document.getElementsByClassName('bottom-nav-item');
            for (var i = 0; i < navItems.length; i++) {
                navItems[i].classList.remove('active');
            }
            
            var navItem = document.getElementById('nav-' + tabId);
            if (navItem) {
                navItem.classList.add('active');
            }
            
            // Close side nav
            closeNav();
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
        
        // Prayer Times
        function initPrayerTimes() {
            // Sample prayer times for Kuwait (in real app, this would come from an API)
            document.getElementById('fajrTime').textContent = '4:15';
            document.getElementById('sunriseTime').textContent = '5:35';
            document.getElementById('dhuhrTime').textContent = '11:45';
            document.getElementById('asrTime').textContent = '3:15';
            document.getElementById('maghribTime').textContent = '5:50';
            document.getElementById('ishaTime').textContent = '7:05';
            
            // Set Hijri date
            var today = new Date();
            document.getElementById('hijriDate').textContent = getHijriDate(today);
        }
        
        function getHijriDate(date) {
            // This is a simplified conversion - in a real app, use a proper Hijri calendar library
            return '15 رمضان 1445';
        }
        
        // Quran List
        function initQuranList() {
            const surahs = [
                "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
                "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
                "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
                "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
                "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
                "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
                "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
                "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
                "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
                "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
                "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
                "المسد", "الإخلاص", "الفلق", "الناس"
            ];
            
            const surahListContainer = document.getElementById('quranSurahList');
            
            for (let i = 0; i < surahs.length; i++) {
                const surahItem = document.createElement('div');
                surahItem.className = 'surah-item';
                
                const surahNumber = document.createElement('div');
                surahNumber.className = 'surah-number';
                surahNumber.textContent = (i + 1);
                
                const surahName = document.createElement('div');
                surahName.className = 'surah-name';
                surahName.textContent = surahs[i];
                
                surahItem.appendChild(surahNumber);
                surahItem.appendChild(surahName);
                
                // Add click event to open the surah
                surahItem.addEventListener('click', function() {
                    openSurah(i + 1);
                });
                
                surahListContainer.appendChild(surahItem);
            }
        }
        
        function openSurah(surahNumber) {
            // In a real app, this would open the specific surah
            alert('سيتم فتح سورة رقم ' + surahNumber);
        }
        
        // Image Viewer
        function openImageViewer(imageSrc) {
            document.getElementById('viewerImage').src = imageSrc;
            document.getElementById('imageViewer').style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
        function closeImageViewer() {
            document.getElementById('imageViewer').style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Generate Web App Manifest
        function generateManifest() {
            const manifest = {
                "name": "مسجد نورة سعد العبيد",
                "short_name": "مسجد نورة",
                "description": "تطبيق مسجد نورة سعد العبيد",
                "start_url": "/",
                "display": "standalone",
                "background_color": "#4CAF50",
                "theme_color": "#4CAF50",
                "icons": [
                    {
                        "src": "https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@5.15.4/svgs/solid/mosque.svg",
                        "sizes": "192x192",
                        "type": "image/svg+xml"
                    },
                    {
                        "src": "https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@5.15.4/svgs/solid/mosque.svg",
                        "sizes": "512x512",
                        "type": "image/svg+xml"
                    }
                ]
            };
            
            const manifestBlob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
            const manifestURL = URL.createObjectURL(manifestBlob);
            document.getElementById('manifestPlaceholder').href = manifestURL;
        }
        
        // Contact Form Handler
        document.getElementById('contactForm').addEventListener('submit', function(event) {
            event.preventDefault();
            
            // In a real app, this would send the data to a server
            alert('تم إرسال رسالتك بنجاح وسيتم الرد عليك قريباً');
            
            // Reset form
            this.reset();
        });