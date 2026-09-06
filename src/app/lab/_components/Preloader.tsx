'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { motionTokens } from '@/lib/design/motion-tokens';
import { instrumentSerif, geistMono } from '../fonts';
import { GOLD, LAB_BG, TEXT_DIM } from '../_lib/labStyles';

const PRIMED_TIMEOUT_MS = 4000;
const COUNTER_DURATION_S = 1.15;
const SPIN_AT = 1.8;
const FINISH_AFTER_PRIMED_MS = 350;

interface PreloaderProps {
  primed: boolean;
  onDone: () => void;
}

/**
 * Themen-Preloader: der Ladezähler läuft als Multiplier (Status BET → SPIN),
 * nach 4 s wird `primed` forciert, damit die Seite nie hängen bleibt.
 */
export function Preloader({ primed, onDone }: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [status, setStatus] = useState<'BET' | 'SPIN'>('BET');
  const multiplier = useMotionValue(1);
  const label = useTransform(multiplier, (value) => `${value.toFixed(2)}×`);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setVisible(false);
    onDone();
  };

  useEffect(() => {
    const timeout = window.setTimeout(finish, PRIMED_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!primed) return;
    const timeout = window.setTimeout(finish, FINISH_AFTER_PRIMED_MS);
    return () => window.clearTimeout(timeout);
  }, [primed]);

  useEffect(() => {
    const controls = animate(multiplier, 2.42, {
      duration: COUNTER_DURATION_S,
      ease: motionTokens.easing.decelerate,
      onUpdate: (value) => {
        if (value > SPIN_AT) setStatus('SPIN');
      },
    });
    return () => controls.stop();
  }, [multiplier]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: LAB_BG,
          }}
          data-testid="lab-preloader"
          exit={{
            clipPath: 'inset(0 0 100% 0)',
            opacity: 0.4,
            transition: { duration: 0.7, ease: motionTokens.easing.snappy },
          }}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
          >
            <span
              style={{
                fontFamily: geistMono.style.fontFamily,
                fontSize: '10px',
                letterSpacing: '0.42em',
                color: TEXT_DIM,
              }}
            >
              {status}
            </span>
            <motion.span
              style={{
                fontFamily: instrumentSerif.style.fontFamily,
                fontStyle: 'italic',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '56px',
                color: GOLD,
              }}
            >
              {label}
            </motion.span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Preloader;
