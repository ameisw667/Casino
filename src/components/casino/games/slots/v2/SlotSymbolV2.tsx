'use client';
import React from 'react';
import { motion } from 'framer-motion';
import type { SymbolType } from '@/components/casino/SlotSymbol';

interface SlotSymbolV2Props {
  type: SymbolType;
  size?: number;
  isWinning?: boolean;
  isBlurry?: boolean;
  multiplierValue?: number;
}

const SYMBOL_DATA: Record<
  SymbolType,
  { color: string; glowColor: string; label: string; icon: (id: string) => React.ReactNode }
> = {
  zeus: {
    color: '#FFD700',
    glowColor: '#FFD700',
    label: 'ZEUS',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-zeus.png"
        alt="Zeus"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },
  crown: {
    color: '#FFD700',
    glowColor: '#FFD700',
    label: 'CROWN',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-crown.png"
        alt="Crown"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },
  chalice: {
    color: '#FF8C00',
    glowColor: '#FF8C00',
    label: 'CHALICE',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-chalice.png"
        alt="Chalice"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },
  ring: {
    color: '#00D4FF',
    glowColor: '#00D4FF',
    label: 'RING',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-ring-v2-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F7FF" />
            <stop offset="50%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#0066AA" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="36"
          r="18"
          fill="none"
          stroke={`url(#grad-ring-v2-${id})`}
          strokeWidth="8"
        />
        <circle cx="32" cy="36" r="10" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="2" />
        <path d="M24 18 L32 8 L40 18 L32 26 Z" fill="#00D4FF" stroke="#0066AA" strokeWidth="1" />
        <path d="M24 18 L32 22 L40 18" fill="rgba(255,255,255,0.4)" />
        <circle cx="29" cy="12" r="2" fill="rgba(255,255,255,0.7)" />
      </svg>
    ),
  },
  hourglass: {
    color: '#A855F7',
    glowColor: '#A855F7',
    label: 'TIME',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-hg-v2-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E9D5FF" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
        </defs>
        <rect x="12" y="6" width="40" height="6" rx="3" fill={`url(#grad-hg-v2-${id})`} />
        <rect x="12" y="52" width="40" height="6" rx="3" fill={`url(#grad-hg-v2-${id})`} />
        <path
          d="M14 12 L28 32 L14 52"
          fill="none"
          stroke={`url(#grad-hg-v2-${id})`}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M50 12 L36 32 L50 52"
          fill="none"
          stroke={`url(#grad-hg-v2-${id})`}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M14 12 L50 12 L36 32 L50 52 L14 52 L28 32 Z" fill="rgba(168,85,247,0.15)" />
        <path d="M18 14 L46 14 L34 28 L30 28 Z" fill={`url(#grad-hg-v2-${id})`} opacity="0.6" />
        <path d="M30 36 L34 36 L42 50 L22 50 Z" fill={`url(#grad-hg-v2-${id})`} opacity="0.8" />
        <circle cx="32" cy="32" r="2" fill="#A855F7" />
      </svg>
    ),
  },
  gem_red: {
    color: '#FF3366',
    glowColor: '#FF3366',
    label: 'GEM',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-gr-v2-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB3C6" />
            <stop offset="50%" stopColor="#FF3366" />
            <stop offset="100%" stopColor="#AA0033" />
          </linearGradient>
        </defs>
        <path
          d="M32 6 L52 22 L44 58 L20 58 L12 22 Z"
          fill={`url(#grad-gr-v2-${id})`}
          stroke="#AA0033"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M32 6 L52 22 L32 18 L12 22 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M24 10 L32 18" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      </svg>
    ),
  },
  gem_blue: {
    color: '#3B82F6',
    glowColor: '#3B82F6',
    label: 'GEM',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-gb-v2-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BFDBFE" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <path
          d="M32 6 L52 22 L44 58 L20 58 L12 22 Z"
          fill={`url(#grad-gb-v2-${id})`}
          stroke="#1D4ED8"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M32 6 L52 22 L32 18 L12 22 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M24 10 L32 18" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      </svg>
    ),
  },
  gem_green: {
    color: '#22C55E',
    glowColor: '#22C55E',
    label: 'GEM',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-gg-v2-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BBF7D0" />
            <stop offset="50%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        <path
          d="M32 6 L52 22 L44 58 L20 58 L12 22 Z"
          fill={`url(#grad-gg-v2-${id})`}
          stroke="#15803D"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M32 6 L52 22 L32 18 L12 22 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M24 10 L32 18" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
      </svg>
    ),
  },
  wild: {
    color: '#FF00FF',
    glowColor: '#FF00FF',
    label: 'WILD',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`grad-wild-v2-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF00FF" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#00FFFF" />
          </linearGradient>
        </defs>
        <polygon
          points="32,4 37,26 58,26 42,40 48,62 32,48 16,62 22,40 6,26 27,26"
          fill={`url(#grad-wild-v2-${id})`}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="#000"
          fontFamily="Arial"
        >
          WILD
        </text>
      </svg>
    ),
  },
  scatter: {
    color: '#FFD700',
    glowColor: '#FFD700',
    label: 'BONUS',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`grad-scatter-v2-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF8C00" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill={`url(#grad-scatter-v2-${id})`} />
        <circle cx="32" cy="32" r="16" fill="rgba(255,255,255,0.2)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1="32"
            y1="32"
            x2={32 + Math.cos((angle * Math.PI) / 180) * 28}
            y2={32 + Math.sin((angle * Math.PI) / 180) * 28}
            stroke="#FFD700"
            strokeWidth="2"
            opacity="0.6"
          />
        ))}
        <text
          x="32"
          y="37"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fill="#000"
          fontFamily="Arial"
        >
          BONUS
        </text>
      </svg>
    ),
  },
  multiplier: {
    color: '#FFD700',
    glowColor: '#FFD700',
    label: 'MULTI',
    icon: (id) => (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`grad-multi-v2-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF8C00" />
          </radialGradient>
        </defs>
        <path d="M4 32 Q12 16 24 24 Q16 32 24 40 Q12 48 4 32 Z" fill="#FFD700" opacity="0.7" />
        <path d="M60 32 Q52 16 40 24 Q48 32 40 40 Q52 48 60 32 Z" fill="#FFD700" opacity="0.7" />
        <circle cx="32" cy="32" r="16" fill={`url(#grad-multi-v2-${id})`} />
        <circle cx="27" cy="26" r="4" fill="rgba(255,255,255,0.5)" />
      </svg>
    ),
  },

  card_ten: {
    color: '#C8A84B',
    glowColor: '#D4AF37',
    label: '10',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-ten.png"
        alt="10"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },

  card_jack: {
    color: '#7799DD',
    glowColor: '#99BBFF',
    label: 'J',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-jack.png"
        alt="Jack"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },

  card_queen: {
    color: '#DD6677',
    glowColor: '#FF8899',
    label: 'Q',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-queen.png"
        alt="Queen"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },

  card_king: {
    color: '#CCCCCC',
    glowColor: '#FFFFFF',
    label: 'K',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-king.png"
        alt="King"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },

  card_ace: {
    color: '#FFD700',
    glowColor: '#FFFACD',
    label: 'A',
    icon: (_id) => (
      <img
        src="/images/slots/v2/sym-ace.png"
        alt="Ace"
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    ),
  },
};

