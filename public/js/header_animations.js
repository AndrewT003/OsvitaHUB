window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  const progressBar = document.getElementById('scrollProgressBar');
  progressBar.style.width = scrollPercent + '%';

  
});
  document.getElementById('menuToggle').addEventListener('click', function() {
    document.querySelector('header').classList.toggle('open');
});
