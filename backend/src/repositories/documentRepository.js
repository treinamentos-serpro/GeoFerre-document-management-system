// Repositório de documentos: persiste metadados em memória e arquivos no filesystem local.

const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.resolve(__dirname, '../../storage');

// Armazenamento em memória dos metadados dos documentos.
const documents = [];

/**
 * Salva os metadados de um documento recém-enviado.
 * @param {{ id: string, originalName: string, filename: string, size: number, owner: string, uploadedAt: string }} metadata
 * @returns {object} Os metadados salvos.
 */
function save(metadata) {
  documents.push(metadata);
  return metadata;
}

/**
 * Retorna todos os documentos cadastrados.
 * @returns {object[]}
 */
function findAll() {
  return [...documents];
}

/**
 * Busca um documento pelo seu identificador.
 * @param {string} id
 * @returns {object|undefined}
 */
function findById(id) {
  return documents.find((doc) => doc.id === id);
}

/**
 * Retorna o caminho absoluto do arquivo no filesystem.
 * Usa path.basename para evitar directory traversal.
 * @param {string} filename
 * @returns {string}
 */
function resolveFilePath(filename) {
  return path.join(STORAGE_DIR, path.basename(filename));
}

/**
 * Verifica se o arquivo existe no filesystem.
 * @param {string} filename
 * @returns {boolean}
 */
function fileExists(filename) {
  return fs.existsSync(resolveFilePath(filename));
}

module.exports = { save, findAll, findById, resolveFilePath, fileExists };
