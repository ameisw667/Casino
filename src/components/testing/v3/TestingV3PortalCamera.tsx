'use client';

import React from 'react';
import Image from 'next/image';
import { motion, MotionValue } from 'framer-motion';
import { TestingV3MorphCard } from './TestingV3MorphCard';
import { TestingV3SplitterChips } from './TestingV3SplitterChips';
import { TestingV3Shockwave } from './TestingV3Shockwave';

interface TestingV3PortalCameraProps {
  nebulaRef: React.RefObject<HTMLDivElement | null>;
  ringRef: React.RefObject<HTMLDivElement | null>;
  coreRef: React.RefObject<HTMLDivElement | null>;
  cardRef: React.RefObject<HTMLDivElement | null>;
  chipsRef: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  isFlipped?: boolean;
  scrollProgress: number;
}

export function TestingV3PortalCamera({
  nebulaRef,
  ringRef,
  coreRef,
  cardRef,
  chipsRef,
  rotateX,
  rotateY,
  scrollProgress,
}: TestingV3PortalCameraProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '960px',
        height: '620px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1500px',
        transformStyle: 'preserve-3d',
        overflow: 'visible',
      }}
    >
      {/* =========================================================================
          LAYER 0 (Z: -450px): Frameless Cosmic Gravitational Nebula Deep Field
          ========================================================================= */}
      <div
        ref={nebulaRef}
        style={{
          position: 'absolute',
          width: '140vw',
          height: '140vh',
          transform: 'translateZ(-450px)',
          opacity: 0.9,
          pointerEvents: 'none',
          zIndex: 1,
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
        }}
      >
        <Image
          src="/images/testing-v3/layer-0-nebula.png"
          alt="Cosmic Gravitational Nebula"
          fill
          sizes="140vw"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* =========================================================================
          LAYER 1 (Z: -150px): Monumental Rotating Stargate Rune Ring (Screen Blend)
          ========================================================================= */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          width: '640px',
          height: '640px',
          transform: 'translateZ(-150px)',
          opacity: 0.95,
          pointerEvents: 'none',
          zIndex: 2,
          mixBlendMode: 'screen',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 0 55px rgba(212, 175, 55, 0.65))',
          }}
        >
          <Image
            src="/images/testing-v3/layer-1-stargate-ring.png"
            alt="Rotating Stargate Ring"
            fill
            sizes="640px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>

      {/* High-Energy Cosmic Shockwave Impulse (Singularity Crossing) */}
      <TestingV3Shockwave scrollProgress={scrollProgress} />

      {/* =========================================================================
          LAYER 2 (Z: 0px): Floating Gold Crystal Core & Singularity Portal
          ========================================================================= */}
      <div
        ref={coreRef}
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          transform: 'translateZ(0px)',
          pointerEvents: 'none',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulsing Singularity Aura */}
        <div
          style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255, 223, 115, 0.35) 0%, rgba(212, 175, 55, 0.12) 50%, transparent 75%)',
            filter: 'blur(30px)',
            animation: 'pulse 3s infinite alternate ease-in-out',
            mixBlendMode: 'screen',
          }}
        />

        <motion.div
          animate={{
            y: [-8, 8, -8],
            rotateZ: [-2, 2, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'relative',
            width: '260px',
            height: '260px',
            filter: 'drop-shadow(0 0 35px rgba(212, 175, 55, 0.6))',
          }}
        >
          <Image
            src="/images/testing-v3/layer-2-vortex-core.png"
            alt="Gold Crystal Vortex Core"
            fill
            sizes="260px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>

      {/* =========================================================================
          LAYER 3 (Z: +250px): Quantum Ace 3D-Karte & VIP-Splitter-Chips
          ========================================================================= */}
      <div
        style={{
          position: 'relative',
          transform: 'translateZ(250px)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TestingV3MorphCard
          cardRef={cardRef}
          rotateX={rotateX}
          rotateY={rotateY}
          scrollProgress={scrollProgress}
        />

        <div ref={chipsRef}>
          <TestingV3SplitterChips />
        </div>
      </div>
    </div>
  );
}
