const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

const allowedFileTypes = new Map([
  ['.pdf', 'application/pdf'],
  ['.txt', 'text/plain'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.doc', 'application/msword'],
  [
    '.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
]);

class UnsupportedFileTypeError extends Error {
  constructor() {
    super('O tipo de arquivo enviado não é permitido.');
  }
}

function getPositiveInteger(environmentVariable, defaultValue) {
  const configuredValue = Number.parseInt(
    process.env[environmentVariable],
    10
  );

  return Number.isSafeInteger(configuredValue) && configuredValue > 0
    ? configuredValue
    : defaultValue;
}

function createDocumentRoutes(documentController, storageDirectory) {
  const storage = multer.diskStorage({
    destination(request, file, callback) {
      fs.mkdir(storageDirectory, { recursive: true }, (error) => {
        callback(error, storageDirectory);
      });
    },
    filename(request, file, callback) {
      callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  });
  const upload = multer({
    storage,
    limits: {
      fieldSize: getPositiveInteger('DOCUMENT_MAX_FIELD_SIZE_BYTES', 256),
      fields: 1,
      fileSize: getPositiveInteger('DOCUMENT_MAX_FILE_SIZE_BYTES', 10 * 1024 * 1024),
      files: 1,
      parts: 3,
    },
    fileFilter(request, file, callback) {
      const extension = path.extname(file.originalname).toLowerCase();

      if (allowedFileTypes.get(extension) !== file.mimetype) {
        return callback(new UnsupportedFileTypeError());
      }

      return callback(null, true);
    },
  });
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.uploadDocument);
  router.get('/documents', documentController.listDocuments);
  router.get('/documents/:id/download', documentController.downloadDocument);

  return router;
}

module.exports = { createDocumentRoutes, UnsupportedFileTypeError };