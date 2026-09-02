---
description: "Audita vulnerabilidades do DMS e propõe correções priorizadas para upload, API, filesystem e dependências."
name: auditar-seguranca-dms
argument-hint: "escopo opcional, por exemplo: priorize upload e download"
agent: dms-security-auditor
---

# Auditar Segurança do DMS

Faça uma auditoria de segurança da aplicação Document Management System.

Considere o foco adicional informado pelo usuário: `${input:escopo:foco opcional da auditoria}`.

## Resultado esperado

- Analise os fluxos de upload, listagem e download de documentos.
- Verifique o uso de `multer`, armazenamento local, caminhos de arquivo, validação de entrada, tratamento de erros e respostas HTTP.
- Analise dependências e execute `npm audit` quando estiver disponível, sem alterar arquivos ou atualizar pacotes automaticamente.
- Avalie o cliente frontend apenas quanto a riscos de consumo e exposição da API.
- Diferencie vulnerabilidades verificadas de riscos residuais do escopo atual.
- Forneça achados priorizados, correções mínimas e testes de regressão recomendados.
- Não implemente as correções durante a auditoria; use a passagem "Implementar correções aprovadas" somente após a revisão dos achados.