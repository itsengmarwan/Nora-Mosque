document.addEventListener('DOMContentLoaded', function() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const albumImage = document.getElementById('album-image');
    const images = [
        'https://source.unsplash.com/random/600x400/?mosque&sig=1',
        'https://source.unsplash.com/random/600x400/?mosque&sig=2',
        'https://source.unsplash.com/random/600x400/?mosque&sig=3'
        // يمكنك إضافة المزيد من الروابط هنا
    ];
    let currentIndex = 0;

    if (prevBtn && nextBtn && albumImage) {
        albumImage.src = images[currentIndex]; // عرض الصورة الأولى عند التحميل

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