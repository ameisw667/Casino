'use client';

import { getChipDef } from './roulette-config';
import { CasinoJeton } from './CasinoJeton';

// ---------------------------------------------------------------------------
// Reusable 3D Table Chip Stack with Integrated Big Amount (Single Display)
// ---------------------------------------------------------------------------

export function TableChipStack({ amount, size = 36 }: { amount: number; size?: number }) {
  const chipDef = getChipDef(amount);
  const formattedAmount = amount >= 1000 ? `$${amount / 1000}k` : `$${amount}`;

  return (
    <div className="table-chip-badge">
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 3D Stack Under-layer for depth */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '1px',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.75)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.95)',
            zIndex: 1,
          }}
        />
        {/* Scaled Main Jeton with Integrated Big Amount */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <CasinoJeton
            label={formattedAmount}
            baseColor={chipDef.baseColor}
            stripeColor={chipDef.stripeColor}
            coreBg={chipDef.coreBg}
            textColor={chipDef.textColor}
            size={size}
          />
        </div>
      </div>
    </div>
  );
}
