import DOMPurify from 'dompurify';
import { sanitizerConfig } from '../config/conversionConfig';

/**
 * Sanitize HTML to prevent XSS and strip disallowed elements.
 *
 * Updated to preserve inline styles needed for faithful DOCX rendering
 * (indentation via margin-left, text-indent, padding-left).
 *
 * @param {string} rawHtml - Untrusted HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(rawHtml) {
  return DOMPurify.sanitize(rawHtml, sanitizerConfig);
}
