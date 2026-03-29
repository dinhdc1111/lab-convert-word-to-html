/**
 * CPBank Terms & Conditions HTML template.
 *
 * Pixel-accurate reproduction of the reference design at:
 * https://design.vnpay.vn/web/cpbank/dkdk/terms-and-conditions-m-banking.html
 *
 * This template provides:
 * - Full CSS matching the reference (typography, spacing, lists, layout)
 * - Responsive header with logo, phone, website
 * - Scroll-to-top button
 * - Mobile breakpoints (767px, 480px)
 */

/**
 * Full CSS stylesheet matching the reference design.
 */
export const cpbankStyles = `
:root {
  --primary: #ec7925;
}

* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  scrollbar-width: thin;
}

body {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  background-color: #f7f7f7;
  line-height: 1.5;
  text-align: justify;
  margin: 0;
  padding: 8px;
}

p {
  margin: 0.5rem 0;
}

.wrapper {
  max-width: 1024px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
  background: #ffffff;
  box-shadow: rgb(0 0 0 / 20%) 0px 0px 6px 0px;
}

/* ── Title ── */
.title {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
}

/* ── Section headings ── */
.article-title,
.sub-title,
.define {
  font-weight: 600;
}

.article-title {
  margin-top: 1.5rem;
  text-transform: uppercase;
}

.article-indent {
  text-indent: 2rem;
}

/* ── Links ── */
.number-phone {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
}

a {
  color: inherit;
}

/* ── DOCX Structure-Faithful Rendering ── */

/* Headings from DOCX */
.docx-heading {
  margin: 0.5rem 0;
}

.docx-heading-1 {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
}

.docx-heading-2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  text-transform: uppercase;
}

.docx-heading-3 {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
}

.docx-heading-4,
.docx-heading-5,
.docx-heading-6 {
  font-size: 1rem;
  font-weight: 600;
}

.docx-heading-num {
  font-weight: inherit;
}

/* List items rendered as paragraphs with explicit numbering */
.docx-list-item {
  margin: 0.3rem 0;
  position: relative;
}

.docx-list-marker {
  font-weight: 600;
  display: inline;
}

.docx-bullet-marker {
  display: inline;
  margin-right: 0.25rem;
}

/* Indentation levels for DOCX hierarchy */
.docx-indent-0 { /* Uses inline margin-left from DOCX twips */ }
.docx-indent-1 { /* Uses inline margin-left from DOCX twips */ }
.docx-indent-2 { /* Uses inline margin-left from DOCX twips */ }
.docx-indent-3 { /* Uses inline margin-left from DOCX twips */ }
.docx-indent-4 { /* Uses inline margin-left from DOCX twips */ }

/* Paragraph types */
.docx-paragraph {
  margin: 0.5rem 0;
}

/* Alignment */
.docx-align-center { text-align: center; }
.docx-align-right { text-align: right; }
.docx-align-justify { text-align: justify; }

/* ── Legacy Lists (kept for backward compatibility) ── */
ul {
  padding-left: 2.25rem;
  position: relative;
}

ul li {
  list-style: none;
}

ul.ul-style-1 {
  padding: 0;
}

ul.ul-style-1 > li {
  list-style: none;
  position: relative;
  padding: 0 0 0 1.5rem;
}

ul.ul-style-1 > li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 0.4rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background-color: #000;
}

ul.ul-level-2 {
  padding-left: 1rem;
}

ul.ul-level-2 li {
  list-style: circle;
}

ul li .number {
  position: absolute;
  left: 0;
  font-weight: 600;
}

ul li:not(:last-child) {
  margin-bottom: 0.5rem;
}

/* ── Header ── */
.header-wrap {
  padding-bottom: 0.5rem;
  border-bottom: 3px solid var(--primary);
}

header table {
  width: 100%;
}

.logo-wrap .logo {
  height: 40px;
}

header .header-contact {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

header .header-contact a {
  text-decoration: none;
  color: inherit;
}

header .header-contact svg {
  margin-right: 0.25rem;
}

/* ── Main section ── */
section.main {
  margin-top: 2rem;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Scroll to top ── */
.scroll-top {
  width: 36px;
  height: 36px;
  position: fixed;
  bottom: -20px;
  right: 20px;
  cursor: pointer;
  z-index: 100;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  opacity: 0;
  box-shadow: 0 0.5rem 1.5rem 0.5rem rgb(0 0 0 / 8%);
  transition: all .2s ease;
}

.scroll-top.show {
  opacity: 0.3;
  bottom: 40px;
}

.scroll-top .ic-arrow {
  transform: rotate(-90deg);
}

@media (hover) {
  .scroll-top.show:hover {
    opacity: 1;
  }
}

.scroll-top.show:focus,
.scroll-top.show:visited,
.scroll-top.show:active {
  opacity: 1;
}

/* ── Responsive ── */
@media only screen and (max-width: 767px) {
  body {
    text-align: left;
  }

  header .header-contact a {
    font-size: 14px;
  }
}

@media only screen and (max-width: 480px) {
  .logo-wrap {
    text-align: center;
  }

  .header-inner {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  header .header-contact a {
    font-size: 12px;
  }
}
`;

