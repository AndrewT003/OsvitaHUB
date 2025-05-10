import express from 'express';

const router = express.Router();

// Авторизована покупка
router.post('/purchase', (req, res) => {
  const user = req.user;
  const { lessonId } = req.body;

  if (!user) {
    return res.status(401).json({ error: 'Неавторизовано' });
  }

  // TODO: зберегти покупку в БД
  console.log(`User ${user.email} купив урок ${lessonId}`);
  res.json({ success: true });
});

// Гостьова покупка
router.post('/purchase-guest', (req, res) => {
  const { lessonId, name, email, phone } = req.body;

  if (!lessonId || !name || !email || !phone) {
    return res.status(400).json({ error: 'Не всі поля заповнені' });
  }

  // TODO: зберегти заявку в БД або надіслати повідомлення адміну
  console.log(`Гість купив урок ${lessonId}. Дані: ${name}, ${email}, ${phone}`);
  res.json({ success: true });
});

export default router;
