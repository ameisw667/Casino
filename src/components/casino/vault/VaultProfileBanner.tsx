'use client';
import Image from 'next/image';
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
        ...card({ padding: isMobile ? '20px 16px' : '22px 32px' }),
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: isMobile ? '16px' : '24px',
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

      {/* Avatar + Name + Identity Badges */}
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
              fontSize: isMobile ? '1rem' : '1.15rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '0.58rem',
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
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>
              LVL {level}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.58rem',
                fontWeight: 900,
                color: '#10b981',
                letterSpacing: '0.06em',
              }}
            >
              <Image
                src="/images/2026-09-06_icon-security-verified-quantum-gold_v001.png"
                alt="Certified"
                width={11}
                height={11}
                style={{ objectFit: 'contain' }}
              />
              CERTIFIED
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
            $
            {`${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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

      {/* Verified Status Pill (Desktop/Tablet right-aligned) */}
      <div
        style={{
          display: isMobile ? 'none' : 'flex',
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
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            fontSize: '0.62rem',
            fontWeight: 800,
            color: '#10b981',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          <Image
            src="/images/2026-09-06_icon-security-verified-quantum-gold_v001.png"
            alt="Certified"
            width={12}
            height={12}
            style={{ objectFit: 'contain' }}
          />
          VERIFIED
        </div>
      </div>
    </div>
  );
}
