import express from 'express';
import Teacher from '../models/Teachers.js';
import Lesson from '../models/Lessons.js';

import upload from '../middleware/upload.js'; // додано

import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  if (!req.session.userId || req.session.role !== 'teacher') {
    return res.redirect('/login_page');
  }

  try {
    const teacher = await Teacher.findOne({ userId: req.session.userId });
    if (!teacher) return res.status(404).send("Вчителя не знайдено");

    const lessons = await Lesson.find({ teacherId: teacher._id })
      .populate({
        path: 'studentId',          // Поле для популяції
        model: 'Student',           // Модель, яку популюємо
        select: 'name surname grade phone' // Додаємо поле phone до вибірки
      });

    res.render('teacher_page', { teacher, lessons });
  } catch (err) {
    console.error('Помилка при завантаженні дашборду вчителя:', err);
    res.status(500).send("Помилка сервера");
  }
});



// GET: Форма редагування
router.get('/edit', async (req, res) => {
  if (!req.session.userId || req.session.role !== 'teacher') return res.redirect('/login');

  try {
    const teacher = await Teacher.findOne({ userId: req.session.userId });
    if (!teacher) return res.status(404).send("Вчителя не знайдено");
    res.render('edit_teacher', { teacher });
  } catch (err) {
    console.error('Помилка при відкритті форми редагування:', err);
    res.status(500).send("Помилка сервера");
  }
});

// POST: Збереження з фото
router.post('/edit', upload.single('avatar'), async (req, res) => {
  if (!req.session.userId || req.session.role !== 'teacher') return res.redirect('/login');

  const { name, surname, phone, bio, experience, subjects } = req.body;

  try {
    const teacher = await Teacher.findOne({ userId: req.session.userId });
    if (!teacher) return res.status(404).send("Вчителя не знайдено");

    // Якщо нове фото, видалити старе
    if (req.file && teacher.avatar) {
      const oldPath = path.join('public', teacher.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Оновлення
    teacher.name = name;
    teacher.surname = surname;
    teacher.phone = phone;
    teacher.bio = bio;
    teacher.experience = experience;
    teacher.subjects = subjects.split(',').map(s => s.trim());
    if (req.file) {
      teacher.avatar = '/uploads/teachers/' + req.file.filename;
    }

    await teacher.save();
    res.redirect('/teacher/dashboard');
  } catch (err) {
    console.error('Помилка при оновленні профілю вчителя:', err);
    res.status(500).send("Помилка сервера");
  }
});

export default router;
