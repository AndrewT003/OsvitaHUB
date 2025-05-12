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

  // 🔄 Нові поля для скидання пароля через 6-значний код
  resetCode: { type: String },             // код (наприклад, "123456")
  resetCodeExpires: { type: Date }         // термін дії коду

}, { timestamps: true });

export default mongoose.model('User', userSchema);
