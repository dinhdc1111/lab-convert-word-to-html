/**
 * Legal Document Structure Normalizer
 *
 * Parses Vietnamese legal documents following the Điều / Khoản / Điểm hierarchy
 * and rebuilds correct HTML structure from raw text paragraphs.
 *
 * This service exists because Mammoth.js flattens numbered lists into a single
 * globally-continuous <ol>, destroying Article-scoped numbering. This normalizer
 * detects structural patterns via regex and rebuilds a proper hierarchical tree.
 *
 * Hierarchy:
 *   Document Title  → <h1>     (exactly one)
 *   Điều N.         → <h2>     (Article — resets all child counters)
 *   N.              → <ol><li> (Clause — resets point counter)
 *   a)              → <ol type="a"><li> (Point)
 *
 * @module legalNormalizerService
 * @see /.agents/skills/skill.md
 */

// ─── Pattern definitions ────────────────────────────────────────────────────

const PATTERNS = {
  /** Điều 1. / Điều 23. — Article level */
  article: /^Điều\s+\d+\./,
  /** 1. / 2. / 10. — Clause level (number + dot + space) */
  clause: /^\d+\.\s/,
  /** a) / b) / c) — Point level (letter + paren + space) */
  point: /^[a-z]\)\s/,
};

// ─── Node types ─────────────────────────────────────────────────────────────

/**
 * @typedef {'title' | 'article' | 'clause' | 'point' | 'text'} NodeType
 */

/**
 * @typedef {Object} LegalNode
 * @property {NodeType} type
 * @property {string} raw - Original text, unmodified
 * @property {LegalNode[]} children
 */

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Detect whether an HTML string contains Vietnamese legal document patterns.
 * Used to decide whether to apply normalization or skip it.
 *
 * @param {string} html - Raw HTML from mammoth
 * @returns {boolean}
 */
export function isVietnameseLegalDocument(html) {
  return PATTERNS.article.test(stripHtmlTags(html));
}

/**
 * Normalize a legal document from raw HTML paragraphs into correct
 * hierarchical HTML structure.
 *
 * Pipeline: raw HTML → extract paragraphs → classify → build tree → render HTML
 *
 * @param {string} rawHtml - HTML output from mammoth
 * @returns {string} Normalized semantic HTML
 */
export function normalizeLegalStructure(rawHtml) {
  // Step 1: Extract paragraphs from HTML
  const paragraphs = extractParagraphs(rawHtml);

  if (paragraphs.length === 0) {
    return rawHtml;
  }

  // Step 2: Classify each paragraph
  const classified = paragraphs.map((text) => ({
    type: classifyParagraph(text),
    raw: text,
    children: [],
  }));

  // Step 3: Build hierarchical tree
  const tree = buildTree(classified);

  // Step 4: Render to semantic HTML
  return renderTree(tree);
}

// ─── Step 1: Extract paragraphs ─────────────────────────────────────────────

/**
 * Extract text content from HTML paragraphs and list items.
 * Preserves inline HTML (bold, italic, links) but splits on block boundaries.
 *
 * @param {string} html
 * @returns {string[]}
 */
function extractParagraphs(html) {
  const results = [];

  // Match content inside <p>, <li>, <h1>–<h6> tags
  // Capture the inner HTML (preserving inline tags like <strong>, <em>, <a>)
  const blockRegex = /<(?:p|li|h[1-6])[^>]*>([\s\S]*?)<\/(?:p|li|h[1-6])>/gi;
  let match;

  while ((match = blockRegex.exec(html)) !== null) {
    const content = match[1].trim();
    if (content) {
      results.push(content);
    }
  }

  return results;
}

// ─── Step 2: Classify paragraphs ────────────────────────────────────────────

/**
 * Classify a paragraph's structural role by testing its plain text
 * against patterns in priority order.
 *
 * @param {string} html - Paragraph inner HTML
 * @returns {NodeType}
 */
function classifyParagraph(html) {
  const text = stripHtmlTags(html).trim();

  if (PATTERNS.article.test(text)) return 'article';
  if (PATTERNS.clause.test(text)) return 'clause';
  if (PATTERNS.point.test(text)) return 'point';
  return 'text';
}

// ─── Step 3: Build tree ─────────────────────────────────────────────────────

/**
 * Build a hierarchical tree from a flat list of classified nodes.
 *
 * Rules:
 * - First text node (before any article) that looks like a title → title node
 * - article nodes are top-level, reset clause/point scope
 * - clause nodes nest under current article
 * - point nodes nest under current clause
 * - text nodes attach to the deepest current scope
 *
 * @param {LegalNode[]} nodes
 * @returns {LegalNode[]}
 */
