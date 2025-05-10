document.querySelectorAll('.buy-button').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const lessonId = btn.getAttribute('data-id');
    const lessonTitle = btn.getAttribute('data-title');

    const res = await fetch('/api/is-authenticated');
    const data = await res.json();

    if (data.authenticated) {
      showConfirmModal(lessonId, lessonTitle);
    } else {
      showGuestFormModal(lessonId, lessonTitle);
    }
  });
});

function showConfirmModal(lessonId, title) {
  const modal = document.createElement('div');
  modal.classList.add('modal-backdrop');
  modal.innerHTML = `
    <div class="modal">
      <h2 style="color: black;">Підтвердити покупку</h2>
      <p style="color: black;">Ви дійсно хочете купити: <strong>${title}</strong>?</p>
      <button onclick="submitPurchase('${lessonId}')">Підтвердити</button>
      <button onclick="closeModal()">Скасувати</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showGuestFormModal(lessonId, title) {
  const modal = document.createElement('div');
  modal.classList.add('modal-backdrop');
  modal.innerHTML = `
    <div class="modal">
      <h2 style="color: black;">Заповніть форму</h2>
      <p style="color: black;">Щоб купити <strong>${title}</strong>, вкажіть дані:</p>
      <form onsubmit="submitGuestPurchase(event, '${lessonId}')">
        <input type="text" name="name" placeholder="Ім’я" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="tel" name="phone" placeholder="Телефон" required>
        <button type="submit">Придбати</button>
        <button type="button" onclick="closeModal()">Скасувати</button>
      </form>
      <h3 style="color: black;">Рекомендуємо <a style="color: #fdb446;" href="/login_page"> Зареєструватися </a></h3>
    </div>
  `;
  document.body.appendChild(modal);
}

function submitPurchase(lessonId) {
  fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId })
  }).then(() => {
    closeModal();
    const alertBox = document.getElementById('alertMessage');
    if (alertBox) alertBox.classList.add('show');
    setTimeout(() => closeAlert(), 5000);
  });
}

function submitGuestPurchase(e, lessonId) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value;
  const email = form.email.value;
  const phone = form.phone.value;

  fetch('/api/purchase-guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, name, email, phone })
  }).then(() => {
    closeModal();
    const alertBox = document.getElementById('alertMessage');
    if (alertBox) alertBox.classList.add('show');
    setTimeout(() => closeAlert(), 5000);
  });
}

function closeModal() {
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.remove();
}

function closeAlert() {
  const alertBox = document.getElementById('alertMessage');
  if (alertBox) alertBox.classList.remove('show');
}
