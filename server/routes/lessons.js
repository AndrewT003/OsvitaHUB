import express from 'express';
import LessonPlan from '../models/LessonsPlan.js';
import Users from '../models/Users.js'; // 🔥 Імпортуємо модель користувача
import Student from '../models/Student.js'; // Імпортуємо модель Student
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Не забудь активувати dotenv, якщо не зроблено

const router = express.Router();

router.get('/lessons', async (req, res) => {
  try {
    const lessons = await LessonPlan.find();
    res.render('lessons', { lessons });
  } catch (error) {
    console.error('Помилка при завантаженні уроків:', error);
    res.status(500).send('Помилка сервера');
  }
});

router.get('/api/is-authenticated', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// 🔐 Покупка для авторизованих користувачів
router.post('/api/purchase', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Ви не авторизовані' });
  }

  const { lessonId } = req.body;

  try {
    const lesson = await LessonPlan.findById(lessonId);
    const userFromDb = await Users.findById(req.user._id); // Дані з User
    const student = await Student.findOne({ userId: userFromDb._id }); // Дані з Student

    const userEmail = userFromDb.email || 'невідомо';
    const userName = `${userFromDb.name || ''} ${userFromDb.surname || ''}`.trim();
    const userPhone = student?.phone || 'невідомо'; // Беремо телефон зі Student

    sendPurchaseEmail(lesson, userEmail, userName, userPhone);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Помилка при покупці:', error);
    res.status(500).json({ success: false, message: 'Помилка при оформленні покупки' });
  }
});

// 🧾 Покупка для гостей
router.post('/api/purchase-guest', async (req, res) => {
  const { lessonId, name, email, phone } = req.body;

  try {
    const lesson = await LessonPlan.findById(lessonId);
    sendPurchaseEmail(lesson, email, name, phone);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Помилка при покупці для гостя:', error);
    res.status(500).json({ success: false, message: 'Помилка при оформленні покупки' });
  }
});

// 📧 Відправлення email
function sendPurchaseEmail(lesson, userEmail, userName = 'Невідомий', userPhone = 'Невідомий') {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Нова покупка: ${lesson.title}`,
    text: `Користувач ${userName} (Email: ${userEmail}, Телефон: ${userPhone}) придбав урок "${lesson.title}".`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Помилка при надсиланні листа:', error);
    } else {
      console.log('Лист надіслано: ' + info.response);
    }
  });
}

export default router;
