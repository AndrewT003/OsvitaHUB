import express from 'express';
import bcrypt from 'bcrypt'
import Users from '../models/Users.js';
import Teacher from '../models/Teachers.js';
import Student from '../models/Student.js';
import Lesson from '../models/Lessons.js';  // Ось тут потрібно імпортувати модель Lesson
import LessonPlan from '../models/LessonsPlan.js';  // Імпорт моделі LessonPlan




const router = express.Router();



// Middleware для перевірки, що користувач є адміном
function isAdmin(req, res, next) {
  if (req.session.userId && req.session.role === 'admin') {
    return next(); // Доступ дозволено
  }
  return res.redirect('/login_page'); // Якщо не адмін, переадресація
}


router.get('/admin_page', isAdmin, async (req, res) => {
  try {
    // Завантажуємо всі уроки з популяцією для студентів та вчителів
    const lessons = await Lesson.find()
      .populate({
        path: 'studentId',  // Популяція для студентів
        model: 'Student',    // Модель студентів
        select: 'name surname grade phone' // Вибірка полів студентів
      })
      .populate({
        path: 'teacherId',  // Популяція для вчителів
        model: 'Teacher',
        select: 'name surname'  // Вибірка полів вчителів
      });

    // Завантажуємо всі плани уроків
    const lessonPlans = await LessonPlan.find(); // Завантаження всіх планів уроків

    // Після завантаження передаємо їх в шаблон
    res.render('admin_page', { lessons, lessonPlans });  // Передаємо lessonPlans в шаблон
  } catch (err) {
    console.error('Помилка при завантаженні уроків:', err);
    res.status(500).send("Помилка при завантаженні даних");
  }
});




router.post('/update-lesson-plan', async (req, res) => {
  const { lessonPlanId, price, description } = req.body;

  try {
    // Готуємо лише ті поля, які потрібно оновити
    const updateFields = {};
    if (price !== undefined && price !== '') updateFields.price = price;
    if (description !== undefined && description !== '') updateFields.description = description;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send('Немає даних для оновлення');
    }

    const updatedPlan = await LessonPlan.findByIdAndUpdate(
      lessonPlanId,
      updateFields,
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).send("План уроку не знайдено");
    }

    res.redirect('/admin_page');
  } catch (err) {
    console.error('Помилка при оновленні плану уроку:', err);
    res.status(500).send('Помилка при оновленні плану уроку');
  }
});


router.post('/create-user', async (req, res) => {
  const { name, surname, phone, email, password } = req.body;
  const role = 'teacher';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення користувача
    const newUser = await Users.create({
      name,
      surname,
      email,
      passwordHash: hashedPassword,
      role
    });

    // Впевнитися, що newUser має _id
    if (!newUser || !newUser._id) {
      throw new Error('Не вдалося створити користувача');
    }

    // Створення вчителя
    await Teacher.create({
      userId: newUser._id,
      name,
      surname,
      phone
    });

    res.redirect('/admin_page');
  } catch (err) {
    console.error(err);
    res.status(500).send("Помилка при створенні вчителя");
  }
});



// GET: сторінка для створення уроку + список уроків
router.get('/create-lesson', async (req, res) => {
  try {
    // Отримуємо список вчителів та студентів
    const teachers = await Teacher.find();
    const students = await Student.find();
    
    // Отримуємо всі уроки, популюючи інформацію про вчителів та студентів
    const lessons = await Lesson.find()
      .populate('teacherId') 
      .populate('studentId') 
      .sort({ date: 1 }); 

    // Рендеримо сторінку create-lesson та передаємо дані
    res.render('create-lesson', { teachers, students, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка при завантаженні даних');
  }
});




import moment from 'moment-timezone';

// POST: створення нового уроку
router.post('/create-lesson', async (req, res) => {
  const { teacherId, studentId, subject, date, time } = req.body;

  try {
    // Конкатенація дати та часу і конвертація в UTC
    const lessonDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm')
      .tz('Europe/Kyiv') // Перетворюємо на Український час
      .utc(); // Перетворюємо на UTC для збереження в базі

    // Створення нового уроку
    const lesson = new Lesson({
      teacherId,
      studentId,
      subject,
      date: lessonDateTime, // Зберігаємо в UTC
      time, // Можна зберегти також час окремо, якщо хочете
    });

    await lesson.save();
    res.redirect('/admin_page'); // Переадресовуємо назад на адмін панель
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка при створенні уроку');
  }
});



router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Помилка при виході");
    }
    res.redirect('/login_page');
  });
});


  
  export default router;
  
