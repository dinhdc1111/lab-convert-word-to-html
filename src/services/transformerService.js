import { stripEmptyTags } from '../utils/htmlUtils';

/**
 * Post-process HTML for semantic correctness and cleanliness.
 *
 * This service now performs ONLY safe, structure-preserving transformations:
 * 1. Replace presentational <b>/<i> with semantic <strong>/<em>
 * 2. Strip empty tags
 * 3. Clean up any residual <ol>/<ul> wrappers from Mammoth fallback HTML
 *
 * IMPORTANT: This service does NOT:
 * - Infer structure from text patterns
 * - Convert headings to different elements
 * - Generate or modify numbering
 * - Apply document-type-specific transformations
 *
 * Structure is now handled entirely by the DOCX XML extractor
 * and structure renderer.
 *
 * @param {string} html - HTML string (either from structure renderer or Mammoth)
 * @returns {string} Cleaned HTML string
 */
export function transformHtml(html) {
  let result = html;

  // 1. Replace presentational tags with semantic equivalents
  result = result.replace(/<b(\s|>)/gi, '<strong$1');
  result = result.replace(/<\/b>/gi, '</strong>');
  result = result.replace(/<i(\s|>)/gi, '<em$1');
  result = result.replace(/<\/i>/gi, '</em>');

  // 2. Strip empty tags
  result = stripEmptyTags(result);

  // 3. Remove any residual <ol>/<ul> wrappers that Mammoth may have produced
  //    in fallback HTML (tables section). This unwraps <li> contents into <p>.
  result = unwrapResidualLists(result);

  return result;
}

/**
 * Remove <ol> and <ul> wrappers, converting <li> to <p>.
 * This catches any list elements that Mammoth generated despite the styleMap overrides.
 *
 * @param {string} html
 * @returns {string}
 */
function unwrapResidualLists(html) {
  let result = html;

  // Remove <ol ...> and </ol> wrappers
  result = result.replace(/<ol[^>]*>/gi, '');
  result = result.replace(/<\/ol>/gi, '');

  // Remove <ul ...> and </ul> wrappers
  result = result.replace(/<ul[^>]*>/gi, '');
  result = result.replace(/<\/ul>/gi, '');

  // Convert <li ...> to <p> and </li> to </p>
  result = result.replace(/<li([^>]*)>/gi, '<p$1>');
  result = result.replace(/<\/li>/gi, '</p>');

  return result;
}
