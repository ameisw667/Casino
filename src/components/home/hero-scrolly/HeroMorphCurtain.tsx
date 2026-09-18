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
      {/* Multi-Layered Luminous Gold Dust Veil & Soft Upward Ambient Mist */}
      <div
        ref={fogRef}
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '-10%',
          right: '-10%',
          height: '240px',
          background:
            'radial-gradient(ellipse 90% 100% at 50% 100%, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.06) 45%, rgba(11, 14, 20, 0.0) 85%)',
          filter: 'blur(35px)',
          opacity: 0.8,
          willChange: 'opacity, transform',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
