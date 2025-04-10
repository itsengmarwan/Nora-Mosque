<?php
// Nora-Mosque/send-email.php

// --- الإعدادات ---
// !! تعديل هام جداً: استبدل هذا ببريدك الإلكتروني الفعلي الخاص بالمسجد !!
$recipient_email = "marwan.tarek.abosalem@gmail.com";
$subject_prefix = "[رسالة من موقع مسجد نورة]"; // بادئة لموضوع البريد

// --- التحقق من الطلب ---
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- الحصول على البيانات وتعقيمها ---
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    // --- التحقق من صحة البيانات الأساسية ---
    $errors = [];
    if (empty($name)) {
        $errors[] = "الاسم مطلوب.";
    }
    // استخدام FILTER_VALIDATE_EMAIL للتحقق من صحة البريد الإلكتروني
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
        $email_body .= "البريد الإلكتروني للمرسل: $email\n"; // يظهر في نص الرسالة
        $email_body .= "الموضوع: $subject\n";
        $email_body .= "الرسالة:\n$message\n";

        // --- بناء رؤوس البريد (Headers) ---
        // From: يظهر اسم المُرسِل (كما أدخله) وعنوان بريده
        // Reply-To: عند الرد على الرسالة، سيتم الرد على عنوان المُرسِل الأصلي
        $headers = "From: \"$name\" <$email>\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n"; // دعم اللغة العربية
        $headers .= "X-Mailer: PHP/" . phpversion();

        // --- محاولة إرسال البريد ---
        // **تنبيه:** وظيفة mail() تعتمد بشكل كبير على إعدادات الخادم (Server).
        // قد تحتاج إلى تكوين إضافي (مثل SMTP) لتعمل بشكل موثوق.
        // يُفضل استخدام مكتبة مثل PHPMailer مع SMTP لضمان وصول أفضل للرسائل.
        if (mail($recipient_email, $email_subject, $email_body, $headers)) {
            // نجح الإرسال: اعرض رسالة نجاح
             echo "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><title>تم الإرسال</title><link rel='stylesheet' href='style.css'><style>body{padding-top: 20px; text-align: center; font-family: Tajawal, sans-serif;}.success-message { color: green; font-size: 1.2em; margin-bottom: 15px; } .back-link { display: inline-block; margin-top: 20px; color: #b8860b; text-decoration: none; font-weight: bold; }</style></head><body>";
             echo "<div class='container' style='max-width: 600px; margin: auto; padding: 30px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);'>";
             echo "<h2 style='color: #5cb85c;'>تم إرسال رسالتك بنجاح!</h2>";
             echo "<p class='success-message'>شكراً لتواصلك معنا، سنقوم بالرد عليك في أقرب وقت ممكن.</p>";
             // رابط للعودة إلى صفحة التواصل
             echo "<a href='contact.html' class='back-link'>العودة إلى صفحة التواصل</a>";
             echo "</div></body></html>";
             exit;
        } else {
            // فشل الإرسال: اعرض رسالة خطأ
            $errors[] = "حدث خطأ أثناء محاولة إرسال البريد. قد يكون السبب في إعدادات الخادم. يرجى المحاولة مرة أخرى لاحقاً أو استخدام وسيلة اتصال أخرى.";
        }
    }

    // --- إذا كانت هناك أخطاء (من التحقق الأولي أو من فشل الإرسال)، اعرضها ---
    if (!empty($errors)) {
         echo "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><title>خطأ في الإرسال</title><link rel='stylesheet' href='style.css'><style>body{padding-top: 20px; text-align: center; font-family: Tajawal, sans-serif;} .error-message { color: red; margin-bottom: 10px; } .error-list { list-style: none; padding: 0; } .back-link { display: inline-block; margin-top: 20px; color: #b8860b; text-decoration: none; font-weight: bold; }</style></head><body>";
         echo "<div class='container' style='max-width: 600px; margin: auto; padding: 30px; background: #fff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);'>";
         echo "<h2 style='color: red;'>حدث خطأ:</h2>";
         echo "<ul class='error-list'>";
         foreach ($errors as $error) {
             echo "<li class='error-message'>- $error</li>";
         }
         echo "</ul>";
         // استخدام history.back() للحفاظ على بيانات النموذج عند العودة
         echo "<a href='#' onclick='window.history.back(); return false;' class='back-link'>العودة وتصحيح الأخطاء</a>";
         echo "</div></body></html>";
         exit;
    }

} else {
    // إذا لم يكن الطلب POST، اعرض رسالة خطأ أو أعد التوجيه
    http_response_code(405); // Method Not Allowed
    echo "وصول غير مصرح به. يجب إرسال البيانات عبر نموذج الاتصال.";
    // يمكنك إعادة التوجيه إلى صفحة الاتصال بدلاً من عرض رسالة
    // header("Location: contact.html");
    exit;
}
?>