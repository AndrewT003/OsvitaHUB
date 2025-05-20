import express from 'express';
import FeedbackText from '../models/Text_feedback.js';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const router = express.Router();

// Показати відгуки з пагінацією
router.get('/feedbacks', async (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const limit = 10;

  try {
    const feedbacks = await FeedbackText.find()
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Обчислюємо середній рейтинг на основі всіх відгуків (без пагінації)
    const allFeedbacks = await FeedbackText.find();
    const ratings = allFeedbacks
      .map(fb => Number(fb.rating))
      .filter(r => !isNaN(r));

    const totalRatings = ratings.reduce((sum, r) => sum + r, 0);
    const avgRating = ratings.length ? (totalRatings / ratings.length).toFixed(1) : null;

    // Якщо це AJAX-запит — віддаємо JSON (тут можна також додати avgRating, якщо потрібно)
    if (req.xhr) {
      return res.json({ feedbacks });
    }

    // Інакше рендеримо всю сторінку з середнім рейтингом
    res.render('feedbacks', { feedbacks, avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка сервера');
  }
});



router.post('/feedbacks', async (req, res) => {
  const { email, text, rating } = req.body;

  try {
    await FeedbackText.create({ email, text, rating });

    // Надіслати подяку на email користувача
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Дякуємо за ваш відгук!',
      text: `Дякуємо, що залишили відгук!\n\nОцінка: ${rating}/5\nВаш відгук: "${text}"\n\nНам дуже важлива ваша думка.`,
    });

    res.redirect('/feedbacks');
  } catch (err) {
    console.error('Помилка збереження або надсилання email:', err);
    res.status(400).send('Помилка при надсиланні відгуку');
  }
});

export default router;
