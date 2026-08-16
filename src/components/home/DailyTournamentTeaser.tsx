'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Timer, Crown, Flame, Sparkles, Zap } from 'lucide-react';

interface LeaderboardUser {
  rank: number;
  username: string;
  wagered: number;
  prize: string;
  avatar: string;
  accent: string;
  badge: string;
}

const TOP_PLAYERS: LeaderboardUser[] = [
  {
    rank: 2,
    username: 'SatoshiN',
    wagered: 62100,
    prize: '$3,000.00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SatoshiN',
    accent: '#C0C0C0',
    badge: 'SILBER',
  },
  {
    rank: 1,
    username: 'VibeGod_99',
    wagered: 84500,
    prize: '$5,000.00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VibeGod',
    accent: '#D4AF37',
    badge: 'CHAMPION',
  },
  {
    rank: 3,
    username: 'HighRollerX',
    wagered: 41900,
    prize: '$2,000.00',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HighRollerX',
    accent: '#CD7F32',
    badge: 'BRONZE',
  },
];

export const DailyTournamentTeaser: React.FC<{ isMobile?: boolean }> = ({ isMobile = false }) => {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto 64px',
        padding: '0 8px',
      }}
    >
      {/* Floating Section Header (No Outer Box) */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'flex-end',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#D4AF37',
              fontSize: '0.72rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            <Trophy size={13} />
            <span>$10,000 DAILY RACE</span>
          </div>
          <h2
            style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: 1000,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.03em',
            }}
          >
            TÄGLICHES TURNIER
          </h2>
        </div>

        {/* Live Countdown Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '20px',
            padding: '6px 14px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Timer size={15} color="#D4AF37" />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
            VERBLEIBEND:
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: '#D4AF37',
              fontWeight: 1000,
              fontFamily: 'monospace',
            }}
          >
            04h 22m 10s
          </span>
        </div>
      </div>

      {/* Dynamic 3D Podium Stage (Frameless) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1.15fr 1fr',
          alignItems: 'flex-end',
          gap: isMobile ? '16px' : '20px',
        }}
      >
        {TOP_PLAYERS.map((p) => {
          const isRank1 = p.rank === 1;
          return (
            <motion.div
              key={p.rank}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: p.rank * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                position: 'relative',
                borderRadius: '20px',
                background: isRank1
                  ? 'linear-gradient(160deg, rgba(32, 26, 14, 0.85) 0%, rgba(14, 14, 20, 0.9) 100%)'
                  : 'linear-gradient(160deg, rgba(22, 22, 30, 0.7) 0%, rgba(12, 12, 18, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: isRank1
                  ? '1px solid rgba(212, 175, 55, 0.45)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                padding: isRank1 ? '24px 20px' : '20px 16px',
                boxShadow: isRank1
                  ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.2)'
                  : '0 12px 30px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                zIndex: isRank1 ? 3 : 2,
              }}
            >
              {/* Crown for #1 */}
              {isRank1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 1000,
                    letterSpacing: '0.08em',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)',
                  }}
                >
                  <Crown size={12} fill="#000" />
                  <span>PLATZ 1</span>
                </div>
              )}

              {/* Rank Badge Indicator */}
              {!isRank1 && (
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: p.accent,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                  }}
                >
                  #{p.rank} {p.badge}
                </div>
              )}

              {/* Avatar with Halo Ring */}
              <div
                style={{
                  position: 'relative',
                  width: isRank1 ? '68px' : '56px',
                  height: isRank1 ? '68px' : '56px',
                  borderRadius: '50%',
                  padding: '3px',
                  background: `linear-gradient(135deg, ${p.accent} 0%, transparent 100%)`,
                  marginBottom: '10px',
                  marginTop: isRank1 ? '6px' : '0',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#0a0a0f',
                  }}
                >
                  <img src={p.avatar} alt={p.username} style={{ width: '100%', height: '100%' }} />
                </div>
              </div>

              {/* User Name */}
              <div
                style={{
                  fontSize: isRank1 ? '1.1rem' : '0.98rem',
                  fontWeight: 1000,
                  color: '#ffffff',
                  marginBottom: '2px',
                }}
              >
                {p.username}
              </div>

              {/* Wager Stat */}
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255, 255, 255, 0.55)',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  marginBottom: '14px',
                }}
              >
                Wager: ${p.wagered.toLocaleString('en-US')}
              </div>

              {/* Prize Ribbon */}
              <div
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isRank1 ? 'rgba(0, 231, 1, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: isRank1
                    ? '1px solid rgba(0, 231, 1, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={13} color="#00E701" />
                <span
                  style={{
                    fontSize: isRank1 ? '1.05rem' : '0.92rem',
                    fontWeight: 1000,
                    color: '#00E701',
                    fontFamily: 'monospace',
                  }}
                >
                  {p.prize}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
