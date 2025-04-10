document.addEventListener('DOMContentLoaded', function() {
    const headerInner = document.querySelector('.header-inner');
    const nav = document.querySelector('nav');
    const body = document.querySelector('body');
    // const menuToggle = headerInner ? headerInner.querySelector('::after') : null; // تعليق أو حذف محاولة استهداف ::after

    // وظيفة ألبوم الصور في الصفحة الرئيسية
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const albumImage = document.getElementById('album-image');
    const images = [
        'mosque_images/image1.jpg',
        'mosque_images/image2.jpg',
        'mosque_images/image3.jpg',
        'mosque_images/image4.jpg',
        'mosque_images/image5.jpg',
        'mosque_images/image6.jpg',
        'mosque_images/image7.jpg'
        // يمكنك إضافة المزيد من أسماء الصور هنا مثل 'mosque_images/image3.jpg'
    ];
    let currentIndex = 0;

    if (prevBtn && nextBtn && albumImage && images.length > 0) {
        albumImage.src = images[currentIndex];

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            albumImage.src = images[currentIndex];
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            albumImage.src = images[currentIndex];
        });
    }

    // تفعيل/إخفاء قائمة التنقل على الجوال
    if (headerInner && nav && body && window.innerWidth <= 768) {
        headerInner.addEventListener('click', function() {
            nav.classList.toggle('open');
            body.classList.toggle('menu-open');
        });
    }

    // إغلاق القائمة وإزالة تأثير الخلفية عند تغيير حجم الشاشة
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            nav.classList.remove('open');
            body.classList.remove('menu-open');
        }
    });

    // كود تفعيل أنيميشن الظهور عند التمرير
    const elementsToAnimate = document.querySelectorAll('.element-to-animate');

    function checkVisibility() {
        elementsToAnimate.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            // لو العنصر ظاهر جزئياً في الشاشة (80% من الأسفل)
            if (elementTop < viewportHeight * 0.8 && elementBottom > 0) {
                element.classList.add('animate__animated'); // تأكد من وجود هذا الكلاس
                element.classList.add('animate__delay-0.2s'); // إضافة تأخير بسيط (اختياري)
                element.classList.add('animate__fast'); // سرعة أسرع شوية (اختياري)
                // يمكنك إضافة تأثيرات أنيميشن مختلفة هنا بناءً على العنصر إذا أردت
                if (element.id === 'photo-album') {
                    element.classList.add('animate__fadeInUp');
                } else if (element.id === 'social-links') {
                    element.classList.add('animate__slideInLeft');
                } else if (element.id === 'azkar-app') {
                    element.classList.add('animate__fadeIn');
                } else if (element.id === 'suggestions') {
                    element.classList.add('animate__slideInRight');
                }
                // يمكنك إضافة المزيد من الشروط للعناصر الأخرى
            }
        });
    }

    window.addEventListener('scroll', checkVisibility);
    checkVisibility(); // عشان نشيك أول مرة عند تحميل الصفحة
});