/**
 * SVG icons used in the header and scroll-to-top button.
 */
const PHONE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path d="m15.086 10.4-3.137-1.392a1.542 1.542 0 0 0-1.824.442l-.947 1.185a12.427 12.427 0 0 1-3.813-3.812l1.184-.946a1.541 1.541 0 0 0 .444-1.826L5.6.914A1.539 1.539 0 0 0 3.807.049L1.155.738a1.545 1.545 0 0 0-1.14 1.706 15.976 15.976 0 0 0 13.542 13.541 1.522 1.522 0 0 0 .212.015 1.544 1.544 0 0 0 1.493-1.154l.688-2.653a1.533 1.533 0 0 0-.864-1.793z" style="fill:var(--primary)"/></svg>`;

const GLOBE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 91.582 91.582"><g transform="translate(-3.813 -3.813)"><path style="fill:var(--primary)" d="M49.6,3.813A45.791,45.791,0,1,0,95.395,49.6,45.818,45.818,0,0,0,49.6,3.813Zm-1.984,4.2v19.7A80.049,80.049,0,0,1,33.211,26.1a49.246,49.246,0,0,1,2.68-6.582C39.172,12.949,43.324,8.961,47.617,8.016Zm3.969,0c4.3.945,8.449,4.934,11.727,11.5A49.177,49.177,0,0,1,66,26.121a80.73,80.73,0,0,1-14.418,1.594ZM38.039,9.41a34.142,34.142,0,0,0-5.7,8.324,54.444,54.444,0,0,0-2.992,7.438,54.848,54.848,0,0,1-10.465-3.906A41.672,41.672,0,0,1,38.039,9.41Zm23.129,0A41.654,41.654,0,0,1,80.3,21.25,51.274,51.274,0,0,1,69.879,25.2a55.522,55.522,0,0,0-3.008-7.469A34.253,34.253,0,0,0,61.168,9.41ZM82.9,24.352a41.558,41.558,0,0,1,8.48,23.266H73.445a81.986,81.986,0,0,0-2.457-18.582A54,54,0,0,0,82.9,24.352Zm-66.621.031A57.94,57.94,0,0,0,28.227,29a81.888,81.888,0,0,0-2.465,18.621H7.828A41.546,41.546,0,0,1,16.277,24.383Zm15.816,5.551a84.372,84.372,0,0,0,15.523,1.758V47.617H29.73A78.606,78.606,0,0,1,32.094,29.934Zm35.027.023a78.927,78.927,0,0,1,2.355,17.66H51.586V31.691A83.79,83.79,0,0,0,67.121,29.957ZM7.828,51.586H25.762a81.992,81.992,0,0,0,2.457,18.586,53.993,53.993,0,0,0-11.91,4.684A41.572,41.572,0,0,1,7.828,51.586Zm21.9,0H47.617v15.93A83.425,83.425,0,0,0,32.086,69.25,78.926,78.926,0,0,1,29.73,51.586Zm21.855,0H69.477a78.621,78.621,0,0,1-2.363,17.688,84.081,84.081,0,0,0-15.527-1.758Zm21.859,0H91.379A41.558,41.558,0,0,1,82.93,74.824,57.95,57.95,0,0,0,70.98,70.211,81.893,81.893,0,0,0,73.445,51.586ZM47.617,71.492V91.2c-4.293-.953-8.445-4.945-11.727-11.5A49.93,49.93,0,0,1,33.2,73.086,80.388,80.388,0,0,1,47.617,71.492Zm3.969,0A79.7,79.7,0,0,1,66,73.109a50.013,50.013,0,0,1-2.684,6.59c-3.277,6.555-7.43,10.547-11.727,11.5ZM29.328,74a55.379,55.379,0,0,0,3.008,7.473,34.42,34.42,0,0,0,5.7,8.332A41.784,41.784,0,0,1,18.895,77.953,52,52,0,0,1,29.328,74Zm40.535.031a55.234,55.234,0,0,1,10.461,3.906A41.745,41.745,0,0,1,61.168,89.8a34.533,34.533,0,0,0,5.7-8.332A54.322,54.322,0,0,0,69.863,74.031Z"/></g></svg>`;