const WIN_GLOW_COLOR = '#FFD700';

export const SlotSymbolV2: React.FC<SlotSymbolV2Props> = ({
  type,
  size = 64,
  isWinning = false,
  isBlurry = false,
  multiplierValue,
}) => {
  const data = SYMBOL_DATA[type];
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <motion.div
      animate={{
        scale: isWinning ? [1, 1.15, 1.08, 1.12, 1] : 1,
        opacity: 1,
        filter: isBlurry
          ? 'blur(6px) brightness(1.2)'
          : isWinning
            ? `drop-shadow(0 0 12px ${WIN_GLOW_COLOR}) drop-shadow(0 0 24px ${WIN_GLOW_COLOR})`
            : `drop-shadow(0 0 4px ${data.glowColor}40)`,
      }}
      transition={
        isWinning
          ? { duration: 0.8, repeat: Infinity, repeatType: 'loop' }
          : { type: 'spring', stiffness: 300, damping: 20 }
      }
      style={{
        width: size,
        height: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'default',
      }}
    >
      {isWinning && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: '-20%',
            borderRadius: '50%',
            background: WIN_GLOW_COLOR,
            filter: 'blur(20px)',
            zIndex: -1,
          }}
        />
      )}

      <div style={{ width: '85%', height: '85%' }}>{data.icon(uniqueId)}</div>

      {type === 'multiplier' && multiplierValue && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.28,
            fontWeight: 900,
            color: '#000',
            textShadow: 'none',
            fontFamily: 'monospace',
            paddingTop: '8%',
          }}
        >
          {multiplierValue}×
        </div>
      )}

      {type === 'scatter' && !isBlurry && (
        <motion.span
          animate={isWinning ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.6 }}
          style={{
            position: 'absolute',
            bottom: '-4px',
            fontSize: Math.max(9, size * 0.14),
            fontWeight: 900,
            background: data.color,
            color: '#000',
            padding: '1px 5px',
            borderRadius: '3px',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          BONUS
        </motion.span>
      )}
    </motion.div>
  );
};
