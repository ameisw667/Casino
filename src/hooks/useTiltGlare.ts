'use client';

import { useCallback } from 'react';
import {
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import { springs } from '@/lib/design/motion-tokens';

interface UseTiltGlareOptions {
  /** Maximum tilt in degrees on each axis */
  maxTilt?: number;
  /** Pointer-tracking is ignored entirely when true (e.g. mobile) */
  disabled?: boolean;
}

export interface TiltGlareState {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  /** Glare origin, 0-100 in both axes, for a radial-gradient overlay */
  glareX: MotionValue<number>;
  glareY: MotionValue<number>;
  /** 0 -> hovered, spring-smoothed; drives glare opacity */
  glareActive: MotionValue<number>;
  onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

/**
 * Tracks continuous pointer position outside React state (SOP 15 §2):
 * tilt springs and the glare origin update DOM values directly instead of
 * re-rendering per pointer tick. Respects prefers-reduced-motion by freezing
 * all values at rest (no tilt, no glare).
 */
export function useTiltGlare({
  maxTilt = 6,
  disabled = false,
}: UseTiltGlareOptions = {}): TiltGlareState {
  const prefersReducedMotion = useReducedMotion();

  const pointerX = useMotionValue(0); // -1 (left) ... 1 (right)
  const pointerY = useMotionValue(0); // -1 (top) ... 1 (bottom)
  const hovered = useMotionValue(0);

  const rotateX = useSpring(useTransform(pointerY, [-1, 1], [maxTilt, -maxTilt]), springs.snappy);
  const rotateY = useSpring(useTransform(pointerX, [-1, 1], [-maxTilt, maxTilt]), springs.snappy);
  const glareX = useTransform(pointerX, [-1, 1], [0, 100]);
  const glareY = useTransform(pointerY, [-1, 1], [0, 100]);
  const glareActive = useSpring(hovered, springs.snappy);

  const isFrozen = prefersReducedMotion || disabled;

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (isFrozen) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      if (centerX === 0 || centerY === 0) return;
      pointerX.set((e.clientX - rect.left - centerX) / centerX);
      pointerY.set((e.clientY - rect.top - centerY) / centerY);
    },
    [isFrozen, pointerX, pointerY],
  );

  const onPointerEnter = useCallback(() => {
    if (isFrozen) return;
    hovered.set(1);
  }, [isFrozen, hovered]);

  const onPointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
    hovered.set(0);
  }, [pointerX, pointerY, hovered]);

  return {
    rotateX,
    rotateY,
    glareX,
    glareY,
    glareActive,
    onPointerMove,
    onPointerEnter,
    onPointerLeave,
  };
}
