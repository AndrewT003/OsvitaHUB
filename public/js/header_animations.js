  let lastScrollY = window.scrollY;
  const header = document.querySelector('header');

  let isHidden = false;

  function hideHeader() {
    header.classList.add('hidden');
    header.classList.remove('revealed-by-hover');
    isHidden = true;
  }

  function showHeader() {
    header.classList.remove('hidden');
    header.classList.remove('revealed-by-hover');
    isHidden = false;
  }

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
      // Скрол вниз — сховати
      hideHeader();
    } else if (currentScrollY < lastScrollY) {
      // Скрол вгору — показати
      showHeader();
    }

    lastScrollY = currentScrollY;
  });

  // Відстежуємо мишу по всій сторінці
  document.addEventListener('mousemove', (e) => {
    if (!isHidden) return;

    // Якщо мишка вгорі сторінки (у межах 80px) — показати header
    if (e.clientY < 80) {
      header.classList.add('revealed-by-hover');
    } else {
      header.classList.remove('revealed-by-hover');
    }
  });

  document.getElementById('menuToggle').addEventListener('click', function() {
    document.querySelector('header').classList.toggle('open');
});


