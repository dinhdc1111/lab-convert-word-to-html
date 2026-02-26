/**
 * DOCX Structure Extractor
 *
 * Parses the raw DOCX (ZIP) file to extract structural metadata directly
 * from the Office Open XML, bypassing Mammoth's interpretation layer.
 *
 * Extracts:
 * - Paragraph styles (Heading 1–6, Normal, List Paragraph, etc.)
 * - Numbering definitions (numId, ilvl, format, prefix text)
 * - Indentation levels (from both numbering defs and explicit paragraph props)
 * - Run-level formatting (bold, italic, underline)
 *
 * This metadata is used downstream by structureRendererService to produce
 * HTML that is structurally faithful to the original Word document.
 *
 * @module docxExtractorService
 */

import JSZip from 'jszip';

// ─── XML Namespace ──────────────────────────────────────────────────────────

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} DocxRun
 * @property {string} text        - Text content of the run
 * @property {boolean} bold       - Whether run is bold
 * @property {boolean} italic     - Whether run is italic
 * @property {boolean} underline  - Whether run is underlined
 * @property {boolean} strike     - Whether run has strikethrough
 * @property {string|null} hyperlink - Hyperlink URL if this run is inside a hyperlink
 * @property {'superscript'|'subscript'|null} vertAlign - Vertical alignment
 */

/**
 * @typedef {Object} DocxParagraph
 * @property {number} index             - Zero-based position in document
 * @property {'heading'|'list-item'|'paragraph'|'table'} type
 * @property {number} headingLevel      - 1–6 for headings, 0 otherwise
 * @property {string} styleId           - Raw style ID (e.g., 'Heading1')
 * @property {string} styleName         - Human-readable style name
 * @property {boolean} isList           - Whether this paragraph has numbering
 * @property {number|null} numId        - Numbering definition ID
 * @property {number} ilvl              - Indent level (0-based) from numbering
 * @property {string} numberingPrefix   - Computed numbering prefix text (e.g., "1.", "a)")
 * @property {number} indentLeftTwips   - Left indent in twips (1/1440 inch)
 * @property {number} hangingTwips      - Hanging indent in twips
 * @property {DocxRun[]} runs           - Text runs with formatting
 * @property {string} textContent       - Plain text (for matching with Mammoth output)
 * @property {string} alignment         - Paragraph alignment (left, center, right, both)
 */

/**
 * @typedef {Object} DocxStructure
 * @property {DocxParagraph[]} paragraphs
 * @property {Object} numberingDefs
 * @property {Object} styleDefs
 */

/**
 * Extract structural metadata from a DOCX ArrayBuffer.
 *
 * @param {ArrayBuffer} arrayBuffer - The DOCX file content
 * @returns {Promise<DocxStructure>}
 */
export async function extractDocxStructure(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Parse the three key XML documents
  const documentXml = await readXmlFromZip(zip, 'word/document.xml');
  const numberingXml = await readXmlFromZip(zip, 'word/numbering.xml');
  const stylesXml = await readXmlFromZip(zip, 'word/styles.xml');
  const relsXml = await readXmlFromZip(zip, 'word/_rels/document.xml.rels');

  // Build lookup tables
  const styleDefs = parseStyleDefinitions(stylesXml);
  const numberingDefs = parseNumberingDefinitions(numberingXml);
  const hyperlinkMap = parseRelationships(relsXml);

  // Extract paragraphs with metadata
  const paragraphs = extractParagraphs(documentXml, numberingDefs, styleDefs, hyperlinkMap);

  return { paragraphs, numberingDefs, styleDefs };
}

// ─── ZIP / XML Helpers ──────────────────────────────────────────────────────

/**
 * Read and parse an XML file from the DOCX ZIP archive.
 * Returns null if the file doesn't exist.
 *
 * @param {JSZip} zip
 * @param {string} path
 * @returns {Promise<Document|null>}
 */
async function readXmlFromZip(zip, path) {
  const file = zip.file(path);
  if (!file) return null;

  const text = await file.async('text');
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/xml');
}

/**
 * Get child elements by local name within a namespace.
 * @param {Element} parent
 * @param {string} localName
 * @param {string} [ns=W_NS]
 * @returns {Element[]}
 */
