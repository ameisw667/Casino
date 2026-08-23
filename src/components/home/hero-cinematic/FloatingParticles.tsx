'use client';
import { motion } from 'framer-motion';
import { FLOATING_PARTICLES } from './config';

export function FloatingParticles({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
      {FLOATING_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: accentColor,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.85, 0.2],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
