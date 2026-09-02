// Rotas de documentos: define os endpoints e configura o multer para uploads.

const express = require('express');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/documentController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../storage'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage });

// Limitador de taxa: 10 requisições por minuto por IP nos endpoints de arquivo.
const fileLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
});

router.post('/upload', fileLimiter, upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', fileLimiter, controller.download);

module.exports = router;
