'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Trophy, ExternalLink, User, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Tooltip } from '../ui/Tooltip';

interface ThrottledBet {
  id: string;
  game: string;
  user: string;
  amount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
}

export function LiveActivityFeedV2() {
  const allBets = useCasinoStore((state) => state.allBets);
  const [activeTab, setActiveTab] = useState<'ALL' | 'BIG' | 'MINE'>('ALL');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [displayBets, setDisplayBets] = useState<ThrottledBet[]>([]);
  const lastUpdateRef = useRef(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  // Throttled update: refreshes at most once per 60s, except on first
  // population (displayBets.length === 0), which updates immediately.
  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 60000 && displayBets.length > 0) return;
    lastUpdateRef.current = now;
    setDisplayBets(allBets.slice(0, 10) as ThrottledBet[]);
  }, [allBets, displayBets.length]);

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
      style={{ margin: '40px 0' }}
    >
      <div
        className="glass-card"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          background:
            'linear-gradient(180deg, rgba(16, 18, 24, 0.85) 0%, rgba(10, 12, 16, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.05)',
        }}
      >
        {/* Integrated Top Toolbar: Filter Tabs & Live Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.25)',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                    padding: '7px 16px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: active
                      ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                      : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                    border: active ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: active ? '0 4px 14px rgba(212, 175, 55, 0.35)' : 'none',
                  }}
                >
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(0, 231, 1, 0.06)',
              border: '1px solid rgba(0, 231, 1, 0.2)',
              color: '#00e701',
              fontSize: '0.74rem',
              fontWeight: 900,
              letterSpacing: '0.06em',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#00e701',
                boxShadow: '0 0 8px #00e701',
              }}
            />
            LIVE FEED
          </div>
        </div>
        <table
          className="smart-table"
          style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}
        >
          <thead>
            <tr
              style={{
                background: 'rgba(0,0,0,0.2)',
                color: '#b1bad3',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
              }}
            >
              <th style={{ padding: '16px' }}>Game</th>
              <th style={{ padding: '16px' }}>Player</th>
              <th style={{ padding: '16px' }}>
                <Tooltip content="Total amount wagered">Wager</Tooltip>
              </th>
              <th style={{ padding: '16px' }}>
                <Tooltip content="Return multiplier">Multiplier</Tooltip>
              </th>
              <th style={{ padding: '16px' }}>
                <Tooltip content="Total amount returned">Payout</Tooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredBets.length > 0 ? (
                filteredBets.map((bet) => (
                  <motion.tr
                    key={bet.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    style={{
                      borderBottom: '1px solid hsla(0,0%,100%,0.02)',
                      background: bet.user === 'You' ? 'hsla(var(--primary), 0.05)' : 'transparent',
                    }}
                  >
                    <td data-label="Game" style={{ padding: '16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: 'hsl(var(--primary))',
                        }}
                      >
                        <Gamepad2 size={14} />
                        {bet.game}
                      </div>
                    </td>
                    <td data-label="Player" style={{ padding: '16px' }}>
                      <div
                        onClick={() => setSelectedUser(bet.user)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <User size={14} style={{ color: '#b1bad3' }} />
                        {bet.user}
                      </div>
                    </td>
                    <td
                      data-label="Wager"
                      style={{
                        padding: '16px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      ${bet.amount.toFixed(2)}
                    </td>
                    <td
                      data-label="Multiplier"
                      style={{
                        padding: '16px',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: bet.isWin ? '#00e701' : '#b1bad3',
                      }}
                    >
                      {bet.multiplier > 0 ? `${bet.multiplier.toFixed(2)}x` : '-'}
                    </td>
                    <td data-label="Payout" style={{ padding: '16px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 900,
                          color: bet.isWin ? '#00e701' : '#b1bad3',
                        }}
                      >
                        ${bet.payout.toFixed(2)}
                        {bet.isWin && bet.multiplier >= 10 && <Trophy size={14} />}
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
                              color: 'hsla(var(--primary), 0.5)',
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
                      color: '#b1bad3',
                      fontSize: '0.9rem',
                    }}
                  >
                    No recent activity to show
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <PlayerProfileModal
        user={selectedUser || ''}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </motion.section>
  );
}
