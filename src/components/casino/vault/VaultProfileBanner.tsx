'use client';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import type { VipTier } from '@/lib/casino/vip-config';
import { card } from './vault-card';

interface VaultProfileBannerProps {
  isMobile: boolean;
  displayName: string;
  avatarUrl: string;
  currentTier: VipTier;
  level: number;
  balance: number;
  xp: number;
  levelProgress: number;
}

export function VaultProfileBanner({
  isMobile,
  displayName,
  avatarUrl,
  currentTier,
  level,
  balance,
  xp,
  levelProgress,
}: VaultProfileBannerProps) {
  return (
    <div
      style={{
        ...card({ padding: isMobile ? '24px 20px' : '22px 32px' }),
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '20px' : '28px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '10%',
          width: '220px',
          height: '220px',
          background: `radial-gradient(circle, ${currentTier.color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Avatar + Name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div style={{ width: '52px', height: '52px', position: 'relative', flexShrink: 0 }}>
          <svg
            width="52"
            height="52"
            viewBox="0 0 100 100"
            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={currentTier.color}
              strokeWidth="6"
              strokeDasharray={`${levelProgress * 2.76} 276`}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dasharray 0.8s ease',
                filter: `drop-shadow(0 0 4px ${currentTier.color}50)`,
              }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: '5px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${currentTier.color}40`,
            }}
          >
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              unoptimized
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span
              style={{
                fontSize: '0.55rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: `${currentTier.color}15`,
                color: currentTier.color,
                border: `1px solid ${currentTier.color}30`,
                letterSpacing: '0.08em',
              }}
            >
              {currentTier.name}
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
              LVL {level}
            </span>
          </div>
        </div>
      </div>

      {/* Key Figures */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          flex: isMobile ? undefined : 1,
          justifyContent: isMobile ? undefined : 'center',
          maxWidth: isMobile ? undefined : '420px',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.04)',
            flex: 1,
            minWidth: '140px',
          }}
        >
          <div
            style={{
              fontSize: '0.55rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}
          >
            BALANCE
          </div>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#D4AF37',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div
          style={{
            padding: '14px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.04)',
            flex: 1,
            minWidth: '140px',
          }}
        >
          <div
            style={{
              fontSize: '0.55rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}
          >
            XP
          </div>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {xp.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Verified */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '8px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)',
            fontSize: '0.6rem',
            fontWeight: 800,
            color: '#10b981',
          }}
        >
          <ShieldCheck size={11} /> VERIFIED
        </div>
      </div>
    </div>
  );
}
