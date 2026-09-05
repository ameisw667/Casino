/**
 * Motion Tokens & Spring Physics (Framer Motion 12)
 * Canonical animation primitives for Casino games, UI transitions, and overlays.
 */

import { type Transition, type Variants } from 'framer-motion';

export const motionTokens = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.25,
    slow: 0.4,
    deliberate: 0.6,
    spin: 1.2,
  },
  easing: {
    smooth: [0.25, 0.1, 0.25, 1.0] as const,
    snappy: [0.16, 1, 0.3, 1] as const,
    accelerate: [0.4, 0, 1, 1] as const,
    decelerate: [0, 0, 0.2, 1] as const,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  scale: {
    subtle: 0.98,
    press: 0.95,
    pop: 1.03,
    highlight: 1.06,
  },
} as const;

export const springs = {
  /**
   * Design-Guardian standard spring (SOP 04 §4) — canonical for lobby/UI
   * surfaces. Resolves the historical VibeMotion (300/30/mass:1) discrepancy
   * in favour of the documented system value.
   */
  standard: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    bounce: 0.4,
  } satisfies Transition,

  /** Snappy feedback for tactile buttons, chips, and small controls */
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 0.8,
  } satisfies Transition,

  /** Gentle smooth transition for cards, popovers, and containers */
  gentle: {
    type: 'spring',
    stiffness: 300,
    damping: 28,
    mass: 1.0,
  } satisfies Transition,

  /** Bouncy celebratory spring for big wins, level-ups, and notifications */
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 18,
    bounce: 0.45,
  } satisfies Transition,

  /** Card flip physics for Blackjack / Card Games */
  cardFlip: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
    mass: 0.9,
  } satisfies Transition,

  /** Counter roll-up ticker spring */
  counterRoll: {
    type: 'spring',
    stiffness: 180,
    damping: 22,
  } satisfies Transition,
} as const;

export const staggerVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  } satisfies Variants,
  item: {
    hidden: { opacity: 0, y: motionTokens.distance.md },
    visible: {
      opacity: 1,
      y: 0,
      transition: springs.gentle,
    },
  } satisfies Variants,
};

export const modalVariants = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: motionTokens.duration.fast } },
    exit: { opacity: 0, transition: { duration: motionTokens.duration.fast } },
  } satisfies Variants,
  panel: {
    hidden: {
      opacity: 0,
      scale: motionTokens.scale.press,
      y: motionTokens.distance.sm,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: springs.gentle,
    },
    exit: {
      opacity: 0,
      scale: motionTokens.scale.press,
      y: motionTokens.distance.sm,
      transition: { duration: motionTokens.duration.fast },
    },
  } satisfies Variants,
};

export const toastVariants = {
  hidden: {
    opacity: 0,
    x: motionTokens.distance.xl,
    scale: motionTokens.scale.subtle,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    x: motionTokens.distance.xl,
    scale: motionTokens.scale.subtle,
    transition: { duration: motionTokens.duration.fast },
  },
} satisfies Variants;

export const pageTransitionVariants = {
  initial: { opacity: 0, y: motionTokens.distance.sm },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.easing.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -motionTokens.distance.sm,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.easing.smooth,
    },
  },
} satisfies Variants;
