'use client';

import React, { useState } from 'react';
import { Trophy, ExternalLink, User, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { Tooltip } from '../ui/Tooltip';

export function LiveActivityFeed() {
  const isMobile = useCasinoStore((state) => state.isMobile);
  const allBets = useCasinoStore((state) => state.allBets);
  const [activeTab, setActiveTab] = useState<'ALL' | 'BIG' | 'MINE'>('ALL');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredBets = allBets.filter((bet) => {
    if (activeTab === 'MINE') return bet.user === 'You' || bet.user === 'You';
    if (activeTab === 'BIG') return bet.multiplier >= 10 || bet.amount >= 50;
    return true;
  });

  return (
    <section style={{ margin: '40px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'BIG', 'MINE'].map((tab) => (
            <motion.button
              key={tab}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab as 'ALL' | 'BIG' | 'MINE')}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {tab === 'ALL' ? 'All Bets' : tab === 'BIG' ? '🔥 High Rollers' : 'My Bets'}
            </motion.button>
          ))}
        </div>

        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#00e701',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00e701' }}
            />
            LIVE ACTIVITY
          </div>
        )}
      </div>

      <div
        className="glass-card"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid hsla(0,0%,100%,0.05)',
        }}
      >
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
                      background:
                        bet.user === 'You' || bet.user === 'You'
                          ? 'hsla(var(--primary), 0.05)'
                          : 'transparent',
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
                        {(bet.user === 'You' || bet.user === 'You') && (
                          <motion.button
                            whileHover={{ scale: 1.1, color: '#fff' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const { addChatMessage } = useCasinoStore.getState();
                              addChatMessage({
                                user: 'You',
                                rank: 'PLAYER',
                                message: `🚀 Just won ${bet.multiplier.toFixed(2)}x ($${bet.payout.toFixed(2)}) on ${bet.game}!`,
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
    </section>
  );
}
