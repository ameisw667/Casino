'use client';

import React, { useState, useRef, useMemo } from 'react';
import { ExternalLink, User, Gamepad2, Trophy, Flame } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Tooltip } from '../ui/Tooltip';
import { bentoTypography } from '@/components/home/bento/bento-lobby-tokens';

interface ThrottledBet {
  id: string;
  game: string;
  user: string;
  amount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
}

const CURATED_LIVE_BETS: ThrottledBet[] = [
  { id: 'lb-1', user: 'Satoshi_X', game: 'Crash Rocket', amount: 300, multiplier: 14.2, payout: 4260, isWin: true },
  { id: 'lb-2', user: 'Alexander_V', game: 'Neon Slots', amount: 100, multiplier: 89.0, payout: 8900, isWin: true },
  { id: 'lb-3', user: 'Victoria_Royale', game: 'VIP Blackjack', amount: 5000, multiplier: 2.0, payout: 10000, isWin: true },
  { id: 'lb-4', user: 'CryptoKing', game: 'Royale Roulette', amount: 500, multiplier: 36.0, payout: 18000, isWin: true },
  { id: 'lb-5', user: 'LuckyStrike', game: 'Ultimate Dice', amount: 150, multiplier: 34.0, payout: 5100, isWin: true },
  { id: 'lb-6', user: 'CyberWhale_88', game: 'Crash Rocket', amount: 250, multiplier: 1.85, payout: 462.5, isWin: true },
  { id: 'lb-7', user: 'Maximilian_VIP', game: 'Neon Slots', amount: 75, multiplier: 0, payout: 0, isWin: false },
  { id: 'lb-8', user: 'AuraMaster', game: 'Ultimate Dice', amount: 400, multiplier: 2.0, payout: 800, isWin: true },
];

