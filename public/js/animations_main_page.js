  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target); // анімація 1 раз
      }
    },
    { threshold: 0.1 }
  );

  const target = document.getElementById('FirsPartMainPage');
  if (target) observer.observe(target);


  document.addEventListener("DOMContentLoaded", function() {
    const section = document.querySelector("#consultationSection");
  
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.add("visible");
        }
      });
    }, {
      threshold: 0.5  // Це означає, що анімація почнеться, коли 50% елемента буде видимим
    });
  
    observer.observe(section);
  });
  

