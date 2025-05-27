import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/Users.js';
import Student from '../models/Student.js';
import passport from 'passport';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// Email check
router.get('/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ exists: false });
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (err) {
    console.error('Помилка при перевірці email:', err);
    res.status(500).json({ exists: false });
  }
});

// ✅ Реєстрація з верифікацією пошти
router.post('/register', async (req, res) => {
  const { name, surname, email, password, role, grade, phone } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("Email вже використовується");

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      surname,
      email,
      passwordHash,
      role: role || 'student',
      verifyToken,
      isVerified: false
    });

    await user.save();

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
    }

    // Надсилання email для підтвердження
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    const verifyLink = `http://${req.headers.host}/verify-email?token=${verifyToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Підтвердження реєстрації',
      text: `Привіт, ${user.name}! Підтвердіть свою пошту за посиланням: ${verifyLink}`
    };

    await transporter.sendMail(mailOptions);

  res.status(200).json({ success: true, message: "Реєстрація успішна. Перевірте вашу пошту для підтвердження." });
  } catch (err) {
    console.error('Помилка при реєстрації:', err);
    res.status(500).send("Помилка під час реєстрації");
  }
});

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).render('error_page', {
      title: 'Некоректне посилання',
      message: 'Посилання для підтвердження некоректне або відсутнє.'
    });
  }

  try {
    const user = await User.findOne({ verifyToken: token });

    if (!user) {
      return res.status(400).render('error_page_for_terminate_code', {
        title: 'Недійсний код',
        message: 'Цей код вже використано або він протермінований. Ви можете запросити новий код.'
      });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.verificationSuccess = 'Пошта успішно підтверджена! Ви увійшли в систему.';

    if (user.role === 'student') return res.redirect('/student/dashboard');
    if (user.role === 'teacher') return res.redirect('/teacher/dashboard');
    if (user.role === 'admin') return res.redirect('/admin_page');

    return res.redirect('/login_page');
  } catch (err) {
    console.error(err);
    res.status(500).render('error_page_for_terminate_code', {
      title: 'Помилка',
      message: 'Щось пішло не так при підтвердженні пошти. Спробуйте пізніше.'
    });
  }
});



router.post('/login', async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.redirect('/login_page?error=email-not-found');
  }

  // ✅ Перевірка підтвердження тільки для student
  if (user.role === 'student' && !user.isVerified) {
    return res.redirect('/login_page?error=email-not-verified');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/login_page?error=wrong-password');
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      req.session.userId = user._id;
      req.session.role = user.role;

      if (user.role === 'student') return res.redirect('/student/dashboard');
      if (user.role === 'teacher') return res.redirect('/teacher/dashboard');
      if (user.role === 'admin') return res.redirect('/admin_page');

      return res.redirect('/login_page');
    });
  })(req, res, next);
});


// Забули пароль
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, message: null });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.render('forgot-password', {
      error: 'Користувача з такою поштою не знайдено',
      message: null
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000;

  user.resetCode = code;
  user.resetCodeExpires = expires;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: 'Код для скидання пароля',
    text: `Ваш код для скидання пароля: ${code}. Він дійсний протягом 10 хвилин.`
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('Email error:', err);
      return res.render('forgot-password', {
        error: 'Не вдалося надіслати код',
        message: null
      });
    }

    res.redirect(`/reset-code?email=${encodeURIComponent(user.email)}`);
  });
});

// Скидання пароля
router.get('/reset-code', (req, res) => {
  res.render('reset-code', {
    email: req.query.email || '',
    error: null,
    message: null
  });
});

router.post('/reset-code', async (req, res) => {
  const { email, code, password, confirmPassword } = req.body;

  if (!email || !code || !password || password !== confirmPassword) {
    return res.render('reset-code', {
      email,
      error: 'Невірні дані або паролі не збігаються',
      message: null
    });
  }

  const user = await User.findOne({
    email,
    resetCode: code,
    resetCodeExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.render('reset-code', {
      email,
      error: 'Код недійсний або протермінований',
      message: null
    });
  }

  // Перевірка: новий пароль не повинен збігатися зі старим
  const isSamePassword = await bcrypt.compare(password, user.passwordHash);
  if (isSamePassword) {
    return res.render('reset-code', {
      email,
      error: 'Новий пароль не може збігатися з попереднім',
      message: null
    });
  }

  // Зберегти новий пароль
  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();

  res.render('reset-code', {
    email: '',
    error: null,
    message: 'Пароль успішно оновлено. Тепер ви можете увійти.'
  });
});

// Вихід
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login_page');
  });
});

export default router;
