import { saveAs } from 'file-saver';
import { renderTemplateDocument, DEFAULT_TEMPLATE_ID } from './templateService';

/**
 * Download HTML content as a .html file using the selected template.
 *
 * @param {string} html - The HTML content (fragment, not full document)
 * @param {string} [filename='converted'] - Base filename without extension
 * @param {string} [templateId='cpbank'] - Template identifier
 */
export function downloadAsHtml(html, filename = 'converted', templateId = DEFAULT_TEMPLATE_ID) {
  const fullDocument = renderTemplateDocument(templateId, html, filename);
  const blob = new Blob([fullDocument], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${filename}.html`);
}

/**
 * Copy HTML content to the clipboard.
 *
 * @param {string} html - The HTML content (fragment, not full document)
 * @param {string} [templateId='cpbank'] - Template identifier
 * @param {string} [title='Converted Document'] - Document title
 * @returns {Promise<boolean>} true if copy succeeded
 */
export async function copyToClipboard(html, templateId = DEFAULT_TEMPLATE_ID, title = 'Converted Document') {
  const fullDocument = renderTemplateDocument(templateId, html, title);

  try {
    await navigator.clipboard.writeText(fullDocument);
    return true;
  } catch {
    // Fallback for older browsers / insecure contexts
    return fallbackCopy(fullDocument);
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
