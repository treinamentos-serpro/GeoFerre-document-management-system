// Serviço de documentos: concentra as regras de negócio do DMS.
// Não tem conhecimento de HTTP — recebe e retorna dados de domínio.

const crypto = require('crypto');
const repository = require('../repositories/documentRepository');

/**
 * Registra um documento após o upload do arquivo pelo multer.
 * @param {{ originalname: string, filename: string, size: number }} file
 * @param {string} owner
 * @returns {object} Metadados do documento criado.
 */
function registerDocument(file, owner) {
  if (!file) {
    throw new Error('Nenhum arquivo foi enviado.');
  }

  const metadata = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    owner: owner || 'anonymous',
    uploadedAt: new Date().toISOString(),
  };

  return repository.save(metadata);
}

/**
 * Lista todos os documentos cadastrados.
 * @returns {object[]}
 */
function listDocuments() {
  return repository.findAll();
}

/**
 * Obtém o caminho absoluto de um documento para download.
 * @param {string} id
 * @returns {{ filePath: string, originalName: string }}
 */
function getDocumentForDownload(id) {
  const doc = repository.findById(id);

  if (!doc) {
    throw new Error('Documento não encontrado.');
  }

  if (!repository.fileExists(doc.filename)) {
    throw new Error('Arquivo não encontrado no servidor.');
  }

  return {
    filePath: repository.resolveFilePath(doc.filename),
    originalName: doc.originalName,
  };
}

module.exports = { registerDocument, listDocuments, getDocumentForDownload };
