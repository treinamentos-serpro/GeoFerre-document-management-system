import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ onUploaded }) {
  const [owner, setOwner] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner.trim()) {
      setMessage('Selecione um arquivo e informe o proprietário.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const document = await uploadDocument(file, owner.trim());
      onUploaded(document);
      setOwner('');
      setFile(null);
      event.target.reset();
      setMessage('Documento enviado com sucesso.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label>
        Proprietário
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Ex.: user-123"
          required
        />
      </label>
      <label>
        Documento
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          required
        />
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
      {message && <p className="form-message">{message}</p>}
    </form>
  );
}