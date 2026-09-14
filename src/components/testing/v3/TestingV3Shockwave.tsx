'use client';

import React from 'react';

interface TestingV3ShockwaveProps {
  scrollProgress: number;
}

export function TestingV3Shockwave({ scrollProgress }: TestingV3ShockwaveProps) {
  // Shockwave activates during the 180° hyperspace singularity flip (0.42 -> 0.85)
  const active = scrollProgress >= 0.42 && scrollProgress <= 0.85;
  if (!active) return null;

  // Normalized shockwave progress (0 -> 1)
  const p = Math.max(0, Math.min(1, (scrollProgress - 0.45) / 0.3));

  // Ring 1: Primary Supernova Wave
  const scale1 = 0.4 + p * 2.2;
  const opacity1 = p < 0.3 ? p / 0.3 : Math.max(0, 1 - (p - 0.3) / 0.7);

  // Ring 2: Secondary Harmonic Expansion
  const p2 = Math.max(0, Math.min(1, (scrollProgress - 0.5) / 0.3));
  const scale2 = 0.3 + p2 * 2.6;
  const opacity2 = p2 < 0.25 ? (p2 / 0.25) * 0.8 : Math.max(0, (1 - (p2 - 0.25) / 0.75) * 0.8);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        transform: 'translateZ(50px)',
      }}
    >
      {/* Primary Shockwave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          border: '2px solid rgba(255, 223, 115, 0.75)',
          boxShadow: `
            0 0 50px rgba(212, 175, 55, 0.7),
            inset 0 0 30px rgba(255, 223, 115, 0.5)
          `,
          transform: `scale(${scale1})`,
          opacity: opacity1,
          willChange: 'transform, opacity',
        }}
      />

      {/* Secondary Harmonic Wave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          border: '1.5px solid rgba(245, 158, 11, 0.6)',
          boxShadow: '0 0 70px rgba(245, 158, 11, 0.6)',
          transform: `scale(${scale2})`,
          opacity: opacity2,
          willChange: 'transform, opacity',
        }}
      />

      {/* Central Singularity Flash Bloom */}
      <div
        style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255, 215, 0, 0.35) 0%, rgba(212, 175, 55, 0.12) 45%, transparent 70%)',
          filter: 'blur(22px)',
          transform: `scale(${0.6 + p * 1.5})`,
          opacity: opacity1 * 0.7,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}
