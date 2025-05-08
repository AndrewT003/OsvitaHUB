// models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  surname: { type: String },
  phone: { type: String },
  grade: { type: String },
  avatar: { type: String },
  enrolledPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LessonPlan' }],
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }]
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);



