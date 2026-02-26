/**
 * Structure Renderer Service
 *
 * Takes DOCX structural metadata (from docxExtractorService) and Mammoth's
 * HTML output, then produces HTML that is structurally faithful to the
 * original Word document.
 *
 * Core principles:
 * 1. DO NOT regenerate numbering — use computed prefix from DOCX XML
 * 2. DO NOT convert paragraphs into <ol>/<ul> auto-numbered lists
 * 3. DO NOT infer structure from text patterns
 * 4. Preserve exact indentation hierarchy and numbering text
 *
 * The renderer works in two modes:
 * - Structure mode: Renders from DOCX metadata (primary, for paragraphs)
 * - Passthrough mode: Passes Mammoth HTML through (for tables/images)
 *
 * @module structureRendererService
 */

import { stripEmptyTags } from '../utils/htmlUtils';

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Render faithful HTML from DOCX structure metadata and Mammoth HTML.
 *
 * Strategy:
 * 1. Parse Mammoth HTML to extract tables and images (Mammoth handles these well)
 * 2. Walk DOCX paragraph metadata sequentially
 * 3. Render each paragraph based on its type, numbering, and indentation
 * 4. Splice in tables/images from Mammoth where they appear in the document
 *
 * @param {string} mammothHtml - HTML produced by Mammoth.js
 * @param {import('./docxExtractorService').DocxStructure} structure - Extracted DOCX metadata
 * @returns {string} Structurally faithful HTML
 */
export function renderFaithfulHtml(mammothHtml, structure) {
  const { paragraphs } = structure;

  if (!paragraphs || paragraphs.length === 0) {
    return mammothHtml; // Fallback to Mammoth output
  }

  // Extract tables from Mammoth HTML (we rely on Mammoth for table rendering)
  const mammothTables = extractTablesFromHtml(mammothHtml);

  const htmlParts = [];
  let tableIndex = 0;

  for (const para of paragraphs) {
    if (para.type === 'table') {
      // Use Mammoth's table rendering
      if (tableIndex < mammothTables.length) {
        htmlParts.push(mammothTables[tableIndex]);
        tableIndex++;
      }
      continue;
    }

    // Skip empty paragraphs (no text content and no meaningful runs)
    if (!para.textContent.trim() && !para.runs.some((r) => r.bookmarkId)) {
      continue;
    }

    htmlParts.push(renderParagraph(para));
  }

  let result = htmlParts.join('\n');

  // Clean up
  result = stripEmptyTags(result);

  return result;
}

// ─── Paragraph Rendering ────────────────────────────────────────────────────

/**
 * Render a single paragraph to HTML based on its metadata.
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @returns {string}
 */
function renderParagraph(para) {
  const innerHtml = renderRuns(para.runs);

  switch (para.type) {
    case 'heading':
      return renderHeading(para, innerHtml);
    case 'list-item':
      return renderListItem(para, innerHtml);
    case 'paragraph':
    default:
      return renderNormalParagraph(para, innerHtml);
  }
}

/**
 * Render a heading paragraph.
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @param {string} innerHtml
 * @returns {string}
 */
function renderHeading(para, innerHtml) {
  const level = Math.min(Math.max(para.headingLevel, 1), 6);
  const tag = `h${level}`;
  const classes = buildClasses(para, `docx-heading docx-heading-${level}`);
  const style = buildInlineStyle(para);
  const content = para.numberingPrefix
    ? `<span class="docx-heading-num">${escapeHtml(para.numberingPrefix)}</span> ${innerHtml}`
    : innerHtml;

  return `<${tag}${classes}${style}>${content}</${tag}>`;
}

/**
 * Render a list item as a paragraph with explicit numbering prefix.
 * Uses <p> with numbering text — NOT <ol>/<ul> auto-numbering.
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @param {string} innerHtml
 * @returns {string}
 */
function renderListItem(para, innerHtml) {
  const isBullet = isBulletItem(para);
  const baseClass = isBullet ? 'docx-list-item docx-bullet' : 'docx-list-item docx-numbered';
  const levelClass = `docx-indent-${para.ilvl}`;
  const classes = buildClasses(para, `${baseClass} ${levelClass}`);
  const style = buildInlineStyle(para);

  let prefixHtml = '';
  if (para.numberingPrefix) {
    if (isBullet) {
      prefixHtml = `<span class="docx-bullet-marker">${escapeHtml(para.numberingPrefix)}</span>`;
    } else {
      prefixHtml = `<span class="docx-list-marker">${escapeHtml(para.numberingPrefix)}</span>`;
    }
  }

  // Combine prefix + content with a space separator
  const content = prefixHtml
    ? `${prefixHtml} ${innerHtml}`
    : innerHtml;

  return `<p${classes}${style}>${content}</p>`;
}

