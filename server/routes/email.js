import express from 'express';
import { sendConsultationEmails } from '../middleware/emailSender.js';

const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    await sendConsultationEmails(req.body);
    res.status(200).send('Заявка успішно надіслана!');
  } catch (error) {
    console.error('Помилка при надсиланні:', error);
    res.status(500).send('Сталася помилка при надсиланні листів.');
  }
});

export default router;
