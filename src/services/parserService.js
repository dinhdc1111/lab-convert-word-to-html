import mammoth from 'mammoth';
import { mammothOptionsClean } from '../config/conversionConfig';
import { extractDocxStructure } from './docxExtractorService';

/**
 * Parse a .docx ArrayBuffer into raw HTML using Mammoth.js.
 * This is now used primarily for table/image rendering fallback.
 * The main structure is extracted directly from DOCX XML.
 *
 * @param {ArrayBuffer} arrayBuffer - The file content as ArrayBuffer
 * @returns {Promise<{ html: string, messages: Array }>}
 */
export async function parseDocx(arrayBuffer) {
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    mammothOptionsClean,
  );

  return {
    html: result.value,
    messages: result.messages || [],
  };
}

/**
 * Full DOCX parsing: extracts both Mammoth HTML and DOCX XML structure.
 *
 * Returns:
 * - mammothHtml: HTML from Mammoth (used for tables, images)
 * - structure: Paragraph metadata from DOCX XML (styles, numbering, indentation)
 * - messages: Conversion warnings from Mammoth
 *
 * @param {ArrayBuffer} arrayBuffer - The file content as ArrayBuffer
 * @returns {Promise<{ mammothHtml: string, structure: import('./docxExtractorService').DocxStructure, messages: Array }>}
 */
export async function parseDocxFull(arrayBuffer) {
  // Run both extractions in parallel
  const [mammothResult, structure] = await Promise.all([
    mammoth.convertToHtml({ arrayBuffer }, mammothOptionsClean),
    extractDocxStructure(arrayBuffer),
  ]);

  return {
    mammothHtml: mammothResult.value,
    structure,
    messages: mammothResult.messages || [],
  };
}
