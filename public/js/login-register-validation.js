// Функція для зміни виду пароля
function togglePassword(button) {
  const input = button.previousElementSibling;
  if (input.type === 'password') {
    input.type = 'text';
    button.textContent = '🔒';
  } else {
    input.type = 'password';
    button.textContent = '🔓';
  }
}

// Функції для перемикання форм реєстрації/авторизації
function showRegister() {
  document.getElementById('formsContainer').style.transform = 'translateX(-50%)';
}

function showLogin() {
  document.getElementById('formsContainer').style.transform = 'translateX(0%)';
}

// Референси до форм
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Кнопки
const registerBtn = document.getElementById('register-submit');
const submitLoginButton = document.getElementById('submit-login-button');

// Валідація полів реєстрації
const name = registerForm.name;
const surname = registerForm.surname;
const email = registerForm.email;
const phone = registerForm.phone;
const password = registerForm.password;

const nameValid = /^[^\s][а-яА-Яa-zA-ZёЁіїІЇЄєґҐ'-]{1,}$/;
const phoneValid = /^\+380\d{9}$/;
const passwordValid = /^(?=.*[a-zA-Zа-яА-ЯіІїЇєЄґҐ])(?=.*[A-ZА-ЯІЇЄҐ])(?=.*\d).{8,}$/;
const emailValid = /^[а-яА-ЯёЁіІїЇєЄґҐa-zA-Z0-9._-]+@[а-яА-ЯёЁіІїЇєЄґҐa-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Логіка для кнопки реєстрації
function updateRegisterButtonState() {
  const allValid =
    nameValid.test(name.value) &&
    nameValid.test(surname.value) &&
    emailValid.test(email.value) &&
    phoneValid.test(phone.value) &&
    passwordValid.test(password.value);

  registerBtn.disabled = !allValid;
}

let emailTimeout;
let emailTaken = false;

// Валідація email під час реєстрації
function validateEmailField() {
  if (!emailValid.test(email.value)) {
    email.classList.add('invalid');
    document.getElementById('email-error').textContent = 'Некоректний email';
    emailTaken = false;
    updateRegisterButtonState();
    return;
  }

  clearTimeout(emailTimeout);
  emailTimeout = setTimeout(() => {
    fetch(`/check-email?email=${encodeURIComponent(email.value)}`)
      .then(response => response.json())
      .then(data => {
        if (data.exists) {
          email.classList.add('invalid');
          document.getElementById('email-error').textContent = 'Email вже використовується';
          emailTaken = true;
        } else {
          email.classList.remove('invalid');
          document.getElementById('email-error').textContent = '';
          emailTaken = false;
        }
        updateRegisterButtonState();
      })
      .catch(() => {
        email.classList.add('invalid');
        document.getElementById('email-error').textContent = 'Помилка перевірки email';
        emailTaken = true;
        updateRegisterButtonState();
      });
  }, 500);
}

email.addEventListener('input', validateEmailField);
email.addEventListener('change', validateEmailField);
email.addEventListener('blur', validateEmailField);

// Валідація пароля під час реєстрації
registerForm.addEventListener('input', () => {
  name.classList.toggle('invalid', !nameValid.test(name.value));
  document.getElementById('name-error').textContent = nameValid.test(name.value) ? '' : 'Некоректне ім’я';

  surname.classList.toggle('invalid', !nameValid.test(surname.value));
  document.getElementById('surname-error').textContent = nameValid.test(surname.value) ? '' : 'Некоректне прізвище';

  phone.classList.toggle('invalid', !phoneValid.test(phone.value));
  document.getElementById('phone-error').textContent = phoneValid.test(phone.value) ? '' : 'Номер має бути у форматі +380XXXXXXXXX';

  password.classList.toggle('invalid', !passwordValid.test(password.value));
  document.getElementById('password-error').textContent = passwordValid.test(password.value)
    ? '' : 'Пароль має бути не менше 8 символів і містити великі, малі літери та цифру';

  updateRegisterButtonState();
});



 window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    const emailField = document.querySelector('input[name="email"]');
    const passwordField = document.querySelector('input[name="password"]');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');

    if (error === 'wrong-password') {
      passwordField.classList.add('invalid');
      passwordError.textContent = 'Неправильний пароль';
    }

    if (error === 'email-not-found') {
      emailField.classList.add('invalid');
      emailError.textContent = 'Користувача з такою поштою не знайдено';
    }
  });
