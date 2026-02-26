import ConverterContainer from './containers/ConverterContainer';

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerContent: {
    maxWidth: '960px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  badge: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '999px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontWeight: 600,
    letterSpacing: '0.03em',
  },
  main: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '2rem',
  },
};

function App() {
  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Word → HTML Converter</h1>
          <span style={styles.badge}>CLIENT-SIDE</span>
        </div>
      </header>
      <main style={styles.main}>
        <ConverterContainer />
      </main>
    </div>
  );
}

export default App;
