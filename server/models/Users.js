import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  resetCode: { type: String },
  resetCodeExpires: { type: Date },

  // 🆕 Для підтвердження пошти
  verifyToken: { type: String },
  isVerified: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('User', userSchema);
