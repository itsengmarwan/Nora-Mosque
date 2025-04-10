<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="تابع آخر أخبار وفعاليات جامع نورة سعد العبيد في السالمية، بما في ذلك المحاضرات، الدروس الدينية، والأنشطة المجتمعية.">
    <title>الأخبار والفعاليات - مسجد نورة سعد العبيد</title>
    <link rel="icon" href="images/mosque-logo.png" type="image/png">
     <link rel="stylesheet" href="style.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
    </head>
<body>
    <div class="container">
        <header>
             <div class="header-inner">
                 <div class="logo">
                    <a href="index.html" style="text-decoration: none; display: flex; align-items: center;">
                        <img src="images/mosque-logo.png" alt="شعار المسجد">
                        <div class="logo-text">
                            <h1>مسجد نورة سعد العبيد</h1>
                            <p>صرح إسلامي شامخ</p>
                        </div>
                    </a>
                </div>
                <nav>
                    <ul>
                         <li><a href="index.html">الرئيسية</a></li>
                        <li><a href="about.html">عن المسجد</a></li>
                        <li><a href="gallery.html">مكتبة الصور</a></li>
                        <li><a href="prayer-times.html">مواقيت الصلاة</a></li>
                        <li><a href="quran.html">المصحف الشريف</a></li>
                        <li><a href="contact.html">تواصل معنا</a></li>
                        <li><a href="news.php">الأخبار والفعاليات</a></li>
                    </ul>
                </nav>
                <button class="menu-toggle" aria-label="Toggle navigation">☰</button>
            </div>
        </header>

        <main id="news-page">
            <h2>آخر الأخبار والفعاليات</h2>

            <div id="news-list">
                <?php
                // --- تنبيه: هذا مجرد محتوى ثابت للمثال ---
                // --- يجب استبدال هذا الجزء بكود PHP حقيقي لجلب الأخبار من قاعدة بيانات ---

                // --- مثال لخبر 1 ---
                echo '<div class="news-item">';
                echo '<h3>محاضرة إيمانية بعنوان فضائل شهر شعبان</h3>';
                // تم تعديل التاريخ ليكون أكثر واقعية أو يمكن إزالته
                echo '<p class="date">تاريخ النشر: 15 فبراير</p>';
                echo '<p>ينظم الجامع محاضرة قيمة يلقيها الشيخ [اسم الشيخ] حول فضائل شهر شعبان وكيفية الاستعداد لرمضان...</p>';
                // الرابط يجب أن يؤدي لصفحة تفاصيل الخبر عند برمجتها
                echo '<a href="#" class="read-more">اقرأ المزيد</a>';
                echo '</div>';

                // --- مثال لخبر 2 ---
                echo '<div class="news-item">';
                echo '<h3>بدء التسجيل في حلقات تحفيظ القرآن الصيفية</h3>';
                // تم تعديل التاريخ ليكون أكثر واقعية أو يمكن إزالته (تاريخ اليوم كمثال)
                echo '<p class="date">تاريخ النشر: 11 أبريل</p>';
                echo '<p>يعلن الجامع عن فتح باب التسجيل في حلقات تحفيظ القرآن الكريم للصغار والكبار خلال العطلة الصيفية. المقاعد محدودة...</p>';
                // الرابط يجب أن يؤدي لصفحة تفاصيل الخبر عند برمجتها
                echo '<a href="#" class="read-more">اقرأ المزيد</a>';
                echo '</div>';

                 // --- مثال لخبر 3 ---
                echo '<div class="news-item">';
                echo '<h3>استعدادات الجامع لاستقبال شهر رمضان المبارك</h3>';
                 // تم تعديل التاريخ ليكون أكثر واقعية أو يمكن إزالته
                echo '<p class="date">تاريخ النشر: 20 مارس</p>';
                echo '<p>يقوم الجامع بوضع اللمسات الأخيرة على خطته لاستقبال شهر رمضان، بما في ذلك تجهيز المصليات وتنظيم برامج إيمانية متنوعة...</p>';
                // الرابط يجب أن يؤدي لصفحة تفاصيل الخبر عند برمجتها
                echo '<a href="#" class="read-more">اقرأ المزيد</a>';
                echo '</div>';
                // --- نهاية الأمثلة الثابتة ---
                ?>
            </div>
             <p style="margin-top: 30px; color: #777;">(ملاحظة: هذه مجرد أمثلة للأخبار، سيتم عرض الأخبار الفعلية قريباً بعد برمجة النظام.)</p>

        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>