function getElements(parent, localName, ns = W_NS) {
  if (!parent) return [];
  return Array.from(parent.getElementsByTagNameNS(ns, localName));
}

/**
 * Get the first child element by local name.
 * @param {Element} parent
 * @param {string} localName
 * @param {string} [ns=W_NS]
 * @returns {Element|null}
 */
function getFirst(parent, localName, ns = W_NS) {
  if (!parent) return null;
  return parent.getElementsByTagNameNS(ns, localName)[0] || null;
}

/**
 * Get attribute value using the w: namespace prefix.
 * Falls back to non-prefixed attribute.
 * @param {Element} el
 * @param {string} attrName
 * @returns {string|null}
 */
function getAttr(el, attrName) {
  if (!el) return null;
  return el.getAttributeNS(W_NS, attrName)
    || el.getAttribute(`w:${attrName}`)
    || el.getAttribute(attrName)
    || null;
}

// ─── Parse Relationships ────────────────────────────────────────────────────

/**
 * Parse document.xml.rels to build a map of relationship IDs to targets.
 * Used to resolve hyperlink references.
 *
 * @param {Document|null} relsXml
 * @returns {Map<string, string>}
 */
function parseRelationships(relsXml) {
  const map = new Map();
  if (!relsXml) return map;

  const rels = relsXml.getElementsByTagName('Relationship');
  for (const rel of rels) {
    const id = rel.getAttribute('Id');
    const target = rel.getAttribute('Target');
    const type = rel.getAttribute('Type') || '';
    if (id && target && type.includes('hyperlink')) {
      map.set(id, target);
    }
  }
  return map;
}

// ─── Parse Style Definitions ────────────────────────────────────────────────

/**
 * Parse word/styles.xml into a lookup of style definitions.
 *
 * @param {Document|null} stylesXml
 * @returns {Map<string, { styleId: string, name: string, type: string, basedOn: string|null, headingLevel: number, numId: number|null, ilvl: number|null }>}
 */
function parseStyleDefinitions(stylesXml) {
  const defs = new Map();
  if (!stylesXml) return defs;

  const styles = getElements(stylesXml.documentElement, 'style');

  for (const style of styles) {
    const styleId = getAttr(style, 'styleId');
    const type = getAttr(style, 'type') || 'paragraph';
    if (!styleId) continue;

    const nameEl = getFirst(style, 'name');
    const name = nameEl ? (getAttr(nameEl, 'val') || '') : '';

    const basedOnEl = getFirst(style, 'basedOn');
    const basedOn = basedOnEl ? (getAttr(basedOnEl, 'val') || null) : null;

    // Detect heading level from style name or outlineLvl
    let headingLevel = 0;
    const headingMatch = name.match(/^[Hh]eading\s+(\d)/);
    if (headingMatch) {
      headingLevel = parseInt(headingMatch[1], 10);
    }
    // Also check outlineLvl in pPr
    const pPr = getFirst(style, 'pPr');
    const outlineLvl = getFirst(pPr, 'outlineLvl');
    if (outlineLvl) {
      const lvl = parseInt(getAttr(outlineLvl, 'val') || '-1', 10);
      if (lvl >= 0 && lvl <= 8) {
        headingLevel = lvl + 1; // outlineLvl is 0-based
      }
    }

    // Check for numbering inherited from style
    let numId = null;
    let ilvl = null;
    let indentLeftTwips = 0;
    let hangingTwips = 0;

    const numPr = getFirst(pPr, 'numPr');
    if (numPr) {
      const numIdEl = getFirst(numPr, 'numId');
      const ilvlEl = getFirst(numPr, 'ilvl');
      if (numIdEl) numId = parseInt(getAttr(numIdEl, 'val') || '0', 10);
      if (ilvlEl) ilvl = parseInt(getAttr(ilvlEl, 'val') || '0', 10);
    }

    // Extract indentation from style
    const ind = getFirst(pPr, 'ind');
    if (ind) {
      indentLeftTwips = parseInt(getAttr(ind, 'left') || getAttr(ind, 'start') || '0', 10);
      hangingTwips = parseInt(getAttr(ind, 'hanging') || '0', 10);
    }

    defs.set(styleId, {
      styleId,
      name,
      type,
      basedOn,
      headingLevel,
      numId,
      ilvl,
      indentLeftTwips,
      hangingTwips,
    });
  }

  return defs;
}

