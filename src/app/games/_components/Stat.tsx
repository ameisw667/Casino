export function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
        lineHeight: 1.1,
      }}
    >
      <span
        style={{
          fontSize: '0.6rem',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '3px',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '0.95rem',
          fontWeight: 900,
          color: highlight ? '#D4AF37' : '#ffffff',
          fontFamily: 'var(--font-mono, monospace)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </span>
    </div>
  );
}
