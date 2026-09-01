const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

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
  const upload = multer({ storage });
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.uploadDocument);
  router.get('/documents', documentController.listDocuments);
  router.get('/documents/:id/download', documentController.downloadDocument);

  return router;
}

module.exports = { createDocumentRoutes };