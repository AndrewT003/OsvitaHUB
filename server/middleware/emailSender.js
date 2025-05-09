import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Завантажує .env

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendConsultationEmails({ name, subject, grade, email, phone }) {
  const adminMail = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_ADMIN,
    subject: 'Нова заявка на консультацію',
    text: `Ім'я: ${name}
    Предмет: ${subject}
    Клас: ${grade}
    Email: ${email}
    Телефон: ${phone}`,
  };

  const userMail = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Підтвердження заявки на консультацію',
    text: `Дякуємо, ${name}!
    Ваша заявка на консультацію з предмета "${subject}" для ${grade} класу отримана.
    Ми зв'яжемося з вами за номером: ${phone}`,
  };

  await transporter.sendMail(adminMail);
  await transporter.sendMail(userMail);
}
