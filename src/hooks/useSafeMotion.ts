'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * Hook providing motion variants that automatically respect the user's
 * `prefers-reduced-motion` operating system setting.
 *
 * @param offset - Optional translation distance in px (default: 12)
 */
export function useSafeMotion(offset = 12) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    };
  }

  return {
    initial: { opacity: 0, y: offset },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -offset },
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  };
}
