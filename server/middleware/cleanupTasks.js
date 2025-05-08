import cron from 'node-cron';
import Lesson from '../models/Lessons.js';
import moment from 'moment-timezone';

export async function cleanUpLessons() {
  const now = moment().utc().toDate();

  try {
    const result = await Lesson.deleteMany({
      date: { $lt: now },
      status: { $ne: 'completed' }
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Видалено ${result.deletedCount} уроків, що вже пройшли`);
    }
  } catch (error) {
    console.error('❌ Помилка під час очищення уроків:', error);
  }
}

// 🕒 Планувальник — щогодини
cron.schedule('0 * * * *', cleanUpLessons);
