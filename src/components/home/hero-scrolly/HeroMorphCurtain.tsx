'use client';

import React from 'react';

interface HeroMorphCurtainProps {
  curtainRef?: React.RefObject<HTMLDivElement | null>;
  fogRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * HeroMorphCurtain: Soft organic atmospheric transition.
 * Zero hard lines, zero dark rectangular banding. Only soft golden light diffusion.
 */
export function HeroMorphCurtain({ curtainRef, fogRef }: HeroMorphCurtainProps) {
  return (
    <div
      ref={curtainRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '140px',
        pointerEvents: 'none',
        zIndex: 2,
        overflow: 'visible',
      }}
    >
      {/* Soft Luminous Gold Dust Veil - no hard black boxes */}
      <div
        ref={fogRef}
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.02) 55%, transparent 100%)',
          filter: 'blur(25px)',
          opacity: 0.75,
          willChange: 'opacity, transform',
        }}
      />
    </div>
  );
}
