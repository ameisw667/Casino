'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import { motion } from 'framer-motion';
import { motionTokens } from '@/lib/design/motion-tokens';
import type { SessionState } from '../_lib/crashRound';
import { geistMono } from '../fonts';
import { GOLD, TEXT_DIM } from '../_lib/labStyles';

interface StillnessSectionProps {
  session: SessionState;
  onEnter: () => void;
  onLeave: () => void;
}

export function StillnessSection({ session, onEnter, onLeave }: StillnessSectionProps) {
  const sentinel = useRef<HTMLElement | null>(null);
  const inView = useInView(sentinel, { margin: '-35% 0px' });

  useEffect(() => {
    if (inView) onEnter();
    else onLeave();
  }, [inView, onEnter, onLeave]);

  return (
    <section
      ref={sentinel}
      style={{
        position: 'relative',
        minHeight: '90svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 24px 96px',
        maxWidth: '1240px',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ margin: '-20% 0px' }}
        transition={{ duration: motionTokens.duration.deliberate }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontFamily: geistMono.style.fontFamily,
          fontSize: '11px',
          letterSpacing: '0.34em',
          color: TEXT_DIM,
        }}
      >
        <span>PULS · STILLE</span>
        <span style={{ color: '#B9B39D', fontVariantNumeric: 'tabular-nums' }}>
          {session.cashOuts} CASH OUTS · {session.busts} BUSTS
        </span>
        {session.bestMultiplier > 0 ? (
          <span style={{ color: GOLD, fontVariantNumeric: 'tabular-nums' }}>
            BEST {session.bestMultiplier.toFixed(2)}×
          </span>
        ) : null}
      </motion.div>
    </section>
  );
}

export default StillnessSection;
