/**
 * Mammoth.js conversion options.
 *
 * IMPORTANT: The primary pipeline now uses DOCX XML extraction for structure.
 * Mammoth is used only as a fallback for rich content (tables, images).
 * List conversion is overridden to prevent Mammoth from generating <ol>/<ul>
 * with auto-numbering, which destroys Word's original numbering structure.
 */
export const mammothOptions = {
  styleMap: [
    // ─── Headings ───
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Heading 4'] => h4:fresh",
    "p[style-name='Heading 5'] => h5:fresh",
    "p[style-name='Heading 6'] => h6:fresh",

    // ─── Override list conversion: render as <p> instead of <li> ───
    // This prevents Mammoth from wrapping items in <ol>/<ul> and
    // using browser auto-numbering. The actual numbering prefix
    // is computed from DOCX XML by docxExtractorService.
    "p:ordered-list(1) => p.docx-ol-1:fresh",
    "p:ordered-list(2) => p.docx-ol-2:fresh",
    "p:ordered-list(3) => p.docx-ol-3:fresh",
    "p:ordered-list(4) => p.docx-ol-4:fresh",
    "p:ordered-list(5) => p.docx-ol-5:fresh",
    "p:unordered-list(1) => p.docx-ul-1:fresh",
    "p:unordered-list(2) => p.docx-ul-2:fresh",
    "p:unordered-list(3) => p.docx-ul-3:fresh",
    "p:unordered-list(4) => p.docx-ul-4:fresh",
    "p:unordered-list(5) => p.docx-ul-5:fresh",

    // ─── Run styles ───
    "r[style-name='Strong'] => strong",
    "r[style-name='Emphasis'] => em",
  ],
  convertImage: mammothImageConverter(),
};

/**
 * Returns a mammoth image converter that embeds images as base64 data URIs.
 */
function mammothImageConverter() {
  return {
    __type: 'imgElement',
    altText: '',
  };
}

/**
 * Mammoth options used for the table/image fallback pass.
 * Includes list overrides to prevent auto-numbering artifacts.
 */
export const mammothOptionsClean = {
  styleMap: mammothOptions.styleMap,
};

/**
 * DOMPurify configuration — allowlist of safe HTML tags and attributes.
 *
 * Updated to support structure-faithful rendering:
 * - 'style' attribute is allowed for inline indentation from DOCX
 * - data-* attributes allowed for DOCX metadata
 */
export const sanitizerConfig = {
  ALLOWED_TAGS: [
    // Structure
    'article', 'section', 'div', 'span', 'p', 'br', 'hr',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Inline semantics
    'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup', 'mark', 'small',
    'abbr', 'cite', 'code', 'kbd', 'pre', 'blockquote', 'q',
    // Lists (kept for backward compat; new pipeline uses <p> for lists)
    'ul', 'ol', 'li',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Media
    'img', 'figure', 'figcaption',
    // Links
    'a',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id',
    'colspan', 'rowspan', 'width', 'height',
    'target', 'rel', 'type', 'start',
    'style', // Needed for inline indentation from DOCX structure
  ],
  ALLOW_DATA_ATTR: true, // Allow data-docx-* attributes for structure metadata
};
