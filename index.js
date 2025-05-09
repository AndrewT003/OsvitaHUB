import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import session from 'express-session';
import AboutUsPage from './server/routes/pages.js';
import adminRoutes from './server/routes/admin.js';
import studentRoutes from './server/routes/student.js';
import login_page from './server/routes/login.js';
import authRoutes from './server/routes/auch.js';
import LessonPlan from './server/models/LessonsPlan.js';
import connectDB from './server/js/database.js';
import { cleanUpLessons } from './server/middleware/cleanupTasks.js';
import teacherRoutes from './server/routes/teacher.js';
import moment from 'moment-timezone';
import emailRoutes from './server/routes/email.js';



const app = express();
const PORT = 3000;

// Щоб працював __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EJS + moment
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.moment = moment;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Сесії
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Статика
app.use(express.static('public'));
app.use(express.static('server'));

// Основні маршрути
AboutUsPage(app);
app.use(adminRoutes);
app.use(authRoutes);
login_page(app);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use(emailRoutes); // або app.use('/email', emailRoutes) якщо хочеш префікс


// Головна сторінка
app.get('/', async (req, res) => {
  try {
    const lessonPlans = await LessonPlan.find().sort({ lessonCount: 1 });
    res.render('index', { lessonPlans });
  } catch (error) {
    console.error('Помилка при завантаженні планів:', error);
    res.status(500).send('Помилка сервера');
  }
});

// Підключення до MongoDB і запуск сервера
connectDB().then(async () => {
  // Очищення уроків після запуску
  await cleanUpLessons();

  // (Необов’язково) автоматичне очищення щогодини
  setInterval(cleanUpLessons, 60 * 60 * 1000); // кожну годину


  // Обробник 404 — якщо маршрут не знайдено
app.use((req, res, next) => {
  console.warn(`Маршрут не знайдено: ${req.originalUrl}`);
  res.redirect('/');
});


  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
  });

}).catch((err) => {
  console.error('❌ Помилка підключення до MongoDB:', err);
});
