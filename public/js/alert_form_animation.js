  const form = document.querySelector('.consultation-form');
  const alertMessage = document.getElementById('alertMessage');
  const alertIcon = alertMessage.querySelector('.alert-icon');
  const alertText = alertMessage.querySelector('.alert-text');
  const closeButton = alertMessage.querySelector('.close-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Запобігаємо перезавантаженню сторінки при відправці

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      subject: formData.get('subject'),
      grade: formData.get('grade'),
      email: formData.get('email'),
      phone: formData.get('phone'),
    };

    try {
      const response = await fetch('/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showAlert('Дякуємо вам за довіру', 'success');
        showAlert('Заявка успішно надіслана!', 'success');
      } else {
        showAlert('Сталася помилка при надсиланні.', 'error');
      }
    } catch (error) {
      showAlert('Сталася помилка. Спробуйте пізніше.', 'error');
    }
  });

  function showAlert(message, type) {
    const pageContent = document.getElementById('pageContent');
  
    alertText.textContent = message;
    alertMessage.classList.add('show');
    pageContent.classList.add('blur'); // блюрити фон
  
    if (type === 'success') {
      alertMessage.classList.add('success');
      alertMessage.classList.remove('error');
    } else if (type === 'error') {
      alertMessage.classList.add('error');
      alertMessage.classList.remove('success');
    }
  
    const hideAlert = () => {
      alertMessage.classList.remove('show');
      pageContent.classList.remove('blur'); // зняти блюр
    };
  
    closeButton.onclick = hideAlert;
    setTimeout(hideAlert, 500000);
  }
  

