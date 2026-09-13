'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface HeroScrollyPortalVisualProps {
  isMobile: boolean;
  portalRef?: React.RefObject<HTMLDivElement | null>;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  sealRef?: React.RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}

export default function HeroScrollyDesktopPortalVisual({
  isMobile,
  portalRef,
  cardRef,
  sealRef,
}: HeroScrollyPortalVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth mouse tilt spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(mouseY, { stiffness: 45, damping: 20 });
  const rotateY = useSpring(mouseX, { stiffness: 45, damping: 20 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseX.set(normX * 14);
      mouseY.set(-normY * 14);
    },
    [isMobile, mouseX, mouseY],
  );

  const handlePointerLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        position: 'relative',
        width: isMobile ? '100%' : '380px',
        maxWidth: '100%',
        height: isMobile ? '340px' : '460px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1200,
        pointerEvents: 'auto',
        overflow: 'visible',
      }}
    >
      {/* Outer GSAP Portal Anchor */}
      <div
        ref={portalRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          overflow: 'visible',
        }}
      >
        {/* Soft Radial Ambient Aura - 0% harsh edges */}
        <div
          style={{
            position: 'absolute',
            width: isMobile ? '260px' : '360px',
            height: isMobile ? '260px' : '360px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 70%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Layer 1: The Rotating Royal Stargate Seal */}
        <div
          ref={sealRef}
          style={{
            position: 'absolute',
            width: isMobile ? '260px' : '350px',
            height: isMobile ? '260px' : '350px',
            opacity: 0.9,
            zIndex: 2,
            pointerEvents: 'none',
            transformOrigin: 'center center',
            overflow: 'visible',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Image
              src="/images/2026-09-05_seal-casino-royale-quantum-gold_v001.png"
              alt="Casino Royale Stargate Seal"
              fill
              sizes="(max-width: 1024px) 260px, 350px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </motion.div>
        </div>

        {/* Layer 2: Interactive Floating 3D Quantum Ace Card */}
        <motion.div
          ref={cardRef}
          style={{
            position: 'relative',
            width: isMobile ? '200px' : '255px',
            height: isMobile ? '280px' : '355px',
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            zIndex: 3,
            cursor: 'grab',
            overflow: 'visible',
          }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Card Floating Hover Motion */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
              rotateZ: [-1, 1, -1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              filter:
                'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 35px rgba(212, 175, 55, 0.4))',
            }}
          >
            <Image
              src="/images/2026-09-04_brand-ace-quantum-gold_v001.png"
              alt="Quantum Ace of Spades"
              fill
              sizes="(max-width: 1024px) 220px, 290px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </motion.div>

          {/* Floating Quantum Engine Micro-Badge */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: isMobile ? '10px' : '16px',
              left: '50%',
              transform: 'translateX(-50%) translateZ(40px)',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(11, 14, 20, 0.88)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 4,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#00E701',
                boxShadow: '0 0 8px #00E701',
              }}
            />
            <span
              style={{
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                color: '#D4AF37',
                textTransform: 'uppercase',
              }}
            >
              PROVABLY FAIR 3D PORTAL
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
