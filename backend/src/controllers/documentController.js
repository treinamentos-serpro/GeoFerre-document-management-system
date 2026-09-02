// Controller de documentos: trata entrada/saída HTTP e delega ao serviço.

const path = require('path');
const service = require('../services/documentService');

/**
 * POST /upload
 * Recebe o arquivo enviado pelo multer e registra os metadados.
 */
function upload(req, res) {
  try {
    const owner = req.body.owner;
    const document = service.registerDocument(req.file, owner);
    res.status(201).json(document);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /documents
 * Retorna a lista de documentos cadastrados.
 */
function list(req, res) {
  const documents = service.listDocuments();
  res.json(documents);
}

/**
 * GET /documents/:id/download
 * Envia o arquivo para download.
 */
function download(req, res) {
  try {
    const { filePath, originalName } = service.getDocumentForDownload(req.params.id);
    // Sanitiza o nome original para evitar injeção no cabeçalho Content-Disposition.
    const safeName = path.basename(originalName);
    res.download(filePath, safeName);
  } catch (err) {
    const status = err.message === 'Documento não encontrado.' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

module.exports = { upload, list, download };
