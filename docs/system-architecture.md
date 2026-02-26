# System Architecture: DOCX to HTML Export System

This document describes the architecture, structure, and responsibilities of the DOCX to HTML export system. It serves as long-term context for AI-assisted refactoring and system maintenance.

## 1. Project Overview

### Purpose
The system provides a robust mechanism for converting Microsoft Word (.docx) documents into clean, structurally faithful HTML. It is designed to preserve the visual and hierarchical integrity of the original document, specifically catering to complex legal and formal document structures.

### Main Technologies
- **React**: UI framework for the application.
- **Vite**: Build tool and development server.
- **Mammoth.js**: Used for basic HTML conversion and extraction of complex elements like tables and images.
- **FileSaver.js**: Handles client-side file saving and downloads.

### Core Objective
The primary goal is to **preserve Word structure exactly** when exporting to HTML. This includes maintaining indentation hierarchy, numbering definitions (without regeneration), and paragraph styles, ensuring the output reflects the original DOCX XML rather than relying on text-based inference.

---

## 2. Export Pipeline Architecture

The conversion follows a structured pipeline to ensure data integrity at each stage:

1.  **DOCX Input**: The user uploads a `.docx` file as a `File` or `ArrayBuffer`.
2.  **XML Extraction**: The ZIP archive is read, and key XML files (`document.xml`, `numbering.xml`, `styles.xml`) are parsed using `jszip` and `DOMParser`.
3.  **Structure Model Builder**: A specialized model is built, extracting paragraph-level metadata (type, style, alignment, indentation).
4.  **Numbering Resolver**: Computed numbering prefix text (e.g., "1.", "a)", "•") is resolved from the Word numbering definitions and mapped directly to the model.
5.  **HTML Renderer**: A custom renderer generates HTML using the structure model. It uses Mammoth.js as a fallback for complex elements like tables and images.
6.  **UI Preview**: The generated HTML is sanitized and displayed in a real-time preview component.
7.  **File Export**: The final HTML is wrapped in a template and exported using `FileSaver.js`.

---

## 3. Core Modules and Responsibilities

While current implementation resides in `src/services/`, the logical architecture follows the structure below designed for high maintainability.

### `/core/docx/xmlExtractor.ts`
*(Source: `src/services/docxExtractorService.js`)*
- **Responsibility**: Low-level parsing of the DOCX ZIP structure and extraction of raw XML data.
- **Input**: `ArrayBuffer` (DOCX file).
- **Output**: JSON representation of raw XML nodes and relationship maps.
- **What it must NOT do**: Perform any business logic, rendering, or numbering computation.

### `/core/docx/structureBuilder.ts`
*(Source: `src/services/docxExtractorService.js`)*
- **Responsibility**: Orchestrates the building of the `DocxStructure` model by combining styles and document content.
- **Input**: Raw XML data from `xmlExtractor`.
- **Output**: `DocxStructure` object containing an array of `DocxParagraph` objects.
- **What it must NOT do**: Generate HTML or interact with the browser DOM.

### `/core/docx/numberingResolver.ts`
*(Source: `src/services/docxExtractorService.js`)*
- **Responsibility**: Interprets `numbering.xml` and computes the exact prefix text for every list item in the document.
- **Input**: Numbering definitions and document paragraphs.
- **Output**: Updated `DocxParagraph` objects with `numberingPrefix` property.
- **What it must NOT do**: Modify original text content or create new numbering sequences not present in Word.

### `/core/export/htmlRenderer.ts`
*(Source: `src/services/structureRendererService.js`)*
- **Responsibility**: Transforms the `DocxStructure` model into a clean HTML string.
- **Input**: `DocxStructure` and fallback Mammoth HTML.
- **Output**: Clean HTML string.
- **What it must NOT do**: Handle file downloads or UI state.

### `/core/export/exportDocx.ts`
*(Source: `src/services/exportService.js`)*
- **Responsibility**: Handles the final packaging of HTML into downloadable files or clipboard content.
- **Input**: HTML string and configuration.
- **Output**: Side-effect (file download or clipboard update).
- **What it must NOT do**: Parse DOCX or modify the internal structure model.

---

## 4. Structure Preservation Rules

To maintain absolute fidelity, all modules must adhere to these rules:

- **No auto numbering regeneration**: Use the exact prefix computed from Word. Do not use `<ol>`/`<ul>` tags for numbered lists as they rely on browser-side numbering.
- **No text-based structure inference**: Decisions must be made based on XML metadata (styles, nodes), never by scanning text content (e.g., "Starts with 'Article'").
- **Preserve paragraph styles**: Map Word style IDs to CSS classes accurately.
- **Preserve indentation levels**: Convert Word `twips` directly to `mm` or `px` indentation in the output CSS.
- **Preserve numbering definitions**: Respect `numId` and `ilvl` relationships exactly as defined in the source XML.
- **Do not modify original prefix text**: The `numberingPrefix` is extracted/computed; once set, it should be treated as immutable by the renderer.

---

## 5. Design Principles

- **Separation of Concerns**: Core parsing logic is strictly separated from rendering and UI logic.
- **No UI logic inside core**: Core modules must remain pure and testable outside a browser environment where possible.
- **No DOM mutation inside parser layer**: The DOCX parser works with a virtual structure model, not the active DOM.
- **Future-proof structure handling**: The `DocxStructure` model is designed to be extensible to and from other formats.
- **Avoid content-pattern hardcoding**: Architecture must remain agnostic of specific text patterns (e.g., do NOT depend on "Điều" or "Chương").

---

## 6. Known Risks and Constraints

- **Mammoth auto-list behavior**: Mammoth.js often attempts to create its own lists. We explicitly override/ignore this in favor of our custom XML extraction for lists.
- **Word numbering inconsistencies**: Word frequently allows "broken" or inconsistent numbering. The resolver must attempt to replicate these exactly rather than "fixing" them.
- **Complex nested numbering edge cases**: Deeply nested lists (level 5+) may require specialized CSS handling for alignment.

---

## 7. Extension Strategy

### Add new format support
1.  Implement a new `Extractor` in `/core/` that maps the new format to the standard `DocxStructure` model.
2.  Update `conversionPipeline` to route the file type to the appropriate extractor.

### Modify numbering behavior
1.  Extend `numberingResolver.ts` to support new `numFmt` types if encountered in future Word versions.
2.  Adjust the `NumberingCounter` class to handle specific reset behaviors if required.

### Change rendering strategy
1.  Modify `htmlRenderer.ts` or create a new renderer implementation.
2.  Update CSS templates in `/templates/` to reflect the new visual style.

### Integrate SEO optimization
1.  Leverage the existing `seoService.js` hook in the pipeline.
2.  Add post-rendering HTML transformation steps that do not violate structure preservation rules.
