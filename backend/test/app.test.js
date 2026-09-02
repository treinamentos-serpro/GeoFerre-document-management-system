const { after, before, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const storageDirectory = path.join(
  os.tmpdir(),
  `dms-test-${process.pid}-${Date.now()}`
);

process.env.DOCUMENT_STORAGE_DIR = storageDirectory;
process.env.DOCUMENT_MAX_FILE_SIZE_BYTES = '64';
process.env.DOCUMENT_MAX_FIELD_SIZE_BYTES = '16';

const app = require('../src/app');

let server;
let baseUrl;

async function listStoredFiles() {
  const entries = await fs.readdir(storageDirectory);
  return entries.filter((entry) => entry !== '.gitkeep');
}

before(async () => {
  await fs.mkdir(storageDirectory, { recursive: true });
  server = app.listen(0);

  await new Promise((resolve) => server.on('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
  await fs.rm(storageDirectory, { recursive: true, force: true });
});

test('envia, lista e baixa um documento', async () => {
  const formData = new FormData();
  formData.append('owner', 'user-123');
  formData.append(
    'file',
    new Blob(['conteudo do documento'], { type: 'text/plain' }),
    'relatorio.txt'
  );

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.deepStrictEqual(
    Object.keys(document).sort(),
    ['id', 'mimeType', 'originalName', 'owner', 'size', 'uploadedAt']
  );
  assert.strictEqual(document.originalName, 'relatorio.txt');
  assert.strictEqual(document.owner, 'user-123');
  assert.strictEqual(document.mimeType, 'text/plain');
  assert.strictEqual(document.size, 21);

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [document]);

  const downloadResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download`
  );
  assert.strictEqual(downloadResponse.status, 200);
  assert.match(
    downloadResponse.headers.get('content-disposition'),
    /attachment; filename="relatorio.txt"/
  );
  assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');
});

test('rejeita upload sem arquivo ou proprietário', async () => {
  const withoutFile = new FormData();
  withoutFile.append('owner', 'user-123');

  const withoutFileResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: withoutFile,
  });
  assert.strictEqual(withoutFileResponse.status, 400);
  assert.deepStrictEqual(await withoutFileResponse.json(), {
    error: 'Envie um arquivo no campo file.',
  });

  const withoutOwner = new FormData();
  withoutOwner.append(
    'file',
    new Blob(['conteúdo'], { type: 'text/plain' }),
    'arquivo.txt'
  );
  const filesBeforeRequest = await listStoredFiles();

  const withoutOwnerResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: withoutOwner,
  });
  assert.strictEqual(withoutOwnerResponse.status, 400);
  assert.deepStrictEqual(await withoutOwnerResponse.json(), {
    error: 'Informe o proprietário do documento.',
  });
  assert.deepStrictEqual(await listStoredFiles(), filesBeforeRequest);
});

test('rejeita arquivo acima do tamanho permitido sem persistir conteúdo parcial', async () => {
  const formData = new FormData();
  formData.append('owner', 'user-123');
  formData.append(
    'file',
    new Blob(['x'.repeat(65)], {
      type: 'text/plain',
    }),
    'grande.txt'
  );
  const filesBeforeRequest = await listStoredFiles();

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(response.status, 413);
  assert.deepStrictEqual(await response.json(), {
    error: 'O arquivo excede o tamanho máximo permitido.',
  });
  assert.deepStrictEqual(await listStoredFiles(), filesBeforeRequest);
});

test('rejeita proprietário acima do limite sem persistir arquivo', async () => {
  const formData = new FormData();
  formData.append('owner', 'x'.repeat(17));
  formData.append(
    'file',
    new Blob(['conteúdo'], { type: 'text/plain' }),
    'arquivo.txt'
  );
  const filesBeforeRequest = await listStoredFiles();

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(await response.json(), {
    error: 'Um campo de texto excede o tamanho máximo permitido.',
  });
  assert.deepStrictEqual(await listStoredFiles(), filesBeforeRequest);
});

test('rejeita tipo de arquivo não permitido', async () => {
  const formData = new FormData();
  formData.append('owner', 'user-123');
  formData.append(
    'file',
    new Blob(['executável'], { type: 'application/x-msdownload' }),
    'arquivo.exe'
  );
  const filesBeforeRequest = await listStoredFiles();

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  assert.strictEqual(response.status, 415);
  assert.deepStrictEqual(await response.json(), {
    error: 'O tipo de arquivo enviado não é permitido.',
  });
  assert.deepStrictEqual(await listStoredFiles(), filesBeforeRequest);
});

test('inclui cabeçalhos básicos de segurança', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.strictEqual(response.headers.get('x-powered-by'), null);
  assert.strictEqual(response.headers.get('x-content-type-options'), 'nosniff');
  assert.strictEqual(response.headers.get('x-frame-options'), 'DENY');
});

test('informa quando o documento não existe para download', async () => {
  const response = await fetch(
    `${baseUrl}/documents/documento-inexistente/download`
  );

  assert.strictEqual(response.status, 404);
  assert.deepStrictEqual(await response.json(), {
    error: 'Documento não encontrado.',
  });
});
