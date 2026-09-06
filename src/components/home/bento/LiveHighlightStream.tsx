'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { springs } from '@/lib/design/motion-tokens';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { HighrollerWinDetailModal, type HighrollerWinItem } from '../HighrollerWinDetailModal';
import { bentoColors, bentoTypography } from './bento-lobby-tokens';

const ROTATION_INTERVAL_MS = 4200;

interface StreamEntry {
  id: string;
  user: string;
  amount: number;
  game: string;
  mult: string;
  type: HighrollerWinItem['type'];
  time: string;
}

/**
 * Consolidated live-ambience stream (fuses the old fullwidth highroller
 * ticker bar and the VIP side drawer into one 1x2 Bento cell). Simulated,
 * curated dataset by design — verified player activity lives in
 * LiveActivityFeedV2; switching this to real store data is Jan's call
 * (03-frontend-lobby.md §7.3).
 */
const STREAM_ENTRIES: StreamEntry[] = [
  {
    id: '1',
    user: 'Satoshi_X',
    amount: 4250.0,
    game: 'Crash Rocket',
    mult: '14.20x',
    type: 'hot',
    time: 'gerade eben',
  },
  {
    id: '2',
    user: 'WhaleWatcher',
    amount: 8900.0,
    game: 'Neon Slots',
    mult: '89.00x',
    type: 'whale',
    time: 'vor 1m',
  },
  {
    id: '3',
    user: 'CryptoKing',
    amount: 12500.0,
    game: 'VIP Blackjack',
    mult: '2.50x',
    type: 'vip',
    time: 'vor 2m',
  },
  {
    id: '4',
    user: 'LuckyStrike',
    amount: 3400.0,
    game: 'Ultimate Dice',
    mult: '34.00x',
    type: 'hot',
    time: 'vor 3m',
  },
  {
    id: '5',
    user: 'AuraMaster',
    amount: 18200.0,
    game: 'Royale Roulette',
    mult: '36.00x',
    type: 'jackpot',
    time: 'vor 4m',
  },
];

const TYPE_META: Record<HighrollerWinItem['type'], { color: string; badge: string }> = {
  jackpot: { color: bentoColors.gold, badge: 'JACKPOT' },
  whale: { color: bentoColors.goldLight, badge: 'WHALE' },
  vip: { color: bentoColors.emerald, badge: 'VIP' },
  hot: { color: bentoColors.gold, badge: 'HEISS' },
};

export function LiveHighlightStream() {
  const prefersReducedMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedWin, setSelectedWin] = useState<HighrollerWinItem | null>(null);

  const active = STREAM_ENTRIES[activeIdx];

  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (selectedWin) return;
      setActiveIdx((prev) => (prev + 1) % STREAM_ENTRIES.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPaused, selectedWin]);

  if (!active) return null;

  return (
    <>
      <GlassSurface
        radius="lg"
        elevation={2}
        withTopSheen
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '16px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
              <motion.span
                animate={prefersReducedMotion ? undefined : { opacity: [1, 0.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: bentoColors.emerald,
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.9)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: bentoColors.gold,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Live Auszahlungen
              </span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.22)',
                color: bentoColors.emerald,
                fontSize: '0.6rem',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              <span style={bentoTypography.dynamicNumber}>99.2% RTP</span>
            </div>
          </div>

          {/* Rotating headline entry */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={active.id}
              type="button"
              onClick={() => setSelectedWin(active)}
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
              aria-label={`Win-Details von ${active.user}: $${active.amount.toLocaleString('en-US')} bei ${active.game}`}
              className="focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              whileHover={{ scale: 1.01 }}
              transition={{ ...springs.standard, stiffness: 350 }}
              style={{
                position: 'relative',
                textAlign: 'left',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                width: '100%',
                marginBottom: '12px',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}
              >
                {(() => {
                  const Meta = TYPE_META[active.type];
                  return (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        background: `${Meta.color}18`,
                        border: `1px solid ${Meta.color}44`,
                        color: Meta.color,
                        fontSize: '0.56rem',
                        fontWeight: 900,
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                      }}
                    >
                      {Meta.badge}
                    </span>
                  );
                })()}
                <span
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {active.user}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    ...bentoTypography.dynamicNumber,
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: bentoColors.emerald,
                    letterSpacing: '-0.02em',
                  }}
                >
                  +${active.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span
                  style={{
                    ...bentoTypography.dynamicNumber,
                    padding: '1px 7px',
                    borderRadius: '6px',
                    background: 'rgba(212, 175, 55, 0.14)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    color: bentoColors.gold,
                    fontSize: '0.78rem',
                    fontWeight: 900,
                  }}
                >
                  {active.mult}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.55)',
                  marginTop: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span style={{ color: bentoColors.gold, fontWeight: 800 }}>{active.game}</span>
                <span>{active.time}</span>
              </div>

              {/* Rotation progress indicator (continuous-motion primitive) */}
              {!prefersReducedMotion && !isPaused && (
                <motion.div
                  key={`progress-${active.id}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    height: '2px',
                    background: `linear-gradient(90deg, rgba(16, 185, 129, 0) 0%, rgba(16, 185, 129, 1) 100%)`,
                  }}
                />
              )}
            </motion.button>
          </AnimatePresence>

          {/* Remaining entries */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {STREAM_ENTRIES.filter((entry) => entry.id !== active.id).map((entry) => {
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedWin(entry)}
                  aria-label={`Win-Details von ${entry.user}: $${entry.amount.toLocaleString('en-US')} bei ${entry.game}`}
                  className="focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '7px 10px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: '#fff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.user}
                    </span>
                  </span>
                  <span
                    style={{
                      ...bentoTypography.dynamicNumber,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: bentoColors.emerald,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: bentoColors.gold }}>{entry.mult}</span>
                    +${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              marginTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.64rem',
              color: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              Instant Payouts
            </span>
            <span style={{ color: bentoColors.gold, fontWeight: 800 }}>100% Provably Fair</span>
          </div>
        </div>
      </GlassSurface>

      {/* Außerhalb von GlassSurface: backdrop-filter würde sonst den
          containing block des fixed-modal kapern und ihn auf die Zelle clippen. */}
      <HighrollerWinDetailModal win={selectedWin} onClose={() => setSelectedWin(null)} />
    </>
  );
}
