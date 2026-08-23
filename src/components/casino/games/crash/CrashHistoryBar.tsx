'use client';

interface CrashHistoryBarProps {
  history: number[];
}

/**
 * Crash recent-result pills bar. Pure presentational — extracted verbatim from crash/page.tsx.
 */
export function CrashHistoryBar({ history }: CrashHistoryBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}
    >
      {history.slice(0, 22).map((h, i) => (
        <div
          key={i}
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            flexShrink: 0,
            fontFamily: 'monospace',
            color:
              h >= 10
                ? '#FFD700'
                : h >= 5
                  ? '#c084fc'
                  : h >= 2
                    ? '#60a5fa'
                    : 'rgba(255,255,255,0.45)',
            background:
              h >= 10
                ? 'rgba(255,215,0,0.12)'
                : h >= 5
                  ? 'rgba(192,132,252,0.12)'
                  : h >= 2
                    ? 'rgba(96,165,250,0.12)'
                    : 'rgba(255,255,255,0.04)',
            border: `1px solid ${
              h >= 10
                ? 'rgba(255,215,0,0.3)'
                : h >= 5
                  ? 'rgba(192,132,252,0.3)'
                  : h >= 2
                    ? 'rgba(96,165,250,0.3)'
                    : 'rgba(255,255,255,0.08)'
            }`,
          }}
        >
          {h.toFixed(2)}x
        </div>
      ))}
    </div>
  );
}
