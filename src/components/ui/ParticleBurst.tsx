'use client';
import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square';
}

export interface ParticleBurstHandle {
  fire: () => void;
}

interface ParticleBurstProps {
  particleCount?: number;
  colors?: string[];
  spreadAngle?: number;
  speed?: number;
  onComplete?: () => void;
}

/**
 * ParticleBurst - Explosive particle effect, fired imperatively via ref.
 *
 * Creates a burst of particles that explode outward from center.
 * Used for button clicks, wins, and celebration moments.
 *
 * Imperative (not a `trigger` prop): the parent owns the originating event
 * (e.g. a click) and calls `ref.current.fire()` directly, rather than the
 * component watching a boolean prop transition in an effect.
 */
export const ParticleBurst = forwardRef<ParticleBurstHandle, ParticleBurstProps>(
  (
    {
      particleCount = 12,
      colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#ffffff'],
      spreadAngle = 360,
      speed = 1,
      onComplete,
    },
    ref,
  ) => {
    const [particles, setParticles] = useState<Particle[]>([]);

    const fire = useCallback(() => {
      const newParticles: Particle[] = [];
      const angleStep = spreadAngle / particleCount;

      for (let i = 0; i < particleCount; i++) {
        const angle = (angleStep * i - spreadAngle / 2) * (Math.PI / 180);
        const velocity = (Math.random() * 0.5 + 0.5) * speed * 100;

        newParticles.push({
          id: Date.now() + i,
          x: 0,
          y: 0,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 720,
          shape: Math.random() > 0.5 ? 'circle' : 'square',
        });
      }

      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);
    }, [particleCount, spreadAngle, speed, colors, onComplete]);

    useImperativeHandle(ref, () => ({ fire }), [fire]);

    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: '50%', y: '50%', scale: 0, opacity: 1, rotate: particle.rotation }}
              animate={{
                x: `calc(50% + ${particle.vx}px)`,
                y: `calc(50% + ${particle.vy}px)`,
                scale: 0,
                opacity: 0,
                rotate: particle.rotation + particle.rotationSpeed,
              }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                borderRadius: particle.shape === 'circle' ? '50%' : '4px',
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  },
);

ParticleBurst.displayName = 'ParticleBurst';
