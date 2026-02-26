import { useState } from 'react';
import { Download, Clipboard, Check, X } from 'lucide-react';
import Button from '../common/Button';

const styles = {
  container: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  feedback: {
    fontSize: '0.85rem',
    color: '#059669',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  errorFeedback: {
    color: '#ef4444',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

/**
 * Export action buttons — download HTML file and copy to clipboard.
 *
 * @param {{
 *   html: string,
 *   fileName: string,
 *   onDownload: () => void,
 *   onCopy: () => Promise<boolean>,
 * }} props
 */
export default function ExportActions({ html, onDownload, onCopy }) {
  const [copyStatus, setCopyStatus] = useState(null); // 'success' | 'error' | null

  if (!html) return null;

  const handleCopy = async () => {
    const success = await onCopy();
    setCopyStatus(success ? 'success' : 'error');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div style={styles.container}>
      <Button variant="primary" onClick={onDownload}>
        <span style={styles.buttonContent}>
          <Download size={18} strokeWidth={2} />
          Download HTML
        </span>
      </Button>
      <Button variant="secondary" onClick={handleCopy}>
        <span style={styles.buttonContent}>
          <Clipboard size={18} strokeWidth={2} />
          Copy to Clipboard
        </span>
      </Button>
      
      {copyStatus === 'success' && (
        <span style={styles.feedback}>
          <Check size={16} strokeWidth={2.5} />
          Copied!
        </span>
      )}
      
      {copyStatus === 'error' && (
        <span style={{ ...styles.feedback, ...styles.errorFeedback }}>
          <X size={16} strokeWidth={2.5} />
          Copy failed
        </span>
      )}
    </div>
  );
}