const ARROW_UP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="ic-arrow" width="24" height="24" viewBox="0 0 24 24"><g transform="translate(-336 -78)"><path d="M352,101.3l7-6.9-7-7.1" transform="translate(-7.5 -3.8)" fill="none" stroke="#fff" stroke-miterlimit="10" stroke-width="1.5"/><rect width="24" height="24" transform="translate(336 78)" fill="none"/></g></svg>`;

/**
 * Builds the <header> block with logo, phone, and website.
 *
 * @param {object} [options]
 * @param {string} [options.logoUrl] - URL or path to logo image
 * @param {string} [options.phone] - Phone number to display
 * @param {string} [options.phoneHref] - Phone href for tel: link
 * @param {string} [options.website] - Website display text
 * @param {string} [options.websiteUrl] - Website URL
 * @returns {string}
 */
export function buildHeader(options = {}) {
  const {
    logoUrl = 'https://design.vnpay.vn/web/cpbank/dkdk/logo/cambodia.svg',
    phone = '+855(0) 23 260 888',
    phoneHref = 'tel:+855(0) 23 260 888',
    website = 'www.cambodiapostbank.com',
    websiteUrl = 'https://www.cambodiapostbank.com',
  } = options;

  return `
    <header>
      <div class="header-wrap">
        <div class="header-inner">
          <div class="logo-wrap">
            <img src="${logoUrl}" alt="CPBank Logo" class="logo">
          </div>
          <div class="header-contact-wrap">
            <div class="header-contact">
              ${PHONE_ICON_SVG}
              <a href="${phoneHref}">${phone}</a>
            </div>
            <div class="header-contact">
              ${GLOBE_ICON_SVG}
              <a target="_blank" rel="noopener noreferrer" href="${websiteUrl}">${website}</a>
            </div>
          </div>
        </div>
      </div>
    </header>`;
}

/**
 * Builds the scroll-to-top button + its script.
 * @returns {string}
 */
export function buildScrollToTop() {
  return `
    <div class="scroll-top">
      ${ARROW_UP_SVG}
    </div>
    <script>
      const btnScroll = document.querySelector(".scroll-top");
      let toTop, windowHeight = window.innerHeight;
      window.addEventListener("scroll", function() {
        toTop = this.scrollY;
        toTop >= windowHeight ? btnScroll.classList.add("show") : btnScroll.classList.remove("show");
      });
      function scrollToTop() {
        if (document.body.scrollTop !== 0 || document.documentElement.scrollTop !== 0) {
          window.scrollBy(0, -windowHeight / 3);
          requestAnimationFrame(scrollToTop);
        }
      }
      btnScroll.addEventListener("click", function() { scrollToTop(); });
    </script>`;
}

/**
 * Wrap converted HTML body in the full CPBank document template.
 *
 * @param {string} bodyHtml - The converted HTML content (section body)
 * @param {string} [title='Terms and Conditions for CPBank Mobile Banking']
 * @param {object} [headerOptions] - Options passed to buildHeader()
 * @returns {string} Full HTML document
 */
export function wrapInCpbankTemplate(bodyHtml, title = 'Terms and Conditions for CPBank Mobile Banking', headerOptions = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="CPBank - ${title}">
  <meta name="keywords" content="cpbank, terms and conditions, mobile banking">
  <meta name="author" content="CPBank">
  <title>${title}</title>
  <style>${cpbankStyles}</style>
</head>
<body>
  <div class="wrapper">
    ${buildHeader(headerOptions)}
    <section class="main">
      ${bodyHtml}
    </section>
  </div>
  ${buildScrollToTop()}
</body>
</html>`;
}

