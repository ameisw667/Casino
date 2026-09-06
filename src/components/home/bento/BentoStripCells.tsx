'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import { soundManager } from '@/lib/casino/sound-manager';
import { resolvePlayerAvatar } from '@/lib/casino/player-avatar';
import { useDailyRaceStandings, formatCountdown } from '@/hooks/useDailyRaceStandings';
import { RANK_STYLE, PRIZE_BY_RANK } from '../DailyTournamentTeaser';
import { VIP_TIERS, type VipTier } from '../VipProgressTeaser';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';

const RankBenefitsModal = dynamic(() => import('@/components/casino/RankBenefitsModal'), {
  ssr: false,
});

const PODIUM_ORDER = [2, 1, 3];

interface PodiumSlot {
  rank: number;
  username: string | null;
  wagered: number;
  accent: string;
}

/**
 * Full-width podium strip inside the bento mosaic. Visual family is
 * intentionally distinct from the card cells (frameless podium inside a soft
 * strip instead of an eyebrow+grid section) per the layout-repetition ban.
 */
export function TournamentPodiumStrip({ isMobile }: { isMobile: boolean }) {
  const { standings, secondsUntilReset } = useDailyRaceStandings();

  const slots: PodiumSlot[] = PODIUM_ORDER.map((rank) => {
    const entry = standings.find((s) => s.rank === rank);
    return {
      rank,
      username: entry?.username ?? null,
      wagered: entry?.wagered ?? 0,
      accent: RANK_STYLE[rank]?.accent ?? '#C0C0C0',
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.1 }}
      style={{
        gridColumn: '1 / -1',
        gridRow: 'span 1',
        borderRadius: '16px',
        background: 'rgba(11, 14, 20, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        padding: isMobile ? '18px 14px' : '22px 26px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? '20px' : '26px',
      }}
    >
      {/* Title block */}
      <div
        style={{
          flexShrink: 0,
          minWidth: isMobile ? 'auto' : '215px',
          position: 'relative',
          paddingLeft: isMobile ? '40px' : '58px',
        }}
      >
        <Image
          src="/images/trophy-tournament-gold.png"
          alt="Turnierpokal"
          width={isMobile ? 32 : 48}
          height={isMobile ? 32 : 48}
          sizes="(max-width: 768px) 32px, 48px"
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            objectFit: 'contain',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: bentoColors.gold,
            fontSize: '0.62rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '3px',
          }}
        >
          <span>$10,000 Daily Race</span>
        </div>
        <div
          style={{
            fontSize: '1.12rem',
            fontWeight: 1000,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          Tägliches Turnier
        </div>
      </div>

      {/* Podium 2-1-3, rank 1 elevated */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          alignItems: 'flex-end',
          gap: isMobile ? '10px' : '14px',
          minWidth: 0,
        }}
      >
        {slots.map((slot) => (
          <PodiumColumn key={slot.rank} slot={slot} isMobile={isMobile} />
        ))}
      </div>

      {/* Countdown */}
      <div
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '6px 12px',
          borderRadius: '9999px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <span style={{ fontSize: '0.66rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700 }}>
          Restlaufzeit:
        </span>
        <span
          style={{
            ...bentoTypography.dynamicNumber,
            fontSize: '0.76rem',
            fontWeight: 900,
            color: bentoColors.gold,
            whiteSpace: 'nowrap',
          }}
        >
          {secondsUntilReset === null ? '...' : formatCountdown(secondsUntilReset)}
        </span>
      </div>
    </motion.div>
  );
}

