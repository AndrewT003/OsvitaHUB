import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  surname:{type: String,required: true},
  phone:{type: String,required: true},
  avatar: { type: String }, // шлях або URL до зображення
  subjects: [{ type: String }],
  bio: { type: String },
  experience: { type: Number },
  rating: { type: Number, default: 0 },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  availableTimes: [{
    day: { type: String },
    timeSlots: [{ type: String }]
  }]
}, { timestamps: true });


export default mongoose.model('Teacher', teacherSchema);
