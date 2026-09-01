import DownloadButton from './DownloadButton.jsx';

function formatSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents, isLoading }) {
  if (isLoading) {
    return <p className="status-message">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="status-message">Nenhum documento enviado.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Documento</th>
            <th scope="col">Proprietário</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>{document.originalName}</td>
              <td>{document.owner}</td>
              <td>{formatSize(document.size)}</td>
              <td>{new Date(document.uploadedAt).toLocaleString('pt-BR')}</td>
              <td>
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