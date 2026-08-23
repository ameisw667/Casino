'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, X, Flame, Crown, TrendingUp } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';

interface LiveEvent {
  id: string;
  user: string;
  game: string;
  amount: number;
  mult: string;
  isHighroller: boolean;
  time: string;
}

const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: '1',
    user: 'Satoshi_X',
    game: 'Crash',
    amount: 4250.0,
    mult: '14.2x',
    isHighroller: true,
    time: 'gerade eben',
  },
  {
    id: '2',
    user: 'VipWhale_99',
    game: 'Slots',
    amount: 8900.0,
    mult: '89.0x',
    isHighroller: true,
    time: 'vor 12s',
  },
  {
    id: '3',
    user: 'AuraPlayer',
    game: 'Blackjack',
    amount: 1500.0,
    mult: '2.5x',
    isHighroller: false,
    time: 'vor 28s',
  },
  {
    id: '4',
    user: 'Lucky_7',
    game: 'Dice',
    amount: 3200.0,
    mult: '32.0x',
    isHighroller: true,
    time: 'vor 45s',
  },
  {
    id: '5',
    user: 'RoyaleAce',
    game: 'Roulette',
    amount: 6700.0,
    mult: '36.0x',
    isHighroller: true,
    time: 'vor 1m',
  },
];

export function VipLiveStreamRail() {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>(INITIAL_EVENTS);

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
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const games = ['Crash', 'Slots', 'Dice', 'Blackjack', 'Roulette'];
      const users = [
        'NeonKing',
        'CryptoLord',
        'CyberHighroller',
        'VipShark',
        'GoldenBet',
        'AuraPro',
      ];
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const mult = (Math.random() * 20 + 1.5).toFixed(1) + 'x';
      const amount = Math.floor(Math.random() * 4500 + 500);

      const newEvent: LiveEvent = {
        id: Math.random().toString(36).substring(2, 9),
        user: randomUser,
        game: randomGame,
        amount,
        mult,
        isHighroller: amount > 2500,
        time: 'gerade eben',
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 7)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile (<=768px): Rail komplett ausgeblendet — vermeidet permanenten
          Header-/Content-Overlap durch fixed Toggle-Pill + 300px Drawer.
          Desktop (>=769px) bleibt unverändert. */}
      {isMobile ? null : (
        <>
      {/* Floating Toggle Pill at the right edge */}
      {!isOpen && (
        <motion.button
          onClick={() => {
            soundManager.playClick();
            setIsOpen(true);
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'fixed',
            right: 0,
            top: '45%',
            transform: 'translateY(-50%)',
            zIndex: 45,
            padding: '10px 14px 10px 12px',
            borderRadius: '16px 0 0 16px',
            background:
              'linear-gradient(135deg, rgba(20, 20, 28, 0.92) 0%, rgba(10, 10, 15, 0.95) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRight: 'none',
            color: '#D4AF37',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.15)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00E701',
              boxShadow: '0 0 8px #00E701',
            }}
          />
          <Radio size={14} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            VIP STREAM
          </span>
        </motion.button>
      )}

      {/* Slide-out VIP Live Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{
              position: 'fixed',
              right: 0,
              top: '70px',
              bottom: '20px',
              width: '300px',
              zIndex: 48,
              borderRadius: '20px 0 0 20px',
              background:
                'linear-gradient(180deg, rgba(14, 14, 20, 0.94) 0%, rgba(8, 8, 12, 0.96) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRight: 'none',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#00E701',
                    boxShadow: '0 0 8px #00E701',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: '#D4AF37',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  VIP HIGHROLLER STREAM
                </span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsOpen(false);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Live Stats Pulse */}
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                background: 'rgba(212, 175, 55, 0.04)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
                fontSize: '0.68rem',
                fontWeight: 700,
              }}
            >
              <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Aktive VIP Spieler</span>
              <span style={{ color: '#00E701', fontFamily: 'monospace', fontWeight: 900 }}>
                1,420 ONLINE
              </span>
            </div>

            {/* Event List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <AnimatePresence initial={false}>
                {events.map((evt) => (
                  <motion.div
                    key={evt.id}
                    layout
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: evt.isHighroller
                        ? 'linear-gradient(135deg, rgba(30, 24, 10, 0.65) 0%, rgba(16, 16, 22, 0.8) 100%)'
                        : 'rgba(255, 255, 255, 0.03)',
                      border: evt.isHighroller
                        ? '1px solid rgba(212, 175, 55, 0.25)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      boxShadow: evt.isHighroller ? '0 4px 16px rgba(212, 175, 55, 0.1)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {evt.isHighroller ? (
                          <Crown size={12} color="#D4AF37" />
                        ) : (
                          <Flame size={12} color="#FF5722" />
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                          {evt.user}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          fontWeight: 900,
                          color: '#D4AF37',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'rgba(212, 175, 55, 0.12)',
                        }}
                      >
                        {evt.mult}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.68rem',
                      }}
                    >
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{evt.game}</span>
                      <span
                        style={{
                          color: '#00E701',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          letterSpacing: '0.02em',
                        }}
                      >
                        +${evt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TrendingUp size={12} color="#00E701" />
                <span>Instant Payouts</span>
              </div>
              <span style={{ color: '#D4AF37', fontWeight: 800 }}>100% Provably Fair</span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
        </>
      )}
    </>
  );
}
