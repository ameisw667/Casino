'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  History,
  Trash2,
  Undo2,
  FastForward,
  Zap,
  Target,
  Trophy,
  Flame,
  Snowflake,
  Crown,
} from 'lucide-react';

import { useCasinoStore } from '@/store/useCasinoStore';
import { CasinoCore } from '@/lib/casino/casino-core';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { Chip } from '@/components/casino/games/roulette/Chip';
import {
  ROULETTE_NUMBERS,
  WHEEL_ORDER,
  CHIPS,
  type Color,
  type BetType,
  type BetPlacement,
  type RouletteNumber,
} from '@/components/casino/games/roulette/types';

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

const CHIP_SHORTCUTS: Record<string, number> = {
  '1': CHIPS[0],
  '2': CHIPS[1],
  '3': CHIPS[2],
  '4': CHIPS[3],
  '5': CHIPS[4],
  '6': CHIPS[5],
  '7': CHIPS[6],
};

const SIDE_BETS: {
  label: string;
  type: BetType;
  className?: string;
  overrideBg?: string;
}[] = [
  { label: '1-18', type: { type: 'RANGE', value: '1-18' }, className: 'rounded-bl-xl' },
  { label: 'EVEN', type: { type: 'EVEN_ODD', value: 'EVEN' } },
  { label: 'RED', type: { type: 'COLOR', value: 'RED' }, overrideBg: 'hsl(var(--error))' },
  { label: 'BLACK', type: { type: 'COLOR', value: 'BLACK' }, overrideBg: '#111' },
  { label: 'ODD', type: { type: 'EVEN_ODD', value: 'ODD' } },
  { label: '19-36', type: { type: 'RANGE', value: '19-36' }, className: 'rounded-br-xl' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function betTypeKey(type: BetType): string {
  return `${type.type}:${type.value}`;
}

function colorForNumber(c: Color): string {
  if (c === 'RED') return 'hsl(var(--error))';
  if (c === 'BLACK') return '#111';
  return 'hsl(var(--success))';
}

function textColorForNumber(c: Color): string {
  return c === 'GREEN' ? '#000' : '#fff';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HotColdStats({ history }: { history: RouletteNumber[] }) {
  const stats = useMemo(() => {
    const counts: Record<number, number> = {};
    history.forEach((h) => {
      counts[h.n] = (counts[h.n] || 0) + 1;
    });
    const entries = Object.entries(counts).map(([n, count]) => ({
      n: Number(n),
      count,
      c: ROULETTE_NUMBERS.find((r) => r.n === Number(n))?.c ?? 'GREEN',
    }));
    const sorted = entries.sort((a, b) => b.count - a.count);
    return {
      hot: sorted.slice(0, 5),
      cold: sorted.slice(-5).reverse(),
    };
  }, [history]);

  const pillStyle = (c: Color): React.CSSProperties => ({
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 900,
    background: colorForNumber(c),
    color: textColorForNumber(c),
    border: c === 'BLACK' ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Flame size={14} color="hsl(var(--primary))" />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          Hot & Cold
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '9px',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'hsl(var(--error))',
              letterSpacing: '0.05em',
            }}
          >
            <Flame size={10} />
            Hot
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {stats.hot.length === 0 && (
              <span
                style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}
              >
                Waiting...
              </span>
            )}
            {stats.hot.map((h) => (
              <div key={`hot-${h.n}`} style={pillStyle(h.c)}>
                {h.n}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '9px',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.05em',
            }}
          >
            <Snowflake size={10} />
            Cold
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {stats.cold.length === 0 && (
              <span
                style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}
              >
                Waiting...
              </span>
            )}
            {stats.cold.map((h) => (
              <div key={`cold-${h.n}`} style={pillStyle(h.c)}>
                {h.n}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentBetsList({ bets }: { bets: BetPlacement[] }) {
  const total = bets.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={14} color="hsl(var(--primary))" />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}
          >
            Your Bets
          </span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>
          {formatUsd(total)}
        </span>
      </div>

      {bets.length === 0 ? (
        <div
          style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.2)',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          No bets placed yet
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '180px',
            overflowY: 'auto',
          }}
        >
          {bets.map((bet) => (
            <div
              key={bet.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
                {bet.type.type === 'STRAIGHT'
                  ? `Number ${bet.type.value}`
                  : bet.type.type === 'COLOR'
                    ? `${bet.type.value}`
                    : bet.type.type === 'EVEN_ODD'
                      ? `${bet.type.value}`
                      : bet.type.type === 'RANGE'
                        ? `${bet.type.value}`
                        : bet.type.type === 'DOZEN'
                          ? `${bet.type.value === 1 ? '1st' : bet.type.value === 2 ? '2nd' : '3rd'} 12`
                          : bet.type.type === 'COLUMN'
                            ? `${bet.type.value === 1 ? '1st' : bet.type.value === 2 ? '2nd' : '3rd'} Column`
                            : `${bet.type.value}`}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'hsl(var(--primary))' }}>
                {formatUsd(bet.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionStats({ stats }: { stats: { wins: number; losses: number; profit: number } }) {
  const total = stats.wins + stats.losses;
  const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={14} color="hsl(var(--primary))" />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          Session Stats
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
            }}
          >
            Win Rate
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 900,
              color: winRate >= 50 ? 'hsl(var(--success))' : '#fff',
            }}
          >
            {winRate}%
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
            }}
          >
            Profit
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 900,
              color: stats.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))',
            }}
          >
            {stats.profit >= 0 ? '+' : ''}
            {formatUsd(stats.profit)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontSize: '9px',
              fontWeight: 900,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
            }}
          >
            Spins
          </span>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{total}</span>
        </div>
      </div>
    </div>
  );
}

