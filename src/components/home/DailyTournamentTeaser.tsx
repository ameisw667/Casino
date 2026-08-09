'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Timer } from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  username: string;
  wagered: number;
  prize: string;
  avatar: string;
}

const TOP_PLAYERS: LeaderboardUser[] = [
  {
    rank: 1,
    username: 'VibeGod_99',
    wagered: 84500,
    prize: '$5,000.00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VibeGod',
  },
  {
    rank: 2,
    username: 'SatoshiN',
    wagered: 62100,
    prize: '$3,000.00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SatoshiN',
  },
  {
    rank: 3,
    username: 'HighRollerX',
    wagered: 41900,
    prize: '$2,000.00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HighRollerX',
  },
];

export const DailyTournamentTeaser: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  return (
    <section style={{ marginBottom: '60px' }}>
      <div
        style={{
          borderRadius: '24px',
          background:
            'linear-gradient(135deg, rgba(20, 20, 28, 0.78) 0%, rgba(10, 10, 14, 0.88) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 12px 32px rgba(0, 0, 0, 0.6)',
          padding: isMobile ? '24px 18px' : '36px 36px',
        }}
      >
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#D4AF37',
                fontSize: '0.75rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                marginBottom: '6px',
              }}
            >
              <Trophy size={14} /> $10,000 DAILY RACE
            </div>
            <h2
              style={{
                fontSize: isMobile ? '1.6rem' : '2.2rem',
                fontWeight: 1000,
                color: '#fff',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              TÄGLICHES TURNIER
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px 16px',
            }}
          >
            <Timer size={18} color="#D4AF37" />
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
              VERBLEIBEND:
            </span>
            <span
              style={{
                fontSize: '0.95rem',
                color: '#fff',
                fontWeight: 1000,
                fontFamily: 'monospace',
              }}
            >
              04h 22m 10s
            </span>
          </div>
        </div>

        {/* Top 3 Player Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {TOP_PLAYERS.map((p) => {
            const isRank1 = p.rank === 1;
            return (
              <motion.div
                key={p.rank}
                whileHover={{ y: -4 }}
                style={{
                  position: 'relative',
                  borderRadius: '16px',
                  background: isRank1
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(20, 20, 25, 0.9) 100%)'
                    : 'rgba(20, 20, 26, 0.6)',
                  border: isRank1
                    ? '1px solid rgba(212, 175, 55, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {/* Rank Badge */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isRank1 ? '#D4AF37' : p.rank === 2 ? '#C0C0C0' : '#CD7F32',
                    color: '#000',
                    fontWeight: 1000,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isRank1 ? '0 0 20px rgba(212,175,55,0.5)' : 'none',
                  }}
                >
                  #{p.rank}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    background: '#000',
                  }}
                >
                  <img src={p.avatar} alt={p.username} style={{ width: '100%', height: '100%' }} />
                </div>

                {/* User Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff' }}>
                    {p.username}
                  </div>
                  <div
                    style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}
                  >
                    Wager: ${p.wagered.toLocaleString()}
                  </div>
                </div>

                {/* Prize */}
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 1000,
                    color: '#00E701',
                    fontFamily: 'monospace',
                  }}
                >
                  {p.prize}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
