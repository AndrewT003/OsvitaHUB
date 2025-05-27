import moment from 'moment-timezone';
import express from 'express';
import bcrypt from 'bcrypt'
import Users from '../models/Users.js';
import Teacher from '../models/Teachers.js';
import Student from '../models/Student.js';
import Lesson from '../models/Lessons.js';  
import LessonPlan from '../models/LessonsPlan.js'; 
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Contact from '../models/Contact.js';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Функція для відправки листів при створенні уроку
async function sendLessonEmails({ student, teacher, lesson }) {
  const lessonDateLocal = moment(lesson.date).tz('Europe/Kyiv').format('DD.MM.YYYY HH:mm');

  const studentMail = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Ваш новий урок',
    text: `Привіт, ${student.name}!
    Ваш урок з предмета "${lesson.subject}" запланований на ${lessonDateLocal} з вчителем ${teacher.name} ${teacher.surname}.
    Якщо у вас є питання, звертайтесь.`,
  };

  const teacherMail = {
    from: process.env.EMAIL_USER,
    to: teacher.email,
    subject: 'Новий урок призначено',
    text: `Привіт, ${teacher.name}!
    Вам призначено урок з предмета "${lesson.subject}" на ${lessonDateLocal} зі студентом ${student.name} ${student.surname}.
    Перевірте розклад.`,
  };

  await transporter.sendMail(studentMail);
  await transporter.sendMail(teacherMail);
}

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

router.post('/update-single-contact', async (req, res) => {
  const { contactType, contactValue } = req.body;

  try {
    let contacts = await Contact.findOne();
    if (!contacts) {
      contacts = new Contact();
    }

    // Захищаємо, щоб оновити тільки існуючі поля
    const allowedFields = ['instagram', 'tiktok', 'facebook', 'telegram', 'whatsapp', 'viber', 'phoneNumber'];
    if (!allowedFields.includes(contactType)) {
      return res.status(400).send('Невірний тип контакту');
    }

    contacts[contactType] = contactValue;
    await contacts.save();

    res.redirect('/admin_page');
  } catch (error) {
    console.error('Помилка оновлення контакту:', error);
    res.status(500).send('Помилка сервера');
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

router.post('/update-contacts', async (req, res) => {
  const { instagram, tiktok, facebook, telegram, whatsapp, viber, phoneNumber } = req.body;

  try {
    let contacts = await Contact.findOne();
    if (!contacts) {
      contacts = new Contact();
    }

    contacts.instagram = instagram;
    contacts.tiktok = tiktok;
    contacts.facebook = facebook;
    contacts.telegram = telegram;
    contacts.whatsapp = whatsapp;
    contacts.viber = viber;
    contacts.phoneNumber = phoneNumber;

    await contacts.save();

    res.redirect('/admin_page');
  } catch (error) {
    console.error('Помилка оновлення контактів:', error);
    res.status(500).send('Помилка сервера');
  }
});

router.post('/delete-lesson/:id', async (req, res) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.redirect('/create-lesson');
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка при видаленні уроку');
  }
});

// GET форма редагування уроку
router.get('/edit-lesson/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('teacherId')
      .populate('studentId');
    const teachers = await Teacher.find();
    const students = await Student.find();

    if (!lesson) return res.status(404).send('Урок не знайдено');

    res.render('edit-lesson', { lesson, teachers, students });
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка при завантаженні уроку');
  }
});

// POST оновлення уроку
router.post('/edit-lesson/:id', async (req, res) => {
  try {
    const { teacherId, studentId, subject, date, time } = req.body;

    const lessonDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm')
      .tz('Europe/Kyiv')
      .utc();

    await Lesson.findByIdAndUpdate(req.params.id, {
      teacherId,
      studentId,
      subject,
      date: lessonDateTime,
      time
    });

    res.redirect('/create-lesson');
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка при оновленні уроку');
  }
});

router.get('/create-lesson', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    const students = await Student.find();

    const lessons = await Lesson.find()
      .populate({
        path: 'teacherId',
        model: 'Teacher',
        select: 'name surname'
      })
      .populate({
        path: 'studentId',
        model: 'Student',
        select: 'name surname grade phone'
      })
      .sort({ date: 1 });

    res.render('create-lesson', { teachers, students, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).send('Помилка при завантаженні даних');
  }
});

// POST: створення нового уроку
router.post('/create-lesson', async (req, res) => {
  const { teacherId, studentId, subject, date, time } = req.body;

  try {
    const lessonDateTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm')
      .tz('Europe/Kyiv')
      .utc();

    const lesson = new Lesson({
      teacherId,
      studentId,
      subject,
      date: lessonDateTime,
      time,
    });

    await lesson.save();

    // Завантажуємо студентa і вчителя
    const student = await Student.findById(studentId);
    const teacher = await Teacher.findById(teacherId);

    // Завантажуємо user-и для email
    const studentUser = student ? await Users.findById(student.userId).lean() : null;
    const teacherUser = teacher ? await Users.findById(teacher.userId).lean() : null;

    if (studentUser?.email && teacherUser?.email) {
      try {
        await sendLessonEmails({
          student: { ...student.toObject(), email: studentUser.email },
          teacher: { ...teacher.toObject(), email: teacherUser.email },
          lesson,
        });
      } catch (mailErr) {
        console.error('Помилка при надсиланні листів:', mailErr);
      }
    } else {
      console.warn('Відсутній email у студента або вчителя, листи не надіслані');
    }

    res.redirect('/admin_page');
  } catch (err) {
    console.error('Помилка при створенні уроку:', err);
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
  
