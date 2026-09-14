'use client';

import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Dices, Flame, Sparkles, CircleDot, Layers } from 'lucide-react';
import type { HistoryRow } from '@/components/history/HistoryTableStream';

export interface HistoryFisheyeGridProps {
  rows: HistoryRow[];
  onSelectRow?: (row: HistoryRow) => void;
  isMobile?: boolean;
}

const GAME_ICONS: Record<string, typeof Dices> = {
  dice: Dices,
  crash: Flame,
  slots: Sparkles,
  roulette: CircleDot,
  blackjack: Layers,
};

interface FisheyeCardProps {
  row: HistoryRow;
  mousePos: { x: number; y: number } | null;
  onSelect?: () => void;
  isReduced: boolean;
  isMobile: boolean;
}

function FisheyeCard({ row, mousePos, onSelect, isReduced, isMobile }: FisheyeCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const isWin = row.amount > 0;
  const isPush = row.amount === 0;

  const [distortion, setDistortion] = useState({ scale: 1, glowIntensity: 0, zIndex: 1 });

  useLayoutEffect(() => {
    if (isReduced || isMobile || !mousePos || !cardRef.current) {
      setDistortion((prev) =>
        prev.scale !== 1 ? { scale: 1, glowIntensity: 0, zIndex: 1 } : prev,
      );
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;
    const dist = Math.hypot(mousePos.x - cardCenterX, mousePos.y - cardCenterY);
    const radius = 220; // Fisheye influence radius in px

    if (dist < radius) {
      const factor = Math.cos((Math.PI * dist) / (2 * radius));
      setDistortion({
        scale: 1 + 0.18 * Math.pow(factor, 2),
        glowIntensity: Math.pow(factor, 2),
        zIndex: 10,
      });
    } else {
      setDistortion((prev) =>
        prev.scale !== 1 ? { scale: 1, glowIntensity: 0, zIndex: 1 } : prev,
      );
    }
  }, [mousePos, isReduced, isMobile]);

  const { scale, glowIntensity, zIndex } = distortion;

  const gameKey = (row.game ?? row.type ?? 'dice').toLowerCase();
  const Icon = GAME_ICONS[gameKey] || Dices;
  const outcomeColor = isWin ? '#10b981' : isPush ? '#60a5fa' : '#ef4444';
  const glowBorder = isWin
    ? `rgba(16, 185, 129, ${0.2 + glowIntensity * 0.5})`
    : isPush
      ? `rgba(96, 165, 250, ${0.2 + glowIntensity * 0.4})`
      : `rgba(239, 68, 68, ${0.15 + glowIntensity * 0.35})`;

  return (
    <motion.div
      ref={cardRef}
      onClick={onSelect}
      whileHover={isReduced ? undefined : { scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      animate={{
        scale: isReduced ? 1 : scale,
        zIndex,
      }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 24,
        mass: 0.2,
      }}
      style={{
        position: 'relative',
        borderRadius: '16px',
        background:
          'linear-gradient(145deg, rgba(22, 25, 35, 0.85) 0%, rgba(11, 14, 20, 0.95) 100%)',
        border: `1px solid ${glowBorder}`,
        boxShadow:
          glowIntensity > 0.05
            ? `0 14px 30px rgba(0, 0, 0, 0.7), 0 0 ${Math.round(glowIntensity * 24)}px ${glowBorder}`
            : '0 6px 18px rgba(0, 0, 0, 0.4)',
        padding: isMobile ? '12px' : '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        transformOrigin: 'center center',
      }}
    >
      {/* Top Row: Game Badge & Provably Fair Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#D4AF37',
          }}
        >
          <Icon size={12} style={{ color: '#D4AF37' }} />
          {row.game || row.type || 'Game'}
        </div>

        <div
          title="Kryptografisch verifiziert"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#10b981',
            fontSize: '0.65rem',
            fontWeight: 700,
          }}
        >
          <ShieldCheck size={13} />
          <span style={{ opacity: 0.8 }}>FAIR</span>
        </div>
      </div>

      {/* Middle: Amount / Payout Highlight */}
      <div style={{ margin: '4px 0' }}>
        <div
          style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.35)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '2px',
          }}
        >
          {isWin ? 'Gewinn' : isPush ? 'Einsatz zurück' : 'Verlust'}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: isMobile ? '1.1rem' : '1.3rem',
            fontWeight: 900,
            color: outcomeColor,
            letterSpacing: '-0.02em',
            textShadow: isWin ? '0 0 12px rgba(16, 185, 129, 0.45)' : undefined,
          }}
        >
          {row.amount > 0
            ? `+$${row.amount.toFixed(2)}`
            : row.amount < 0
              ? `-$${Math.abs(row.amount).toFixed(2)}`
              : '$0.00'}
        </div>
      </div>

      {/* Bottom Row: Balance After & Time */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          color: 'rgba(255, 255, 255, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '8px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>
          Bal: ${row.balance_after.toFixed(2)}
        </span>
        <span>
          {new Date(row.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}

export function HistoryFisheyeGrid({
  rows,
  onSelectRow,
  isMobile = false,
}: HistoryFisheyeGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const prefersReduced = useReducedMotion();
  const isReduced = Boolean(prefersReduced);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isReduced || isMobile) return;
      setMousePos({ x: e.clientX, y: e.clientY });
    },
    [isReduced, isMobile],
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  if (!rows || rows.length === 0) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: isMobile ? '10px' : '14px',
        width: '100%',
        position: 'relative',
        padding: '4px 0 16px',
      }}
    >
      {rows.map((row) => (
        <FisheyeCard
          key={row.id}
          row={row}
          mousePos={mousePos}
          onSelect={() => onSelectRow?.(row)}
          isReduced={isReduced}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}
