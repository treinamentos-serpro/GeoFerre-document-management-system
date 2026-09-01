import { getDownloadUrl } from '../services/documentApi.js';

export default function DownloadButton({ documentId, originalName }) {
  return (
    <a
      className="download-button"
      href={getDownloadUrl(documentId)}
      aria-label={`Baixar ${originalName}`}
    >
      Baixar
    </a>
  );
}