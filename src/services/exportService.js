import { saveAs } from 'file-saver';
import { wrapInCpbankTemplate } from '../templates/cpbankTemplate';

/**
 * Download HTML content as a .html file using the CPBank template.
 *
 * @param {string} html - The HTML content (fragment, not full document)
 * @param {string} [filename='converted'] - Base filename without extension
 */
export function downloadAsHtml(html, filename = 'converted') {
  const fullDocument = wrapInCpbankTemplate(html, filename);
  const blob = new Blob([fullDocument], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${filename}.html`);
}

/**
 * Copy HTML content to the clipboard.
 *
 * @param {string} html - The HTML string to copy
 * @returns {Promise<boolean>} true if copy succeeded
 */
export async function copyToClipboard(html) {
  try {
    await navigator.clipboard.writeText(html);
    return true;
  } catch {
    // Fallback for older browsers / insecure contexts
    return fallbackCopy(html);
  }
}

/**
 * Fallback copy using a temporary textarea element.
 * @param {string} text
 * @returns {boolean}
 */
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const success = document.execCommand('copy');
    return success;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
