/* =====================
   NAVIGATION
===================== */

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.add('hidden');
  });

  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick')?.includes(tabId)) {
      item.classList.add('active');
    }
  });

  closeNav();
}

function openNav() {
  const nav = document.getElementById("mySidenav");
  if (nav) nav.style.width = "280px";
}

function closeNav() {
  const nav = document.getElementById("mySidenav");
  if (nav) nav.style.width = "0";
}

/* =====================
   LAZY LOAD IMAGES (CDN)
===================== */

document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add("loaded");
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: "200px"
  });

  images.forEach(img => observer.observe(img));
});
