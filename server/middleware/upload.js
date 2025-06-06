import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'public/uploads/teachers';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });
export default upload;
