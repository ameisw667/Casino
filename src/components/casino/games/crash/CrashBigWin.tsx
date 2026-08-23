'use client';

interface CrashBigWinProps {
  amount: number;
  multiplier: number;
  onClose: () => void;
}

/**
 * Big-win celebration overlay. Pure presentational — extracted verbatim from crash/page.tsx.
 */
export function CrashBigWin({ amount, multiplier, onClose }: CrashBigWinProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 'clamp(3rem, 12vw, 5.5rem)',
            color: '#FFD700',
            textShadow: '0 0 60px rgba(255, 215, 0, 0.9)',
            fontWeight: 900,
            margin: 0,
          }}
        >
          BIG WIN!
        </h1>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 6vw, 3.2rem)',
            color: '#FFF',
            fontFamily: 'monospace',
            margin: '10px 0',
          }}
        >
          ${amount.toFixed(2)}
        </h2>
        <div
          style={{
            fontSize: '1.5rem',
            color: '#4ade80',
            fontWeight: 800,
            fontFamily: 'monospace',
          }}
        >
          {multiplier.toFixed(2)}x
        </div>
      </div>
    </div>
  );
}
