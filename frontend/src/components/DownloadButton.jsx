import { getDownloadUrl } from '../services/documentApi.js';

export default function DownloadButton({ documentId, originalName }) {
  return (
    <a
      className="inline-flex min-h-9 items-center rounded border border-pine px-3 py-1.5 font-mono text-xs font-semibold text-pine transition hover:bg-pine hover:text-white focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2"
      href={getDownloadUrl(documentId)}
      aria-label={`Baixar ${originalName}`}
    >
      Baixar
    </a>
  );
}