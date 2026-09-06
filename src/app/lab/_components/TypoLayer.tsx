'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { instrumentSerif, geistMono } from '../fonts';
import { motionTokens, springs } from '@/lib/design/motion-tokens';
import { GOLD, TEXT_DIM } from '../_lib/labStyles';

const LINE_VARIANTS = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { ...springs.gentle, delay: 0.08 * i },
  }),
};

const HERO_LINES = ['Der Katalog', 'ist ein', 'Partikelsystem.'];

export function TypoHero() {
  const reduced = useReducedMotion() ?? false;
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px',
        maxWidth: '1240px',
      }}
    >
      <motion.p
        style={{
          fontFamily: geistMono.style.fontFamily,
          fontSize: '11px',
          letterSpacing: '0.42em',
          color: TEXT_DIM,
        }}
        initial={reduced ? undefined : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: motionTokens.duration.slow }}
      >
        PULS · 01 — ORDNUNG
      </motion.p>
      <h1
        style={{
          marginTop: '24px',
          fontFamily: instrumentSerif.style.fontFamily,
          fontSize: 'clamp(3rem, 8.5vw, 8rem)',
          lineHeight: 0.94,
          color: '#F4EFE0',
          maxWidth: '1080px',
        }}
      >
        {HERO_LINES.map((line, i) => (
          <motion.span
            key={line}
            style={{ display: 'block', overflow: 'hidden' }}
            custom={i}
            initial={reduced ? undefined : 'hidden'}
            animate={reduced ? undefined : 'visible'}
            variants={LINE_VARIANTS}
          >
            <span
              style={
                i === 2
                  ? { display: 'block', fontStyle: 'italic', color: GOLD }
                  : { display: 'block' }
              }
            >
              {line}
            </span>
          </motion.span>
        ))}
      </h1>
      <motion.p
        style={{
          marginTop: '32px',
          maxWidth: '420px',
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#B9B39D',
          fontFamily: geistMono.style.fontFamily,
        }}
        initial={reduced ? undefined : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: motionTokens.duration.deliberate, delay: 0.5 }}
      >
        Scroll langsam. Das Gold formt die Kurve — du wettest mit dem Cursor.
      </motion.p>
    </section>
  );
}

export default TypoHero;
