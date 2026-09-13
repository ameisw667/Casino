'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface GoldVectorSignatureProps {
  rankName: string;
  rankColor?: string;
  userLevel: number;
  playerName?: string;
  isMobile?: boolean;
}

export function GoldVectorSignature({
  rankName,
  rankColor = '#D4AF37',
  userLevel,
  playerName = 'VibeCoder_Royale',
  isMobile = false,
}: GoldVectorSignatureProps) {
  const [animationKey, setAnimationKey] = useState(0);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      aria-label="Royal VIP Accreditation Certificate"
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(20, 24, 34, 0.96) 0%, rgba(10, 12, 18, 0.98) 100%)',
        border: '1.5px solid rgba(212, 175, 55, 0.35)',
        borderRadius: '20px',
        padding: isMobile ? '20px 16px' : '26px 24px',
        boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.7), 0 0 24px rgba(212, 175, 55, 0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Ornate Corner Borders */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '16px',
          height: '16px',
          borderTop: '2px solid #D4AF37',
          borderLeft: '2px solid #D4AF37',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '16px',
          height: '16px',
          borderTop: '2px solid #D4AF37',
          borderRight: '2px solid #D4AF37',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          width: '16px',
          height: '16px',
          borderBottom: '2px solid #D4AF37',
          borderLeft: '2px solid #D4AF37',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          width: '16px',
          height: '16px',
          borderBottom: '2px solid #D4AF37',
          borderRight: '2px solid #D4AF37',
          opacity: 0.6,
        }}
      />

      {/* Certificate Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          paddingBottom: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={16} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: '#D4AF37',
              textTransform: 'uppercase',
            }}
          >
            CERTIFICATE OF VIP ACCREDITATION
          </span>
        </div>

        <button
          type="button"
          onClick={handleReplay}
          title="Signatur erneut animieren"
          style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '6px',
            padding: '4px 8px',
            color: '#D4AF37',
            fontSize: '0.62rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <RefreshCw size={11} />
          <span>RE-SIGN</span>
        </button>
      </div>

      {/* Certificate Proclamation Body */}
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <div
          style={{
            fontSize: '0.68rem',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '4px',
          }}
        >
          Solemnly Conferred Upon
        </div>
        <div
          style={{
            fontSize: isMobile ? '1.1rem' : '1.35rem',
            fontWeight: 900,
            fontFamily: 'var(--font-mono), monospace',
            color: '#FFFFFF',
            letterSpacing: '0.05em',
            textShadow: '0 0 16px rgba(212, 175, 55, 0.4)',
            marginBottom: '6px',
          }}
        >
          {playerName}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: rankColor,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            padding: '2px 10px',
            borderRadius: '999px',
          }}
        >
          <Sparkles size={12} />
          <span>
            {rankName} TIER SOVEREIGN • LEVEL {userLevel}
          </span>
        </div>
      </div>

      {/* Signature & Seal Chamber */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 140px',
          gap: '16px',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: '14px',
          padding: '14px 18px',
        }}
      >
        {/* Animated Vector Liquid Gold Signature */}
        <div>
          <div
            style={{
              fontSize: '0.62rem',
              color: 'rgba(255, 255, 255, 0.4)',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}
          >
            OFFICIAL ACCREDITATION SIGNATURE:
          </div>
          <svg
            key={animationKey}
            viewBox="0 0 340 70"
            style={{
              width: '100%',
              maxWidth: '300px',
              height: '56px',
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient id="goldLiquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF2B2" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#AA7C11" />
              </linearGradient>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Signature Base Path (Glow Layer) */}
            <motion.path
              d="M 15 48 Q 45 10, 75 38 T 130 32 T 180 44 Q 210 12, 240 36 T 290 28 Q 315 22, 325 45"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.42, 0, 0.58, 1] }}
            />

            {/* Flourish Loop Underline */}
            <motion.path
              d="M 35 55 Q 160 62, 310 50 Q 230 65, 120 62"
              fill="none"
              stroke="url(#goldLiquidGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.6, delay: 0.3, ease: 'easeOut' }}
            />

            {/* Primary Calligraphic Stroke */}
            <motion.path
              d="M 15 48 Q 45 10, 75 38 T 130 32 T 180 44 Q 210 12, 240 36 T 290 28 Q 315 22, 325 45"
              fill="none"
              stroke="url(#goldLiquidGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#goldGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.42, 0, 0.58, 1] }}
            />
          </svg>
          <div
            style={{
              fontSize: '0.62rem',
              color: 'rgba(212, 175, 55, 0.75)',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            Grand Chancellor & Master of Tables · <em>Casino Royale</em>
          </div>
        </div>

        {/* Official Wax / Gold Seal Medallion */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: isMobile ? 'none' : '1px solid rgba(212, 175, 55, 0.2)',
            paddingLeft: isMobile ? '0' : '12px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #D4AF37 0%, #997415 70%, #5E4609 100%)',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0B0E14',
              marginBottom: '4px',
            }}
          >
            <ShieldCheck size={26} strokeWidth={2.4} />
          </div>
          <span
            style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: 'rgba(212, 175, 55, 0.8)',
              textAlign: 'center',
            }}
          >
            VERIFIED SEAL
          </span>
        </div>
      </div>
    </div>
  );
}

export default GoldVectorSignature;
