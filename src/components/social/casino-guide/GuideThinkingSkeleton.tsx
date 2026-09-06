'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { springs } from '@/lib/design/motion-tokens';

const THINKING_PHASES = [
  'Konsultiere Casino-Regelwerk…',
  'Analysiere Quoten & RTP…',
  'Formuliere Strategie-Empfehlung…',
];

const TOOL_PHASE_LABELS: Record<string, string> = {
  get_player_vip_progress: 'Frage VIP-Fortschritt ab…',
  get_player_session_stats: 'Lade Gameplay-Statistiken…',
  get_player_account_limits: 'Prüfe Kontolimits…',
  trigger_ui_action: 'Bereite Schnellaktion vor…',
};

interface GuideThinkingSkeletonProps {
  activeToolName?: string | null;
}

export function GuideThinkingSkeleton({ activeToolName }: GuideThinkingSkeletonProps = {}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % THINKING_PHASES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      role="status"
      aria-busy="true"
      aria-live="polite"
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={springs.standard}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: '340px',
        padding: '14px 16px',
        borderRadius: '16px',
        background: 'rgba(14, 18, 26, 0.75)',
        border: '1px solid hsla(var(--primary), 0.28)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 hsla(var(--primary), 0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Subtle Ambient Glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(var(--primary), 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header with Avatar and Rotating Status Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <motion.div
          animate={
            prefersReduced
              ? {}
              : {
                  boxShadow: [
                    '0 0 0px hsla(var(--primary), 0.2)',
                    '0 0 12px hsla(var(--primary), 0.45)',
                    '0 0 0px hsla(var(--primary), 0.2)',
                  ],
                }
          }
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, hsla(var(--primary), 0.25), hsla(var(--primary), 0.08))',
            border: '1px solid hsla(var(--primary), 0.5)',
            display: 'grid',
            placeItems: 'center',
            color: 'hsl(var(--primary))',
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/royale-guide-thinking.png"
            alt="Royale Guide denkt nach"
            width={40}
            height={40}
            sizes="40px"
            style={{ objectFit: 'contain' }}
          />
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', height: '18px', flex: 1, overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeToolName ? `tool-${activeToolName}` : `phase-${phaseIndex}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'hsl(var(--primary))',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeToolName
                  ? (TOOL_PHASE_LABELS[activeToolName] ?? 'Führe Systemabfrage aus…')
                  : THINKING_PHASES[phaseIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Shimmer Skeleton Wave Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '4px' }}>
        {[
          { width: '92%', height: '10px' },
          { width: '78%', height: '10px' },
          { width: '56%', height: '10px' },
        ].map((bar, i) => (
          <div
            key={i}
            style={{
              width: bar.width,
              height: bar.height,
              borderRadius: '6px',
              background: 'hsla(var(--primary), 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={
                prefersReduced
                  ? {}
                  : {
                      x: ['-100%', '100%'],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: 1.6,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, transparent 0%, hsla(var(--primary), 0.28) 50%, transparent 100%)',
              }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
