<?php
// ملف config.php لتحديد مسار ملف CSV
$excel_csv_path = 'path/to/your/prayer_times.csv';

function getPrayerTimesForToday($csvFilePath) {
    $today_date = date('j'); // الحصول على رقم اليوم فقط (بدون الشهر والسنة كما في المثال)
    $prayer_times = [];

    if (($handle = fopen($csvFilePath, "r")) !== false) {
        // تخطي السطر الأول (العناوين) إذا كان موجودًا
        fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            if (isset($row[0])) {
                // تقسيم التاريخ إذا كان بتنسيق يوم/شهر/سنة واستخراج اليوم
                $date_parts = explode('/', trim($row[0]));
                $day = isset($date_parts[0]) ? trim($date_parts[0]) : '';

                if ($day === $today_date) {
                    $prayer_times['fajr'] = isset($row[1]) ? trim($row[1]) : '--:--';
                    $prayer_times['sunrise'] = isset($row[2]) ? trim($row[2]) : '--:--';
                    $prayer_times['dhuhr'] = isset($row[3]) ? trim($row[3]) : '--:--';
                    $prayer_times['asr'] = isset($row[4]) ? trim($row[4]) : '--:--';
                    $prayer_times['maghrib'] = isset($row[5]) ? trim($row[5]) : '--:--';
                    $prayer_times['isha'] = isset($row[6]) ? trim($row[6]) : '--:--';
                    break; // تم العثور على مواقيت اليوم، يمكن التوقف
                }
            }
        }
        fclose($handle);
    }

    return $prayer_times;
}

$today_prayer_times = getPrayerTimesForToday($excel_csv_path);
?>

<div id="prayer" class="tab-content active">
    <div class="card">
        <div class="section-title">
            <i class="fas fa-clock"></i> مواقيت الصلاة اليوم
        </div>
        <div class="prayer-times" id="prayerTimesContainer">
            <div class="prayer-time-item">
                <div class="prayer-name">الفجر</div>
                <div class="prayer-time" id="fajrTime"><?php echo $today_prayer_times['fajr'] ?? '--:--'; ?></div>
            </div>
            <div class="prayer-time-item">
                <div class="prayer-name">الشروق</div>
                <div class="prayer-time" id="sunriseTime"><?php echo $today_prayer_times['sunrise'] ?? '--:--'; ?></div>
            </div>
            <div class="prayer-time-item">
                <div class="prayer-name">الظهر</div>
                <div class="prayer-time" id="dhuhrTime"><?php echo $today_prayer_times['dhuhr'] ?? '--:--'; ?></div>
            </div>
            <div class="prayer-time-item">
                <div class="prayer-name">العصر</div>
                <div class="prayer-time" id="asrTime"><?php echo $today_prayer_times['asr'] ?? '--:--'; ?></div>
            </div>
            <div class="prayer-time-item">
                <div class="prayer-name">المغرب</div>
                <div class="prayer-time" id="maghribTime"><?php echo $today_prayer_times['maghrib'] ?? '--:--'; ?></div>
            </div>
            <div class="prayer-time-item">
                <div class="prayer-name">العشاء</div>
                <div class="prayer-time" id="ishaTime"><?php echo $today_prayer_times['isha'] ?? '--:--'; ?></div>
            </div>
        </div>
        <div class="text-center mt-4">
            <small>التاريخ الهجري: <span id="hijriDate">--</span></small><br>
            <small>أوقات الصلاة لمدينة الكويت</small>
        </div>
    </div>
</div>

<script>
    // لا تحتاج إلى تعيين مواقيت الصلاة هنا بعد الآن، PHP قام بذلك
    // تحتاج إلى الاحتفاظ ببقية وظائف JavaScript مثل switchTab وغيرها
</script>