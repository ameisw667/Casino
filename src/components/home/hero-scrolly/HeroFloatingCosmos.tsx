'use client';

import React, { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface HeroFloatingCosmosProps {
  isMobile: boolean;
  magicianRef?: React.RefObject<HTMLDivElement | null>;
  jetRef?: React.RefObject<HTMLDivElement | null>;
  diceRef?: React.RefObject<HTMLDivElement | null>;
  luckySevenRef?: React.RefObject<HTMLDivElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * HeroFloatingCosmos: Spatial 3D Casino Universe
 * Verteilt 4 photorealistische, schwebende Casino-Visuals über das gesamte Hero-Banner:
 * 1. Royale Guide Magier (links oben über der H1, Host mit Sternenstab)
 * 2. Crash Quantum Jet (mittig oben, Raum-Trajectory)
 * 3. Quantum 3D Gold Würfel (rechts oben)
 * 4. 3D Lucky Seven & Dice (rechte Flanke, Glücksreliquie)
 *
 * Alle Elemente reagieren auf Maus-Neigungsphysik (Spring) und GSAP-Scroll-Scrubbing.
 */
export function HeroFloatingCosmos({
  isMobile,
  magicianRef,
  jetRef,
  diceRef,
  luckySevenRef,
  containerRef,
}: HeroFloatingCosmosProps) {
  // Parallax spring physics reacting to cursor movement
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 45, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handlePointerMove = useCallback(
    (e: MouseEvent) => {
      if (isMobile) return;
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;
      mouseX.set(normX * 16);
      mouseY.set(normY * 16);
    },
    [isMobile, mouseX, mouseY],
  );

  useEffect(() => {
    if (isMobile) return;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isMobile, handlePointerMove]);

  if (isMobile) {
    // Auf Mobile rendern wir nur eine dezente Kompaktversion ohne schwere Raum-Overlays
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'visible',
        perspective: 1400,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Gravitational Orbit Rings (Elliptische Lichtbahnen um das Zentrum) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          width: '760px',
          height: '420px',
          transform: 'translate(-50%, -50%) rotateX(65deg) rotateZ(-20deg)',
          borderRadius: '50%',
          border: '1px solid rgba(212, 175, 55, 0.16)',
          boxShadow: '0 0 45px rgba(212, 175, 55, 0.08)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '35%',
          left: '54%',
          width: '980px',
          height: '520px',
          transform: 'translate(-50%, -50%) rotateX(60deg) rotateZ(15deg)',
          borderRadius: '50%',
          border: '1px dashed rgba(212, 175, 55, 0.12)',
          pointerEvents: 'none',
        }}
      />

      {/* Satellit 1: Royale Guide Magier (Links über der H1 mit Goldlichtkorona) */}
      <div
        ref={magicianRef}
        style={{
          position: 'absolute',
          top: '8%',
          left: '26%',
          width: '100px',
          height: '100px',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(60px)',
          filter:
            'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px rgba(212, 175, 55, 0.6))',
        }}
      >
        {/* Kometenschweif & Orbit Glow Anchor */}
        <div
          style={{
            position: 'absolute',
            inset: '-12px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 75%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          animate={{
            y: [-6, 6, -6],
            rotateZ: [-2, 3, -2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/images/royale-guide-mascot.png"
            alt="Royale Guide Magier"
            fill
            sizes="100px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>

      {/* Satellit 2: Crash Quantum Jet (Mittig oben mit Ionen-Glow) */}
      <div
        ref={jetRef}
        style={{
          position: 'absolute',
          top: '6%',
          left: '52%',
          width: '120px',
          height: '120px',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(80px) rotate(-14deg)',
          filter:
            'drop-shadow(0 25px 40px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 40px rgba(212, 175, 55, 0.65))',
        }}
      >
        {/* Ionen-Triebwerksschweif */}
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '15%',
            width: '70px',
            height: '24px',
            background:
              'radial-gradient(ellipse at center, rgba(0, 231, 1, 0.4) 0%, rgba(212, 175, 55, 0.25) 45%, transparent 75%)',
            filter: 'blur(8px)',
            transform: 'rotate(-25deg)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          animate={{
            y: [5, -7, 5],
            x: [-4, 4, -4],
            rotateZ: [-14, -8, -14],
          }}
          transition={{
            duration: 5.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/images/2026-09-05_crash-jet-quantum-gold_v001.png"
            alt="Crash Quantum Jet"
            fill
            sizes="120px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>

      {/* Satellit 3: Quantum 3D Gold Würfel (Rechts oben) */}
      <div
        ref={diceRef}
        style={{
          position: 'absolute',
          top: '11%',
          right: '10%',
          width: '95px',
          height: '95px',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(100px)',
          filter:
            'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.92)) drop-shadow(0 0 35px rgba(212, 175, 55, 0.55))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)',
            filter: 'blur(12px)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          animate={{
            y: [-7, 7, -7],
            rotateZ: [10, 24, 10],
          }}
          transition={{
            duration: 5.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/images/2026-09-02_icon-dice-quantum-gold_transparent.png"
            alt="Quantum 3D Gold Dice"
            fill
            sizes="95px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>

      {/* Satellit 4: 3D Lucky Seven & Dice (Rechte untere Flanke) */}
      <div
        ref={luckySevenRef}
        style={{
          position: 'absolute',
          top: '62%',
          right: '4%',
          width: '100px',
          height: '100px',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(50px)',
          filter:
            'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 35px rgba(212, 175, 55, 0.55))',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          animate={{
            y: [6, -6, 6],
            rotateZ: [-6, 6, -6],
          }}
          transition={{
            duration: 6.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Image
            src="/images/2026-09-05_ach-dice-seven-3d_v001.png"
            alt="3D Lucky Seven & Dice"
            fill
            sizes="100px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </div>
    </div>
  );
}
