// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/Users.js';
import Student from '../models/Student.js'; // ⬅️ імпорт моделі студента

const router = express.Router();

// routes/auth.js
router.post('/register', async (req, res) => {
  const { name, surname, email, password, role, grade, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("Email вже використовується");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      surname,
      email,
      passwordHash,
      role: role || 'student'
    });

    await user.save();

    req.session.userId = user._id;
    req.session.role = user.role;

    if (user.role === 'student') {
      const student = new Student({
        userId: user._id,
        name: user.name,
        surname: user.surname,
        phone,
        grade,
        avatar: ''
      });
      await student.save();

      res.redirect('/student/dashboard');
    } else if (user.role === 'admin') {
      res.redirect('/admin_page');
    }

  } catch (err) {
    console.error('Помилка при реєстрації:', err);
    res.status(500).send("Помилка під час реєстрації");
  }
});


// ▶️ Авторизація
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send("Користувача не знайдено");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).send("Невірний пароль");

    req.session.userId = user._id;
    req.session.role = user.role;

    console.log('Сесія користувача:', req.session);

    if (user.role === 'student') {
      res.redirect('/student/dashboard');
    } else if (user.role === 'admin') {
      res.redirect('/admin_page');
    }
    else if (user.role === 'teacher') {
      res.redirect('/teacher/dashboard');
    }
  } catch (err) {
    console.error('Помилка при вході:', err);
    res.status(500).send("Помилка входу");
  }
});

// ▶️ Вихід
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login_page');
  });
});

export default router;
