// models/Lessons.js
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Lesson', lessonSchema);
