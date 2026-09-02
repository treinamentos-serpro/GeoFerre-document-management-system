import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ onUploaded }) {
  const [owner, setOwner] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner.trim()) {
      setFeedback({ type: 'error', text: 'Selecione um arquivo e informe o proprietário.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const document = await uploadDocument(file, owner.trim());
      onUploaded(document);
      setOwner('');
      setFile(null);
      event.target.reset();
      setFeedback({ type: 'success', text: 'Documento enviado com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-end" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Proprietário
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Ex.: user-123"
          required
          className="min-h-11 rounded border border-slate-400 bg-white px-3 py-2 text-ink shadow-sm outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/25"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Documento
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          required
          className="min-h-11 w-full rounded border border-slate-400 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-mono file:text-xs file:font-semibold file:text-ink hover:file:bg-slate-200 focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/25"
        />
      </label>
      <button type="submit" disabled={isSubmitting} className="min-h-11 rounded bg-pine px-5 py-2 font-mono text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-pine focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
      {feedback && <p className={`border-l-4 px-4 py-3 text-sm md:col-span-3 ${feedback.type === 'success' ? 'border-pine bg-teal-50 text-teal-900' : 'border-red-700 bg-red-50 text-red-900'}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.text}</p>}
    </form>
  );
}