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

import { HighrollerWinDetailModal } from './HighrollerWinDetailModal';

export function LiveHighrollerTickerBar() {
  const [wins] = useState<HighrollerWin[]>(DEFAULT_WINS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedWin, setSelectedWin] = useState<HighrollerWin | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 768px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    // Visibility change pause
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (selectedWin) return; // Pause while viewing details
      setActiveIdx((prev) => (prev + 1) % DEFAULT_WINS.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [selectedWin]);

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
    <>
      <div
        style={{
          width: '100%',
          maxWidth: '1560px',
          margin: '0 auto 16px',
          padding: isMobile ? '0 16px' : '0 24px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '5px' : '8px', flexShrink: 0 }}>
            <span
              style={{
                width: isMobile ? '6px' : '8px',
                height: isMobile ? '6px' : '8px',
                borderRadius: '50%',
                background: '#00E701',
                boxShadow: '0 0 8px #00E701',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: isMobile ? '0.62rem' : '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                color: '#D4AF37',
                textTransform: 'uppercase',
              }}
            >
              {isMobile ? 'LIVE' : 'LIVE AUSZAHLUNGEN'}
            </span>
          </div>

          {/* Center: Dynamic Animated Win Ticker (Clickable for NP-2) */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              margin: isMobile ? '0 4px' : '0 16px',
              height: '100%',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedWin(activeWin)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '4px' : '10px',
                  fontSize: isMobile ? '0.68rem' : '0.8rem',
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {getTypeIcon(activeWin.type)}
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: isMobile ? '80px' : 'none',
                  }}
                >
                  {activeWin.user}
                </span>
                {!isMobile && (
                  <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.75rem' }}>
                    gewann
                  </span>
                )}
                <span
                  style={{
                    color: '#00E701',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    letterSpacing: '0.02em',
                    flexShrink: 0,
                  }}
                >
                  +${activeWin.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                {!isMobile && (
                  <>
                    <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.75rem' }}>
                      in
                    </span>
                    <span style={{ color: '#D4AF37', fontWeight: 800 }}>{activeWin.game}</span>
                    <span
                      style={{
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: '#D4AF37',
                        fontSize: '0.66rem',
                        fontWeight: 900,
                      }}
                    >
                      {activeWin.mult}
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: High-Confidence Trust Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '4px' : '6px',
              padding: isMobile ? '2px 6px' : '4px 10px',
              borderRadius: '8px',
              background: 'rgba(0, 231, 1, 0.08)',
              border: '1px solid rgba(0, 231, 1, 0.2)',
              color: '#00E701',
              fontSize: isMobile ? '0.62rem' : '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={isMobile ? 10 : 13} />
            <span>99.2% RTP</span>
          </div>
        </div>
      </div>

      {/* Highroller Detail Modal (NP-2) */}
      <HighrollerWinDetailModal win={selectedWin} onClose={() => setSelectedWin(null)} />
    </>
  );
}
