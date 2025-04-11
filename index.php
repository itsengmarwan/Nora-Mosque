<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مسجد نورة سعد العبيد</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.1/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css">
    <link rel="manifest" href="#" id="manifestPlaceholder">
    <meta name="theme-color" content="#4CAF50">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="مسجد نورة">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="mySidenav" class="sidenav">
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">×</a>
        <a href="javascript:void(0)" onclick="switchTab('home')"><i class="fas fa-home"></i> الرئيسية</a>
        <a href="javascript:void(0)" onclick="switchTab('about')"><i class="fas fa-info-circle"></i> عن المسجد</a>
        <a href="javascript:void(0)" onclick="switchTab('prayer')"><i class="fas fa-clock"></i> مواقيت الصلاة</a>
        <a href="javascript:void(0)" onclick="switchTab('gallery')"><i class="fas fa-images"></i> مكتبة الصور</a>
        <a href="javascript:void(0)" onclick="switchTab('quran')"><i class="fas fa-book-open"></i> المصحف الشريف</a>
        <a href="javascript:void(0)" onclick="switchTab('library')"><i class="fas fa-book"></i> مكتبة المسجد</a>
        <a href="javascript:void(0)" onclick="switchTab('azkar')"><i class="fas fa-pray"></i> أذكار المسلم</a>
        <a href="javascript:void(0)" onclick="switchTab('suggestions')"><i class="fas fa-comment-alt"></i> شاركنا برأيك</a>
        <a href="javascript:void(0)" onclick="switchTab('contact')"><i class="fas fa-envelope"></i> تواصل معنا</a>
        <a href="javascript:void(0)" onclick="switchTab('location')"><i class="fas fa-map-marker-alt"></i> موقع المسجد</a>
    </div>

    <div class="navbar">
        <div class="logo-container">
            <div class="logo">
                <i class="fas fa-mosque"></i>
            </div>
            <div class="app-name">مسجد نورة سعد العبيد</div>
        </div>
        <button class="menu-toggle" onclick="openNav()">
            <i class="fas fa-bars"></i>
        </button>
    </div>

    <div class="main-container">
        <div id="home" class="tab-content active">
            <img src="mosque_images/image1.jpg" alt="مسجد نورة سعد العبيد" class="banner-image">

            <div class="card">
                <div class="section-title">
                    <i class="fas fa-mosque"></i> أهلا بكم في مسجد نورة سعد العبيد
                </div>
                <p>هذا التطبيق مخصص لخدمة مسجد نورة سعد العبيد بالكويت، ويقدم معلومات ومزايا متنوعة للمصلين والزوار.</p>
            </div>

            <div class="feature-cards">
                <a href="javascript:void(0)" onclick="switchTab('prayer')" class="feature-card">
                    <i class="fas fa-clock"></i>
                    <div class="feature-card-title">مواقيت الصلاة</div>
                    <div class="feature-card-desc">أوقات الصلوات اليومية</div>
                </a>
                <a href="javascript:void(0)" onclick="switchTab('quran')" class="feature-card">
                    <i class="fas fa-book-open"></i>
                    <div class="feature-card-title">المصحف الشريف</div>
                    <div class="feature-card-desc">قراءة القرآن الكريم</div>
                </a>
                <a href="javascript:void(0)" onclick="switchTab('gallery')" class="feature-card">
                    <i class="fas fa-images"></i>
                    <div class="feature-card-title">صور المسجد</div>
                    <div class="feature-card-desc">معرض صور متنوع</div>
                </a>
                <a href="javascript:void(0)" onclick="switchTab('library')" class="feature-card">
                    <i class="fas fa-book"></i>
                    <div class="feature-card-title">مكتبة الجامع</div>
                    <div class="feature-card-desc">حجز واستعارة الكتب</div>
                </a>
            </div>

            <div class="card" style="margin-top: 20px;">
                <div class="section-title">
                    <i class="fas fa-hashtag"></i> تابعونا على
                </div>
                <div class="social-links">
                    <a href="https://chat.whatsapp.com/LuwgLyE5NVf2Hb8Yb6lhS9" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-whatsapp"></i>
                        </div>
                        <div class="social-name">واتساب</div>
                    </a>
                    <a href="https://www.instagram.com/nsom_15?igsh=MWo0d3g2em9heWMwYw==" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-instagram"></i>
                        </div>
                        <div class="social-name">إنستجرام</div>
                    </a>
                    <a href="https://www.tiktok.com/@nsom_15?_t=ZS-8vQHwvIMxqp&_r=1" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-tiktok"></i>
                        </div>
                        <div class="social-name">تيكتوك</div>
                    </a>
                    <a href="https://x.com/nsom_15?t=e5bbi8l3y6ys3lKeC14VXQ&s=08" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-twitter"></i>
                        </div>
                        <div class="social-name">اكس</div>
                    </a>
                    <a href="https://youtube.com/@nsom_15?si=2e8nG3ua_URYlhyt" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-youtube"></i>
                        </div>
                        <div class="social-name">يوتيوب</div>
                    </a>
                    <a href="https://www.facebook.com/share/12JAF4EbBsd/" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-facebook"></i>
                        </div>
                        <div class="social-name">فيسبوك</div>
                    </a>
                    <a href="https://t.me/nsom_15" class="social-link">
                        <div class="social-icon">
                            <i class="fab fa-telegram"></i>
                        </div>
                        <div class="social-name">تلجرام</div>
                    </a>
                </div>
            </div>
        </div>

        <div id="about" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-info-circle"></i> عن جامع نورة سعد العبيد
                </div>
                <div class="mosque-info">
                    <p>يُعتبر جامع نورة سعد العبيد معلماً إسلامياً بارزاً يزهو في قلب منطقة السالمية التابعة لمحافظة حولي بدولة الكويت، وتحديداً يشع نوره في شارع 8.</p>
                    <p>يشرف على إمامة المسجد فضيلة الشيخ/ <strong>عبداللّه العازمي </strong><p>و يلقي خطبة الجمعة فضيلة الشيخ الدكتور/ <strong>سعد سعد الأحمد</strong></p>، ويرفع نداء الحق بصوته العذب المؤذن الشيخ/ <strong>حسن بدري</strong>.</p>
                </div>

                <div class="section-title">
                    <i class="fas fa-calendar-alt"></i> الأنشطة والفعاليات الرئيسية
                </div>
                <ul class="activities-list">
                    <li>إقامة الصلوات الخمس جماعة في أوقاتها.</li>
                    <li>تنظيم حلقات تحفيظ وتدارس القرآن الكريم لمختلف الأعمار.</li>
                    <li>إلقاء خطبة الجمعة الأسبوعية التي تناقش قضايا معاصرة بمنظور إسلامي.</li>
                    <li>إحياء ليالي شهر رمضان الفضيل بصلاتي التراويح والقيام وتنظيم فعاليات مصاحبة.</li>
                    <li>استضافة محاضرات ودروس دينية وعلمية دورية يقدمها نخبة من المشايخ والدعاة.</li>
                    <li>توفير مكتبة عامرة بالكتب الشرعية والثقافية للباحثين والمهتمين.</li>
                </ul>

                <div class="section-title" style="margin-top: 20px;">
                    <i class="fas fa-question-circle"></i> لماذا سُمي بهذا الاسم؟
                </div>
                <p>حمل هذا الصرح اسم "نورة سعد العبيد" تكريماً وعرفاناً للسيدة الفاضلة/ <strong>نورة سعد العبيد</strong> رحمها الله، التي كانت سبباً في إنشائه ووهبت جهودها لخدمة بيوت الله، سائلين المولى أن يجعل ذلك في ميزان حسناتها وأن يخلد ذكرها في سجل الخير والعطاء.</p>
            </div>
        </div>

        <div id="prayer" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-clock"></i> مواقيت الصلاة اليوم
                </div>
                <div class="prayer-times" id="prayerTimesContainer">
                    <div class="prayer-time-item">
                        <div class="prayer-name">الفجر</div>
                        <div class="prayer-time" id="fajrTime">--:--</div>
                    </div>
                    <div class="prayer-time-item">
                        <div class="prayer-name">الشروق</div>
                        <div class="prayer-time" id="sunriseTime">--:--</div>
                    </div>
                    <div class="prayer-time-item">
                        <div class="prayer-name">الظهر</div>
                        <div class="prayer-time" id="dhuhrTime">--:--</div>
                    </div>
                    <div class="prayer-time-item">
                        <div class="prayer-name">العصر</div>
                        <div class="prayer-time" id="asrTime">--:--</div>
                    </div>
                    <div class="prayer-time-item">
                        <div class="prayer-name">المغرب</div>
                        <div class="prayer-time" id="maghribTime">--:--</div>
                    </div>
                    <div class="prayer-time-item">
                        <div class="prayer-name">العشاء</div>
                        <div class="prayer-time" id="ishaTime">--:--</div>
                    </div>
                </div>
                <div class="text-center mt-4">
                    <small>التاريخ الهجري: <span id="hijriDate">--</span></small><br>
                    <small>أوقات الصلاة لمدينة الكويت</small>
                </div>
            </div>
        </div>

        <div id="gallery" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-images"></i> مكتبة الصور
                </div>
                <div class="gallery">
                    <div class="gallery-item">
                        <img src="mosque_images/image1.jpg" alt="صورة خارجية لمسجد نورة سعد العبيد" onclick="openImageViewer(this.src)">
                    </div>
                    <div class="gallery-item">
                        <img src="mosque_images/image2.jpg" alt="صورة داخلية لقاعة الصلاة في مسجد نورة" onclick="openImageViewer(this.src)">
                    </div>
                    <div class="gallery-item">
                        <img src="mosque_images/image3.jpg" alt="صورة داخلية للمسجد" onclick="openImageViewer(this.src)">
                    </div>
                    <div class="gallery-item">
                        <img src="mosque_images/image4.jpg" alt="صورة تفصيلية للزخارف في المسجد" onclick="openImageViewer(this.src)">
                    </div>
                    <div class="gallery-item">
                        <img src="mosque_images/image5.jpg" alt="صورة عامة للمسجد مع المصلين" onclick="openImageViewer(this.src)">
                    </div>
                </div>
            </div>
        </div>

        <div id="quran" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-book-open"></i> المصحف الشريف
                </div>
                <p class="mb-3">نسخة مجمع الملك فهد لطباعة المصحف الشريف</p>
                <div class="quran-surah-list" id="quranSurahList">
                    </div>
                <div class="swipe-indicator">
                    <div class="indicator-dot active"></div>
                    <div class="indicator-dot"></div>
                    <div class="indicator-dot"></div>
                </div>
            </div>
        </div>

        <div id="library" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-book"></i> مكتبة المسجد
                </div>
                <p>قريبًا ستتوفر هنا قائمة بالكتب المتاحة في مكتبة المسجد وروابط لحجز أو استعارة الكتب.</p>
            </div>
        </div>

        <div id="azkar" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-pray"></i> أذكار المسلم
                </div>
                <p>قريبًا ستتوفر هنا مجموعة من أذكار المسلم اليومية.</p>
            </div>
        </div>

        <div id="suggestions" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-comment-alt"></i> شاركنا برأيك
                </div>
                <form id="suggestionsForm">
                    <div class="mb-4">
                        <label for="name" class="block text-gray-700 text-sm font-bold mb-2">الاسم:</label>
                        <input type="text" id="name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="اسمك الكريم">
                    </div>
                    <div class="mb-4">
                        <label for="suggestion" class="block text-gray-700 text-sm font-bold mb-2">اقتراحك/رأيك:</label>
                        <textarea id="suggestion" rows="4" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="اكتب اقتراحك أو رأيك هنا"></textarea>
                    </div>
                    <div class="flex items-center justify-between">
                        <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">إرسال الاقتراح</button>
                        <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onclick="document.getElementById('suggestionsForm').reset()">مسح</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="contact" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-envelope"></i> تواصل معنا
                </div>
                <p>يمكنكم التواصل مع إدارة المسجد عبر الوسائل التالية:</p>
                <ul>
                <li><strong>البريد الإلكتروني:</strong> <a href="mailto:info@yourmosque.com">info@yourmosque.com</a> (مثال)</li>
                    <li><strong>رقم الهاتف:</strong> +965 XXXXXXXX (مثال)</li>
                    <li><strong>العنوان:</strong> شارع 8، السالمية، الكويت (مثال)</li>
                </ul>
                <p class="mt-4">نتطلع إلى تواصلكم واستقبال استفساراتكم وملاحظاتكم.</p>
            </div>
        </div>

        <div id="location" class="tab-content">
            <div class="card">
                <div class="section-title">
                    <i class="fas fa-map-marker-alt"></i> موقع المسجد
                </div>
                <div class="map-container">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3477.67890123456!2d48.077777!3d29.345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sYour+Mosque+Name!5e0!3m2!1sar!2skw!4v16XXXXXXXXX"
                            width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                    <p class="mt-3 text-center"><a href="https://www.google.com/maps/place/Your+Mosque+Name" target="_blank">عرض الموقع على خرائط جوجل</a></p>
                    <small>*** يرجى استبدال رابط الخريطة واسم الموقع بالمعلومات الصحيحة لمسجدكم. ***</small>
                </div>
            </div>
        </div>
    </div>

    <div class="bottom-navigation">
        <a href="javascript:void(0)" onclick="switchTab('home')" class="bottom-nav-item active">
            <i class="fas fa-home"></i>
            <span>الرئيسية</span>
        </a>
        <a href="javascript:void(0)" onclick="switchTab('prayer')" class="bottom-nav-item">
            <i class="fas fa-clock"></i>
            <span>مواقيت الصلاة</span>
        </a>
        <a href="javascript:void(0)" onclick="switchTab('quran')" class="bottom-nav-item">
            <i class="fas fa-book-open"></i>
            <span>المصحف</span>
        </a>
        <a href="javascript:void(0)" onclick="switchTab('gallery')" class="bottom-nav-item">
            <i class="fas fa-images"></i>
            <span>الصور</span>
        </a>
        <a href="javascript:void(0)" onclick="openNav()" class="bottom-nav-item">
            <i class="fas fa-bars"></i>
            <span>المزيد</span>
        </a>
    </div>

    <div id="imageViewer" class="image-viewer">
        <span class="close-btn" onclick="closeImageViewer()">&times;</span>
        <img class="viewer-image" id="viewedImage" src="" alt="صورة مكبرة">
    </div>

    <script src="script.js"></script>
</body>
</html>