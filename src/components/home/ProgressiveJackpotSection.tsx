'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, Zap, ShieldCheck, Activity } from 'lucide-react';

export const ProgressiveJackpotSection: React.FC<{ isMobile?: boolean }> = ({
  isMobile = false,
}) => {
  const [jackpot, setJackpot] = useState<number>(1489254.8);

  // Slowly increment jackpot value every 2 seconds for live atmosphere
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + Math.random() * 2.45 + 0.15);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'GESAMT AUSGEZAHLT', value: '$14,280,450+', icon: Coins, color: '#D4AF37' },
    { label: 'DURCHSCHN. AUSZAHLUNG', value: '1.8 SEKUNDEN', icon: Zap, color: '#00E701' },
    { label: 'PLATZIERTE WETTEN', value: '4,892,100+', icon: Activity, color: '#00B67A' },
    { label: 'PROVABLY FAIR', value: '100% TRANSPARENT', icon: ShieldCheck, color: '#9370DB' },
  ];

  return (
    <section style={{ marginBottom: '60px' }}>
      {/* Main Jackpot Counter Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(24, 22, 16, 0.78) 0%, rgba(12, 12, 18, 0.88) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow:
            'inset 0 1px 2px rgba(255, 255, 255, 0.25), 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(212, 175, 55, 0.2)',
          padding: isMobile ? '32px 20px' : '48px 40px',
          textAlign: 'center',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 18px',
            borderRadius: '20px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            color: '#D4AF37',
            fontSize: '0.8rem',
            fontWeight: 900,
            letterSpacing: '0.12em',
            marginBottom: '16px',
          }}
        >
          <Trophy size={16} /> LIVE PROGRESSIVE JACKPOT
        </div>

        {/* Big Animated Amount */}
        <div
          style={{
            fontSize: isMobile ? 'clamp(2.2rem, 8vw, 3rem)' : 'clamp(3.5rem, 6vw, 5.2rem)',
            fontWeight: 1000,
            fontFamily: 'monospace',
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            textShadow: '0 0 40px rgba(212, 175, 55, 0.6), 0 0 80px rgba(212, 175, 55, 0.3)',
            marginBottom: '12px',
          }}
        >
          ${jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <p
          style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            fontWeight: 600,
          }}
        >
          Auszahlung erfolgt automatisch bei Treffer aller VIP Jackpot-Kombinationen.
        </p>
      </motion.div>

      {/* Platform Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              style={{
                borderRadius: '16px',
                background: 'rgba(15, 15, 20, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={18} color={stat.color} />
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: 'rgba(255, 255, 255, 0.5)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: isMobile ? '1.1rem' : '1.35rem',
                  fontWeight: 1000,
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
