'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle2, Lock, Sparkles, ChevronRight, Award } from 'lucide-react';
import { soundManager } from '@/lib/casino/sound-manager';
import type { VipTier } from '@/lib/casino/vip-config';

interface VipBookshelfShowcaseProps {
  isMobile: boolean;
  vipTiers: VipTier[];
  currentTier: VipTier;
  xp: number;
  selectedTierName: string | null;
  onSelectTier: (name: string) => void;
}

const TIER_BOOKS: Record<
  string,
  {
    subtitle: string;
    coverGradient: string;
    spineColor: string;
    goldEmboss: string;
    perks: string[];
    quote: string;
  }
> = {
  BRONZE: {
    subtitle: 'THE INITIATE TOME',
    coverGradient: 'linear-gradient(135deg, #3d2414 0%, #1a100a 100%)',
    spineColor: '#cd7f32',
    goldEmboss: '#e69a4e',
    perks: ['1% Täglicher Rakeback', 'Standard Support', 'Wöchentliche Bonus-Drops'],
    quote: 'Der Beginn deiner Reise in den exklusiven Royale Club.',
  },
  SILVER: {
    subtitle: 'THE NOBLE GRIMOIRE',
    coverGradient: 'linear-gradient(135deg, #2b303c 0%, #12151b 100%)',
    spineColor: '#c0c0c0',
    goldEmboss: '#e2e8f0',
    perks: ['2% Täglicher Rakeback', 'Prioritäts-Auszahlungen', 'Silber Club Turniere'],
    quote: 'Solide Ausdauer verdient beschleunigte Privilegien.',
  },
  GOLD: {
    subtitle: 'THE SOVEREIGN CODEX',
    coverGradient: 'linear-gradient(135deg, #42320b 0%, #1c1505 100%)',
    spineColor: '#D4AF37',
    goldEmboss: '#FFD700',
    perks: ['3% Täglicher Rakeback', '24/7 VIP Concierge Desk', 'Monatliche Luxus-Präsente'],
    quote: 'Reines Gold ziert den Pfad wahrer High-Roller.',
  },
  PLATINUM: {
    subtitle: 'THE IMPERIAL ARCHIVE',
    coverGradient: 'linear-gradient(135deg, #102e40 0%, #06131c 100%)',
    spineColor: '#38bdf8',
    goldEmboss: '#7dd3fc',
    perks: ['5% Sofortiger Rakeback', 'Persönlicher VIP Account Manager', 'Maßgeschneiderte Limits'],
    quote: 'Exzellenz ohne Kompromisse in der Elite-Klasse.',
  },
  DIAMOND: {
    subtitle: 'THE OBSIDIAN OMNIBUS',
    coverGradient: 'linear-gradient(135deg, #182838 0%, #080f16 100%)',
    spineColor: '#b9f2ff',
    goldEmboss: '#e0f7ff',
    perks: ['10% Maximaler Rakeback', 'Direkter Vorstandskontakt & Reisen', 'Maßgeschneiderte Private Tables'],
    quote: 'Die ultimative Stufe der Casino Royale Aristokratie.',
  },
};

