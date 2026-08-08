'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{
        background: '#000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'sans-serif',
        padding: '20px',
        textAlign: 'center',
        margin: 0,
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎰</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffd700', marginBottom: '16px' }}>SYSTEM RECOVERY REQUIRED</h2>
        <p style={{ color: '#aaa', marginBottom: '32px', maxWidth: '500px' }}>
          A critical error occurred in the casino engine. This has been logged for our engineers.
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          marginBottom: '32px',
          maxWidth: '80vw',
          overflowX: 'auto',
          color: '#ff4444',
        }}
        >
          {error.message || 'Unknown Runtime Error'}
        </div>
        <button
          onClick={() => reset()}
          style={{
            background: '#ffd700',
            color: '#000',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          RETRY INITIALIZATION
        </button>
      </body>
    </html>
  );
}
