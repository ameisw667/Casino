'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { geistMono } from '../fonts';
import { GOLD } from '../_lib/labStyles';

const PULL_RADIUS_PX = 130;
const LINK_SPRING = { stiffness: 220, damping: 20, mass: 0.6 } as const;

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
}

export function MagneticLink({ href, children }: MagneticLinkProps) {
  const reduced = useReducedMotion() ?? false;
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, LINK_SPRING);
  const y = useSpring(pointerY, LINK_SPRING);

  const update = (clientX: number, clientY: number) => {
    const rect = linkRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    const falloff = Math.max(0, 1 - dist / PULL_RADIUS_PX);
    pointerX.set(dx * falloff * 0.24);
    pointerY.set(dy * falloff * 0.24);
  };

  return (
    <motion.a
      href={href}
      ref={linkRef}
      style={{
        fontFamily: geistMono.style.fontFamily,
        fontSize: '11px',
        letterSpacing: '0.34em',
        color: GOLD,
        ...(reduced ? {} : { x, y }),
      }}
      onPointerMove={
        reduced
          ? undefined
          : (event) => {
              update(event.clientX, event.clientY);
            }
      }
      onPointerLeave={
        reduced
          ? undefined
          : () => {
              pointerX.set(0);
              pointerY.set(0);
            }
      }
    >
      {children}
    </motion.a>
  );
}

export default MagneticLink;
