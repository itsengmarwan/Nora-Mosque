document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('header');
    const body = document.querySelector('body');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const albumImage = document.getElementById('album-image');
    const images = [
        'mosque_images/image1.jpg',
        'mosque_images/image2.jpg'
        // يمكنك إضافة المزيد من أسماء الصور هنا مثل 'mosque_images/image3.jpg'
    ];
    let currentIndex = 0;

    function adjustBodyPadding() {
        if (header && body && window.innerWidth <= 768) {
            const headerHeight = header.offsetHeight;
            body.style.paddingTop = `${headerHeight}px`;
        } else if (body) {
            body.style.paddingTop = '60px'; // القيمة الأصلية للشاشات الأكبر
        }
    }

    // ضبط الحشو عند تحميل الصفحة
    adjustBodyPadding();

    // ضبط الحشو عند تغيير حجم النافذة
    window.addEventListener('resize', adjustBodyPadding);

    // وظيفة ألبوم الصور
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
});