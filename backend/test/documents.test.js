const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Testes de integração das rotas de documentos.
// Utiliza o servidor HTTP nativo do Node para evitar dependências externas.

let server;
let baseUrl;

before(() => {
  // Recarrega o repositório para iniciar com lista vazia entre execuções.
  // Cada require usa o cache do módulo, então o estado já persiste por teste.
  const app = require('../src/app');
  server = http.createServer(app);
  return new Promise((resolve) => server.listen(0, resolve)).then(() => {
    const { port } = server.address();
    baseUrl = `http://localhost:${port}`;
  });
});

after(() => new Promise((resolve) => server.close(resolve)));

/**
 * Faz uma requisição HTTP simples e retorna { statusCode, body }.
 */
function request(method, path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const req = http.request(url, { method, headers: options.headers || {} }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        let parsed;
        try { parsed = JSON.parse(body); } catch { parsed = body; }
        resolve({ statusCode: res.statusCode, body: parsed, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

/**
 * Faz upload de um arquivo usando multipart/form-data manualmente.
 */
function uploadFile(filePath, owner) {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const filename = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    const parts = [];
    if (owner) {
      parts.push(
        Buffer.from(
          `--${boundary}\r\nContent-Disposition: form-data; name="owner"\r\n\r\n${owner}\r\n`
        )
      );
    }
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: application/octet-stream\r\n\r\n`
      )
    );
    parts.push(fileContent);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    const body = Buffer.concat(parts);

    const url = new URL(baseUrl + '/upload');
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(Buffer.concat(chunks).toString()); } catch { parsed = {}; }
        resolve({ statusCode: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

test('GET /health retorna status ok', async () => {
  const { statusCode, body } = await request('GET', '/health');
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(body.status, 'ok');
});

test('GET /documents retorna lista vazia inicialmente', async () => {
  const { statusCode, body } = await request('GET', '/documents');
  assert.strictEqual(statusCode, 200);
  assert.ok(Array.isArray(body));
});

test('POST /upload sem arquivo retorna 400', async () => {
  const { statusCode, body } = await request('POST', '/upload', {
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.strictEqual(statusCode, 400);
  assert.ok(body.error);
});

test('POST /upload com arquivo retorna 201 e metadados', async () => {
  // Cria um arquivo temporário para upload.
  const tmpFile = path.join(os.tmpdir(), 'test-upload.txt');
  fs.writeFileSync(tmpFile, 'conteúdo de teste');

  const { statusCode, body } = await uploadFile(tmpFile, 'usuario1');
  fs.unlinkSync(tmpFile);

  assert.strictEqual(statusCode, 201);
  assert.ok(body.id);
  assert.strictEqual(body.originalName, 'test-upload.txt');
  assert.strictEqual(body.owner, 'usuario1');
  assert.ok(body.uploadedAt);
});

test('GET /documents retorna documento após upload', async () => {
  const { statusCode, body } = await request('GET', '/documents');
  assert.strictEqual(statusCode, 200);
  assert.ok(Array.isArray(body));
  // Deve conter pelo menos o documento enviado no teste anterior.
  assert.ok(body.length >= 1);
});

test('GET /documents/:id/download retorna 404 para id inexistente', async () => {
  const { statusCode, body } = await request('GET', '/documents/id-inexistente/download');
  assert.strictEqual(statusCode, 404);
  assert.ok(body.error);
});
