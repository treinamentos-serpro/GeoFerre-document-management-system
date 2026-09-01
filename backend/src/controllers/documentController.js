function createDocumentController(documentService) {
  return {
    uploadDocument(request, response) {
      const owner = request.body.owner?.trim();

      if (!request.file) {
        return response.status(400).json({ error: 'Envie um arquivo no campo file.' });
      }

      if (!owner) {
        return response.status(400).json({ error: 'Informe o proprietário do documento.' });
      }

      const document = documentService.createDocument(request.file, owner);
      return response.status(201).json(document);
    },

    listDocuments(request, response) {
      return response.json(documentService.listDocuments());
    },

    async downloadDocument(request, response) {
      const document = await documentService.getDocumentForDownload(request.params.id);
      return response.download(document.storagePath, document.originalName);
    },
  };
}

module.exports = { createDocumentController };