document.querySelectorAll('.question-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const answer = toggle.nextElementSibling;
    const arrow = toggle.querySelector('.arrow');
    answer.classList.toggle('show');
    arrow.classList.toggle('rotate');
  });
});