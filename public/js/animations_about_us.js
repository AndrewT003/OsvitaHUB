const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.3 });
  
  document.querySelectorAll(
    '.animate-about-title, .animate-about-img, .animate-about-text, ' +
    '.animate-services-title, .animate-services-img, .animate-services-text, .animate-lessons'
  ).forEach(el => observer.observe(el));
  