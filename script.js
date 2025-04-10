// Nora-Mosque/script.js
document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const body = document.body; // Use document.body directly

    if (menuToggle && nav && header) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            // Adjust body padding dynamically based on nav height when opened/closed
            if (nav.classList.contains('open')) {
                // Calculate potential body padding based on header and nav height
                const headerHeight = header.offsetHeight;
                const navHeight = nav.scrollHeight; // Use scrollHeight for full potential height
                body.style.paddingTop = `${headerHeight + navHeight}px`;
                menuToggle.textContent = '✕'; // Change icon to 'X' when open
            } else {
                body.style.paddingTop = `${header.offsetHeight}px`; // Reset to header height
                menuToggle.textContent = '☰'; // Change icon back to hamburger
            }
        });

        // Close menu if user clicks outside the nav when it's open
        document.addEventListener('click', (event) => {
            const isClickInsideNav = nav.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            if (nav.classList.contains('open') && !isClickInsideNav && !isClickOnToggle) {
                nav.classList.remove('open');
                body.style.paddingTop = `${header.offsetHeight}px`; // Reset padding
                 menuToggle.textContent = '☰'; // Change icon back
            }
        });
    }

    // Reset menu and padding on window resize if going from mobile to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (nav && nav.classList.contains('open')) {
                nav.classList.remove('open');
                 menuToggle.textContent = '☰';
            }
            // Reset body padding if it was set by the mobile menu
            if (body.style.paddingTop !== '' && header) {
                 body.style.paddingTop = `${header.offsetHeight}px`; // Or set back to default CSS value
            }
        } else {
             // Ensure correct padding if resizing below 768px while menu is closed
             if (header && (!nav || !nav.classList.contains('open'))) {
                 body.style.paddingTop = `${header.offsetHeight}px`;
             }
        }
    });

    // --- Homepage Photo Album ---
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const albumImage = document.getElementById('album-image');
    // Ensure your image paths are correct and inside an array
    const images = [
        'mosque_images/image1.jpg',
        'mosque_images/image2.jpg',
        'mosque_images/image3.jpg',
        'mosque_images/image4.jpg',
        'mosque_images/image5.jpg',
        // Add more image paths here
    ];
    let currentIndex = 0;
    let isAnimating = false; // Flag to prevent rapid clicking

    function showImage(index) {
        if (!albumImage || images.length === 0 || isAnimating) return;
        isAnimating = true;

        albumImage.classList.add('fade-out'); // Start fade out

        // Wait for fade out transition to complete
        setTimeout(() => {
            currentIndex = (index + images.length) % images.length; // Handle wrap around
            albumImage.src = images[currentIndex];

            // Important: Let the browser update the src BEFORE starting fade in
            // Using a nested timeout (even 0ms) or requestAnimationFrame can help
            setTimeout(() => {
                albumImage.classList.remove('fade-out'); // Start fade in
                 // Reset flag after fade in starts (or completes)
                setTimeout(() => { isAnimating = false; }, 600); // Match transition duration
            }, 50); // Small delay

        }, 600); // Match transition duration
    }

    if (prevBtn && nextBtn && albumImage && images.length > 0) {
        // Initial image load (no animation)
        albumImage.src = images[currentIndex];

        prevBtn.addEventListener('click', () => {
            showImage(currentIndex - 1);
        });

        nextBtn.addEventListener('click', () => {
            showImage(currentIndex + 1);
        });

        // Optional: Auto-play functionality
        // setInterval(() => {
        //     showImage(currentIndex + 1);
        // }, 5000); // Change image every 5 seconds
    }

    // --- Set Active Navigation Link ---
    // Get the current page path
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'; // Default to index.html if path is '/'
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active'); // Add 'active' class to the current page link
        }
    });

});