<?php
// Nora-Mosque/send_email.php

// --- الإعدادات ---
// **هام جداً:** استبدل هذا ببريدك الإلكتروني الفعلي الذي ستستقبل عليه الرسائل
$recipient_email = "your-email@example.com";
$subject_prefix = "[رسالة من موقع مسجد نورة]"; // بادئة لموضوع البريد

// --- التحقق من الطلب ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- الحصول على البيانات وتعقيمها ---
    // استخدام filter_input للوصول الآمن للمتغيرات
    // استخدام FILTER_SANITIZE_STRING لإزالة العلامات (Tags)
    // استخدام FILTER_SANITIZE_EMAIL للتحقق من صيغة البريد
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    // --- التحقق من صحة البيانات الأساسية ---
    $errors = [];
    if (empty($name)) {
        $errors[] = "الاسم مطلوب.";
    }
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "بريد إلكتروني صحيح مطلوب.";
    }
     if (empty($subject)) {
        $errors[] = "الموضوع مطلوب.";
    }
    if (empty($message)) {
        $errors[] = "محتوى الرسالة مطلوب.";
    }

    // --- إذا لم تكن هناك أخطاء، حاول إرسال البريد ---
    if (empty($errors)) {
        // --- بناء محتوى البريد الإلكتروني ---
        $email_subject = "$subject_prefix $subject";
        $email_body = "لقد تلقيت رسالة جديدة من نموذج الاتصال بموقع المسجد:\n\n";
        $email_body .= "الاسم: $name\n";
        $email_body .= "البريد الإلكتروني: $email\n";
        $email_body .= "الموضوع: $subject\n";
        $email_body .= "الرسالة:\n$message\n";

        // --- بناء رؤوس البريد (Headers) ---
        // تحديد عنوان المرسل (Reply-To) ومصدر البريد
        $headers = "From: \"$name\" <$email>\r\n"; // يظهر اسم ورسالة المُرسِل
        $headers .= "Reply-To: $email\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n"; // دعم اللغة العربية
        $headers .= "X-Mailer: PHP/" . phpversion();

        // --- محاولة إرسال البريد ---
        // **تنبيه:** وظيفة mail() تعتمد بشكل كبير على إعدادات الخادم (Server).
        // قد تحتاج إلى تكوين إضافي (مثل SMTP) لتعمل بشكل موثوق، خاصة على الاستضافات المشتركة.
        if (mail($recipient_email, $email_subject, $email_body, $headers)) {
            // نجح الإرسال: أعد التوجيه إلى صفحة شكر (أو اعرض رسالة نجاح)
             // header("Location: thank_you.html"); // قم بإنشاء صفحة thank_you.html
             echo "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><title>تم الإرسال</title><link rel='stylesheet' href='style.css'><style>body{padding-top: 20px; text-align: center; font-family: Tajawal, sans-serif;}.success-message { color: green; font-size: 1.2em; margin-bottom: 15px; } .back-link { display: inline-block; margin-top: 20px; color: #b8860b; text-decoration: none; font-weight: bold; }</style></head><body>";
             echo "<div class='container' style='max-width: 600px; margin: auto; padding: 30px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);'>";
             echo "<h2 style='color: #5cb85c;'>تم إرسال رسالتك بنجاح!</h2>";
             echo "<p class='success-message'>شكراً لتواصلك معنا، سنقوم بالرد عليك في أقرب وقت ممكن.</p>";
             echo "<a href='contact.html' class='back-link'>العودة إلى صفحة التواصل</a>";
             echo "</div></body></html>";
             exit;
        } else {
            // فشل الإرسال: اعرض رسالة خطأ
            $errors[] = "حدث خطأ أثناء محاولة إرسال البريد. يرجى المحاولة مرة أخرى لاحقاً أو استخدام وسيلة اتصال أخرى.";
        }
    }

    // --- إذا كانت هناك أخطاء، اعرضها ---
    if (!empty($errors)) {
         echo "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><title>خطأ في الإرسال</title><link rel='stylesheet' href='style.css'><style>body{padding-top: 20px; text-align: center; font-family: Tajawal, sans-serif;} .error-message { color: red; margin-bottom: 10px; } .error-list { list-style: none; padding: 0; } .back-link { display: inline-block; margin-top: 20px; color: #b8860b; text-decoration: none; font-weight: bold; }</style></head><body>";
         echo "<div class='container' style='max-width: 600px; margin: auto; padding: 30px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);'>";
         echo "<h2 style='color: red;'>خطأ في البيانات المدخلة:</h2>";
         echo "<ul class='error-list'>";
         foreach ($errors as $error) {
             echo "<li class='error-message'>- $error</li>";
         }
         echo "</ul>";
         echo "<a href='contact.html' onclick='window.history.back(); return false;' class='back-link'>العودة وتصحيح الأخطاء</a>"; // Use JS to go back preserving form data
         echo "</div></body></html>";
         exit;
    }

} else {
    // إذا لم يكن الطلب POST، اعرض رسالة خطأ أو أعد التوجيه
    echo " وصول غير مصرح به.";
    // header("Location: contact.html");
    exit;
}
?>