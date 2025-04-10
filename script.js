// Nora-Mosque/script.js
document.addEventListener('DOMContentLoaded', function() {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const body = document.body;

    if (menuToggle && nav && header) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            if (nav.classList.contains('open')) {
                const headerHeight = header.offsetHeight;
                const navHeight = nav.scrollHeight;
                body.style.paddingTop = `${headerHeight + navHeight}px`;
                menuToggle.textContent = '✕';
            } else {
                body.style.paddingTop = `${header.offsetHeight}px`;
                menuToggle.textContent = '☰';
            }
        });

        document.addEventListener('click', (event) => {
            const isClickInsideNav = nav.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            if (nav.classList.contains('open') && !isClickInsideNav && !isClickOnToggle) {
                nav.classList.remove('open');
                body.style.paddingTop = `${header.offsetHeight}px`;
                 menuToggle.textContent = '☰';
            }
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            if (nav && nav.classList.contains('open')) {
                nav.classList.remove('open');
                 menuToggle.textContent = '☰';
            }
            if (body.style.paddingTop !== '' && header) {
                 body.style.paddingTop = `${header.offsetHeight}px`;
            }
        } else {
             if (header && (!nav || !nav.classList.contains('open'))) {
                 body.style.paddingTop = `${header.offsetHeight}px`;
             }
        }
    });

    // --- Homepage Photo Album (Improved Timing) ---
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const albumImage = document.getElementById('album-image');
    const images = [
        'mosque_images/image1.jpg',
        'mosque_images/image2.jpg',
        'mosque_images/image3.jpg',
        'mosque_images/image4.jpg',
        'mosque_images/image5.jpg',
        // Add more image paths here
    ];
    let currentIndex = 0;
    let isAnimating = false; // Flag to prevent rapid clicking during transition

    // Function to show image with fade transition
    function showImage(index) {
        // Exit if elements don't exist, no images, or animation is already running
        if (!albumImage || images.length === 0 || isAnimating) return;

        isAnimating = true; // Set flag to prevent further clicks
        albumImage.classList.add('fade-out'); // Start fade-out animation

        // Wait for the fade-out transition to complete (duration defined in CSS: 0.6s = 600ms)
        setTimeout(() => {
            // Calculate the new index, handling wrap-around
            currentIndex = (index + images.length) % images.length;
            // Update the image source
            albumImage.src = images[currentIndex];

            // Allow a very brief moment for the browser to register the src change
            // before starting the fade-in animation. 50ms is usually sufficient.
            setTimeout(() => {
                // Remove the fade-out class to trigger the fade-in animation (opacity back to 1)
                albumImage.classList.remove('fade-out');

                // Reset the animation flag *after* the fade-in transition is complete (another 600ms)
                // This ensures the user cannot click again until the new image is fully visible.
                setTimeout(() => {
                    isAnimating = false;
                }, 600); // Match the CSS transition duration for fade-in

            }, 50); // Short delay

        }, 600); // Match the CSS transition duration for fade-out
    }

    // Initial setup if album elements exist
    if (prevBtn && nextBtn && albumImage && images.length > 0) {
        // Load the first image without animation initially
        albumImage.src = images[currentIndex];

        // Add event listeners for previous and next buttons
        prevBtn.addEventListener('click', () => {
            showImage(currentIndex + 1); // Note: Your prev button had '>' text, implying next? Corrected logic based on common patterns. Adjust if needed.
        });

        nextBtn.addEventListener('click', () => {
            showImage(currentIndex - 1); // Note: Your next button had '<' text, implying previous? Corrected logic based on common patterns. Adjust if needed.
        });

        // Optional: Auto-play functionality (uncomment to enable)
        // setInterval(() => {
        //     showImage(currentIndex + 1); // Go to next image
        // }, 5000); // Change image every 5 seconds
    }


    // --- Set Active Navigation Link ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        // Handle cases where href might be empty or just '#'
        const linkHref = link.getAttribute('href');
        if (linkHref) {
            const linkPage = linkHref.split('/').pop();
             // Make comparison robust for root path vs index.html
            if (linkPage === currentPage || (currentPage === 'index.html' && linkPage === '')) {
                link.classList.add('active');
            }
        }
    });

});