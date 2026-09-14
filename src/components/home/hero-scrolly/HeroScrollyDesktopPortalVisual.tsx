'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface HeroScrollyPortalVisualProps {
  isMobile: boolean;
  portalRef?: React.RefObject<HTMLDivElement | null>;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  sealRef?: React.RefObject<HTMLDivElement | null>;
  orbitClusterRef?: React.RefObject<HTMLDivElement | null>;
  onReady?: () => void;
}

/**
 * HeroScrollyDesktopPortalVisual: Monumental Royal Stargate & Quantum Ace
 * - Vergrößerter Basisdurchmesser ab 0% (480px)
 * - 0% störende Fremd-Badges (PROVABLY FAIR Badge komplett entfernt)
 * - Reaktiv auf Maus-Tilt (federgelagert) und GSAP 3D-Achsen-Roll (rotateY)
 * - Reaktiv auf Scroll: Oberer rechter 3D-Orbital-Cluster (Dice & Crystal Shard)
 */
export default function HeroScrollyDesktopPortalVisual({
  isMobile,
  portalRef,
  cardRef,
  sealRef,
  orbitClusterRef: _orbitClusterRef,
  onReady,
}: HeroScrollyPortalVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Smooth responsive mouse tilt spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(mouseY, { stiffness: 50, damping: 18 });
  const rotateY = useSpring(mouseX, { stiffness: 50, damping: 18 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      mouseX.set(normX * 18);
      mouseY.set(-normY * 18);
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
        width: isMobile ? '100%' : '480px',
        maxWidth: '100%',
        height: isMobile ? '360px' : '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: 1400,
        pointerEvents: 'auto',
        overflow: 'visible',
      }}
    >
      {/* Outer GSAP Portal Anchor (Governs 3D-Axis Roll & Z-Drift) */}
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
        {/* Soft Radial Ambient Aura - Pure Alpha Diffusion */}
        <div
          style={{
            position: 'absolute',
            width: isMobile ? '300px' : '480px',
            height: isMobile ? '300px' : '480px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 72%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Layer 1: The Monumental Rotating Royal Stargate Seal */}
        <div
          ref={sealRef}
          style={{
            position: 'absolute',
            width: isMobile ? '300px' : '460px',
            height: isMobile ? '300px' : '460px',
            opacity: 0.95,
            zIndex: 2,
            pointerEvents: 'none',
            transformOrigin: '50% 50%',
            overflow: 'visible',
            willChange: 'transform',
          }}
        >
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Image
              src="/images/2026-09-05_seal-casino-royale-quantum-gold_v001.png"
              alt="Casino Royale Stargate Seal"
              fill
              sizes="(max-width: 1024px) 300px, 460px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        {/* Layer 2: Interactive Floating 3D Quantum Ace Card */}
        <motion.div
          ref={cardRef}
          style={{
            position: 'relative',
            width: isMobile ? '220px' : '290px',
            height: isMobile ? '310px' : '405px',
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            zIndex: 3,
            cursor: 'grab',
            overflow: 'visible',
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          {/* Card Floating Hover Motion */}
          <motion.div
            animate={{
              y: [-8, 8, -8],
              rotateZ: [-1.5, 1.5, -1.5],
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
                'drop-shadow(0 25px 45px rgba(0, 0, 0, 0.92)) drop-shadow(0 0 45px rgba(212, 175, 55, 0.5))',
            }}
          >
            <Image
              src="/images/2026-09-04_brand-ace-quantum-gold_v001.png"
              alt="Quantum Ace of Spades"
              fill
              sizes="(max-width: 1024px) 240px, 320px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
