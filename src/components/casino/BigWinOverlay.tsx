'use client';
import React, { useEffect, useState } from 'react';
import {  Star, Trophy } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
interface BigWinOverlayProps {
  amount: number;
  multiplier: number;
  isOpen: boolean;
  onClose: () => void;
}
export default function BigWinOverlay({ amount, multiplier, isOpen, onClose }: BigWinOverlayProps) {
  const { isMobile } = useCasinoStore();
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<{left1: number, left2: number, duration: number, delay: number}[]>([]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
      
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        left1: Math.random() * 100,
        left2: (Math.random() - 0.5) * 40 + (i * 2.5),
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);
  return (
    <AnimatePresence>
      {(isOpen || show) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(15px)',
            pointerEvents: 'auto'
          }}
        >
          {/* Particles / Confetti (Simplified) */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ 
                  top: '-10%', 
                  left: `${p.left1}%`,
                  rotate: 0 
                }}
                animate={{ 
                  top: '110%',
                  rotate: 360,
                  left: `${p.left2}%` 
                }}
                transition={{ 
                  duration: p.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: p.delay
                }}
                style={{ 
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? '#fff' : 'hsl(var(--accent))',
                  borderRadius: i % 2 === 0 ? '0' : '50%',
                }}
              />
            ))}
          </div>
          <motion.div 
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            style={{ 
              textAlign: 'center', 
              position: 'relative', 
              padding: isMobile ? '40px 20px' : '80px 100px', 
              borderRadius: '40px', 
              overflow: 'hidden',
              background: 'hsla(0,0%,0%,0.4)',
              border: '1px solid hsla(var(--primary), 0.3)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
            }}
          >
            {/* Background Texture */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3 }}>
              <Image src="/images/social-win-bg.png" alt="Win Background" fill style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.div 
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                style={{ position: 'relative', display: 'inline-block' }}
              >
                <div style={{ 
                  position: 'absolute', 
                  inset: '-40px', 
                  background: 'radial-gradient(circle, hsla(var(--primary), 0.3) 0%, transparent 70%)',
                  filter: 'blur(20px)'
                }} />
                <Trophy size={isMobile ? 80 : 120} color="hsl(var(--primary))" style={{ position: 'relative', marginBottom: '24px' }} />
              </motion.div>
              <motion.h2 
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '-0.05em', opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                style={{ 
                  fontSize: isMobile ? '3rem' : '5rem', 
                  fontWeight: 900, 
                  fontFamily: "'Outfit', sans-serif", 
                  background: 'linear-gradient(to bottom, #fff, hsl(var(--primary)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1,
                  marginBottom: '8px'
                }}
              >
                BIG WIN!
              </motion.h2>
              
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}
              >
                {multiplier.toFixed(2)}X MULTIPLIER
              </motion.div>
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={{ 
                  fontSize: isMobile ? '2.5rem' : '4.5rem', 
                  fontWeight: 900, 
                  fontFamily: "'Outfit', sans-serif",
                  color: '#fff',
                  textShadow: '0 0 40px hsla(var(--primary), 0.5)'
                }}
              >
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </motion.div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '40px' }}>
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1 + (i * 0.1), type: 'spring' }}
                  >
                    <Star size={24} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}