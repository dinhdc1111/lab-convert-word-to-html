import { useRef } from 'react';
import { FileText } from 'lucide-react';

const styles = {
  dropzone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafafa',
  },
  dropzoneActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  dropzoneError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '0.75rem',
    color: '#9ca3af',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 0.25rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    margin: 0,
  },
  fileInfo: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  fileName: {
    fontWeight: 600,
    color: '#166534',
    fontSize: '0.9rem',
  },
  fileSize: {
    color: '#6b7280',
    fontSize: '0.85rem',
  },
  error: {
    marginTop: '0.75rem',
    color: '#ef4444',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  hidden: {
    display: 'none',
  },
};

/**
 * File upload drop zone component.
 * Supports click-to-browse and drag-and-drop.
 *
 * @param {{
 *   onFileSelect: (e: Event) => void,
 *   fileName: string,
 *   fileSize: string,
 *   error: string,
 *   isDragging: boolean,
 *   onDrop: (e: DragEvent) => void,
 *   onDragOver: (e: DragEvent) => void,
 *   onDragLeave: (e: DragEvent) => void,
 * }} props
 */
export default function FileUploader({
  onFileSelect,
  fileName,
  fileSize,
  error,
  isDragging,
  onDrop,
  onDragOver,
  onDragLeave,
}) {
  const inputRef = useRef(null);

  const dropzoneStyle = {
    ...styles.dropzone,
    ...(isDragging ? styles.dropzoneActive : {}),
    ...(error ? styles.dropzoneError : {}),
  };

  const iconColor = error ? '#ef4444' : isDragging ? '#2563eb' : '#9ca3af';

  return (
    <div
      style={dropzoneStyle}
      onClick={() => inputRef.current?.click()}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx"
        onChange={onFileSelect}
        style={styles.hidden}
      />

      <div style={styles.iconWrapper}>
        <FileText size={40} color={iconColor} strokeWidth={1.5} />
      </div>
      <p style={styles.title}>
        {isDragging ? 'Drop your file here' : 'Drop a .docx file or click to browse'}
      </p>
      <p style={styles.subtitle}>Maximum file size: 10 MB</p>

      {fileName && !error && (
        <div style={styles.fileInfo}>
          <span style={styles.fileName}>{fileName}</span>
          <span style={styles.fileSize}>({fileSize})</span>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}
