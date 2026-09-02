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
    <main className="min-h-screen border-t-4 border-clay px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-300 pb-8">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-clay">Arquivo local</p>
          <h1 className="text-4xl font-medium text-ink sm:text-5xl">Documentos</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Envie, acompanhe e recupere os documentos da equipe.</p>
        </header>

        <section className="border-b border-slate-300 py-8" aria-labelledby="upload-title">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 id="upload-title" className="text-xl font-semibold text-ink">Novo documento</h2>
            <span className="font-mono text-xs text-slate-500">Armazenamento local</span>
          </div>
          <UploadComponent onUploaded={handleUploaded} />
        </section>

        <section className="py-8" aria-labelledby="documents-title">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="documents-title" className="text-xl font-semibold text-ink">Documentos enviados</h2>
            <span className="font-mono text-xs text-slate-500">{documents.length} registro(s)</span>
          </div>
          {error && <p className="mb-4 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{error}</p>}
          <DocumentList documents={documents} isLoading={isLoading} />
        </section>
      </div>
    </main>
  );
}