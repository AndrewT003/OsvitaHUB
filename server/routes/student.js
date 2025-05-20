import express from 'express';
import Student from '../models/Student.js';
import Lesson from '../models/Lessons.js';
import Teacher from '../models/Teachers.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login_page');
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
      return res.status(400).send('Невалідний ID користувача');
    }

    const student = await Student.findOne({ userId: req.session.userId });
    if (!student) return res.status(404).send('Студента не знайдено');

    const lessons = await Lesson.find({ studentId: student._id }).populate('teacherId');

    const message = req.session.verificationSuccess;
    req.session.verificationSuccess = null;

    res.render('student_page', { student, lessons, message });
  } catch (error) {
    console.error('Помилка при завантаженні дашборду:', error);
    res.status(500).send("Помилка при завантаженні сторінки");
  }
});




router.get('/edit', async (req, res) => {
  console.log('Сесія:', req.session);  // Додаємо лог для перевірки сесії
  try {
    const student = await Student.findOne({ userId: req.session.userId });
    if (!student) return res.status(404).send('Студента не знайдено');
    res.render('edit_student', { student });
  } catch (err) {
    console.error('Помилка при отриманні профілю:', err);
    res.status(500).send('Помилка сервера');
  }
});


// POST — збереження редагованого профілю
router.post('/edit', async (req, res) => {
  try {
    const { name, surname, grade, phone } = req.body;

    const updatedStudent = await Student.findOneAndUpdate(
      { userId: req.session.userId },
      { name, surname, grade, phone },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).send('Студента не знайдено');
    }

    res.redirect('/student/dashboard');
  } catch (err) {
    console.error('Помилка при збереженні профілю:', err);
    res.status(500).send('Помилка сервера');
  }
});

export default router;
