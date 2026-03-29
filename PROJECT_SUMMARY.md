# Project Summary: Word → HTML Converter (DocToHTML)

## Overview
A React-based web application that converts `.docx` (Word) documents to clean, structure-faithful HTML. The primary use case is converting Vietnamese legal/financial documents (specifically CPBank terms & conditions) into HTML that preserves the original document's numbering, indentation, and heading hierarchy.

**Key differentiator**: Unlike standard converters (Mammoth.js), this app extracts structure directly from DOCX XML rather than inferring it from text patterns, preserving exact numbering and indentation.

## Tech Stack
- **Framework**: React 19 + Vite 7 (SWC plugin)
- **Styling**: Tailwind CSS 4
- **UI Libraries**: lucide-react (icons), motion (animations), @monaco-editor/react (code editor)
- **Core Libraries**: mammoth.js (DOCX parsing fallback), JSZip (DOCX ZIP extraction), DOMPurify (sanitization), file-saver (download), jszip
- **Package Manager**: pnpm

## Architecture

### Directory Structure
```
src/
├── App.jsx                          # Root → renders ConverterContainer
├── main.jsx                         # React entry point
├── index.css                        # Tailwind import
├── containers/
│   └── ConverterContainer.jsx       # Main container: state mgmt, layout orchestration
├── hooks/
│   ├── useConversion.js             # Conversion pipeline state (idle/converting/done/error)
│   └── useFileUpload.js             # File selection, validation, drag-and-drop
├── pipeline/
│   └── conversionPipeline.js        # 6-step conversion orchestrator
├── services/
│   ├── docxExtractorService.js      # Core: DOCX XML → structure metadata (796 lines)
│   ├── parserService.js             # Mammoth HTML + DOCX structure extraction (parallel)
│   ├── structureRendererService.js  # DOCX metadata → faithful HTML rendering
│   ├── sanitizerService.js          # DOMPurify wrapper
│   ├── transformerService.js        # Post-process: <b>→<strong>, <i>→<em>, unwrap <ol>/<ul>
│   ├── seoService.js                # Stub for future AI SEO optimization
│   ├── exportService.js             # Download as HTML file, copy to clipboard
│   └── legalNormalizerService.js    # Vietnamese legal doc structure normalizer (Điều/Khoản/Điểm)
├── config/
│   ├── appConfig.js                 # MAX_FILE_SIZE (10MB), accepted types, SEO_ENABLED=false
│   └── conversionConfig.js          # Mammoth options, DOMPurify allowlist
├── templates/
│   └── cpbankTemplate.js            # CPBank HTML template (header, CSS, scroll-to-top)
├── utils/
│   ├── fileUtils.js                 # validateFile, formatFileSize, readFileAsArrayBuffer
│   └── htmlUtils.js                 # wrapInDocument, stripEmptyTags, escapeHtml
└── components/
    ├── layout/
    │   ├── Header.jsx               # App header with logo
    │   └── Sidebar.jsx              # Collapsible sidebar: options, file upload
    ├── editor/
    │   ├── Toolbar.jsx              # View mode tabs (preview/code/split), action buttons
    │   ├── DocumentPreview.jsx      # Live HTML preview panel
    │   ├── HtmlOutput.jsx           # Monaco editor for HTML output
    │   └── CodeBlock.jsx            # Monaco Editor wrapper
    ├── common/
    │   ├── Button.jsx               # Reusable button (primary/secondary/danger)
    │   ├── Loader.jsx               # Loading spinner
    │   └── OptionToggle.jsx         # Checkbox toggle
    ├── FileUploader/
    │   └── FileUploader.jsx         # Drag-and-drop file upload zone
    ├── HtmlPreview/
    │   └── HtmlPreview.jsx          # CPBank-styled preview component
    ├── ConversionControls/
    │   └── ConversionControls.jsx   # Convert/Reset buttons + status messages
    └── ExportActions/
        └── ExportActions.jsx        # Download/Copy buttons
```

