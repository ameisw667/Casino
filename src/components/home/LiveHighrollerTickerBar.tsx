'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Crown, Sparkles, TrendingUp } from 'lucide-react';

interface HighrollerWin {
  id: string;
  user: string;
  amount: number;
  game: string;
  mult: string;
  type: 'jackpot' | 'whale' | 'hot' | 'vip';
  time: string;
}

const DEFAULT_WINS: HighrollerWin[] = [
  {
    id: '1',
    user: 'Satoshi_X',
    amount: 4250.0,
    game: 'Crash Rocket',
    mult: '14.20x',
    type: 'hot',
    time: 'gerade eben',
  },
  {
    id: '2',
    user: 'WhaleWatcher',
    amount: 8900.0,
    game: 'Neon Slots',
    mult: '89.00x',
    type: 'whale',
    time: 'vor 1m',
  },
  {
    id: '3',
    user: 'CryptoKing',
    amount: 12500.0,
    game: 'VIP Blackjack',
    mult: '2.50x',
    type: 'vip',
    time: 'vor 2m',
  },
  {
    id: '4',
    user: 'LuckyStrike',
    amount: 3400.0,
    game: 'Ultimate Dice',
    mult: '34.00x',
    type: 'hot',
    time: 'vor 3m',
  },
  {
    id: '5',
    user: 'AuraMaster',
    amount: 18200.0,
    game: 'Royale Roulette',
    mult: '36.00x',
    type: 'jackpot',
    time: 'vor 4m',
  },
];

export function LiveHighrollerTickerBar() {
  const [wins, setWins] = useState<HighrollerWin[]>(DEFAULT_WINS);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    // Visibility change pause
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      setActiveIdx((prev) => (prev + 1) % DEFAULT_WINS.length);
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  const activeWin = wins[activeIdx];

  const getTypeIcon = (type: HighrollerWin['type']) => {
    switch (type) {
      case 'jackpot':
        return <Sparkles size={14} color="#D4AF37" />;
      case 'whale':
        return <Crown size={14} color="#FFD700" />;
      case 'vip':
        return <Zap size={14} color="#00E701" />;
      default:
        return <Flame size={14} color="#FF5722" />;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1560px',
        margin: '0 auto 16px',
        padding: '0 24px',
        zIndex: 10,
        position: 'relative',
      }}
    >
      <div
        style={{
          height: '42px',
          borderRadius: '12px',
          background: 'rgba(12, 12, 18, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(212, 175, 55, 0.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Left Badge: Live Highroller Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00E701',
              boxShadow: '0 0 8px #00E701',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: '#D4AF37',
              textTransform: 'uppercase',
            }}
          >
            LIVE AUSZAHLUNGEN
          </span>
        </div>

        {/* Center: Dynamic Animated Win Ticker */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            margin: '0 16px',
            height: '100%',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {getTypeIcon(activeWin.type)}
              <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{activeWin.user}</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.75rem' }}>
                gewann
              </span>
              <span
                style={{
                  color: '#00E701',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: '0.02em',
                }}
              >
                +${activeWin.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.75rem' }}>auf</span>
              <span style={{ color: '#fff', fontWeight: 800 }}>{activeWin.game}</span>
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  color: '#D4AF37',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                }}
              >
                {activeWin.mult}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Live Activity Rate */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: 'rgba(255, 255, 255, 0.6)',
            flexShrink: 0,
          }}
        >
          <TrendingUp size={13} color="#00E701" />
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>99.2% RTP</span>
        </div>
      </div>
    </div>
  );
}
