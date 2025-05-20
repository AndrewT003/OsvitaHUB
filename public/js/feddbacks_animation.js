  const xAxis = document.getElementById("xAxis");

  // Після завершення анімації осі, запускаємо зростання стовпчиків
  xAxis.addEventListener("animationend", () => {
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar, index) => {
      setTimeout(() => {
        const height = bar.getAttribute("data-height");
        bar.style.animation = "growBar 0.8s ease-out forwards";
        bar.style.height = height + "px";
      }, 300 * index); // Затримка між стовпчиками
    });
  });

  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('rating-value');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.getAttribute('data-value'));

      // Оновити значення hidden input
      ratingInput.value = value;

      // Перемалювати зірки
      stars.forEach((s, index) => {
        s.textContent = index < value ? '★' : '☆';
      });
    });
  });


  let skip = 10; // бо перші 3 вже виведені
const limit = 10;

document.getElementById('load-more').addEventListener('click', async () => {
  const res = await fetch(`/feedbacks?skip=${skip}`, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  });

  const data = await res.json();
  const newFeedbacks = data.feedbacks;
  const container = document.getElementById('feedback-list');

  newFeedbacks.forEach(fb => {
    const item = document.createElement('div');
    item.className = 'feedback-item';

    const stars = Array.from({ length: 5 }, (_, i) => {
      return `<span style="color: ${i < fb.rating ? '#FFD700' : '#ccc'};">★</span>`;
    }).join('');

    item.innerHTML = `
      <p><strong>${fb.email}</strong></p>
      <p>${fb.text}</p>
      <p>${stars}</p>
      <small>${new Date(fb.createdAt).toLocaleDateString()}</small>
    `;

    container.appendChild(item);
  });

  skip += limit;

  if (newFeedbacks.length < limit) {
    const btn = document.getElementById('load-more');
    btn.disabled = true;
    btn.textContent = 'Усі відгуки завантажено';
  }
});

  const form = document.getElementById('feedback-form');
  const errorText = document.getElementById('rating-error');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      ratingInput.value = value;

      // Змінюємо кольори зірок
      stars.forEach((s, i) => {
        s.textContent = i < value ? '★' : '☆';
      });

      // При виборі зірки ховаємо повідомлення про помилку
      errorText.style.display = 'none';
    });
  });

  form.addEventListener('submit', (e) => {
    if (parseInt(ratingInput.value) === 0) {
      e.preventDefault(); // Зупиняємо відправку форми
      errorText.style.display = 'block';
    }
  });
