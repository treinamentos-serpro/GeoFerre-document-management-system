const fs = require('node:fs/promises');
const { constants } = require('node:fs');

function createDocumentRepository() {
  const documents = [];

  return {
    save(document) {
      documents.push(document);
      return document;
    },

    findAll() {
      return [...documents];
    },

    findById(id) {
      return documents.find((document) => document.id === id);
    },

    async isFileAvailable(document) {
      try {
        await fs.access(document.storagePath, constants.R_OK);
        return true;
      } catch {
        return false;
      }
    },

    async removeFile(filePath) {
      await fs.unlink(filePath);
    },
  };
}

module.exports = { createDocumentRepository };