function buildTree(nodes) {
  const root = [];
  let currentArticle = null;
  let currentClause = null;
  let foundFirstArticle = false;

  for (const node of nodes) {
    switch (node.type) {
      case 'article':
        // New article — reset all child scopes
        foundFirstArticle = true;
        currentArticle = { ...node, children: [] };
        currentClause = null;
        root.push(currentArticle);
        break;

      case 'clause':
        if (currentArticle) {
          // Clause nests under current article, reset point scope
          currentClause = { ...node, children: [] };
          currentArticle.children.push(currentClause);
        } else {
          // Clause before any article — push to root as-is
          root.push({ ...node, children: [] });
        }
        break;

      case 'point':
        if (currentClause) {
          // Point nests under current clause
          currentClause.children.push({ ...node, children: [] });
        } else if (currentArticle) {
          // Point without a clause — attach to article
          currentArticle.children.push({ ...node, children: [] });
        } else {
          root.push({ ...node, children: [] });
        }
        break;

      case 'text':
      default:
        if (!foundFirstArticle) {
          // Text before first article — could be doc title or preamble
          const plainText = stripHtmlTags(node.raw).trim();
          if (root.length === 0 && plainText.length > 0 && plainText.length < 200) {
            // Likely document title
            root.push({ type: 'title', raw: node.raw, children: [] });
          } else {
            root.push({ type: 'text', raw: node.raw, children: [] });
          }
        } else if (currentClause) {
          // Body text under a clause — treat as continuation
          currentClause.children.push({ type: 'text', raw: node.raw, children: [] });
        } else if (currentArticle) {
          // Body text under an article
          currentArticle.children.push({ type: 'text', raw: node.raw, children: [] });
        } else {
          root.push({ type: 'text', raw: node.raw, children: [] });
        }
        break;
    }
  }

  return root;
}

// ─── Step 4: Render tree to HTML ────────────────────────────────────────────

/**
 * Render the hierarchical tree to clean semantic HTML.
 *
 * @param {LegalNode[]} tree
 * @returns {string}
 */
function renderTree(tree) {
  const parts = [];

  for (const node of tree) {
    switch (node.type) {
      case 'title':
        parts.push(`<h1 class="title">${node.raw}</h1>`);
        break;

      case 'article':
        parts.push(renderArticle(node));
        break;

      case 'clause':
        // Orphan clause at root level
        parts.push(`<p>${node.raw}</p>`);
        break;

      case 'text':
      default:
        parts.push(`<p>${node.raw}</p>`);
        break;
    }
  }

  return parts.join('\n');
}

/**
 * Render an Article node with its children (clauses, points, text).
 *
 * @param {LegalNode} article
 * @returns {string}
 */
function renderArticle(article) {
  const parts = [];

  // Article heading → <h2>
  parts.push(`<h2 class="article-title">${article.raw}</h2>`);

  // Group children into runs: consecutive clauses → <ol>, text → <p>
  const childGroups = groupChildren(article.children);

  for (const group of childGroups) {
    if (group.type === 'clause') {
      parts.push(renderClauseList(group.nodes));
    } else if (group.type === 'point') {
      parts.push(renderPointList(group.nodes));
    } else {
      for (const node of group.nodes) {
        parts.push(`<p>${node.raw}</p>`);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Render a list of clause nodes as <ol><li>...</li></ol>.
 * Each clause may contain nested points.
 *
 * @param {LegalNode[]} clauses
 * @returns {string}
 */
function renderClauseList(clauses) {
  const items = clauses.map((clause) => {
    const content = [clause.raw];

    // Group clause children
    const childGroups = groupChildren(clause.children);
    for (const group of childGroups) {
      if (group.type === 'point') {
        content.push(renderPointList(group.nodes));
      } else {
        for (const node of group.nodes) {
          content.push(`<p>${node.raw}</p>`);
        }
      }
    }

    return `<li>${content.join('\n')}</li>`;
  });

  return `<ol>${items.join('\n')}</ol>`;
}

/**
 * Render a list of point nodes as <ol type="a"><li>...</li></ol>.
 *
 * @param {LegalNode[]} points
 * @returns {string}
 */
function renderPointList(points) {
  const items = points.map((point) => {
    const content = [point.raw];
    for (const child of point.children) {
      content.push(`<p>${child.raw}</p>`);
    }
    return `<li>${content.join('\n')}</li>`;
  });

  return `<ol type="a">${items.join('\n')}</ol>`;
}

/**
 * Group consecutive children by type to batch them into lists.
 *
 * @param {LegalNode[]} children
 * @returns {{ type: string, nodes: LegalNode[] }[]}
 */
function groupChildren(children) {
  const groups = [];
  let currentGroup = null;

  for (const child of children) {
    const groupType = (child.type === 'clause' || child.type === 'point')
      ? child.type
      : 'text';

    if (currentGroup && currentGroup.type === groupType) {
      currentGroup.nodes.push(child);
    } else {
      currentGroup = { type: groupType, nodes: [child] };
      groups.push(currentGroup);
    }
  }

  return groups;
}

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Strip all HTML tags, returning plain text for pattern matching.
 * Does NOT modify the original content — only used for classification.
 *
 * @param {string} html
 * @returns {string}
 */
function stripHtmlTags(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}
