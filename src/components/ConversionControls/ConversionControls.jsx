import { TriangleAlert, Zap } from 'lucide-react';
import Button from '../common/Button';

const styles = {
  container: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  messages: {
    width: '100%',
    marginTop: '0.5rem',
  },
  warning: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '6px',
    fontSize: '0.85rem',
    color: '#92400e',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  error: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#991b1b',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  icon: {
    flexShrink: 0,
    marginTop: '0.1rem',
  },
};

/**
 * Convert / Reset buttons and status messages.
 *
 * @param {{
 *   onConvert: () => void,
 *   onReset: () => void,
 *   hasFile: boolean,
 *   status: string,
 *   error: string,
 *   messages: Array<{ type: string, message: string }>,
 * }} props
 */
export default function ConversionControls({
  onConvert,
  onReset,
  hasFile,
  status,
  error,
  messages = [],
}) {
  const isConverting = status === 'converting';
  const isDone = status === 'done';

  return (
    <div>
      <div style={styles.container}>
        <Button
          variant="primary"
          disabled={!hasFile || isConverting}
          loading={isConverting}
          onClick={onConvert}
        >
          {isConverting ? 'Converting...' : 'Convert to HTML'}
        </Button>

        {(hasFile || isDone) && (
          <Button variant="secondary" onClick={onReset} disabled={isConverting}>
            Clear
          </Button>
        )}
      </div>

      {error && (
        <div style={{ ...styles.messages }}>
          <div style={styles.error}>
            <TriangleAlert size={18} style={styles.icon} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={styles.warning}>
              <Zap size={16} style={styles.icon} />
              <span>{msg.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
