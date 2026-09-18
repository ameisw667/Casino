'use client';

import React from 'react';
import BigWinOverlay from '@/components/casino/BigWinOverlay';

export default function BigWinTestingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0E14' }}>
      <BigWinOverlay
        isOpen={true}
        amount={14850.50}
        multiplier={77.5}
        onClose={() => {}}
      />
    </div>
  );
}