function PodiumColumn({ slot, isMobile }: { slot: PodiumSlot; isMobile: boolean }) {
  const isRank1 = slot.rank === 1;
  const hasEntry = slot.username !== null;
  const avatar = hasEntry ? resolvePlayerAvatar(slot.username) : null;
  const podiumSurface = isRank1
    ? 'linear-gradient(180deg, rgba(212, 175, 55, 0.12) 0%, rgba(11, 14, 20, 0.95) 100%)'
    : slot.rank === 2
      ? 'linear-gradient(180deg, rgba(192, 192, 192, 0.08) 0%, rgba(11, 14, 20, 0.95) 100%)'
      : 'linear-gradient(180deg, rgba(205, 127, 50, 0.08) 0%, rgba(11, 14, 20, 0.95) 100%)';
  const prizeLabel = `$${(PRIZE_BY_RANK[slot.rank] ?? 0).toLocaleString('en-US')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      whileHover={isMobile ? undefined : { y: -4 }}
      transition={{ ...springs.gentle, delay: slot.rank * 0.08 }}
      style={{
        position: 'relative',
        borderRadius: '14px',
        padding: isRank1 ? '14px 10px 12px' : '12px 8px 10px',
        background: podiumSurface,
        border: `1px solid ${slot.accent}66`,
        boxShadow: isRank1
          ? '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.15)'
          : '0 8px 24px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '6px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: isRank1 ? '52px' : '44px',
          height: isRank1 ? '52px' : '44px',
          borderRadius: '50%',
          padding: '2px',
          background: `linear-gradient(135deg, ${slot.accent} 0%, transparent 100%)`,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#0a0a0f',
          }}
        >
          {avatar && (
            <Image
              src={avatar.src}
              alt={slot.username ?? avatar.initials}
              fill
              sizes="52px"
              style={{ objectFit: 'cover' }}
            />
          )}
        </div>
      </div>
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 1000,
          color: hasEntry ? '#fff' : 'rgba(255, 255, 255, 0.35)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {slot.username ?? 'Noch offen'}
      </div>
      <div
        style={{
          ...bentoTypography.dynamicNumber,
          fontSize: isRank1 ? '0.9rem' : '0.78rem',
          fontWeight: 900,
          color: bentoColors.emerald,
          whiteSpace: 'nowrap',
        }}
      >
        {prizeLabel}
      </div>
      {isRank1 && (
        <Crown
          size={14}
          fill={bentoColors.gold}
          style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: bentoColors.gold,
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Full-width VIP timeline strip: horizontal node track that deliberately
 * breaks the card-cell pattern of the mosaic above it.
 */
export function VipTimelineStrip({ isMobile }: { isMobile: boolean }) {
  const [showRankModal, setShowRankModal] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...springs.gentle, delay: 0.12 }}
      style={{
        gridColumn: '1 / -1',
        gridRow: 'span 1',
        borderRadius: '20px',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        padding: isMobile ? '4px 2px' : '6px 4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          padding: '0 6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: bentoColors.gold,
            fontSize: '0.62rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span>Exklusiver VIP Club · Level Up &amp; Rakeback Roadmap</span>
        </div>
        <motion.button
          type="button"
          onClick={() => {
            soundManager.playClick();
            setShowRankModal(true);
          }}
          className="focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          transition={springs.standard}
          style={{
            padding: '6px 14px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
            color: '#000',
            fontSize: '0.66rem',
            fontWeight: 950,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)',
          }}
        >
          Alle Stufen ansehen
        </motion.button>
      </div>

      {/* Continuous timeline line + active progress beam */}
      <div style={{ position: 'relative' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '28px',
            left: '8%',
            right: '8%',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.07)',
          }}
        >
          <div
            style={{
              width: '28%',
              height: '100%',
              background: `linear-gradient(90deg, #CD7F32 0%, #C0C0C0 70%, ${bentoColors.gold} 100%)`,
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!prefersReducedMotion && (
              <motion.div
                animate={{ x: ['-120%', '220%'] }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 1.4,
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '40%',
                  height: '100%',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)',
                }}
              />
            )}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: isMobile ? '4px' : '12px',
          }}
        >
          {VIP_TIERS.map((tier, idx) => (
            <VipStripNode key={tier.name} tier={tier} idx={idx} isMobile={isMobile} />
          ))}
        </div>
      </div>

      {showRankModal && (
        <RankBenefitsModal isOpen={showRankModal} onClose={() => setShowRankModal(false)} />
      )}
    </motion.div>
  );
}

function VipStripNode({ tier, idx, isMobile }: { tier: VipTier; idx: number; isMobile: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ ...springs.gentle, delay: 0.14 + idx * 0.06 }}
      whileHover={isMobile ? undefined : { y: -4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '5px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: isMobile ? '44px' : '56px',
          height: isMobile ? '44px' : '56px',
          borderRadius: '50%',
          padding: '2px',
          background: 'rgba(11, 14, 20, 0.9)',
          border: `2px solid ${tier.isCurrent ? tier.accent : 'rgba(255, 255, 255, 0.14)'}`,
          boxShadow: tier.isCurrent ? `0 0 16px ${tier.accent}50` : 'none',
          flexShrink: 0,
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
            src={tier.image}
            alt={tier.name}
            fill
            unoptimized
            sizes="60px"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
      <div
        style={{
          fontSize: isMobile ? '0.56rem' : '0.74rem',
          fontWeight: 1000,
          color: tier.isCurrent ? '#fff' : tier.accent,
          letterSpacing: '0.03em',
        }}
      >
        {tier.name}
      </div>
      <div
        style={{
          ...bentoTypography.dynamicNumber,
          fontSize: isMobile ? '0.5rem' : '0.62rem',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.5)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {tier.wager}
      </div>
    </motion.div>
  );
}
