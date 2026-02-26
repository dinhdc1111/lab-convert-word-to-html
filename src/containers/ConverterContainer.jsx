import { useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useConversion } from '../hooks/useConversion';
import { downloadAsHtml, copyToClipboard } from '../services/exportService';

import FileUploader from '../components/FileUploader/FileUploader';
import ConversionControls from '../components/ConversionControls/ConversionControls';
import HtmlPreview from '../components/HtmlPreview/HtmlPreview';
import ExportActions from '../components/ExportActions/ExportActions';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '0.5rem 0',
  },
};

/**
 * Smart container — the ONLY component that knows about hooks and services.
 * Composes all presentational components and wires props from hooks.
 */
export default function ConverterContainer() {
  const {
    file,
    fileName,
    fileSize,
    error: uploadError,
    isDragging,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    clearFile,
  } = useFileUpload();

  const {
    html,
    status,
    error: conversionError,
    messages,
    convert,
    reset,
  } = useConversion();

  const handleConvert = useCallback(() => {
    if (file) convert(file);
  }, [file, convert]);

  const handleReset = useCallback(() => {
    clearFile();
    reset();
  }, [clearFile, reset]);

  const handleDownload = useCallback(() => {
    const baseName = fileName.replace(/\.docx$/i, '') || 'converted';
    downloadAsHtml(html, baseName);
  }, [html, fileName]);

  const handleCopy = useCallback(() => {
    return copyToClipboard(html);
  }, [html]);

  return (
    <div style={styles.container}>
      {/* Upload section */}
      <div style={styles.section}>
        <FileUploader
          onFileSelect={handleFileSelect}
          fileName={fileName}
          fileSize={fileSize}
          error={uploadError}
          isDragging={isDragging}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />

        <ConversionControls
          onConvert={handleConvert}
          onReset={handleReset}
          hasFile={!!file}
          status={status}
          error={conversionError}
          messages={messages}
        />
      </div>

      <hr style={styles.divider} />

      {/* Output section */}
      <div style={styles.section}>
        <HtmlPreview html={html} status={status} />

        <ExportActions
          html={html}
          fileName={fileName}
          onDownload={handleDownload}
          onCopy={handleCopy}
        />
      </div>
    </div>
  );
}
