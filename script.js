document.addEventListener('DOMContentLoaded', function() {
    const headerInner = document.querySelector('.header-inner');
    const nav = document.querySelector('nav');
    const body = document.querySelector('body');
    const menuToggle = headerInner ? headerInner.querySelector('::after') : null; // محاولة استهداف عنصر ::after (قد لا يعمل بشكل مباشر)
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const albumImage = document.getElementById('album-image');
    const images = [
        'mosque_images/image1.jpg',
        'mosque_images/image2.jpg',
        'mosque_images/image3.jpg',
        'mosque_images/image4.jpg',
        'mosque_images/image5.jpg',
        // يمكنك إضافة المزيد من أسماء الصور هنا مثل 'mosque_images/image3.jpg'
    ];
    let currentIndex = 0;

    // وظيفة ألبوم الصور في الصفحة الرئيسية
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

    // إغلاق القائمة وإزالة تأثير الخلفية عند تغيير حجم الشاشة إلى أكبر من 768 بكسل
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            nav.classList.remove('open');
            body.classList.remove('menu-open');
        }
    });
});