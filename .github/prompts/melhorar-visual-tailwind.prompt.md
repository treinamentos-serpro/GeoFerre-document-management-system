---
description: "Moderniza o visual operacional do DMS com Tailwind CSS 3, preservando upload, listagem e download."
name: melhorar-visual-tailwind
argument-hint: "objetivo visual opcional, por exemplo: priorize a tabela de documentos"
agent: dms-visual-tailwind
---

# Melhorar o Visual do DMS

Melhore a interface atual do Document Management System usando Tailwind CSS 3.

Considere o objetivo adicional informado pelo usuário: `${input:objetivo:objetivo visual opcional}`.

## Resultado esperado

- Configure Tailwind CSS 3 no frontend caso ele ainda não esteja configurado.
- Atualize a tela montada por `frontend/src/App.jsx` e os componentes necessários em `frontend/src/components`.
- Preserve os fluxos existentes de upload, listagem, carregamento, erro, lista vazia e download.
- Centralize a apresentação em classes Tailwind e remova apenas os estilos próprios substituídos pela migração.
- Mantenha uma experiência responsiva e acessível, com foco no uso repetido para gestão de documentos.
- Não modifique o backend, os contratos de API ou o comportamento do cliente em `frontend/src/services`.
- Execute `npm --prefix frontend run build` ao final e corrija falhas relacionadas às alterações.