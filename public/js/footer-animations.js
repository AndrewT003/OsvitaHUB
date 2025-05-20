 document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.querySelector('.phone-wrapper');
    const number = wrapper.querySelector('.phone-number');

    wrapper.addEventListener('mouseenter', () => {
      number.style.opacity = '1';
      number.style.transform = 'translateY(-50%) translateX(10px)';
      number.style.visibility = 'visible';
    });

    // Видаляємо подію після першого наведення, щоб залишалось назавжди
    wrapper.addEventListener('mouseenter', function handler() {
      wrapper.removeEventListener('mouseenter', handler);
    });
  });