// ─── Parse Numbering Definitions ────────────────────────────────────────────

/**
 * @typedef {Object} NumberingLevel
 * @property {number} ilvl
 * @property {number} start
 * @property {string} numFmt     - decimal, lowerLetter, upperLetter, lowerRoman, upperRoman, bullet, none
 * @property {string} lvlText    - e.g., "%1.", "%1.%2", "(%1)"
 * @property {number} indentLeft - Left indent in twips
 * @property {number} hanging    - Hanging indent in twips
 * @property {string} suffix     - tab, space, nothing
 */

/**
 * @typedef {Object} NumberingDef
 * @property {number} numId
 * @property {number} abstractNumId
 * @property {Map<number, NumberingLevel>} levels
 */

/**
 * Parse word/numbering.xml into numbering definitions.
 *
 * @param {Document|null} numberingXml
 * @returns {Map<number, NumberingDef>}
 */
function parseNumberingDefinitions(numberingXml) {
  const defs = new Map();
  if (!numberingXml) return defs;

  // Step 1: Parse abstract numbering definitions
  const abstractNums = new Map();
  const abstractNumEls = getElements(numberingXml.documentElement, 'abstractNum');

  for (const absNum of abstractNumEls) {
    const abstractNumId = parseInt(getAttr(absNum, 'abstractNumId') || '0', 10);
    const levels = new Map();

    const lvlEls = getElements(absNum, 'lvl');
    for (const lvl of lvlEls) {
      const ilvl = parseInt(getAttr(lvl, 'ilvl') || '0', 10);

      const startEl = getFirst(lvl, 'start');
      const start = startEl ? parseInt(getAttr(startEl, 'val') || '1', 10) : 1;

      const numFmtEl = getFirst(lvl, 'numFmt');
      const numFmt = numFmtEl ? (getAttr(numFmtEl, 'val') || 'decimal') : 'decimal';

      const lvlTextEl = getFirst(lvl, 'lvlText');
      const lvlText = lvlTextEl ? (getAttr(lvlTextEl, 'val') || '') : '';

      const suffixEl = getFirst(lvl, 'suff');
      const suffix = suffixEl ? (getAttr(suffixEl, 'val') || 'tab') : 'tab';

      // Indentation from level definition
      const pPr = getFirst(lvl, 'pPr');
      const ind = getFirst(pPr, 'ind');
      const indentLeft = ind ? parseInt(getAttr(ind, 'left') || '0', 10) : 0;
      const hanging = ind ? parseInt(getAttr(ind, 'hanging') || '0', 10) : 0;

      levels.set(ilvl, {
        ilvl,
        start,
        numFmt,
        lvlText,
        indentLeft,
        hanging,
        suffix,
      });
    }

    abstractNums.set(abstractNumId, levels);
  }

  // Step 2: Parse num elements (numId → abstractNumId mapping)
  const numEls = getElements(numberingXml.documentElement, 'num');
  for (const num of numEls) {
    const numId = parseInt(getAttr(num, 'numId') || '0', 10);
    const abstractNumIdEl = getFirst(num, 'abstractNumId');
    const abstractNumId = abstractNumIdEl
      ? parseInt(getAttr(abstractNumIdEl, 'val') || '0', 10)
      : 0;

    const levels = abstractNums.get(abstractNumId) || new Map();

    // Check for level overrides in <w:lvlOverride>
    const overrides = getElements(num, 'lvlOverride');
    for (const override of overrides) {
      const ilvl = parseInt(getAttr(override, 'ilvl') || '0', 10);
      const startOverride = getFirst(override, 'startOverride');
      if (startOverride && levels.has(ilvl)) {
        const existing = levels.get(ilvl);
        levels.set(ilvl, {
          ...existing,
          start: parseInt(getAttr(startOverride, 'val') || '1', 10),
        });
      }
    }

    defs.set(numId, { numId, abstractNumId, levels });
  }

  return defs;
}

// ─── Numbering Counter & Text Computation ───────────────────────────────────

/**
 * Manages counters for numbering computation across the document.
 */
