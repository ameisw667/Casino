'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, Zap, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';

export const ProgressiveJackpotSection: React.FC<{ isMobile?: boolean }> = ({
  isMobile = false,
}) => {
  const { formatted: jackpotFormatted } = useProgressiveJackpot();

  const stats = [
    { label: 'GESAMT AUSGEZAHLT', value: '$14,280,450+', icon: Coins, color: '#D4AF37' },
    { label: 'DURCHSCHN. AUSZAHLUNG', value: '1.8 SEKUNDEN', icon: Zap, color: '#00E701' },
    { label: 'PLATZIERTE WETTEN', value: '4,892,100+', icon: Activity, color: '#00B67A' },
    { label: 'PROVABLY FAIR', value: '100% TRANSPARENT', icon: ShieldCheck, color: '#D4AF37' },
  ];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto 64px',
        padding: isMobile ? '24px 16px' : '40px 24px',
      }}
    >
      {/* Floating Horizon Ambient Light Beam */}
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '900px',
          height: '240px',
          background:
            'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 50%, transparent 75%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top Hairline Horizon */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.35) 50%, transparent 100%)',
          marginBottom: '32px',
        }}
      />

      {/* Center Frameless Jackpot Stage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          marginBottom: '36px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            color: '#D4AF37',
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '12px',
            boxShadow: '0 0 20px rgba(212, 175, 55, 0.15)',
          }}
        >
          <Trophy size={14} />
          <span>LIVE PROGRESSIVE JACKPOT</span>
        </div>

        {/* Big Liquid Gold Typographic Headline */}
        <div
          style={{
            fontSize: isMobile ? 'clamp(2.4rem, 8.5vw, 3.4rem)' : 'clamp(3.8rem, 5.5vw, 5.2rem)',
            fontWeight: 1000,
            fontFamily: 'monospace',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #F5E08C 35%, #D4AF37 70%, #997517 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 35px rgba(212, 175, 55, 0.45))',
            marginBottom: '10px',
          }}
        >
          {jackpotFormatted}
        </div>

        <p
          style={{
            fontSize: isMobile ? '0.82rem' : '0.92rem',
            color: 'rgba(255, 255, 255, 0.65)',
            margin: 0,
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          Auszahlung erfolgt automatisch bei Treffer aller VIP Jackpot-Kombinationen.
        </p>
      </motion.div>

      {/* Frameless Floating Metrics Strip (0 Nested Boxes) */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '16px' : '0',
          padding: isMobile ? '16px 0' : '20px 0',
          borderRadius: '16px',
          background: 'rgba(12, 12, 18, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isLast = i === stats.length - 1;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: isMobile ? '8px 12px' : '6px 24px',
                borderRight: !isMobile && !isLast ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                <Icon size={14} color={stat.color} />
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    color: 'rgba(255, 255, 255, 0.55)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
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

      {/* Bottom Hairline Horizon */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.25) 50%, transparent 100%)',
          marginTop: '32px',
        }}
      />
    </section>
  );
};
