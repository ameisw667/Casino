'use client';

import { useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import type { RoundPhase, SessionState } from '../_lib/crashRound';
import { instrumentSerif, geistMono } from '../fonts';
import { motionTokens, springs } from '@/lib/design/motion-tokens';
import { BUST_RED, GOLD, HAIRLINE, TEXT_DIM, TEXT_FAINT } from '../_lib/labStyles';

const CRASH_STEPPER = 0.01;

interface CrashStoryProps {
  multiplier: MotionValue<number>;
  phase: RoundPhase;
  session: SessionState;
  onHold: () => void;
  onRelease: () => void;
}

const PHASE_HINTS: Record<RoundPhase, string> = {
  idle: 'HALTEN ZUM WETTEN',
  holding: 'LIVE — LOSLASSEN = CASH OUT',
  cashed: 'CASH OUT',
  busted: 'BUST',
};

function formatStepped(value: number): string {
  const stepped = Math.floor(value / CRASH_STEPPER) * CRASH_STEPPER;
  return `${stepped.toFixed(2)}×`;
}

export function CrashStory({ multiplier, phase, session, onHold, onRelease }: CrashStoryProps) {
  const [display, setDisplay] = useState('1.00×');
  useMotionValueEvent(multiplier, 'change', (value) => setDisplay(formatStepped(value)));

  const isBusted = phase === 'busted';
  const isCashed = phase === 'cashed';
  const isHolding = phase === 'holding';
  const tone = isBusted ? BUST_RED : isCashed ? GOLD : '#F4EFE0';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '150svh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 24px',
        maxWidth: '1240px',
      }}
    >
      <div style={{ height: '55svh', width: '100%' }} />
      <p style={sectionLabelStyle}>PULS · 02 — STEIGUNG</p>
      <h2
        style={{
          marginTop: '20px',
          fontFamily: instrumentSerif.style.fontFamily,
          fontSize: 'clamp(2rem, 4.6vw, 4.2rem)',
          lineHeight: 1.02,
          color: '#F4EFE0',
          maxWidth: '760px',
        }}
      >
        Die Kurve steigt,{' '}
        <span style={{ fontStyle: 'italic', color: GOLD }}>solange du hältst.</span>
      </h2>
      <div
        style={{
          marginTop: '40px',
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <motion.button
          type="button"
          aria-pressed={isHolding}
          onPointerDown={isHolding ? undefined : onHold}
          onPointerUp={onRelease}
          onPointerLeave={isHolding ? onRelease : undefined}
          disabled={isBusted}
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '16px',
            cursor: 'pointer',
            border: `1px solid ${HAIRLINE}`,
            background: 'rgba(11, 13, 18, 0.7)',
            backdropFilter: 'blur(12px)',
            padding: '20px 24px',
            textAlign: 'left',
          }}
          animate={isBusted ? { opacity: [1, 0.45, 1, 0.45, 1] } : undefined}
          transition={
            isBusted
              ? { duration: 0.6, repeat: 0, ease: 'linear' }
              : { ...springs.gentle, duration: motionTokens.duration.fast }
          }
        >
          <span
            style={{
              fontFamily: geistMono.style.fontFamily,
              fontVariantNumeric: 'tabular-nums',
              fontSize: '56px',
              color: tone,
            }}
          >
            {display}
          </span>
          <span style={phaseHintStyle(isBusted)}>{PHASE_HINTS[phase]}</span>
        </motion.button>
        <p style={sessionLineStyle}>
          {session.cashOuts} CASH OUTS · {session.busts} BUSTS · BEST{' '}
          {session.bestMultiplier.toFixed(2)}×
        </p>
      </div>
      <p style={narrativeStyle}>
        Zu gierig gehalten — und das Feld zerfällt rot. Timing ist die ganze Wette.
      </p>
      <div style={{ height: '20svh', width: '100%' }} />
    </section>
  );
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: geistMono.style.fontFamily,
  fontSize: '11px',
  letterSpacing: '0.42em',
  color: TEXT_DIM,
};

const phaseHintStyle = (isBusted: boolean): React.CSSProperties => ({
  fontFamily: geistMono.style.fontFamily,
  fontSize: '11px',
  letterSpacing: '0.3em',
  color: isBusted ? BUST_RED : TEXT_DIM,
  whiteSpace: 'nowrap',
});

const sessionLineStyle: React.CSSProperties = {
  fontFamily: geistMono.style.fontFamily,
  fontSize: '11px',
  letterSpacing: '0.2em',
  fontVariantNumeric: 'tabular-nums',
  color: TEXT_FAINT,
};

const narrativeStyle: React.CSSProperties = {
  marginTop: '40px',
  maxWidth: '440px',
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#B9B39D',
  fontFamily: geistMono.style.fontFamily,
};

export default CrashStory;
