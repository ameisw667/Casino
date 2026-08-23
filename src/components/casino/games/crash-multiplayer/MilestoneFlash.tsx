import React from 'react';

export function MilestoneFlash({ value, isMobile }: { value: number; isMobile: boolean }) {
  return (
    <div
      className="milestone-pop"
      style={{
        position: 'absolute',
        top: '22%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 15,
        pointerEvents: 'none',
        fontSize: isMobile ? '1.2rem' : '2.8rem',
        fontWeight: 900,
        fontFamily: 'monospace',
        letterSpacing: isMobile ? '1px' : '2px',
        maxWidth: isMobile ? '92vw' : 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: '#FFD700',
        textShadow: '0 0 35px rgba(255, 215, 0, 0.9), 0 0 70px rgba(212, 175, 55, 0.5)',
      }}
    >
      {value}× MILESTONE REACHED!
    </div>
  );
}
