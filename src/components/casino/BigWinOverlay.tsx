'use client';

import React, { useEffect, useState } from 'react';
import { Star, Trophy } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Z_INDEX } from '@/lib/design/tokens.generated';
import { soundManager } from '@/lib/casino/sound-manager';

interface BigWinOverlayProps {
  amount: number;
  multiplier: number;
  isOpen: boolean;
  onClose: () => void;
}

interface Particle {
  id: number;
  left: number;
  drift: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
  isCircle: boolean;
}

const PARTICLE_COLORS = ['#D4AF37', '#FFF7D6', '#F5D77F', '#FFFFFF', '#E6B800'];

const STATIC_PARTICLES: Particle[] = Array.from({ length: 48 }).map((_, i) => ({
  id: i,
  left: (i * 37) % 100,
  drift: ((i * 43) % 60) - 30 + (i % 10) * 4,
  duration: 2.4 + ((i * 29) % 20) / 10,
  delay: ((i * 19) % 18) / 10,
  size: 4 + (i % 6),
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  isCircle: i % 2 === 0,
}));

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
    soundManager.play('win');
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
          {/* Confetti & Light Particles */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
          >
            {STATIC_PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  top: '-10%',
                  left: `${p.left}%`,
                  rotate: 0,
                  opacity: 0.9,
                }}
                animate={{
                  top: '110%',
                  rotate: p.isCircle ? 180 : 360,
                  left: `${p.left + p.drift}%`,
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: p.delay,
                }}
                style={{
                  position: 'absolute',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  background: p.color,
                  borderRadius: p.isCircle ? '50%' : '2px',
                  boxShadow: `0 0 10px ${p.color}`,
                }}
              />
            ))}
          </div>

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
                <Trophy
                  size={isMobile ? 76 : 116}
                  color="#D4AF37"
                  style={{
                    filter: 'drop-shadow(0 0 28px rgba(212, 175, 55, 0.85))',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* BIG WIN! Gradient Heading */}
            <motion.h2
              initial={{ letterSpacing: '0.3em', opacity: 0, scale: 0.8 }}
              animate={{ letterSpacing: '-0.02em', opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
              style={{
                fontSize: isMobile ? '3rem' : '5.5rem',
                fontWeight: 900,
                fontFamily: 'var(--font-inter), sans-serif',
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F8DF8C 45%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                marginBottom: '12px',
                filter: 'drop-shadow(0 0 35px rgba(212, 175, 55, 0.6))',
              }}
            >
              BIG WIN!
            </motion.h2>

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
