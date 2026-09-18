'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Z_INDEX } from '@/lib/design/tokens.generated';
import { CursorParticleTypography } from '@/components/casino/fx/CursorParticleTypography';

import { ParticleTypographyCanvas } from '@/components/casino/fx/ParticleTypographyCanvas';

interface BigWinOverlayProps {
  amount: number;
  multiplier: number;
  isOpen: boolean;
  onClose: () => void;
}

function AnimatedAmount({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 45, damping: 14 });
  const [display, setDisplay] = useState('$0.00');

  useEffect(() => {
    spring.set(value);
    const unsubscribe = spring.on('change', (latest: number) => {
      setDisplay(
        `$${Math.max(0, latest).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      );
    });
    return () => unsubscribe();
  }, [spring, value]);

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{display}</span>;
}

export default function BigWinOverlay({ amount, multiplier, isOpen, onClose }: BigWinOverlayProps) {
  const isMobile = useCasinoStore((s) => s.isMobile);

  useEffect(() => {
    if (!isOpen) return;
    // No soundManager.play('win') here anymore — the game-specific win sound (plus the tiered
    // escalation sweep for this >=20x moment) already plays once via processGameResult() ->
    // playWinTier() in useCasinoStore.ts. This was a confirmed doubling (plan
    // 02_audio_engine_plan.md, finding B3): a generic 'win' on top of e.g. 'crash-win'.
    const timer = setTimeout(() => {
      onClose();
    }, 5500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_INDEX.overlay.bigWin,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            cursor: 'pointer',
            userSelect: 'none',
            overflow: 'hidden',
          }}
        >
          {/* Interactive Gold Dust Particle Physics (60-120 FPS Canvas) */}
          <ParticleTypographyCanvas isMobile={isMobile} />

          {/* Central Radial Aura (No hard edges) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.95, 1.08, 0.95],
              opacity: [0.7, 0.95, 0.7],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              width: isMobile ? '380px' : '720px',
              height: isMobile ? '380px' : '720px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(212, 175, 55, 0.32) 0%, rgba(212, 175, 55, 0.12) 38%, transparent 70%)',
              filter: 'blur(32px)',
              pointerEvents: 'none',
            }}
          />

          {/* Secondary Inner Core Glow */}
          <div
            style={{
              position: 'absolute',
              width: isMobile ? '240px' : '420px',
              height: isMobile ? '240px' : '420px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(255, 240, 180, 0.4) 0%, rgba(212, 175, 55, 0.18) 45%, transparent 75%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }}
          />

          {/* Frameless Floating Content */}
          <motion.div
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 180 }}
            style={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '20px' : '40px',
            }}
          >
            {/* 3D Rotating Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 150 }}
              style={{ position: 'relative', marginBottom: isMobile ? '16px' : '24px' }}
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'inline-flex' }}
              >
                <Image
                  src="/images/2026-09-06_icon-trophy-win-quantum-gold_v001.png"
                  alt="Big Win"
                  width={isMobile ? 76 : 116}
                  height={isMobile ? 76 : 116}
                  style={{
                    filter: 'drop-shadow(0 0 28px rgba(212, 175, 55, 0.85))',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* BIG WIN! Particle Typography with Spring Physics & Explosion */}
            <div style={{ width: '100%', maxWidth: '640px', marginBottom: '12px' }}>
              <CursorParticleTypography
                text="BIG WIN!"
                fontSize={isMobile ? 44 : 76}
                fontFamily="var(--font-heading, 'Cinzel', serif)"
                fontWeight={900}
                as="h2"
                ambientFlakes={true}
                ambientCount={isMobile ? 25 : 60}
                triggerExplosion={true}
                repulsionRadius={90}
                repulsionForce={6.5}
                stiffness={0.045}
                damping={0.88}
                isMobile={isMobile}
              />
            </div>

            {/* Multiplier Badge */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 14 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '6px 18px' : '8px 24px',
                borderRadius: '9999px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)',
                marginBottom: isMobile ? '20px' : '28px',
              }}
            >
              <span
                style={{
                  fontSize: isMobile ? '1rem' : '1.35rem',
                  fontWeight: 800,
                  color: '#D4AF37',
                  letterSpacing: '0.15em',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}
              >
                {multiplier.toFixed(2)}x MULTIPLIER
              </span>
            </motion.div>

            {/* Animated Amount Count-Up */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring', damping: 12, stiffness: 140 }}
              style={{
                fontSize: isMobile ? '2.5rem' : '4.5rem',
                fontWeight: 900,
                fontFamily: 'monospace',
                color: '#FFFFFF',
                textShadow: '0 0 45px rgba(212, 175, 55, 0.75), 0 0 15px rgba(255, 255, 255, 0.5)',
                lineHeight: 1.1,
              }}
            >
              <AnimatedAmount value={amount} />
            </motion.div>

            {/* 5 Bouncing Stars */}
            <div
              style={{
                display: 'flex',
                gap: isMobile ? '10px' : '14px',
                justifyContent: 'center',
                marginTop: isMobile ? '24px' : '32px',
              }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.55 + i * 0.08,
                    type: 'spring',
                    damping: 10,
                    stiffness: 180,
                  }}
                >
                  <Star
                    size={isMobile ? 22 : 28}
                    fill="#D4AF37"
                    color="#D4AF37"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.9))',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Dismiss Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ delay: 1.2, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                marginTop: isMobile ? '24px' : '36px',
                fontSize: isMobile ? '0.75rem' : '0.85rem',
                letterSpacing: '0.15em',
                color: 'rgba(255, 255, 255, 0.45)',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-inter), sans-serif',
                fontWeight: 600,
              }}
            >
              Click anywhere to close
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