class NumberingCounter {
  constructor() {
    /** @type {Map<string, number>} key = "numId:ilvl" → current count */
    this.counters = new Map();
    /** @type {number|null} last numId seen */
    this.lastNumId = null;
    /** @type {number} last ilvl seen */
    this.lastIlvl = -1;
  }

  /**
   * Get the next numbering text for a paragraph.
   *
   * @param {number} numId
   * @param {number} ilvl
   * @param {Map<number, NumberingDef>} numberingDefs
   * @returns {string} The computed prefix text
   */
  getNext(numId, ilvl, numberingDefs) {
    const def = numberingDefs.get(numId);
    if (!def) return '';

    const level = def.levels.get(ilvl);
    if (!level) return '';

    // If numFmt is 'bullet', return bullet character
    if (level.numFmt === 'bullet') {
      return this._getBulletChar(level.lvlText);
    }

    // If numFmt is 'none', return empty
    if (level.numFmt === 'none') {
      return '';
    }

    // Reset deeper levels when moving to a shallower level
    if (this.lastNumId === numId && ilvl < this.lastIlvl) {
      for (let i = ilvl + 1; i <= 9; i++) {
        this.counters.delete(`${numId}:${i}`);
      }
    }

    // Initialize or increment counter
    const key = `${numId}:${ilvl}`;
    if (!this.counters.has(key)) {
      this.counters.set(key, level.start);
    } else {
      this.counters.set(key, this.counters.get(key) + 1);
    }

    this.lastNumId = numId;
    this.lastIlvl = ilvl;

    // Build the numbering text from lvlText template
    return this._formatLvlText(level.lvlText, numId, def, numberingDefs);
  }

  /**
   * Format the lvlText template by replacing %N placeholders.
   *
   * @param {string} lvlText - e.g., "%1.", "%1.%2", "(%1)"
   * @param {number} numId
   * @param {NumberingDef} def
   * @returns {string}
   */
  _formatLvlText(lvlText, numId, def) {
    return lvlText.replace(/%(\d)/g, (_, levelStr) => {
      const levelIndex = parseInt(levelStr, 10) - 1; // %1 → ilvl 0
      const counterKey = `${numId}:${levelIndex}`;
      const value = this.counters.get(counterKey) || 1;
      const levelDef = def.levels.get(levelIndex);
      const fmt = levelDef ? levelDef.numFmt : 'decimal';
      return formatNumber(value, fmt);
    });
  }

  /**
   * Get bullet character from lvlText.
   * @param {string} lvlText
   * @returns {string}
   */
  _getBulletChar(lvlText) {
    // Common bullet characters
    if (!lvlText || lvlText === '\uF0B7' || lvlText === '') return '•';
    if (lvlText === 'o' || lvlText === '\uF0A7') return '○';
    if (lvlText === '\uF0A7') return '■';
    return lvlText || '•';
  }
}

/**
 * Format a number according to the Word numFmt.
 *
 * @param {number} value
 * @param {string} fmt
 * @returns {string}
 */
function formatNumber(value, fmt) {
  switch (fmt) {
    case 'decimal':
    case 'decimalZero':
      return String(value);

    case 'lowerLetter':
      return toLetter(value, false);

    case 'upperLetter':
      return toLetter(value, true);

    case 'lowerRoman':
      return toRoman(value).toLowerCase();

    case 'upperRoman':
      return toRoman(value);

    case 'vietnameseAlpha':
    case 'thaiLetters':
      return String(value);

    default:
      return String(value);
  }
}

/**
 * Convert number to letter (1=a, 2=b, ..., 27=aa).
 * @param {number} n
 * @param {boolean} upper
 * @returns {string}
 */