/**
 * Check if a list item is a bullet (unordered) list item.
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @returns {boolean}
 */
function isBulletItem(para) {
  const prefix = para.numberingPrefix;
  return ['•', '○', '■', '▪', '–', '—', '-', '▸', '►', '◦'].includes(prefix);
}

/**
 * Render a normal (non-heading, non-list) paragraph.
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @param {string} innerHtml
 * @returns {string}
 */
function renderNormalParagraph(para, innerHtml) {
  const classes = buildClasses(para, 'docx-paragraph');
  const style = buildInlineStyle(para);

  return `<p${classes}${style}>${innerHtml}</p>`;
}

// ─── Run Rendering ──────────────────────────────────────────────────────────

/**
 * Render an array of DocxRuns to HTML.
 *
 * @param {import('./docxExtractorService').DocxRun[]} runs
 * @returns {string}
 */
function renderRuns(runs) {
  const parts = [];

  for (const run of runs) {
    // Handle bookmark anchors
    if (run.bookmarkId) {
      parts.push(`<a id="${escapeHtml(run.bookmarkId)}"></a>`);
      continue;
    }

    // Skip truly empty runs
    if (!run.text) continue;

    let html = escapeHtml(run.text);

    // Handle line breaks within text
    html = html.replace(/\n/g, '<br>');

    // Handle tabs
    html = html.replace(/\t/g, '&emsp;');

    // Apply formatting wrappers (innermost first)
    if (run.vertAlign === 'superscript') {
      html = `<sup>${html}</sup>`;
    } else if (run.vertAlign === 'subscript') {
      html = `<sub>${html}</sub>`;
    }

    if (run.strike) {
      html = `<s>${html}</s>`;
    }
    if (run.underline) {
      html = `<u>${html}</u>`;
    }
    if (run.italic) {
      html = `<em>${html}</em>`;
    }
    if (run.bold) {
      html = `<strong>${html}</strong>`;
    }

    // Wrap in hyperlink if present
    if (run.hyperlink) {
      html = `<a href="${escapeHtml(run.hyperlink)}">${html}</a>`;
    }

    parts.push(html);
  }

  return parts.join('');
}

// ─── CSS Class & Style Builders ─────────────────────────────────────────────

/**
 * Build the class attribute string for a paragraph element.
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @param {string} baseClasses
 * @returns {string}
 */
function buildClasses(para, baseClasses) {
  const classes = [baseClasses];

  // Add alignment class
  if (para.alignment === 'center') {
    classes.push('docx-align-center');
  } else if (para.alignment === 'right') {
    classes.push('docx-align-right');
  } else if (para.alignment === 'both') {
    classes.push('docx-align-justify');
  }

  // Add style-based class (sanitize the styleId for CSS)
  if (para.styleId) {
    const safeStyleId = para.styleId.replace(/[^a-zA-Z0-9-_]/g, '-');
    classes.push(`docx-style-${safeStyleId}`);
  }

  const classStr = classes.filter(Boolean).join(' ').trim();
  return classStr ? ` class="${classStr}"` : '';
}

/**
 * Build inline style for indentation.
 * Uses margin-left computed from DOCX twips (1 inch = 1440 twips).
 *
 * @param {import('./docxExtractorService').DocxParagraph} para
 * @returns {string}
 */
function buildInlineStyle(para) {
  const styles = [];

  // Convert twips to mm for margin-left
  // 1 inch = 1440 twips = 25.4 mm
  if (para.indentLeftTwips > 0) {
    const mm = (para.indentLeftTwips / 1440) * 25.4;
    styles.push(`margin-left: ${mm.toFixed(1)}mm`);
  }

  // Hanging indent → text-indent (negative)
  if (para.hangingTwips > 0) {
    const hangMm = (para.hangingTwips / 1440) * 25.4;
    styles.push(`text-indent: -${hangMm.toFixed(1)}mm`);
  }

  return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
}

// ─── Mammoth HTML Extraction ────────────────────────────────────────────────

/**
 * Extract <table>...</table> blocks from Mammoth HTML.
 * Tables are rendered by Mammoth because DOCX table XML is complex.
 *
 * @param {string} html
 * @returns {string[]}
 */
function extractTablesFromHtml(html) {
  const tables = [];
  const regex = /<table[\s>][\s\S]*?<\/table>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    tables.push(match[0]);
  }
  return tables;
}

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}
