'use client';

import React from 'react';
import Image from 'next/image';
import { Trophy, Crown, Flame, Sparkles, Timer, Zap } from 'lucide-react';
import { HALL_OF_FAME_RECORDS } from '@/components/home/bento/Spiral3dSlider';

interface TestingV3FeatureShowcaseProps {
  phaseProgress: number; // 0.0 to 1.0 within the feature showcase phase
  accentColor?: string;
}

const LIVE_PAYOUTS = [
  { user: 'Satoshi_X', game: 'Crash Arena', amount: '$42,500.00', mult: '14.20x', type: 'jackpot' },
  {
    user: 'WhaleWatcher',
    game: 'Cyber Slots',
    amount: '$89,200.00',
    mult: '89.00x',
    type: 'whale',
  },
  {
    user: 'CryptoKing',
    game: 'Neon Blackjack',
    amount: '$12,500.00',
    mult: '3:2 Payout',
    type: 'vip',
  },
  {
    user: 'LuckyStrike',
    game: 'Quantum Roulette',
    amount: '$36,000.00',
    mult: '36.00x',
    type: 'hot',
  },
];

const PODIUM_TOP3 = [
  {
    rank: 2,
    user: 'Victoria_Royale',
    wagered: '94,200 USDT',
    prize: '2,500 USDT',
    accent: '#C0C0C0',
    avatar: '/images/avatars/avatar-obsidian-02.png',
  },
  {
    rank: 1,
    user: 'Alexander_V',
    wagered: '148,500 USDT',
    prize: '5,000 USDT',
    accent: '#D4AF37',
    avatar: '/images/avatars/avatar-obsidian-01.png',
  },
  {
    rank: 3,
    user: 'CyberWhale_88',
    wagered: '54,300 USDT',
    prize: '1,500 USDT',
    accent: '#CD7F32',
    avatar: '/images/avatars/avatar-obsidian-03.png',
  },
];

