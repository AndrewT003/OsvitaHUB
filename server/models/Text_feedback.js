// models/FeedbackText.js
import mongoose from 'mongoose';

const feedbackTextSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: /.+\@.+\..+/,
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const FeedbackText = mongoose.model('FeedbackText', feedbackTextSchema);
export default FeedbackText;
