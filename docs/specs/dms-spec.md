# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, consultem e baixem documentos armazenados
localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos.
- Listagem dos documentos enviados.
- Download de documento pelo identificador.
- Associação simples de cada documento a um proprietário informado no upload.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento, edição ou exclusão de documentos.
- Autenticação e autorização de usuários.
- Persistência durável dos metadados.
- Limites de tamanho e restrição de tipos de arquivo.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo pelo campo `file` em uma requisição `multipart/form-data`. |
| RF-02 | O envio deve informar um proprietário não vazio pelo campo `owner`. |
| RF-03 | O sistema deve gravar o arquivo localmente e registrar seus metadados. |
| RF-04 | O usuário pode listar os metadados públicos de todos os documentos enviados enquanto a aplicação estiver em execução. |
| RF-05 | O usuário pode baixar um documento existente pelo seu identificador. |
| RF-06 | O sistema deve informar erro para upload sem arquivo, upload sem proprietário ou download de documento inexistente. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local por `multer` com `diskStorage`. |
| RNF-02 | O diretório padrão de arquivos é `backend/storage`; `DOCUMENT_STORAGE_DIR` pode substituí-lo por configuração. |
| RNF-03 | Os metadados devem ser mantidos em memória nesta fase e são perdidos quando o processo reinicia. |
| RNF-04 | A porta do backend deve ser configurável por `PORT`, com padrão `3000`. |
| RNF-05 | Nenhum provedor de armazenamento externo ou serviço de upload de terceiros deve ser utilizado. |
| RNF-06 | Erros de entrada devem ser retornados em JSON com uma mensagem em português. |

## 5. Modelo de dados

### Documento

| Campo | Tipo | Exposto na API | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único UUID do documento. |
| `originalName` | string | Sim | Nome original informado no upload. |
| `mimeType` | string | Sim | Tipo MIME informado para o arquivo. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload no formato ISO 8601. |
| `owner` | string | Sim | Identificador simples do proprietário. |
| `storedName` | string | Não | Nome interno e aleatório do arquivo no diretório local. |
| `storagePath` | string | Não | Caminho local usado para recuperar o arquivo no download. |

O catálogo é uma coleção em memória. O arquivo físico e seus metadados têm
ciclos de vida distintos: após reiniciar o backend, arquivos locais antigos
podem existir, mas não podem ser listados ou baixados sem seus metadados.

## 6. Contratos de API

O frontend usa o prefixo `/api`; no desenvolvimento, o proxy do Vite o remove
ao encaminhar a requisição ao backend.

### `POST /upload`

- **Entrada:** `multipart/form-data` com `file` (arquivo obrigatório) e
  `owner` (texto obrigatório).
- **Sucesso:** `201 Created` com os metadados públicos do documento.
- **Erros:** `400 Bad Request` quando `file` ou `owner` estiver ausente ou
  inválido; `500 Internal Server Error` para erro inesperado de armazenamento.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "relatorio.pdf",
  "mimeType": "application/pdf",
  "size": 2048,
  "uploadedAt": "2026-09-01T12:00:00.000Z",
  "owner": "user-123"
}
```

### `GET /documents`

- **Entrada:** nenhuma.
- **Sucesso:** `200 OK` com um array de metadados públicos; um catálogo vazio
  retorna `[]`.

### `GET /documents/:id/download`

- **Entrada:** `id` como parâmetro de rota.
- **Sucesso:** `200 OK` com o conteúdo binário, tipo MIME e cabeçalho
  `Content-Disposition: attachment` com o nome original.
- **Erro:** `404 Not Found` quando o metadado não existe ou o arquivo local não
  está mais disponível.

### `GET /health`

- **Sucesso:** `200 OK` com `{ "status": "ok" }`.

## 7. Decisões arquiteturais

O backend segue Clean Architecture simples com o fluxo de dependência
`routes -> controllers -> services -> repositories`:

- `routes` configura os endpoints e o middleware `multer` com `diskStorage`.
- `controllers` validam a entrada HTTP e constroem as respostas HTTP.
- `services` criam os metadados, filtram os campos públicos e aplicam a regra
  para documento inexistente ou indisponível.
- `repositories` mantêm o catálogo em memória e verificam a disponibilidade do
  arquivo local.

O frontend usa componentes funcionais React e um serviço único baseado em
`fetch` para consumir os contratos da API.

## 8. Plano de execução

1. Criar o repositório em memória para metadados e a verificação de arquivos locais.
2. Criar o serviço de documentos para cadastro, consulta e recuperação para download.
3. Criar controlador e rotas Express, configurando `multer.diskStorage` para o diretório local.
4. Compor as dependências no `app` e padronizar os erros HTTP.
5. Cobrir upload, listagem, download, validação de entrada e documento inexistente com testes de integração do Node.
6. Criar o serviço do frontend para chamadas por `/api`.
7. Construir os componentes de upload, lista e download e integrá-los em uma página de gestão.
8. Validar os testes do backend e a build de produção do frontend.