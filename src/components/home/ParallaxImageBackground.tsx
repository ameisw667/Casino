'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

interface ParallaxImageBackgroundProps {
  imageSrc: string;
  alt: string;
}

/**
 * Ambient mouse-drift spring for the backdrop layers. Deliberately slower and
 * softer than the UI springs in motion-tokens: the background must read as a
 * drifting scene, not as an interactive element.
 */
const DRIFT_SPRING = { stiffness: 40, damping: 20, mass: 1 };

const DEEP_DRIFT_PX = 18;
const MID_DRIFT_PX = 42;

/**
 * 2.5D backdrop: two depth layers cut from the same still image. The mid layer
 * sits above with screen blending and a wider drift radius, which fakes depth
 * without a second asset. Frozen to a static image under prefers-reduced-motion.
 */
export function ParallaxImageBackground({ imageSrc, alt }: ParallaxImageBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  const targetDeepX = useMotionValue(0);
  const targetDeepY = useMotionValue(0);
  const targetMidX = useMotionValue(0);
  const targetMidY = useMotionValue(0);

  const deepX = useSpring(targetDeepX, DRIFT_SPRING);
  const deepY = useSpring(targetDeepY, DRIFT_SPRING);
  const midX = useSpring(targetMidX, DRIFT_SPRING);
  const midY = useSpring(targetMidY, DRIFT_SPRING);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetDeepX.set(nx * DEEP_DRIFT_PX);
      targetDeepY.set(ny * DEEP_DRIFT_PX);
      targetMidX.set(nx * MID_DRIFT_PX);
      targetMidY.set(ny * MID_DRIFT_PX);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [targetDeepX, targetDeepY, targetMidX, targetMidY, prefersReducedMotion]);

  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Depth layer 0 — the slow, wide backdrop */}
      <motion.div style={{ position: 'absolute', inset: '-4%', x: deepX, y: deepY }}>
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </motion.div>

      {/* Depth layer 1 — glowing mid layer with stronger drift for parallax depth */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-8%',
          x: midX,
          y: midY,
          opacity: 0.4,
          mixBlendMode: 'screen',
        }}
      >
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', transform: 'scale(1.15) rotate(180deg)' }}
        />
      </motion.div>
    </div>
  );
}
