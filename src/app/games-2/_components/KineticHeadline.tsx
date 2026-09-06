'use client';

import React, { useEffect, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';

// ──── B — Pointer-reaktive Headline (motion.dev: Gestures + Motion Values) ────
// Geteilte Pointer-Motion Values (Viewport-Koordinaten) fließen in per-Wort-
// Magnet-Offsets: Jedes Wort misst einmal sein Rect und zieht mit einem eigenen
// Spring in Cursor-Nähe. 0 Re-Render pro Frame — alles läuft über Motion Values.

const POINTER_RADIUS_PX = 200;
const MAX_PULL_PX = 9;
const MAX_LIFT_SCALE = 0.04;
const PULL_STRENGTH = 0.18;
const OFFSCREEN = -9999;
const WORD_SPRING = { stiffness: 300, damping: 22, mass: 0.5 } as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function KineticHeadline({
  line1,
  line2,
  gradientLine = 2,
  style,
}: {
  line1: string;
  line2: string;
  gradientLine?: 1 | 2;
  style?: React.CSSProperties;
}) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const pointerX = useMotionValue(OFFSCREEN);
  const pointerY = useMotionValue(OFFSCREEN);

  const handlePointerMove = (event: React.PointerEvent<HTMLHeadingElement>) => {
    if (prefersReducedMotion) return;
    pointerX.set(event.clientX);
    pointerY.set(event.clientY);
  };

  const handlePointerLeave = () => {
    pointerX.set(OFFSCREEN);
    pointerY.set(OFFSCREEN);
  };

  const lineStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '0.26em',
    minWidth: 0,
  };

  return (
    <h1
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        margin: 0,
        fontWeight: 950,
        lineHeight: 1.04,
        letterSpacing: '-0.03em',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.06em',
        ...style,
      }}
    >
      <span style={lineStyle}>
        {line1.split(' ').map((word) => (
          <KineticWord
            key={word}
            text={word}
            pointerX={pointerX}
            pointerY={pointerY}
            isGradient={gradientLine === 1}
            reduced={prefersReducedMotion}
          />
        ))}
      </span>
      <span style={lineStyle}>
        {line2.split(' ').map((word) => (
          <KineticWord
            key={word}
            text={word}
            pointerX={pointerX}
            pointerY={pointerY}
            isGradient={gradientLine === 2}
            reduced={prefersReducedMotion}
          />
        ))}
      </span>
    </h1>
  );
}

const GRADIENT_TEXT: React.CSSProperties = {
  background: 'linear-gradient(90deg, #FFD700 0%, #D4AF37 55%, rgba(212, 175, 55, 0.35) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

function KineticWord({
  text,
  pointerX,
  pointerY,
  isGradient,
  reduced,
}: {
  text: string;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  isGradient: boolean;
  reduced: boolean;
}) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const center = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const measure = () => {
      const rect = wordRef.current?.getBoundingClientRect();
      if (rect) center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Rect-Zentren werden in einem Ref gehalten (kein State), damit die
  // Transform-Ableitung ohne Re-Render pro Frame rechnen kann. Der geringe
  // Messfehler durch das eigene Ziehen wirkt selbst-limitierend (Nähe = Anziehung).
  const offset = useTransform([pointerX, pointerY], (latest: number[]) => {
    const dx = latest[0] - center.current.x;
    const dy = latest[1] - center.current.y;
    const distance = Math.hypot(dx, dy);
    const influence = Math.max(0, 1 - distance / POINTER_RADIUS_PX);
    const pull = influence * influence;
    return {
      x: clamp(dx * PULL_STRENGTH * pull, -MAX_PULL_PX, MAX_PULL_PX),
      y: clamp(dy * PULL_STRENGTH * pull, -MAX_PULL_PX, MAX_PULL_PX),
      scale: 1 + MAX_LIFT_SCALE * pull,
    };
  });

  const springX = useSpring(
    useTransform(offset, (o) => o.x),
    WORD_SPRING,
  );
  const springY = useSpring(
    useTransform(offset, (o) => o.y),
    WORD_SPRING,
  );
  const springScale = useSpring(
    useTransform(offset, (o) => o.scale),
    WORD_SPRING,
  );

  if (reduced) {
    return (
      <span ref={wordRef} style={{ display: 'inline-block', ...(isGradient ? GRADIENT_TEXT : {}) }}>
        {text}
      </span>
    );
  }

  return (
    <motion.span
      ref={wordRef}
      style={{
        x: springX,
        y: springY,
        scale: springScale,
        display: 'inline-block',
        willChange: 'transform',
        ...(isGradient ? GRADIENT_TEXT : {}),
      }}
    >
      {text}
    </motion.span>
  );
}