export function VipBookshelfShowcase({
  isMobile,
  vipTiers,
  currentTier,
  xp,
  selectedTierName,
  onSelectTier,
}: VipBookshelfShowcaseProps) {
  const activeTierName = selectedTierName ?? currentTier.name;
  const activeTier = vipTiers.find((t) => t.name === activeTierName) ?? currentTier;
  const activeBookMeta = TIER_BOOKS[activeTier.name] ?? TIER_BOOKS.GOLD;
  const isUnlocked = xp >= activeTier.minXp;

  return (
    <div
      style={{
        marginBottom: '20px',
        borderRadius: '20px',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.08) 0%, rgba(11, 14, 20, 0.95) 80%)',
        border: '1px solid rgba(212, 175, 55, 0.22)',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.3)',
        padding: isMobile ? '16px 14px' : '22px 24px',
        overflow: 'hidden',
      }}
      aria-label="VIP Bookshelf Magazine Showcase"
    >
      {/* Shelf Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={16} color="#D4AF37" />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 900,
                color: '#D4AF37',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              ROYAL CLUB ARCHIVE
            </div>
            <div
              style={{
                fontSize: isMobile ? '0.95rem' : '1.15rem',
                fontWeight: 1000,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}
            >
              VIP Tier Bookshelf & Benefits Magazine
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            color: '#D4AF37',
            fontSize: '0.62rem',
            fontWeight: 800,
          }}
        >
          <Sparkles size={12} />
          <span>DEIN RANG: {currentTier.name}</span>
        </div>
      </div>

      {/* ──── The 3D Bookshelf Row ──── */}
      <div
        style={{
          position: 'relative',
          padding: '24px 10px 18px',
          perspective: '1200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: isMobile ? '8px' : '18px',
          overflowX: isMobile ? 'auto' : 'visible',
        }}
      >
        {vipTiers.map((tier, idx) => {
          const isSelected = tier.name === activeTierName;
          const isCurrent = tier.name === currentTier.name;
          const unlocked = xp >= tier.minXp;
          const bookMeta = TIER_BOOKS[tier.name] ?? TIER_BOOKS.GOLD;

          return (
            <motion.div
              key={tier.name}
              onClick={() => {
                soundManager.playClick();
                onSelectTier(tier.name);
              }}
              whileHover={
                isMobile
                  ? undefined
                  : {
                      y: -16,
                      rotateX: 6,
                      rotateY: -4,
                      scale: 1.05,
                    }
              }
              animate={{
                y: isSelected ? -12 : 0,
                rotateX: isSelected ? 4 : 0,
                scale: isSelected ? 1.04 : 0.96,
                zIndex: isSelected ? 10 : 2,
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              style={{
                position: 'relative',
                width: isMobile ? '90px' : '140px',
                height: isMobile ? '160px' : '220px',
                borderRadius: '6px 12px 12px 6px',
                background: bookMeta.coverGradient,
                border: isSelected ? `2px solid ${bookMeta.goldEmboss}` : '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isSelected
                  ? `0 20px 36px rgba(0, 0, 0, 0.8), 0 0 26px ${bookMeta.spineColor}55, -6px 0 12px rgba(0, 0, 0, 0.6)`
                  : '0 12px 24px rgba(0, 0, 0, 0.5), -4px 0 8px rgba(0, 0, 0, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: isMobile ? '10px 8px' : '16px 12px',
                transformStyle: 'preserve-3d',
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            >
              {/* Embossed Left Spine Stitch */}
              <div
                style={{
                  position: 'absolute',
                  left: '6px',
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: `linear-gradient(to bottom, transparent, ${bookMeta.goldEmboss}, transparent)`,
                  opacity: 0.5,
                }}
              />

              {/* Book Header / Volume */}
              <div>
                <div
                  style={{
                    fontSize: isMobile ? '0.45rem' : '0.55rem',
                    fontWeight: 900,
                    color: bookMeta.goldEmboss,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  VOL. 0{idx + 1}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '0.72rem' : '0.95rem',
                    fontWeight: 1000,
                    color: '#FFFFFF',
                    letterSpacing: '0.02em',
                    marginTop: '2px',
                  }}
                >
                  {tier.name}
                </div>
              </div>

              {/* Center Emblem Foil */}
              <div
                style={{
                  alignSelf: 'center',
                  width: isMobile ? '36px' : '52px',
                  height: isMobile ? '36px' : '52px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: `1.5px solid ${bookMeta.goldEmboss}`,
                  boxShadow: `inset 0 0 10px ${bookMeta.spineColor}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={isMobile ? 18 : 26} color={bookMeta.goldEmboss} />
              </div>

              {/* Bottom Spine Tag */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: isMobile ? '0.62rem' : '0.78rem',
                    fontWeight: 900,
                    color: '#D4AF37',
                    textAlign: 'center',
                  }}
                >
                  {(tier.rakeback * 100).toFixed(0)}% BACK
                </div>
                <div
                  style={{
                    fontSize: isMobile ? '0.48rem' : '0.56rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textAlign: 'center',
                    marginTop: '2px',
                  }}
                >
                  {isCurrent ? '★ AKTIV' : unlocked ? '✓ OFFEN' : '🔒 GESPERRT'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Wooden / Obsidian Shelf Beam */}
      <div
        style={{
          width: '100%',
          height: '14px',
          borderRadius: '4px',
          background: 'linear-gradient(180deg, #2a2216 0%, #120e0a 70%, #050403 100%)',
          borderTop: '2px solid #D4AF37',
          boxShadow: '0 8px 18px rgba(0, 0, 0, 0.8)',
          marginBottom: '20px',
        }}
      />

      {/* ──── Opened Magazine / Codex Sheet for Inspected Tier ──── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTier.name}
          initial={{ opacity: 0, y: 12, rotateX: -4 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(155deg, rgba(24, 26, 36, 0.95) 0%, rgba(12, 14, 20, 0.98) 100%)',
            border: `1.5px solid ${activeBookMeta.goldEmboss}55`,
            boxShadow: `0 14px 32px rgba(0, 0, 0, 0.6), 0 0 24px ${activeBookMeta.spineColor}20`,
            padding: isMobile ? '16px 14px' : '22px 26px',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Left Leaf: Title, Quote & XP Milestone */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  color: activeBookMeta.goldEmboss,
                  letterSpacing: '0.12em',
                }}
              >
                {activeBookMeta.subtitle}
              </span>
              {isUnlocked ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  <CheckCircle2 size={11} /> FREIGESCHALTET
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  <Lock size={11} /> NOCH {(activeTier.minXp - xp).toLocaleString()} XP
                </span>
              )}
            </div>

            <h3
              style={{
                fontSize: isMobile ? '1.25rem' : '1.6rem',
                fontWeight: 1000,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: '0 0 8px 0',
              }}
            >
              {activeTier.name} CLUB PRIVILEGES
            </h3>

            <p
              style={{
                fontSize: '0.78rem',
                lineHeight: 1.5,
                color: 'rgba(255, 255, 255, 0.65)',
                margin: '0 0 14px 0',
                fontStyle: 'italic',
              }}
            >
              &ldquo;{activeBookMeta.quote}&rdquo;
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
                  QUALIFIKATIONS-GRENZE
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.95rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {activeTier.minXp.toLocaleString()} XP
                </div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase' }}>
                  RAKEBACK VORTEIL
                </div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.95rem', fontWeight: 900, color: '#D4AF37' }}>
                  {(activeTier.rakeback * 100).toFixed(0)}% Cash Return
                </div>
              </div>
            </div>
          </div>

          {/* Right Leaf: Perks List */}
          <div
            style={{
              borderRadius: '12px',
              background: 'rgba(11, 14, 20, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                fontSize: '0.62rem',
                fontWeight: 900,
                color: '#D4AF37',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              EXKLUSIVE BENEFIT-SEITEN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeBookMeta.perks.map((perk, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  <ChevronRight size={13} color={activeBookMeta.goldEmboss} />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
