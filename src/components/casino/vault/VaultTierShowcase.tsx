'use client';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Lock, Crown } from 'lucide-react';
import type { VipTier } from '@/lib/casino/vip-config';

interface VaultTierShowcaseProps {
  isMobile: boolean;
  vipTiers: VipTier[];
  currentTier: VipTier;
  xp: number;
  selectedTierName: string | null;
  onSelectTier: (name: string) => void;
}

export function VaultTierShowcase({
  isMobile,
  vipTiers,
  currentTier,
  xp,
  selectedTierName,
  onSelectTier,
}: VaultTierShowcaseProps) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Star size={16} color="#D4AF37" fill="#D4AF37" />
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.02em',
          }}
        >
          VIP TIERS & BENEFITS
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
          gap: isMobile ? '10px' : '12px',
        }}
      >
        {vipTiers.map((tier) => {
          const isCurrent = tier.name === currentTier.name;
          const isUnlocked = xp >= tier.minXp;

          let metallicBg =
            'linear-gradient(145deg, rgba(24, 24, 32, 0.7) 0%, rgba(12, 12, 18, 0.88) 100%)';
          let metallicBorder = '1px solid rgba(255, 255, 255, 0.06)';
          let glowShadow = 'none';

          if (tier.name === 'BRONZE') {
            metallicBg =
              'radial-gradient(circle at 100% 0%, rgba(205, 127, 50, 0.22) 0%, transparent 60%), linear-gradient(145deg, rgba(38, 26, 18, 0.8) 0%, rgba(18, 14, 12, 0.9) 100%)';
            metallicBorder = `1px solid ${isCurrent ? '#cd7f32' : 'rgba(205, 127, 50, 0.35)'}`;
            glowShadow = isCurrent ? '0 0 20px rgba(205, 127, 50, 0.25)' : 'none';
          } else if (tier.name === 'SILVER') {
            metallicBg =
              'radial-gradient(circle at 100% 0%, rgba(226, 232, 240, 0.22) 0%, transparent 60%), linear-gradient(145deg, rgba(35, 38, 45, 0.8) 0%, rgba(16, 18, 22, 0.9) 100%)';
            metallicBorder = `1px solid ${isCurrent ? '#e2e8f0' : 'rgba(226, 232, 240, 0.35)'}`;
            glowShadow = isCurrent ? '0 0 20px rgba(226, 232, 240, 0.25)' : 'none';
          } else if (tier.name === 'GOLD') {
            metallicBg =
              'radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.28) 0%, transparent 60%), linear-gradient(145deg, rgba(45, 36, 14, 0.85) 0%, rgba(20, 16, 8, 0.92) 100%)';
            metallicBorder = `1px solid ${isCurrent ? '#D4AF37' : 'rgba(212, 175, 55, 0.45)'}`;
            glowShadow = isCurrent ? '0 0 24px rgba(212, 175, 55, 0.35)' : 'none';
          } else if (tier.name === 'PLATINUM') {
            metallicBg =
              'radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(145deg, rgba(20, 36, 48, 0.8) 0%, rgba(12, 18, 26, 0.9) 100%)';
            metallicBorder = `1px solid ${isCurrent ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)'}`;
            glowShadow = isCurrent ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none';
          } else if (tier.name === 'DIAMOND') {
            metallicBg =
              'radial-gradient(circle at 100% 0%, rgba(185, 242, 255, 0.28) 0%, transparent 60%), linear-gradient(145deg, rgba(25, 42, 58, 0.85) 0%, rgba(12, 20, 32, 0.92) 100%)';
            metallicBorder = `1px solid ${isCurrent ? '#b9f2ff' : 'rgba(185, 242, 255, 0.45)'}`;
            glowShadow = isCurrent ? '0 0 24px rgba(185, 242, 255, 0.35)' : 'none';
          }

          const isSelected = (selectedTierName ?? currentTier.name) === tier.name;

          return (
            <motion.div
              key={tier.name}
              onClick={() => onSelectTier(tier.name)}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                padding: isMobile ? '16px 14px' : '18px 16px',
                borderRadius: '16px',
                background: metallicBg,
                border: isSelected ? `2px solid ${tier.color}` : metallicBorder,
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isSelected
                  ? `0 0 24px ${tier.color}40, 0 8px 24px rgba(0, 0, 0, 0.4)`
                  : glowShadow !== 'none'
                    ? glowShadow
                    : '0 8px 24px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '135px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      color: tier.color,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tier.name}
                  </span>
                  {isCurrent ? (
                    <span
                      style={{
                        fontSize: '0.52rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: `${tier.color}25`,
                        color: tier.color,
                        border: `1px solid ${tier.color}50`,
                        textTransform: 'uppercase',
                      }}
                    >
                      AKTIV
                    </span>
                  ) : isUnlocked ? (
                    <CheckCircle2 size={13} color={tier.color} />
                  ) : (
                    <Lock size={12} color="rgba(255, 255, 255, 0.3)" />
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.62rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontWeight: 600,
                  }}
                >
                  ab {tier.minXp.toLocaleString()} XP
                </div>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.35)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Rakeback
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      color: '#D4AF37',
                    }}
                  >
                    {(tier.rakeback * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Tier Benefits Detail HUD */}
      {(() => {
        const inspectedTier =
          vipTiers.find((t) => t.name === (selectedTierName ?? currentTier.name)) ?? currentTier;
        const isUnlocked = xp >= inspectedTier.minXp;
        return (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '12px',
              padding: '16px 20px',
              borderRadius: '14px',
              background:
                'linear-gradient(145deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
              border: `1px solid ${inspectedTier.color}35`,
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px ${inspectedTier.color}15`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${inspectedTier.color}15`,
                  border: `1px solid ${inspectedTier.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: inspectedTier.color,
                }}
              >
                <Crown size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff' }}>
                  {inspectedTier.name} VIP VORTEILE
                </div>
                <div
                  style={{
                    fontSize: '0.66rem',
                    color: 'rgba(255, 255, 255, 0.45)',
                    fontWeight: 600,
                  }}
                >
                  {isUnlocked
                    ? 'Bereits für dein Konto freigeschaltet'
                    : `Benötigt noch ${(inspectedTier.minXp - xp).toLocaleString()} XP`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.35)',
                    textTransform: 'uppercase',
                  }}
                >
                  RAKEBACK
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.95rem',
                    fontWeight: 900,
                    color: '#D4AF37',
                  }}
                >
                  {(inspectedTier.rakeback * 100).toFixed(0)}%
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.35)',
                    textTransform: 'uppercase',
                  }}
                >
                  SUPPORT
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                  {inspectedTier.name === 'DIAMOND' || inspectedTier.name === 'PLATINUM'
                    ? 'VIP Manager'
                    : 'Priorität'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.35)',
                    textTransform: 'uppercase',
                  }}
                >
                  STATUS
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: isUnlocked ? '#10b981' : 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {isUnlocked ? 'FREIGESCHALTET' : 'GESPERRT'}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
