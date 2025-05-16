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

// Стан введення (чи користувач торкався поля)
let touchedFields = {
  name: false,
  surname: false,
  email: false,
  phone: false,
  password: false
};

// Функція для налаштування валідації звичайних полів
function setupFieldValidation(field, regex, errorId, errorMessage) {
  const errorElement = document.getElementById(errorId);

  field.addEventListener('input', () => {
    touchedFields[field.name] = true;
    validate();
  });

  field.addEventListener('blur', () => {
    touchedFields[field.name] = true;
    validate();
  });

  function validate() {
    const isValid = regex.test(field.value);
    if (touchedFields[field.name]) {
      field.classList.toggle('invalid', !isValid);
      errorElement.textContent = isValid ? '' : errorMessage;
    }
    updateRegisterButtonState();
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

// Поля форми
const name = registerForm.name;
const surname = registerForm.surname;
const email = registerForm.email;
const phone = registerForm.phone;
const password = registerForm.password;

// Регулярки
const nameValid = /^[^\s][а-яА-Яa-zA-ZёЁіїІЇЄєґҐ'-]{1,}$/;
const phoneValid = /^\+380\d{9}$/;
const passwordValid = /^(?=.*[a-zA-Zа-яА-ЯіІїЇєЄґҐ])(?=.*[A-ZА-ЯІЇЄҐ])(?=.*\d).{8,}$/;
const emailValid = /^[а-яА-ЯёЁіІїЇєЄґҐa-zA-Z0-9._-]+@[а-яА-ЯёЁіІїЇєЄґҐa-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Стан email
let emailTimeout;
let emailTaken = false;

// Валідація email з серверною перевіркою
function validateEmailField() {
  const errorElement = document.getElementById('email-error');

  if (!emailValid.test(email.value)) {
    if (touchedFields.email) {
      email.classList.add('invalid');
      errorElement.textContent = 'Некоректний email';
    }
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
          if (touchedFields.email) {
            email.classList.add('invalid');
            errorElement.textContent = 'Email вже використовується';
          }
          emailTaken = true;
        } else {
          email.classList.remove('invalid');
          errorElement.textContent = '';
          emailTaken = false;
        }
        updateRegisterButtonState();
      })
      .catch(() => {
        if (touchedFields.email) {
          email.classList.add('invalid');
          errorElement.textContent = 'Помилка перевірки email';
        }
        emailTaken = true;
        updateRegisterButtonState();
      });
  }, 500);
}

// Прив’язка подій до email
email.addEventListener('input', () => {
  touchedFields.email = true;
  validateEmailField();
});
email.addEventListener('blur', () => {
  touchedFields.email = true;
  validateEmailField();
});
email.addEventListener('change', validateEmailField);

// Прив’язка валідації до кожного поля
setupFieldValidation(name, nameValid, 'name-error', 'Некоректне ім’я');
setupFieldValidation(surname, nameValid, 'surname-error', 'Некоректне прізвище');
setupFieldValidation(phone, phoneValid, 'phone-error', 'Номер має бути у форматі +380XXXXXXXXX');
setupFieldValidation(password, passwordValid, 'password-error', 'Пароль має бути не менше 8 символів і містити великі, малі літери та цифру');

// Увімкнути/вимкнути кнопку
function updateRegisterButtonState() {
  const allValid =
    nameValid.test(name.value) &&
    nameValid.test(surname.value) &&
    emailValid.test(email.value) &&
    phoneValid.test(phone.value) &&
    passwordValid.test(password.value) &&
    !emailTaken;

  registerBtn.disabled = !allValid;
}

// Авторизаційна логіка
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

  if (error === 'wrong-password' || error === 'email-not-found') {
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
      forgotLink.classList.remove('hidden');
    }
  }
});
