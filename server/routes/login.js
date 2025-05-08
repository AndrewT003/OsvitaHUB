// server/routes/login.js

export default function login_page(app) {
  app.get('/login_page', (req, res) => {
    if (req.session.userId && req.session.role) {
      // Перевіряємо роль і перенаправляємо відповідно
      switch (req.session.role) {
        case 'student':
          return res.redirect('/student/dashboard');
        case 'teacher':
          return res.redirect('/teacher/dashboard');
        case 'admin':
          return res.redirect('/admin_page');
        default:
          return res.redirect('/login_page'); // Якщо роль невідома — перенаправляємо на логін
      }
    }

    // Якщо не залогінений
    res.render('login');
  });
}