export function LiveActivityFeedV2({ isMobile = false }: { isMobile?: boolean }) {
  const allBets = useCasinoStore((state) => state.allBets);
  const [activeTab, setActiveTab] = useState<'ALL' | 'BIG' | 'MINE'>('ALL');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  // Derives display bets: merges live store bets with curated baseline
  const displayBets = useMemo(() => {
    if (allBets.length > 0) {
      return [
        ...(allBets as ThrottledBet[]),
        ...CURATED_LIVE_BETS.filter((cb) => !allBets.some((ab) => ab.id === cb.id)),
      ].slice(0, 12);
    }
    return CURATED_LIVE_BETS;
  }, [allBets]);

  const filteredBets = displayBets.filter((bet) => {
    if (activeTab === 'MINE') return bet.user === 'You';
    if (activeTab === 'BIG') return bet.multiplier >= 10 || bet.amount >= 50;
    return true;
  });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      style={{ margin: isMobile ? '20px 0 0' : '40px 0', width: '100%' }}
    >
      <div
        className="glass-card"
        style={{
          borderRadius: isMobile ? '18px' : '24px',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          background:
            'linear-gradient(180deg, rgba(16, 18, 26, 0.9) 0%, rgba(10, 12, 18, 0.98) 100%)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(212, 175, 55, 0.15)',
          width: '100%',
        }}
      >
        {/* Componentry Magnetic Dock Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '12px 14px' : '16px 24px',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            background: 'rgba(0, 0, 0, 0.35)',
            gap: isMobile ? '10px' : '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Dock-style Filter Tabs */}
          <div
            style={{
              display: 'inline-flex',
              gap: '6px',
              padding: '4px',
              borderRadius: '14px',
              background: 'rgba(11, 14, 20, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'space-between' : 'flex-start',
            }}
          >
            {[
              { key: 'ALL', label: 'All Bets' },
              { key: 'BIG', label: 'High Rollers' },
              { key: 'MINE', label: 'My Bets' },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(tab.key as 'ALL' | 'BIG' | 'MINE')}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    textAlign: 'center',
                    padding: isMobile ? '8px 6px' : '7px 18px',
                    borderRadius: '10px',
                    fontSize: isMobile ? '0.74rem' : '0.82rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    background: active
                      ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                      : 'transparent',
                    color: active ? '#0B0E14' : 'rgba(255, 255, 255, 0.7)',
                    border: active ? '1px solid #FFE066' : '1px solid transparent',
                    boxShadow: active ? '0 4px 16px rgba(212, 175, 55, 0.4)' : 'none',
                  }}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          {/* Live Sync Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              color: '#10B981',
              fontSize: isMobile ? '0.66rem' : '0.74rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              margin: isMobile ? '0 auto' : '0',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 10px #10B981',
              }}
            />
            LIVE CASINO FEED
          </div>
        </div>

        {/* Desktop Table */}
        <table
          className="live-activity-desktop-table desktop-only"
          style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
        >
          <thead>
            <tr
              style={{
                background: 'rgba(0,0,0,0.45)',
                color: 'rgba(255, 255, 255, 0.55)',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(212, 175, 55, 0.12)',
              }}
            >
              <th style={{ padding: '14px 20px' }}>Spiel</th>
              <th style={{ padding: '14px 20px' }}>Spieler</th>
              <th style={{ padding: '14px 20px' }}>
                <Tooltip content="Wetteinsatz der Spielrunde">Einsatz</Tooltip>
              </th>
              <th style={{ padding: '14px 20px' }}>
                <Tooltip content="Multiplikator des Rundenausgangs">Multiplikator</Tooltip>
              </th>
              <th style={{ padding: '14px 20px' }}>
                <Tooltip content="Gesamtauszahlung der Runde">Auszahlung</Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredBets.length > 0 ? (
                filteredBets.map((bet) => (
                  <motion.tr
                    key={bet.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: bet.user === 'You' ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                      transition: 'background 0.2s ease',
                    }}
                    whileHover={{
                      backgroundColor: 'rgba(212, 175, 55, 0.04)',
                    }}
                  >
                    {/* Game */}
                    <td data-label="Game" style={{ padding: '14px 20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          color: '#F9FAFB',
                        }}
                      >
                        <Gamepad2 size={15} color="#D4AF37" />
                        {bet.game}
                      </div>
                    </td>

                    {/* Player */}
                    <td data-label="Player" style={{ padding: '14px 20px' }}>
                      <div
                        onClick={() => setSelectedUser(bet.user)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          color: '#E5E7EB',
                          cursor: 'pointer',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <User size={13} style={{ color: '#D4AF37' }} />
                        <span>{bet.user}</span>
                      </div>
                    </td>

                    {/* Wager */}
                    <td
                      data-label="Wager"
                      style={{
                        padding: '14px 20px',
                        ...bentoTypography.dynamicNumber,
                        fontSize: '0.86rem',
                        fontWeight: 900,
                        color: '#FFFFFF',
                      }}
                    >
                      ${bet.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Multiplier with Componentry Pill */}
                    <td data-label="Multiplier" style={{ padding: '14px 20px' }}>
                      {bet.isWin ? (
                        <span
                          style={{
                            ...bentoTypography.dynamicNumber,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            background: bet.multiplier >= 10 ? 'rgba(212, 175, 55, 0.16)' : 'rgba(16, 185, 129, 0.12)',
                            border: bet.multiplier >= 10 ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(16, 185, 129, 0.35)',
                            color: bet.multiplier >= 10 ? '#FFD700' : '#10B981',
                            fontSize: '0.78rem',
                            fontWeight: 900,
                          }}
                        >
                          {bet.multiplier >= 10 && <Flame size={12} color="#FFD700" />}
                          {bet.multiplier.toFixed(2)}x
                        </span>
                      ) : (
                        <span
                          style={{
                            ...bentoTypography.dynamicNumber,
                            display: 'inline-flex',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                          }}
                        >
                          0.00x
                        </span>
                      )}
                    </td>

                    {/* Payout */}
                    <td data-label="Payout" style={{ padding: '14px 20px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          ...bentoTypography.dynamicNumber,
                          fontSize: '0.9rem',
                          fontWeight: 1000,
                          color: bet.isWin ? '#10B981' : 'rgba(255, 255, 255, 0.4)',
                          textShadow: bet.isWin && bet.multiplier >= 10 ? '0 0 12px rgba(212, 175, 55, 0.4)' : 'none',
                        }}
                      >
                        {bet.isWin ? `+$${bet.payout.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
                        {bet.isWin && bet.multiplier >= 10 && (
                          <Trophy size={14} color="#D4AF37" />
                        )}
                        {bet.user === 'You' && (
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const { addChatMessage } = useCasinoStore.getState();
                              addChatMessage({
                                user: 'You',
                                rank: 'PLAYER',
                                message: `Just won ${bet.multiplier.toFixed(2)}x ($${bet.payout.toFixed(2)}) on ${bet.game}!`,
                                isWin: true,
                              });
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#D4AF37',
                              cursor: 'pointer',
                              marginLeft: 'auto',
                            }}
                          >
                            <ExternalLink size={14} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <td
                    colSpan={5}
                    style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#9CA3AF',
                      fontSize: '0.9rem',
                    }}
                  >
                    Keine aktuellen Live-Wetten vorhanden
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Mobile Stream: High-Density 2-Sided Bet Rows (<=768px) */}
        <div className="live-activity-mobile-list mobile-only" style={{ width: '100%' }}>
          <AnimatePresence>
            {filteredBets.length > 0 ? (
              filteredBets.map((bet) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: bet.user === 'You' ? 'hsla(var(--primary), 0.06)' : 'transparent',
                    gap: '12px',
                  }}
                >
                  {/* Left: Game & Player */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 900,
                        color: 'hsl(var(--primary))',
                        fontSize: '0.78rem',
                      }}
                    >
                      <Gamepad2 size={13} style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {bet.game}
                      </span>
                    </div>
                    <div
                      onClick={() => setSelectedUser(bet.user)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#8892b0',
                        fontSize: '0.66rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <User size={10} style={{ flexShrink: 0 }} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {bet.user}
                      </span>
                    </div>
                  </div>

                  {/* Right: Payout + Wager & Multiplier */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 900,
                        color: bet.isWin ? '#00e701' : '#8892b0',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>${bet.payout.toFixed(2)}</span>
                      {bet.isWin && bet.multiplier >= 10 && <Image src="/images/2026-09-06_icon-trophy-win-quantum-gold_v001.png" alt="Hoher Gewinn" width={12} height={12} aria-hidden />}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.66rem',
                        color: 'rgba(255, 255, 255, 0.55)',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    >
                      <span>${bet.amount.toFixed(2)}</span>
                      <span
                        style={{
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: bet.isWin
                            ? 'rgba(0, 231, 1, 0.12)'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: bet.isWin
                            ? '1px solid rgba(0, 231, 1, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          color: bet.isWin ? '#00e701' : '#8892b0',
                          fontWeight: 900,
                          fontSize: '0.62rem',
                        }}
                      >
                        {bet.multiplier > 0 ? `${bet.multiplier.toFixed(2)}x` : '-'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div
                style={{
                  padding: isMobile ? '36px 16px' : '48px 24px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: isMobile ? '0.78rem' : '0.86rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                Keine aktuellen Live-Wetten vorhanden
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PlayerProfileModal
        user={selectedUser || ''}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </motion.section>
  );
}
