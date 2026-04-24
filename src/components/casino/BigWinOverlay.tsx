'use client';

import React, { useEffect, useState } from 'react';
import { Coins, Star, Trophy } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface BigWinOverlayProps {
  amount: number;
  multiplier: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function BigWinOverlay({ amount, multiplier, isOpen, onClose }: BigWinOverlayProps) {
  const { isMobile } = useCasinoStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 500);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen && !show) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 9999, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: show ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0)',
      backdropFilter: show ? 'blur(15px)' : 'blur(0px)',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: show ? 'auto' : 'none'
    }}>
      {/* Particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            style={{ 
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: '10px',
              height: '10px',
              background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
              borderRadius: '50%',
              filter: 'blur(4px)',
              opacity: show ? 0.6 : 0,
              transition: 'opacity 1s ease'
            }}
          />
        ))}
      </div>

      <div style={{ 
        textAlign: 'center', 
        transform: show ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(100px)',
        opacity: show ? 1 : 0,
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ 
            position: 'absolute', 
            inset: '-40px', 
            background: 'radial-gradient(circle, hsla(var(--primary), 0.3) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }} />
          <Trophy size={isMobile ? 80 : 120} color="hsl(var(--primary))" style={{ position: 'relative', marginBottom: '24px' }} />
        </div>

        <h2 style={{ 
          fontSize: isMobile ? '3rem' : '5rem', 
          fontWeight: 900, 
          fontFamily: "'Outfit', sans-serif", 
          background: 'linear-gradient(to bottom, #fff, hsl(var(--primary)))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          letterSpacing: '-0.05em',
          marginBottom: '8px'
        }}>
          BIG WIN!
        </h2>
        <div style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '32px' }}>
          {multiplier}X MULTIPLIER
        </div>

        <div style={{ 
          fontSize: isMobile ? '2.5rem' : '4.5rem', 
          fontWeight: 900, 
          fontFamily: "'Outfit', sans-serif",
          color: '#fff',
          textShadow: '0 0 40px hsla(var(--primary), 0.5)'
        }}>
          ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '40px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={24} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
          ))}
        </div>
      </div>
    </div>
  );
}