export function TestingV3FeatureShowcase({
  phaseProgress,
  accentColor = '#D4AF37',
}: TestingV3FeatureShowcaseProps) {
  // Sub-phases:
  // 0.0 - 0.50: Spiral 3D Hall of Fame & Live-Payouts Stream
  // 0.50 - 1.00: Tägliches Turnier & VIP Podium
  const isTournament = phaseProgress >= 0.5;
  const subProg = isTournament ? (phaseProgress - 0.5) / 0.5 : phaseProgress / 0.5;

  if (!isTournament) {
    // Spiral 3D Hall of Fame & Live Payouts
    const activeHofIdx = Math.min(
      HALL_OF_FAME_RECORDS.length - 1,
      Math.floor(subProg * HALL_OF_FAME_RECORDS.length),
    );
    const activeRecord = HALL_OF_FAME_RECORDS[activeHofIdx] || HALL_OF_FAME_RECORDS[0];
    const livePayout = LIVE_PAYOUTS[activeHofIdx % LIVE_PAYOUTS.length];

    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#0B0E14',
          border: '1.5px solid rgba(212, 175, 55, 0.5)',
          boxShadow: '0 30px 60px -10px rgba(0, 0, 0, 0.98), 0 0 45px rgba(212, 175, 55, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.18)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
              }}
            >
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#FFF',
                  letterSpacing: '0.05em',
                }}
              >
                HALL OF FAME
              </div>
              <div
                style={{
                  fontSize: '0.62rem',
                  color: '#FFDF73',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                }}
              >
                SPIRAL 3D STAGE
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.68rem',
              color: '#34D399',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Zap className="h-3 w-3 text-emerald-400" />
            LIVE VERIFIZIERT
          </div>
        </div>

        {/* Central 3D Highroller Card Feature */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '190px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            background:
              'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15) 0%, rgba(11, 14, 20, 0.95) 80%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37 0%, #996515 100%)',
              padding: '2px',
              marginBottom: '8px',
              boxShadow: '0 0 16px rgba(212, 175, 55, 0.5)',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
              }}
            >
              <Image
                src={activeRecord.avatar}
                alt={activeRecord.user}
                fill
                sizes="44px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.95rem',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            {activeRecord.user}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.45rem',
              fontWeight: 1000,
              color: '#FFDF73',
              letterSpacing: '-0.02em',
              textShadow: '0 0 16px rgba(255, 223, 115, 0.6)',
              margin: '4px 0',
            }}
          >
            +${activeRecord.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.7rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <span>{activeRecord.game}</span>
            <span style={{ color: '#D4AF37', fontWeight: 800 }}>({activeRecord.mult})</span>
          </div>
        </div>

        {/* Bottom Live Payout Highlight Stream */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 2,
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame className="h-4 w-4 animate-pulse text-amber-400" />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#FFF', fontWeight: 700 }}>
                  {livePayout.user}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)' }}>
                  {livePayout.game}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: '#10B981',
                }}
              >
                {livePayout.amount}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#FFDF73', fontWeight: 700 }}>
                {livePayout.mult}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.68rem',
              color: 'rgba(255, 255, 255, 0.5)',
              padding: '0 4px',
            }}
          >
            <span>AUSZAHLUNGS-QUOTE: 98.6%</span>
            <span style={{ color: '#FFDF73' }}>INSTANT CR-PAY</span>
          </div>
        </div>
      </div>
    );
  }

  // Tägliches Turnier & VIP Podium
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#0B0E14',
        border: '1.5px solid rgba(212, 175, 55, 0.5)',
        boxShadow: '0 30px 60px -10px rgba(0, 0, 0, 0.98), 0 0 45px rgba(212, 175, 55, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(212, 175, 55, 0.18)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
            }}
          >
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#FFF',
                letterSpacing: '0.05em',
              }}
            >
              TÄGLICHES TURNIER
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                color: '#D4AF37',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
              }}
            >
              10,000 USDT PRIZE POOL
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.68rem',
            color: '#FFDF73',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Timer className="h-3 w-3" />
          04:28:12
        </div>
      </div>

      {/* Central 3-Column VIP Podium Preview */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '8px',
          paddingBottom: '8px',
        }}
      >
        {PODIUM_TOP3.map((slot) => {
          const isFirst = slot.rank === 1;
          const height = isFirst ? '150px' : slot.rank === 2 ? '125px' : '105px';

          return (
            <div
              key={slot.rank}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  width: isFirst ? '36px' : '28px',
                  height: isFirst ? '36px' : '28px',
                  borderRadius: '50%',
                  border: `2px solid ${slot.accent}`,
                  marginBottom: '6px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={slot.avatar}
                  alt={slot.user}
                  fill
                  sizes="36px"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              <div
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#FFF',
                  maxWidth: '75px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '4px',
                }}
              >
                {slot.user.split('_')[0]}
              </div>

              {/* Podium Column Base */}
              <div
                style={{
                  width: '100%',
                  height,
                  borderRadius: '12px 12px 6px 6px',
                  background: isFirst
                    ? 'linear-gradient(to top, rgba(212, 175, 55, 0.45), rgba(212, 175, 55, 0.15))'
                    : 'linear-gradient(to top, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))',
                  border: `1px solid ${slot.accent}66`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 4px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: isFirst ? '1rem' : '0.8rem',
                    fontWeight: 1000,
                    color: slot.accent,
                  }}
                >
                  #{slot.rank}
                </span>

                <span
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: '#FFDF73',
                    textAlign: 'center',
                  }}
                >
                  {slot.prize}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 2,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = '/leaderboard';
          }}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
            border: 'none',
            color: '#0B0E14',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 900,
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
          }}
        >
          <Sparkles className="h-4 w-4" />
          TURNIER BEITRETEN
        </button>
      </div>
    </div>
  );
}
