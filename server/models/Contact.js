// models/Contact.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  instagram: String,
  tiktok: String,
  facebook: String,
  telegram: String,
  whatsapp: String,
  viber: String,
  phoneNumber: String
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
