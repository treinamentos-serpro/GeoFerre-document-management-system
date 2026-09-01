import { useEffect, useState } from 'react';
import DocumentList from '../components/DocumentList.jsx';
import UploadComponent from '../components/UploadComponent.jsx';
import { listDocuments } from '../services/documentApi.js';

export default function DocumentManagerPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocuments() {
      try {
        setDocuments(await listDocuments());
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDocuments();
  }, []);

  function handleUploaded(document) {
    setDocuments((currentDocuments) => [document, ...currentDocuments]);
    setError('');
  }

  return (
    <main className="document-manager">
      <header className="page-header">
        <p className="eyebrow">Arquivo local</p>
        <h1>Documentos</h1>
        <p>Envie, acompanhe e recupere os documentos da equipe.</p>
      </header>

      <section className="upload-section" aria-labelledby="upload-title">
        <h2 id="upload-title">Novo documento</h2>
        <UploadComponent onUploaded={handleUploaded} />
      </section>

      <section className="documents-section" aria-labelledby="documents-title">
        <div className="section-heading">
          <h2 id="documents-title">Documentos enviados</h2>
          <span>{documents.length} registro(s)</span>
        </div>
        {error && <p className="error-message">{error}</p>}
        <DocumentList documents={documents} isLoading={isLoading} />
      </section>
    </main>
  );
}