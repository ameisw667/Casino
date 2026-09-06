'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, Zap, ShieldCheck, Activity } from 'lucide-react';
import { useProgressiveJackpot } from '@/hooks/useProgressiveJackpot';

export const ProgressiveJackpotSection: React.FC<{ isMobile?: boolean }> = ({
  isMobile = false,
}) => {
  const { formatted: jackpotFormatted } = useProgressiveJackpot();

  const stats = [
    {
      label: 'GESAMT AUSGEZAHLT',
      mobileLabel: 'AUSZAHLUNGEN',
      value: '$14,280,450+',
      mobileValue: '$14.28M+',
      icon: Coins,
      color: '#D4AF37',
    },
    {
      label: 'DURCHSCHN. AUSZAHLUNG',
      mobileLabel: 'SPEED',
      value: '1.8 SEKUNDEN',
      mobileValue: '1.8 SEK.',
      icon: Zap,
      color: '#00E701',
    },
    {
      label: 'PLATZIERTE WETTEN',
      mobileLabel: 'WETTEN',
      value: '4,892,100+',
      mobileValue: '4.89M+',
      icon: Activity,
      color: '#00B67A',
    },
    {
      label: 'PROVABLY FAIR',
      mobileLabel: 'FAIRNESS',
      value: '100% TRANSPARENT',
      mobileValue: '100% FAIR',
      icon: ShieldCheck,
      color: '#D4AF37',
    },
  ];

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        margin: isMobile ? '0 auto 24px' : '0 auto 64px',
        padding: isMobile ? '16px 8px' : '40px 24px',
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
          marginBottom: isMobile ? '20px' : '32px',
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
          marginBottom: isMobile ? '24px' : '36px',
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

        {/* Big Liquid Gold Typographic Headline with Rolling Digital Slot Ticker (NP-1) */}
        <div
          style={{
            position: 'relative',
            fontSize: isMobile ? 'clamp(2.2rem, 8vw, 3.2rem)' : 'clamp(3.8rem, 5.5vw, 5.2rem)',
            fontWeight: 1000,
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #F5E08C 35%, #D4AF37 70%, #997517 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 35px rgba(212, 175, 55, 0.45))',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RollingJackpotDisplay formatted={jackpotFormatted} />
        </div>

        <p
          style={{
            fontSize: isMobile ? '0.78rem' : '0.92rem',
            color: 'rgba(255, 255, 255, 0.65)',
            margin: 0,
            fontWeight: 500,
            letterSpacing: '0.02em',
            padding: isMobile ? '0 10px' : '0',
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
          gap: isMobile ? '12px 8px' : '0',
          padding: isMobile ? '12px 6px' : '20px 0',
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
                padding: isMobile ? '6px 4px' : '6px 24px',
                borderRight: !isMobile && !isLast ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginBottom: '4px',
                }}
              >
                <Icon size={isMobile ? 12 : 14} color={stat.color} />
                <span
                  style={{
                    fontSize: isMobile ? '0.62rem' : '0.68rem',
                    fontWeight: 900,
                    color: 'rgba(255, 255, 255, 0.55)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {isMobile ? stat.mobileLabel : stat.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: isMobile ? '0.88rem' : '1.35rem',
                  fontWeight: 1000,
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  letterSpacing: '-0.02em',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMobile ? stat.mobileValue || stat.value : stat.value}
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

// ──── Rolling Digital Slot Ticker Digit ────
function RollingDigit({ char }: { char: string }) {
  if (char === '$' || char === ',' || char === '.' || char === '—') {
    return <span>{char}</span>;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        height: '1.08em',
        overflow: 'hidden',
        verticalAlign: 'top',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ y: '60%', opacity: 0.3 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-60%', opacity: 0.3 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          style={{ display: 'inline-block' }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function RollingJackpotDisplay({ formatted }: { formatted: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {formatted.split('').map((ch, idx) => (
        <RollingDigit key={`${idx}-${ch === ',' || ch === '.' ? ch : 'd'}`} char={ch} />
      ))}
    </div>
  );
}
