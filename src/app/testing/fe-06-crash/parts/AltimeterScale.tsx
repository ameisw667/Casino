'use client';

const ALTIMETER_STEPS = [
  { label: '100×', sub: 'ORBIT' },
  { label: '50×', sub: 'IONOSPHERE' },
  { label: '25×', sub: 'STRATOSPHERE' },
  { label: '10×', sub: 'HIGH ALTITUDE' },
  { label: '5×', sub: 'MID LEVEL' },
  { label: '2×', sub: 'TAKEOFF' },
  { label: '1×', sub: 'SEA LEVEL' },
];

export function AltimeterScale({ currentMultiplier }: { currentMultiplier: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '12px',
        top: '20px',
        bottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {ALTIMETER_STEPS.map((alt) => {
        const isActive = currentMultiplier >= parseFloat(alt.label);
        return (
          <div key={alt.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: isActive ? '18px' : '10px',
                height: '2px',
                background: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s ease',
              }}
            />
            <span
              style={{
                fontSize: '0.70rem',
                fontFamily: 'monospace',
                fontWeight: 800,
                color: isActive ? '#FFFDF0' : 'rgba(255, 255, 255, 0.25)',
                textShadow: isActive ? '0 0 8px rgba(212, 175, 55, 0.6)' : 'none',
              }}
            >
              {alt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
