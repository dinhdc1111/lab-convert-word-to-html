import Loader from '../common/Loader';
import { previewStyles } from '../../templates/cpbankTemplate';

const styles = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: 'rgb(0 0 0 / 10%) 0px 0px 6px 0px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  headerTitle: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#374151',
    margin: 0,
  },
  badge: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: 500,
  },
  preview: {
    maxHeight: '600px',
    overflowY: 'auto',
  },
  empty: {
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '0.95rem',
  },
};

/**
 * Renders the converted HTML output in a preview panel
 * styled to match the CPBank reference design.
 *
 * @param {{ html: string, status: string }} props
 */
export default function HtmlPreview({ html, status }) {
  if (status === 'converting') {
    return (
      <div style={styles.container}>
        <Loader text="Converting your document..." />
      </div>
    );
  }

  if (!html) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <p>📝 Your converted HTML will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <p style={styles.headerTitle}>HTML Preview</p>
        <span style={styles.badge}>Live</span>
      </div>
      <style>{previewStyles}</style>
      <div
        className="cpbank-preview"
        style={styles.preview}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
