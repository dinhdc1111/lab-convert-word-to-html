const styles = {
  base: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  primary: {
    backgroundColor: '#2563eb',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
  danger: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

/**
 * Reusable button component.
 *
 * @param {{ variant?: 'primary'|'secondary'|'danger', disabled?: boolean, loading?: boolean, children: React.ReactNode, onClick?: () => void }} props
 */
export default function Button({
  variant = 'primary',
  disabled = false,
  loading = false,
  children,
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      style={{
        ...styles.base,
        ...styles[variant],
        ...(isDisabled ? styles.disabled : {}),
      }}
      disabled={isDisabled}
      onClick={onClick}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}
