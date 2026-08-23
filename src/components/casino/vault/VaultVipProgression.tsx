'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Lock } from 'lucide-react';
import type { VipTier } from '@/lib/casino/vip-config';
import { card } from './vault-card';

interface VaultVipProgressionProps {
  isMobile: boolean;
  vipTiers: VipTier[];
  currentTier: VipTier;
  nextTier: VipTier | null;
  tierProgress: number;
  xp: number;
}

export function VaultVipProgression({
  isMobile,
  vipTiers,
  currentTier,
  nextTier,
  tierProgress,
  xp,
}: VaultVipProgressionProps) {
  return (
    <div style={{ ...card({ padding: isMobile ? '24px 16px' : '28px' }) }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crown size={16} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            VIP PROGRESSION
          </span>
        </div>
        {nextTier && (
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
            {(nextTier.minXp - xp).toLocaleString()} XP to {nextTier.name}
          </span>
        )}
      </div>

      {/* Tier Nodes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '0 8px',
          marginBottom: '12px',
        }}
      >
        {vipTiers.map((tier, i) => {
          const isActive = tier.name === currentTier.name;
          const isPast = xp >= tier.minXp;
          return (
            <React.Fragment key={tier.name}>
              {i > 0 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isPast
                      ? `linear-gradient(90deg, ${vipTiers[i - 1].color}80, ${tier.color}80)`
                      : 'rgba(255,255,255,0.04)',
                  }}
                />
              )}
              <div
                style={{
                  width: isActive ? 40 : 28,
                  height: isActive ? 40 : 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isPast ? `${tier.color}18` : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${isPast ? `${tier.color}80` : 'rgba(255,255,255,0.06)'}`,
                  position: 'relative',
                  transition: 'all 0.3s',
                  boxShadow: isActive ? `0 0 20px ${tier.color}25` : 'none',
                }}
              >
                {isPast ? (
                  <Star size={isActive ? 16 : 11} color={tier.color} fill={tier.color} />
                ) : (
                  <Lock size={10} color="rgba(255,255,255,0.15)" />
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: '100%',
                    marginTop: '5px',
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    color: isPast ? `${tier.color}cc` : 'rgba(255,255,255,0.15)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em',
                  }}
                >
                  {tier.name}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {nextTier && (
        <div style={{ marginTop: '28px' }}>
          <div
            style={{
              height: '6px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.04)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(tierProgress, 100)}%` }}
              transition={{ type: 'spring', damping: 18, stiffness: 120 }}
              style={{
                height: '100%',
                borderRadius: '4px',
                background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                boxShadow: `0 0 12px ${currentTier.color}60`,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: `${currentTier.color}aa` }}>
              {currentTier.name} &middot; {(currentTier.rakeback * 100).toFixed(0)}% rakeback
            </span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: `${nextTier.color}aa` }}>
              {nextTier.name} &middot; {(nextTier.rakeback * 100).toFixed(0)}% rakeback
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