/**
 * The subset of CSS used for inline preview rendering inside the app.
 * Scoped to avoid leaking into the app's own styles.
 */
export const previewStyles = `
  .cpbank-preview {
    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    text-align: justify;
    color: #333;
    padding: 2rem 1rem 1rem;
  }

  .cpbank-preview .title {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }

  .cpbank-preview .article-title,
  .cpbank-preview .sub-title,
  .cpbank-preview .define {
    font-weight: 600;
  }

  .cpbank-preview .article-title {
    margin-top: 1.5rem;
    text-transform: uppercase;
  }

  .cpbank-preview .article-indent {
    text-indent: 2rem;
  }

  .cpbank-preview p {
    margin: 0.5rem 0;
  }

  /* ── DOCX structure-faithful preview styles ── */

  .cpbank-preview .docx-heading {
    margin: 0.5rem 0;
  }

  .cpbank-preview .docx-heading-1 {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }

  .cpbank-preview .docx-heading-2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1.5rem;
    text-transform: uppercase;
  }

  .cpbank-preview .docx-heading-3 {
    font-size: 1rem;
    font-weight: 600;
    margin-top: 1rem;
  }

  .cpbank-preview .docx-heading-4,
  .cpbank-preview .docx-heading-5,
  .cpbank-preview .docx-heading-6 {
    font-size: 1rem;
    font-weight: 600;
  }

  .cpbank-preview .docx-heading-num {
    font-weight: inherit;
  }

  .cpbank-preview .docx-list-item {
    margin: 0.3rem 0;
    position: relative;
  }

  .cpbank-preview .docx-list-marker {
    font-weight: 600;
    display: inline;
  }

  .cpbank-preview .docx-bullet-marker {
    display: inline;
    margin-right: 0.25rem;
  }

  .cpbank-preview .docx-paragraph {
    margin: 0.5rem 0;
  }

  .cpbank-preview .docx-align-center { text-align: center; }
  .cpbank-preview .docx-align-right { text-align: right; }
  .cpbank-preview .docx-align-justify { text-align: justify; }

  /* ── Legacy list styles (backward compatibility) ── */

  .cpbank-preview ul {
    padding-left: 2.25rem;
    position: relative;
  }

  .cpbank-preview ul li {
    list-style: none;
  }

  .cpbank-preview ul.ul-style-1 {
    padding: 0;
  }

  .cpbank-preview ul.ul-style-1 > li {
    list-style: none;
    position: relative;
    padding: 0 0 0 1.5rem;
  }

  .cpbank-preview ul.ul-style-1 > li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.5rem;
    width: 0.4rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: #000;
  }

  .cpbank-preview ul.ul-level-2 {
    padding-left: 1rem;
  }

  .cpbank-preview ul.ul-level-2 li {
    list-style: circle;
  }

  .cpbank-preview ul li .number {
    position: absolute;
    left: 0;
    font-weight: 600;
  }

  .cpbank-preview ul li:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  .cpbank-preview a {
    color: inherit;
  }

  .cpbank-preview .number-phone {
    color: inherit;
    text-decoration: none;
    font-weight: 600;
  }
`;
