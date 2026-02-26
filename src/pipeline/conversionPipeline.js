import { readFileAsArrayBuffer } from '../utils/fileUtils';
import { parseDocxFull } from '../services/parserService';
import { renderFaithfulHtml } from '../services/structureRendererService';
import { sanitizeHtml } from '../services/sanitizerService';
import { transformHtml } from '../services/transformerService';
import { optimizeForSeo } from '../services/seoService';
import { SEO_ENABLED } from '../config/appConfig';

/**
 * Run the full conversion pipeline on a .docx File.
 *
 * Pipeline (structure-faithful approach):
 *   1. Read file → ArrayBuffer
 *   2. Parse .docx → Mammoth HTML + DOCX XML structure (parallel)
 *   3. Render faithful HTML from DOCX structure (using Mammoth for tables/images)
 *   4. Sanitize HTML                              (DOMPurify)
 *   5. Transform HTML                             (semantic tag cleanup only)
 *   6. [Optional] SEO optimize                    (AI API — when enabled)
 *
 * Core principles:
 * - Structure is extracted directly from DOCX XML, not inferred from text
 * - Numbering is computed from Word's numbering definitions, not regenerated
 * - Paragraphs are NOT converted to <ol>/<ul> with auto-numbering
 * - Indentation hierarchy is preserved via CSS from DOCX measurements
 *
 * @param {File} file - The .docx File object
 * @returns {Promise<{ success: boolean, html?: string, messages?: Array, error?: string }>}
 */
export async function runPipeline(file) {
  try {
    // Step 1: Read file
    const arrayBuffer = await readFileAsArrayBuffer(file);

    // Step 2: Parse .docx → Mammoth HTML + DOCX XML structure
    const { mammothHtml, structure, messages } = await parseDocxFull(arrayBuffer);

    // Step 3: Render faithful HTML from DOCX structure
    // Uses DOCX XML metadata for paragraph types, numbering, indentation.
    // Falls back to Mammoth HTML for tables and images.
    const faithfulHtml = renderFaithfulHtml(mammothHtml, structure);

    // Step 4: Sanitize
    const sanitized = sanitizeHtml(faithfulHtml);

    // Step 5: Transform (semantic tag cleanup only — no structural changes)
    const transformed = transformHtml(sanitized);

    // Step 6: SEO (conditional)
    const finalHtml = SEO_ENABLED
      ? await optimizeForSeo(transformed)
      : transformed;

    return {
      success: true,
      html: finalHtml,
      messages: messages.map((m) => ({
        type: m.type,
        message: m.message,
      })),
    };
  } catch (err) {
    return {
      success: false,
      html: '',
      messages: [],
      error: err.message || 'An unexpected error occurred during conversion.',
    };
  }
}
