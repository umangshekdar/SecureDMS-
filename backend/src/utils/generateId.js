import crypto from 'crypto';

/**
 * Generates formatted Case ID in the structure CASE-YYYY-NNNNN
 * @returns {string}
 */
export const generateCaseId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `CASE-${year}-${randomNum}`;
};

/**
 * Generates formatted Document ID in the structure DOC-YYYY-NNNNN
 * @returns {string}
 */
export const generateDocumentId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `DOC-${year}-${randomNum}`;
};

/**
 * Generates a random secure hexadecimal token.
 * @param {number} bytes 
 * @returns {string}
 */
export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

export default {
  generateCaseId,
  generateDocumentId,
  generateRandomToken,
};
