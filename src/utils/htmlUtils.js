/**
 * Wrap an HTML fragment in a basic HTML document structure (generic fallback).
 * For design-accurate output, use wrapInCpbankTemplate from templates/ instead.
 *
 * @param {string} html - The HTML content body
 * @param {string} [title='Converted Document'] - Document title
 * @returns {string}
 */
export function wrapInDocument(html, title = 'Converted Document') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * { padding: 0; margin: 0; box-sizing: border-box; scrollbar-width: thin}
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      line-height: 1.5;
      text-align: justify;
      max-width: 1024px;
      margin: 0 auto;
      padding: 2rem 1rem;
      color: #333;
      background: #f7f7f7;
    }
    .wrapper { background: #fff; padding: 2rem 1rem; box-shadow: rgb(0 0 0 / 20%) 0px 0px 6px 0px; }
    p { margin: 0.5rem 0; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background-color: #f5f5f5; }
    blockquote { border-left: 4px solid #ddd; margin: 1rem 0; padding: 0.5rem 1rem; color: #666; }
    pre, code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
    pre { padding: 1rem; overflow-x: auto; }
    ul { padding-left: 2.25rem; }
    ul li:not(:last-child) { margin-bottom: 0.5rem; }
  </style>
</head>
<body>
<div class="wrapper">
${html}
</div>
</body>
</html>`;
}

/**
 * Strip empty tags commonly produced by Mammoth.js conversions.
 * Removes empty <p>, <span>, <div> and whitespace-only variants.
 * @param {string} html
 * @returns {string}
 */
export function stripEmptyTags(html) {
  // Iteratively remove empty tags (nested empties collapse in passes)
  let result = html;
  let previous;
  do {
    previous = result;
    result = result.replace(/<(p|span|div|strong|em|b|i|u)>\s*<\/\1>/gi, '');
  } while (result !== previous);
  return result.trim();
}

/**
 * Escape HTML special characters for safe insertion into attributes/text.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}
