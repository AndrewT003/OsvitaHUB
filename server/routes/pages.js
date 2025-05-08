import Teachers from "../models/Teachers.js";

export default function AboutUsPage(app) {
  // Маршрут для сторінки "Про нас"
  app.get('/about_us', async (req, res) => {
    try {
      const teachers = await Teachers.find().limit(6); // 6 перших викладачів
      res.render('about_us', { teachers }); // передаємо в шаблон
    } catch (err) {
      console.error('Помилка при завантаженні викладачів:', err);
      res.status(500).send("Помилка сервера");
    }
  });

  // Маршрут для сторінки всіх викладачів
  app.get('/teachers', async (req, res) => {
    try {
      const teachers = await Teachers.find(); // Отримуємо всіх викладачів
      res.render('all_teachers', { teachers }); // передаємо викладачів у шаблон
    } catch (err) {
      console.error('Помилка при завантаженні викладачів:', err);
      res.status(500).send("Помилка сервера");
    }
  });

  // Маршрут для сторінки конкретного викладача
  app.get('/teachers/:id', async (req, res) => {
    try {
      const teacher = await Teachers.findById(req.params.id); // Знайдемо викладача за ID
      if (!teacher) {
        return res.status(404).send('Викладача не знайдено');
      }
      res.render('teacher_detail', { teacher }); // Передаємо інформацію про викладача у шаблон
    } catch (err) {
      console.error('Помилка при завантаженні інформації про викладача:', err);
      res.status(500).send("Помилка сервера");
    }
  });
}
