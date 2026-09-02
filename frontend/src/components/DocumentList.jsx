import DownloadButton from './DownloadButton.jsx';

function formatSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p className="border-l-4 border-slate-400 bg-slate-100 px-4 py-3 text-sm text-slate-700" role="status">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="border-l-4 border-slate-400 bg-slate-100 px-4 py-3 text-sm text-slate-700">Nenhum documento enviado</p>;
  }

  return (
    <div className="overflow-x-auto border-y border-slate-300 bg-white">
      <table className="min-w-[680px] w-full border-collapse text-left">
        <thead className="bg-slate-100 font-mono text-xs uppercase text-slate-600">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Documento</th>
            <th scope="col" className="px-4 py-3 font-semibold">Proprietário</th>
            <th scope="col" className="px-4 py-3 font-semibold">Tamanho</th>
            <th scope="col" className="px-4 py-3 font-semibold">Enviado em</th>
            <th scope="col" className="sr-only">Ações</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id} className="border-t border-slate-200 text-sm text-slate-700 hover:bg-teal-50/50">
              <td className="px-4 py-4 font-medium text-ink">{document.originalName}</td>
              <td className="px-4 py-4">{document.owner}</td>
              <td className="px-4 py-4 font-mono text-xs">{formatSize(document.size)}</td>
              <td className="px-4 py-4 whitespace-nowrap">{new Date(document.uploadedAt).toLocaleString('pt-BR')}</td>
              <td className="px-4 py-4 text-right">
                <DownloadButton
                  documentId={document.id}
                  originalName={document.originalName}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}