const API_BASE_URL = '/api';

async function getErrorMessage(response) {
  const body = await response.json().catch(() => null);
  return body?.error || 'Não foi possível concluir a solicitação.';
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function listDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents`);

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export function getDownloadUrl(documentId) {
  return `${API_BASE_URL}/documents/${encodeURIComponent(documentId)}/download`;
}