function toLetter(n, upper) {
  let result = '';
  while (n > 0) {
    n--;
    result = String.fromCharCode((n % 26) + (upper ? 65 : 97)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

/**
 * Convert number to Roman numeral.
 * @param {number} num
 * @returns {string}
 */
function toRoman(num) {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

// ─── Extract Paragraphs from document.xml ───────────────────────────────────

/**
 * Walk document.xml and extract all paragraphs with their metadata.
 *
 * @param {Document} documentXml
 * @param {Map<number, NumberingDef>} numberingDefs
 * @param {Map<string, Object>} styleDefs
 * @param {Map<string, string>} hyperlinkMap
 * @returns {DocxParagraph[]}
 */
function extractParagraphs(documentXml, numberingDefs, styleDefs, hyperlinkMap) {
  if (!documentXml) return [];

  const body = getFirst(documentXml.documentElement, 'body');
  if (!body) return [];

  const counter = new NumberingCounter();
  const paragraphs = [];
  let index = 0;

  // Process top-level children of body
  for (const child of body.children) {
    const localName = child.localName;

    if (localName === 'p') {
      const para = processParagraph(child, index, numberingDefs, styleDefs, hyperlinkMap, counter);
      paragraphs.push(para);
      index++;
    } else if (localName === 'tbl') {
      // Tables are preserved as a special marker — Mammoth will handle the actual rendering
      paragraphs.push({
        index: index,
        type: 'table',
        headingLevel: 0,
        styleId: '',
        styleName: '',
        isList: false,
        numId: null,
        ilvl: 0,
        numberingPrefix: '',
        indentLeftTwips: 0,
        hangingTwips: 0,
        runs: [],
        textContent: '__TABLE__',
        alignment: 'left',
      });
      index++;
    } else if (localName === 'sdt') {
      // Structured document tags — extract inner paragraphs
      const innerParas = getElements(child, 'p');
      for (const p of innerParas) {
        const para = processParagraph(p, index, numberingDefs, styleDefs, hyperlinkMap, counter);
        paragraphs.push(para);
        index++;
      }
    }
  }

  return paragraphs;
}

/**
 * Process a single w:p element into a DocxParagraph.
 *
 * @param {Element} pEl - The w:p element
 * @param {number} index
 * @param {Map<number, NumberingDef>} numberingDefs
 * @param {Map<string, Object>} styleDefs
 * @param {Map<string, string>} hyperlinkMap
 * @param {NumberingCounter} counter
 * @returns {DocxParagraph}
 */
function processParagraph(pEl, index, numberingDefs, styleDefs, hyperlinkMap, counter) {
  const pPr = getFirst(pEl, 'pPr');

  // ─── Style ────────────────────────────────────────────────────────
  const pStyleEl = getFirst(pPr, 'pStyle');
  const styleId = pStyleEl ? (getAttr(pStyleEl, 'val') || '') : '';

  const styleDef = styleDefs.get(styleId) || null;
  const styleName = styleDef ? styleDef.name : '';
  let headingLevel = styleDef ? styleDef.headingLevel : 0;

  // ─── Numbering ────────────────────────────────────────────────────
  let numId = null;
  let ilvl = 0;
  let isList = false;

  // Check explicit numPr on the paragraph
  const numPr = getFirst(pPr, 'numPr');
  if (numPr) {
    const numIdEl = getFirst(numPr, 'numId');
    const ilvlEl = getFirst(numPr, 'ilvl');
    if (numIdEl) {
      numId = parseInt(getAttr(numIdEl, 'val') || '0', 10);
    }
    if (ilvlEl) {
      ilvl = parseInt(getAttr(ilvlEl, 'val') || '0', 10);
    }
  }

  // Fall back to numbering from style definition
  if (numId === null && styleDef && styleDef.numId !== null) {
    numId = styleDef.numId;
    ilvl = styleDef.ilvl || 0;
  }

  // A numId of 0 means "no numbering" (Word uses 0 to explicitly remove numbering)
  if (numId !== null && numId > 0) {
    isList = true;
  } else {
    numId = null;
  }

  // ─── Compute numbering prefix ─────────────────────────────────────
  let numberingPrefix = '';
  if (isList && numId !== null) {
    numberingPrefix = counter.getNext(numId, ilvl, numberingDefs);
  }

  // ─── Indentation ──────────────────────────────────────────────────
  let indentLeftTwips = 0;
  let hangingTwips = 0;

  const ind = getFirst(pPr, 'ind');
  if (ind) {
    indentLeftTwips = parseInt(getAttr(ind, 'left') || getAttr(ind, 'start') || '0', 10);
    hangingTwips = parseInt(getAttr(ind, 'hanging') || '0', 10);
  }

  // Fall back to indentation from style definition
  if (indentLeftTwips === 0 && hangingTwips === 0 && styleDef) {
    indentLeftTwips = styleDef.indentLeftTwips || 0;
    hangingTwips = styleDef.hangingTwips || 0;
  }

  // If no explicit indent (paragraph or style) but has numbering, use indent from numbering definition
  if (indentLeftTwips === 0 && isList && numId !== null) {
    const def = numberingDefs.get(numId);
    if (def) {
      const level = def.levels.get(ilvl);
      if (level) {
        indentLeftTwips = level.indentLeft;
        hangingTwips = hangingTwips || level.hanging;
      }
    }
  }

  // ─── Alignment ────────────────────────────────────────────────────
  const jcEl = getFirst(pPr, 'jc');
  const alignment = jcEl ? (getAttr(jcEl, 'val') || 'left') : 'left';

  // ─── Runs ─────────────────────────────────────────────────────────
  const runs = extractRuns(pEl, hyperlinkMap);
  const textContent = runs.map((r) => r.text).join('');

  // ─── Determine type ───────────────────────────────────────────────
  let type = 'paragraph';
  if (headingLevel > 0 && headingLevel <= 6) {
    type = 'heading';
  } else if (isList) {
    type = 'list-item';
  }

  return {
    index,
    type,
    headingLevel,
    styleId,
    styleName,
    isList,
    numId,
    ilvl,
    numberingPrefix,
    indentLeftTwips,
    hangingTwips,
    runs,
    textContent,
    alignment,
  };
}

/**
 * Extract runs (w:r elements and w:hyperlink elements) from a paragraph.
 *
 * @param {Element} pEl
 * @param {Map<string, string>} hyperlinkMap
 * @returns {DocxRun[]}
 */
function extractRuns(pEl, hyperlinkMap) {
  const runs = [];

  for (const child of pEl.children) {
    const localName = child.localName;

    if (localName === 'r') {
      runs.push(processRun(child, null));
    } else if (localName === 'hyperlink') {
      // Resolve hyperlink target
      const rId = child.getAttributeNS(R_NS, 'id')
        || child.getAttribute('r:id')
        || child.getAttribute('id')
        || '';
      const href = hyperlinkMap.get(rId) || null;
      const anchor = getAttr(child, 'anchor');
      const resolvedHref = href || (anchor ? `#${anchor}` : null);

      // Extract runs inside hyperlink
      const innerRuns = getElements(child, 'r');
      for (const r of innerRuns) {
        runs.push(processRun(r, resolvedHref));
      }
    } else if (localName === 'bookmarkStart' || localName === 'bookmarkEnd') {
      // Bookmark — extract the name for anchor support
      const bookmarkName = getAttr(child, 'name');
      if (bookmarkName && bookmarkName !== '_GoBack') {
        runs.push({
          text: '',
          bold: false,
          italic: false,
          underline: false,
          strike: false,
          hyperlink: null,
          vertAlign: null,
          bookmarkId: bookmarkName,
        });
      }
    }
  }

  return runs;
}

/**
 * Process a single w:r element into a DocxRun.
 *
 * @param {Element} rEl
 * @param {string|null} hyperlink
 * @returns {DocxRun}
 */
function processRun(rEl, hyperlink) {
  const rPr = getFirst(rEl, 'rPr');

  const bold = !!(getFirst(rPr, 'b') || getFirst(rPr, 'bCs'));
  const italic = !!(getFirst(rPr, 'i') || getFirst(rPr, 'iCs'));
  const underline = !!getFirst(rPr, 'u');
  const strike = !!(getFirst(rPr, 'strike') || getFirst(rPr, 'dstrike'));

  const vertAlignEl = getFirst(rPr, 'vertAlign');
  const vertAlign = vertAlignEl ? (getAttr(vertAlignEl, 'val') || null) : null;

  // Collect text from w:t elements
  const textEls = getElements(rEl, 't');
  const text = textEls.map((t) => t.textContent || '').join('');

  // Check for tab characters
  const tabEls = getElements(rEl, 'tab');
  const tabText = tabEls.length > 0 ? '\t' : '';

  // Check for break elements
  const brEls = getElements(rEl, 'br');
  const brText = brEls.map((br) => {
    const brType = getAttr(br, 'type');
    return brType === 'page' ? '' : '\n';
  }).join('');

  return {
    text: text + tabText + brText,
    bold,
    italic,
    underline,
    strike,
    hyperlink,
    vertAlign,
  };
}
