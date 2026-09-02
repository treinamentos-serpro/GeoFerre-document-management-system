const path = require('node:path');
const express = require('express');
const multer = require('multer');
const { createDocumentController } = require('./controllers/documentController');
const { createDocumentRepository } = require('./repositories/documentRepository');
const {
  createDocumentRoutes,
  UnsupportedFileTypeError,
} = require('./routes/documentRoutes');
const {
  createDocumentService,
  DocumentNotFoundError,
} = require('./services/documentService');

const app = express();
const PORT = process.env.PORT || 3000;
const storageDirectory =
  process.env.DOCUMENT_STORAGE_DIR || path.join(__dirname, '..', 'storage');
const documentRepository = createDocumentRepository();
const documentService = createDocumentService(documentRepository);
const documentController = createDocumentController(documentService);

app.disable('x-powered-by');
app.use((request, response, next) => {
  response.set({
    'Content-Security-Policy': "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  });
  next();
});
app.use(express.json());
app.use(createDocumentRoutes(documentController, storageDirectory));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'O arquivo excede o tamanho máximo permitido.' });
    }

    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ error: 'Um campo de texto excede o tamanho máximo permitido.' });
    }

    return res.status(400).json({ error: 'Não foi possível processar o arquivo.' });
  }

  if (error instanceof UnsupportedFileTypeError) {
    return res.status(415).json({ error: error.message });
  }

  if (error instanceof DocumentNotFoundError) {
    return res.status(404).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'Ocorreu um erro ao processar a solicitação.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