### Conversion Pipeline (6 Steps)
1. **Read File** → `readFileAsArrayBuffer(file)` → ArrayBuffer
2. **Parse DOCX** → `parseDocxFull(arrayBuffer)` runs in parallel:
   - Mammoth.js → HTML (for tables/images fallback)
   - `extractDocxStructure()` → DOCX XML parsing (paragraphs, numbering, styles)
3. **Render Faithful HTML** → `renderFaithfulHtml()` uses DOCX metadata for structure, Mammoth for tables
4. **Sanitize** → `sanitizeHtml()` via DOMPurify with custom allowlist
5. **Transform** → `transformHtml()` replaces `<b>`→`<strong>`, `<i>`→`<em>`, strips empty tags, unwraps residual `<ol>/<ul>`
6. **SEO** (optional, disabled) → `optimizeForSeo()` stub for future AI API integration

### Core Service: docxExtractorService.js
The heart of the project. Parses raw DOCX ZIP to extract:
- **Paragraph styles**: Heading 1-6, Normal, List Paragraph
- **Numbering definitions**: numId, ilvl, format (decimal/letter/roman/bullet), prefix text computation
- **Indentation**: left indent + hanging indent in twips (1/1440 inch)
- **Run-level formatting**: bold, italic, underline, strikethrough, superscript/subscript
- **Hyperlinks**: resolved from document.xml.rels
- **Tables**: marked as `__TABLE__` placeholder, rendered by Mammoth

Key classes:
- `NumberingCounter`: Manages counters across the document, computes numbering prefix text from `lvlText` templates (e.g., `%1.` → `1.`, `%1.%2` → `1.1`)

### Render Principles
- Paragraphs are rendered as `<p>` with explicit numbering prefix — NOT `<ol>/<ul>` auto-numbering
- Numbering is computed from DOCX XML, not regenerated
- Indentation hierarchy preserved via inline CSS `margin-left` from DOCX twips
- Tables and images fall back to Mammoth.js output

### UI Features
- **3 view modes**: Preview only, Code only, Split view
- **Collapsible sidebar**: conversion options (remove empty tags, base64 images, minify)
- **Export formats**: HTML5 / XHTML toggle
- **Monaco editor**: editable HTML output with syntax highlighting
- **Drag-and-drop** file upload with validation (.docx only, max 10MB)
- **Export**: Download as `.html` file (wrapped in CPBank template) or copy to clipboard

### CPBank Template
Output HTML is wrapped in a CPBank-branded template (`cpbankTemplate.js`) containing:
- Header with logo, phone, website
- Full CSS matching the reference design at `design.vnpay.vn/web/cpbank/dkdk/`
- Scroll-to-top button with animation
- Responsive breakpoints (767px, 480px)
- DOCX structure-faithful CSS classes (`.docx-heading-*`, `.docx-list-item`, `.docx-indent-*`)

### Vietnamese Legal Document Support
`legalNormalizerService.js` provides specialized handling for Vietnamese legal documents:
- Detects pattern: `Điều N.` (Article) → `N.` (Clause) → `a)` (Point)
- Builds hierarchical tree from flat paragraphs
- Renders semantic HTML: `<h2>` for articles, `<ol>` for clauses, `<ol type="a">` for points
- Currently NOT integrated into the main pipeline (exists as a standalone service)

## State Management
- No external state library (Redux/Zustand) — uses React hooks only
- `useFileUpload`: file, fileName, fileSize, error, isDragging
- `useConversion`: html, status (idle|converting|done|error), error, messages

## Build Configuration
- Vite with manual chunks: `mammoth` and `vendor` (react, react-dom) separated
- ESLint with react-hooks and react-refresh plugins
- No TypeScript — plain JSX

## Key Files for Reference
- Pipeline entry: `src/pipeline/conversionPipeline.js:29`
- DOCX extraction: `src/services/docxExtractorService.js:71`
- Numbering computation: `src/services/docxExtractorService.js:362`
- HTML rendering: `src/services/structureRendererService.js:38`
- Container (main layout): `src/containers/ConverterContainer.jsx:12`