function LastResultsStrip({ history }: { history: RouletteNumber[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={14} color="hsl(var(--primary))" />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
          }}
        >
          Last Results
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.1)',
                textTransform: 'uppercase',
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
              }}
            >
              Waiting for first spin...
            </motion.div>
          ) : (
            history.slice(0, 14).map((h, i) => (
              <motion.div
                key={`${h.n}-${i}`}
                initial={{ scale: 0, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 300,
                  delay: i * 0.03,
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  background: colorForNumber(h.c),
                  color: textColorForNumber(h.c),
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>{h.n}</span>
                {i === 0 && (
                  <motion.div
                    layoutId="last-win-glow"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderRadius: '50%',
                    }}
                    className="animate-pulse"
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roulette Wheel SVG with spinning ball
// ---------------------------------------------------------------------------

function RouletteWheel({
  spinning,
  winningNumber,
  wheelRotation,
  ballRotation,
}: {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
  wheelRotation: number;
  ballRotation: number;
}) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.48;
  const innerR = size * 0.34;
  const pocketR = size * 0.41;
  const ballTrackR = size * 0.44;
  const pocketAngle = 360 / 37;

  const pockets = useMemo(() => {
    return WHEEL_ORDER.map((num, i) => {
      const angle = i * pocketAngle - 90;
      const rad = (angle * Math.PI) / 180;
      return {
        num,
        angle,
        x: cx + pocketR * Math.cos(rad),
        y: cy + pocketR * Math.sin(rad),
      };
    });
  }, [cx, cy, pocketR, pocketAngle]);

  const ballRad = ((ballRotation - 90) * Math.PI) / 180;
  const ballX = cx + ballTrackR * Math.cos(ballRad);
  const ballY = cy + ballTrackR * Math.sin(ballRad);

  return (
    <div
      data-testid="roulette-wheel"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px 0',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #3a2a10 0%, #1a1205 60%, #000 100%)',
          boxShadow:
            '0 0 0 8px rgba(212,175,55,0.15), 0 20px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            transform: `rotate(${-wheelRotation}deg)`,
            transition: spinning
              ? 'transform 5.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
              : 'transform 0.6s ease-out',
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={outerR}
            fill="none"
            stroke="rgba(212,175,55,0.25)"
            strokeWidth={2}
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="none"
            stroke="rgba(212,175,55,0.2)"
            strokeWidth={1}
          />

          {pockets.map((p, i) => {
            const startAngle = (p.angle - pocketAngle / 2) * (Math.PI / 180);
            const endAngle = (p.angle + pocketAngle / 2) * (Math.PI / 180);
            const x1 = cx + innerR * Math.cos(startAngle);
            const y1 = cy + innerR * Math.sin(startAngle);
            const x2 = cx + outerR * Math.cos(startAngle);
            const y2 = cy + outerR * Math.sin(startAngle);
            const x3 = cx + outerR * Math.cos(endAngle);
            const y3 = cy + outerR * Math.sin(endAngle);
            const x4 = cx + innerR * Math.cos(endAngle);
            const y4 = cy + innerR * Math.sin(endAngle);
            const path = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;
            return (
              <path
                key={i}
                d={path}
                fill={p.num.c === 'GREEN' ? '#00a86b' : p.num.c === 'RED' ? '#c41e3a' : '#111'}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              />
            );
          })}

          {pockets.map((p, i) => (
            <text
              key={`t-${i}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="10"
              fontWeight="900"
              transform={`rotate(${p.angle + 90}, ${p.x}, ${p.y})`}
              style={{ pointerEvents: 'none' }}
            >
              {p.num.n}
            </text>
          ))}
        </svg>

        {/* Ball */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: size,
            height: size,
            transform: `rotate(${ballRotation}deg)`,
            transition: spinning
              ? 'transform 5.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
              : 'transform 0.6s ease-out',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: ballX - 7,
              top: ballY - 7,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #fff, #d4af37 40%, #8a6e1c 100%)',
              boxShadow: '0 0 12px rgba(255,255,255,0.6), 0 4px 8px rgba(0,0,0,0.6)',
            }}
          />
        </div>

        {/* Center hub */}
        <div
          data-testid="wheel-hub"
          style={{
            position: 'absolute',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #d4af37, #6b4c08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.8), inset 0 0 12px rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}
        >
          <span
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#000',
              textShadow: '0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            {winningNumber && !spinning ? winningNumber.n : '?'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ResultBadge({
  winningNumber,
  lastWin,
}: {
  winningNumber: RouletteNumber | null;
  lastWin: number | null;
}) {
  if (!winningNumber) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '8px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '22px',
          border: '3px solid rgba(255,255,255,0.2)',
          boxShadow: `0 0 30px ${colorForNumber(winningNumber.c)}80`,
          background: colorForNumber(winningNumber.c),
          color: textColorForNumber(winningNumber.c),
        }}
      >
        {winningNumber.n}
      </div>
      {lastWin !== null && lastWin > 0 && (
        <div style={{ color: 'hsl(var(--primary))', fontWeight: 900, fontSize: '20px' }}>
          +{formatUsd(lastWin)}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export function RouletteClient() {
  // Store selectors
  const isMobile = useCasinoStore((s) => s.isMobile);
  const balance = useCasinoStore((s) => s.balance);
  const xp = useCasinoStore((s) => s.xp);
  const level = useCasinoStore((s) => s.level);
  const rank = useCasinoStore((s) => s.rank);
  const provablyFairSettings = useCasinoStore((s) => s.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore((s) => s.setProvablyFairSettings);
  const processGameResult = useCasinoStore((s) => s.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((s) => s.applyServerWalletSnapshot);
  const addToast = useCasinoStore((s) => s.addToast);
  const setIsProcessing = useCasinoStore((s) => s.setIsProcessing);
  const isProcessing = useCasinoStore((s) => s.isProcessing);
  const gameStats = useCasinoStore(
    (s) => s.gameStats.ROULETTE ?? { wins: 0, losses: 0, profit: 0 },
  );
  const gameConfig = useCasinoStore((s) => s.gameConfig);

  // Local state
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [currentBets, setCurrentBets] = useState<BetPlacement[]>([]);
  const [betHistory, setBetHistory] = useState<BetPlacement[][]>([]);
  const [selectedChip, setSelectedChip] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [winningNumber, setWinningNumber] = useState<RouletteNumber | null>(null);
  const [history, setHistory] = useState<RouletteNumber[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [hoveredArea, setHoveredArea] = useState<BetType | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);

  const spinLockRef = useRef(false);

  // Derived values
  const totalWagered = useMemo(
    () => currentBets.reduce((acc, bet) => acc + bet.amount, 0),
    [currentBets],
  );

  const estProfit = useMemo(() => {
    let maxWin = 0;
    for (let i = 0; i <= 36; i++) {
      let currentNumWin = 0;
      currentBets.forEach((bet) => {
        if (CasinoCore.isRouletteWin(bet.type as never, i)) {
          currentNumWin +=
            bet.amount * CasinoCore.getRouletteMultiplier(bet.type as never, gameConfig);
        }
      });
      if (currentNumWin > maxWin) maxWin = currentNumWin;
    }
    return maxWin;
  }, [currentBets, gameConfig]);

  const xpProgress = useMemo(() => {
    const nextLevelXp = Math.pow(level, 2) * 100;
    return Math.min(100, Math.round((xp / nextLevelXp) * 100));
  }, [xp, level]);

  // Core action: place a chip on a bet type
  const handlePlaceBet = useCallback(
    (type: BetType, chipValue: number = selectedChip) => {
      if (spinning || spinLockRef.current) return;
      if (balance < chipValue) {
        addToast('Insufficient balance!', 'error');
        return;
      }
      if (totalWagered + chipValue > balance) {
        addToast('Total bet would exceed your balance!', 'error');
        return;
      }

      setBetHistory((prev) => [...prev, [...currentBets]]);

      const key = betTypeKey(type);
      const existingIndex = currentBets.findIndex((b) => betTypeKey(b.type) === key);

      if (existingIndex > -1) {
        setCurrentBets((prev) => {
          const next = prev.map((b, i) =>
            i === existingIndex ? { ...b, amount: b.amount + chipValue } : b,
          );
          return next;
        });
      } else {
        setCurrentBets((prev) => [...prev, { id: crypto.randomUUID(), type, amount: chipValue }]);
      }

      soundManager.play('chip');
    },
    [spinning, balance, totalWagered, selectedChip, currentBets, addToast],
  );

  // Clear & undo
  const handleClearBets = useCallback(() => {
    if (spinning || currentBets.length === 0) return;
    setCurrentBets([]);
    setBetHistory([]);
  }, [spinning, currentBets.length]);

  const handleUndo = useCallback(() => {
    if (spinning || betHistory.length === 0) return;
    setCurrentBets(betHistory[betHistory.length - 1]);
    setBetHistory((prev) => prev.slice(0, -1));
  }, [spinning, betHistory]);

  // Keyboard shortcuts: 1-7 place the mapped chip on the currently hovered area
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (spinning || !hoveredArea) return;
      const chip = CHIP_SHORTCUTS[e.key];
      if (chip === undefined) return;
      e.preventDefault();
      handlePlaceBet(hoveredArea, chip);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [spinning, hoveredArea, handlePlaceBet]);

  // Spin logic
  const handleSpin = useCallback(async () => {
    if (spinning || spinLockRef.current) return;
    if (currentBets.length === 0) {
      addToast('Place at least one bet first', 'error');
      return;
    }

    const betError = validateBet(totalWagered, balance, gameConfig);
    if (betError) {
      addToast(betError, 'error');
      return;
    }

    spinLockRef.current = true;
    setIsProcessing(true);

    setSpinning(true);
    setWinningNumber(null);
    setLastWin(null);
    soundManager.play('roulette-spin');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/casino/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          gameType: 'ROULETTE',
          amount: totalWagered,
          bets: currentBets,
          clientSeed: sanitizeClientSeed(provablyFairSettings.clientSeed),
          currentNonce: provablyFairSettings.nonce,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error(`API failed: ${response.status}`);
      }

      const result = await response.json();

      setProvablyFairSettings({
        serverSeedHash: result.serverSeedHash,
        nonce: result.nonce,
      });

      const winningNumObj = ROULETTE_NUMBERS.find((n) => n.n === result.roll);
      if (!winningNumObj) {
        throw new Error(`Invalid roll received: ${result.roll}`);
      }

      // Wheel animation math
      const duration = turboMode ? 1200 : 6000;
      const spins = turboMode ? 2 : 6;
      const extraRotation = Math.random() * 360;
      const pocketDegrees = 360 / 37;
      const pocketIndex = WHEEL_ORDER.findIndex((n) => n.n === winningNumObj.n);
      const ballSpins = turboMode ? 4 : 10;
      const targetWheelRotation = wheelRotation + spins * 360 + extraRotation;
      const targetBallRotation =
        ballRotation - ballSpins * 360 + (extraRotation + pocketIndex * pocketDegrees);

      setWheelRotation(targetWheelRotation);
      setBallRotation(targetBallRotation);

      setTimeout(() => {
        setWinningNumber(winningNumObj);
        setSpinning(false);
        setIsProcessing(false);
        spinLockRef.current = false;
        setHistory((prev) => [winningNumObj, ...prev].slice(0, 30));

        if (result.win) {
          setLastWin(result.payout);
        } else {
          setLastWin(0);
        }

        applyServerWalletSnapshot(result.wallet);
        processGameResult({
          game: 'ROULETTE',
          amount: totalWagered,
          multiplier: totalWagered > 0 ? result.payout / totalWagered : 0,
          payout: result.payout,
          win: result.win,
          resultId: result.id,
        });

        // Clear table after showing result for a moment
        setTimeout(() => {
          setCurrentBets([]);
          setWinningNumber(null);
          setLastWin(null);
        }, 3500);
      }, duration);
    } catch (error) {
      CasinoLogger.error('Roulette', 'Spin error', error);
      setSpinning(false);
      setIsProcessing(false);
      spinLockRef.current = false;
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Failed to spin. Please try again.', 'error');
      }
    }
  }, [
    spinning,
    currentBets,
    totalWagered,
    balance,
    addToast,
    setIsProcessing,
    provablyFairSettings,
    setProvablyFairSettings,
    turboMode,
    wheelRotation,
    ballRotation,
    processGameResult,
    applyServerWalletSnapshot,
    gameConfig,
  ]);

  // Global spin / clear shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && hoveredArea === null) {
        e.preventDefault();
        handleSpin();
      } else if (e.code === 'Escape') {
        handleClearBets();
      } else if (e.code === 'KeyT') {
        setTurboMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hoveredArea, handleClearBets, handleSpin]);

  // UI helpers for board
  const isHighlighted = useCallback(
    (num: number) => {
      if (!hoveredArea) return false;
      return CasinoCore.isRouletteWin(hoveredArea as never, num);
    },
    [hoveredArea],
  );

  const renderNumberTile = (num: number) => {
    const data = ROULETTE_NUMBERS.find((n) => n.n === num)!;
    const bet = currentBets.find((b) => b.type.type === 'STRAIGHT' && b.type.value === num);
    const highlighted = isHighlighted(num);
    const isWinner = winningNumber?.n === num && !spinning;

    return (
      <motion.div
        key={num}
        onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: num })}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => handlePlaceBet({ type: 'STRAIGHT', value: num })}
        whileHover={{ scale: 0.98, filter: 'brightness(1.2)' }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: isMobile ? '40px' : '52px',
          cursor: 'pointer',
          fontWeight: 900,
          fontSize: isMobile ? '14px' : '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          userSelect: 'none',
          transition: 'all 0.3s',
          background:
            data.c === 'RED'
              ? 'linear-gradient(135deg, hsl(var(--error)), #7f0e1e)'
              : data.c === 'BLACK'
                ? 'linear-gradient(135deg, #1a1a1a, #0d0d0d)'
                : 'linear-gradient(135deg, hsl(var(--success)), #006b40)',
          boxShadow: highlighted
            ? 'inset 0 0 30px rgba(255,255,255,0.4), 0 0 20px hsla(var(--primary), 0.2)'
            : 'none',
          filter: highlighted ? 'brightness(1.5)' : 'none',
          zIndex: isWinner ? 20 : highlighted ? 10 : 1,
          transform: isWinner ? 'scale(1.05)' : undefined,
          outline: isWinner ? '4px solid #fff' : undefined,
          borderRadius: '4px',
          color: textColorForNumber(data.c),
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>{num}</span>
        {bet && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Chip amount={bet.amount} size={28} stacked vipLevel={level} />
          </div>
        )}
      </motion.div>
    );
  };

  const renderSideBet = (label: string, type: BetType, className = '', overrideBg?: string) => {
    const key = betTypeKey(type);
    const bet = currentBets.find((b) => betTypeKey(b.type) === key);
    const active = hoveredArea && betTypeKey(hoveredArea) === key;

    const borderRadius = className.includes('rounded-bl')
      ? '0 0 0 12px'
      : className.includes('rounded-br')
        ? '0 0 12px 0'
        : className.includes('rounded-tr')
          ? '0 12px 0 0'
          : '4px';

    return (
      <motion.div
        data-testid={label === 'RED' ? 'roulette-bet-red' : undefined}
        onMouseEnter={() => setHoveredArea(type)}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => handlePlaceBet(type)}
        whileHover={{ filter: 'brightness(1.2)' }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontWeight: 900,
          fontSize: isMobile ? '9px' : '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'all 0.2s',
          background: overrideBg || 'rgba(255,255,255,0.05)',
          boxShadow: active ? '0 0 20px hsla(var(--primary), 0.1)' : 'none',
          filter: active ? 'brightness(1.5)' : 'none',
          zIndex: active ? 10 : 1,
          color: '#fff',
          borderRadius,
          minHeight: '44px',
        }}
      >
        {label}
        {bet && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Chip amount={bet.amount} size={28} stacked vipLevel={level} />
          </div>
        )}
      </motion.div>
    );
  };

  if (!mounted) return null;

  return (
    <GameErrorBoundary gameName="Roulette V2">
      <div
        className="roulette-page"
        style={{
          width: '100%',
          maxWidth: '1800px',
          margin: '0 auto',
          padding: isMobile ? '12px' : '24px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: isMobile ? '16px' : '24px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
          borderRadius: '32px',
          minHeight: 'calc(100vh - 120px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5)',
        }}
      >
        <style jsx global>{`
          @media (min-width: 1280px) {
            .roulette-page {
              grid-template-columns: 300px 1fr 300px !important;
            }
          }
          @media (max-width: 1279px) and (min-width: 900px) {
            .roulette-page {
              grid-template-columns: 260px 1fr !important;
            }
            .roulette-right {
              grid-column: 1 / 3;
            }
          }
          @media (max-width: 899px) {
            .roulette-page {
              grid-template-columns: 1fr !important;
            }
            .roulette-left {
              order: 3;
            }
            .roulette-center {
              order: 1;
            }
            .roulette-right {
              order: 2;
            }
          }
          .roulette-board::-webkit-scrollbar {
            height: 6px;
          }
          .roulette-board::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
          }
          .roulette-board {
            overflow-x: auto;
            scrollbar-width: thin;
          }
        `}</style>

        {/* LEFT SIDEBAR */}
        <aside
          className="roulette-left"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'rgba(20,20,20,0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '20px',
          }}
        >
          {/* VIP Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(20,20,20,0.8))',
              borderRadius: '16px',
              border: '1px solid rgba(212,175,55,0.25)',
              boxShadow: '0 8px 32px rgba(212,175,55,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={16} color="hsl(var(--primary))" />
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    color: 'hsl(var(--primary))',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                  }}
                >
                  {rank}
                </span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.6)' }}>
                LVL {level}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <span>XP Progress</span>
              <span>{xpProgress}%</span>
            </div>
            <div
              style={{
                height: '8px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '9999px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <motion.div
                style={{ height: '100%', background: 'hsl(var(--primary))' }}
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

          <SessionStats stats={gameStats} />
          <HotColdStats history={history} />
          <CurrentBetsList bets={currentBets} />

          <div style={{ marginTop: 'auto' }}>
            <LastResultsStrip history={history} />
          </div>
        </aside>

        {/* CENTER: Wheel + Board */}
        <main
          className="roulette-center"
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div
            style={{
              background: 'rgba(20,20,20,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <Zap size={14} color="hsl(var(--primary))" />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                }}
              >
                European Roulette
              </span>
            </div>

            <RouletteWheel
              spinning={spinning}
              winningNumber={winningNumber}
              wheelRotation={wheelRotation}
              ballRotation={ballRotation}
            />

            <ResultBadge winningNumber={winningNumber} lastWin={lastWin} />
          </div>

          {/* Board */}
          <div
            style={{
              background: 'rgba(20,20,20,0.6)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px',
              padding: '16px',
            }}
          >
            <div className="roulette-board">
              <div
                style={{
                  minWidth: isMobile ? '680px' : '780px',
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 64px',
                  gap: '4px',
                  padding: '6px',
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Zero */}
                <motion.div
                  onClick={() => handlePlaceBet({ type: 'STRAIGHT', value: 0 })}
                  onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: 0 })}
                  onMouseLeave={() => setHoveredArea(null)}
                  whileHover={{ filter: 'brightness(1.2)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    gridRow: '1 / 4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, hsl(var(--success)), #006b40)',
                    cursor: 'pointer',
                    fontWeight: 900,
                    fontSize: isMobile ? '20px' : '28px',
                    borderRadius: '12px 0 0 12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    filter:
                      hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === 0
                        ? 'brightness(1.5)'
                        : 'none',
                    boxShadow:
                      hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === 0
                        ? '0 0 20px hsla(var(--success), 0.5)'
                        : 'none',
                    color: '#000',
                  }}
                >
                  0
                  {(() => {
                    const bet = currentBets.find(
                      (b) => b.type.type === 'STRAIGHT' && b.type.value === 0,
                    );
                    return bet ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}
                      >
                        <Chip amount={bet.amount} size={36} stacked vipLevel={level} />
                      </div>
                    ) : null;
                  })()}
                </motion.div>

                {/* Numbers grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)',
                    gap: '4px',
                  }}
                >
                  {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map(renderNumberTile)}
                  {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map(renderNumberTile)}
                  {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(renderNumberTile)}
                </div>

                {/* Columns */}
                <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '4px' }}>
                  {renderSideBet('2:1', { type: 'COLUMN', value: 3 }, 'rounded-tr-xl')}
                  {renderSideBet('2:1', { type: 'COLUMN', value: 2 })}
                  {renderSideBet('2:1', { type: 'COLUMN', value: 1 }, 'rounded-br-xl')}
                </div>

                {/* Dozens */}
                <div
                  style={{
                    gridColumn: '2 / 3',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  {renderSideBet('1st 12', { type: 'DOZEN', value: 1 })}
                  {renderSideBet('2nd 12', { type: 'DOZEN', value: 2 })}
                  {renderSideBet('3rd 12', { type: 'DOZEN', value: 3 })}
                </div>

                {/* Outside bets */}
                <div
                  style={{
                    gridColumn: '2 / 3',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px',
                    marginTop: '4px',
                  }}
                >
                  {SIDE_BETS.map((b) => (
                    <React.Fragment key={betTypeKey(b.type)}>
                      {renderSideBet(b.label, b.type, b.className, b.overrideBg)}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Controls */}
        <aside
          className="roulette-right"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            background: 'rgba(20,20,20,0.6)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="hsl(var(--primary))" />
              <h2
                style={{
                  fontSize: '14px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#fff',
                }}
              >
                Controls
              </h2>
            </div>
            <button
              onClick={() => setTurboMode((p) => !p)}
              style={{
                transition: 'all 0.3s',
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: turboMode ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: turboMode ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
              title="Toggle turbo (T)"
            >
              <FastForward size={18} />
            </button>
          </div>

          {/* Chip selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Select Chip
              </label>
              <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>
                Keys 1-7
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                justifyItems: 'center',
              }}
            >
              {CHIPS.map((c) => (
                <div key={c} style={{ display: 'flex', justifyContent: 'center' }}>
                  <Chip
                    amount={c}
                    active={selectedChip === c}
                    onClick={() => setSelectedChip(c)}
                    size={isMobile ? 48 : 58}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                padding: '0 8px',
              }}
            >
              <span>1=$1</span>
              <span>2=$5</span>
              <span>3=$10</span>
              <span>4=$50</span>
              <span>5=$100</span>
              <span>6=$500</span>
              <span>7=$1k</span>
            </div>
          </div>

          {/* Bet summary */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Est. Profit</span>
              <span style={{ color: 'hsl(var(--primary))' }}>
                {estProfit > 0 ? `+${formatUsd(estProfit)}` : formatUsd(0)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>Total Bet</span>
              <span style={{ color: '#fff' }}>{formatUsd(totalWagered)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSpin}
              disabled={spinning || isProcessing || currentBets.length === 0}
              style={{
                width: '100%',
                height: '64px',
                borderRadius: '16px',
                fontWeight: 900,
                fontSize: '18px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor:
                  spinning || isProcessing || currentBets.length === 0 ? 'not-allowed' : 'pointer',
                border: 'none',
                background:
                  spinning || isProcessing || currentBets.length === 0
                    ? 'rgba(212,175,55,0.4)'
                    : 'linear-gradient(135deg, hsl(var(--primary)), #b8962e)',
                color:
                  spinning || isProcessing || currentBets.length === 0 ? 'rgba(0,0,0,0.5)' : '#000',
                opacity: spinning || isProcessing || currentBets.length === 0 ? 0.6 : 1,
                boxShadow: '0 0 30px hsla(var(--primary), 0.25)',
                position: 'relative',
                overflow: 'hidden',
                letterSpacing: '0.05em',
              }}
            >
              {spinning || isProcessing ? (
                <RotateCcw className="animate-spin" size={24} />
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  <span>PLACE BET</span>
                </>
              )}
            </motion.button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleClearBets}
                disabled={spinning || isProcessing || currentBets.length === 0}
                style={{
                  height: '52px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  opacity: spinning || isProcessing || currentBets.length === 0 ? 0.3 : 1,
                }}
              >
                <Trash2 size={20} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleUndo}
                disabled={spinning || isProcessing || betHistory.length === 0}
                style={{
                  height: '52px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  opacity: spinning || isProcessing || betHistory.length === 0 ? 0.3 : 1,
                }}
              >
                <Undo2 size={20} />
              </motion.button>
            </div>
          </div>

          <div
            style={{
              fontSize: '9px',
              color: 'rgba(255,255,255,0.25)',
              textAlign: 'center',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            Hover any board area, then press 1-7 to drop chips instantly. Click a chip to select its
            value.
          </div>
        </aside>
      </div>
    </GameErrorBoundary>
  );
}
