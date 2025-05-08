import mongoose from 'mongoose';

const lessonPlanSchema = new mongoose.Schema({
  lessonCount: Number,
  description: String,
  title: String,
  price: Number
});

const LessonPlan = mongoose.model('LessonPlan', lessonPlanSchema);

export default LessonPlan;
