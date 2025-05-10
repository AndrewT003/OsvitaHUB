// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/Users.js';
import Student from '../models/Student.js'; // ⬅️ імпорт моделі студента
import passport from 'passport';


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


router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login_page',
}), (req, res) => {
  console.log('🔐 Успішний вхід:', req.user);

  // Зберігаємо дані у сесію
  req.session.userId = req.user._id;
  req.session.role = req.user.role;

  // Перенаправлення за роллю
  const role = req.user.role;
  if (role === 'student') return res.redirect('/student/dashboard');
  if (role === 'teacher') return res.redirect('/teacher/dashboard');
  if (role === 'admin') return res.redirect('/admin_page');

  return res.redirect('/login_page'); // fallback
});





// ▶️ Вихід
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login_page');
  });
});

export default router;
