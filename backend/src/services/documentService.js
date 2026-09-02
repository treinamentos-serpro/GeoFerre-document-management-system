const { randomUUID } = require('node:crypto');

class DocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado.');
  }
}

function toPublicDocument(document) {
  const { id, originalName, mimeType, size, uploadedAt, owner } = document;

  return { id, originalName, mimeType, size, uploadedAt, owner };
}

function createDocumentService(documentRepository) {
  return {
    createDocument(file, owner) {
      const document = {
        id: randomUUID(),
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        owner,
        storagePath: file.path,
      };

      return toPublicDocument(documentRepository.save(document));
    },

    listDocuments() {
      return documentRepository.findAll().map(toPublicDocument);
    },

    async discardUploadedFile(file) {
      if (file?.path) {
        await documentRepository.removeFile(file.path);
      }
    },

    async getDocumentForDownload(id) {
      const document = documentRepository.findById(id);

      if (!document || !(await documentRepository.isFileAvailable(document))) {
        throw new DocumentNotFoundError();
      }

      return document;
    },
  };
}

module.exports = { createDocumentService, DocumentNotFoundError };