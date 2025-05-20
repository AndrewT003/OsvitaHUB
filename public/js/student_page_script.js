const alertMessage = document.getElementById('alertMessage');
const alertText = alertMessage?.querySelector('.alert-text');
const closeButton = alertMessage?.querySelector('.close-btn');

function showAlert(message, type = 'success') {
  if (!alertMessage || !alertText || !closeButton) return;

  alertText.textContent = message;
  alertMessage.classList.add('show');
  alertMessage.classList.remove('error', 'success');
  alertMessage.classList.add(type);

  const hide = () => {
    alertMessage.classList.remove('show');
  };

  closeButton.onclick = hide;
  setTimeout(hide, 10000);
}

document.addEventListener("DOMContentLoaded", function () {
  const messageScript = document.getElementById('server-message');
  const serverMessage = messageScript ? JSON.parse(messageScript.textContent) : '';

  if (serverMessage) {
    showAlert(serverMessage, 'success');
  }
});
