'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Trash2,
  Undo2,
  Zap,
  Flame,
  Snowflake,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Compass,
} from 'lucide-react';

import { useCasinoStore } from '@/store/useCasinoStore';
import { CasinoCore } from '@/lib/casino/casino-core';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { soundManager } from '@/lib/casino/sound-manager';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import {
  ROULETTE_NUMBERS,
  WHEEL_ORDER,
  type BetType,
  type BetPlacement,
  type RouletteNumber,
} from '@/components/casino/games/roulette/types';

// ---------------------------------------------------------------------------
// 1. DEEP-TONE HIGH-CONTRAST VIP CASINO JETONS (4x2 Grid)
// ---------------------------------------------------------------------------

interface ChipDef {
  amount: number;
  label: string;
  baseColor: string;
  stripeColor: string;
  coreBg: string;
  textColor: string;
}

const VIP_CHIPS: ChipDef[] = [
  {
    amount: 1,
    label: '1',
    baseColor: '#64748B',
    stripeColor: '#FFFFFF',
    coreBg: 'radial-gradient(circle at 35% 35%, #334155 0%, #0F172A 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 5,
    label: '5',
    baseColor: '#DC2626',
    stripeColor: '#FCA5A5',
    coreBg: 'radial-gradient(circle at 35% 35%, #991B1B 0%, #450A0A 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 25,
    label: '25',
    baseColor: '#059669',
    stripeColor: '#6EE7B7',
    coreBg: 'radial-gradient(circle at 35% 35%, #065F46 0%, #022C22 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 100,
    label: '100',
    baseColor: '#2563EB',
    stripeColor: '#93C5FD',
    coreBg: 'radial-gradient(circle at 35% 35%, #1E40AF 0%, #172554 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 500,
    label: '500',
    baseColor: '#9333EA',
    stripeColor: '#E9D5FF',
    coreBg: 'radial-gradient(circle at 35% 35%, #6B21A8 0%, #3B0764 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 1000,
    label: '1k',
    baseColor: '#D97706',
    stripeColor: '#FDE68A',
    coreBg: 'radial-gradient(circle at 35% 35%, #92400E 0%, #451A03 100%)',
    textColor: '#FFFFFF',
  },
  {
    amount: 5000,
    label: '5k',
    baseColor: '#AA820A',
    stripeColor: '#FFD700',
    coreBg: 'radial-gradient(circle at 35% 35%, #2A2000 0%, #0A0A0F 100%)',
    textColor: '#FFD700',
  },
];

function getChipDef(amount: number): ChipDef {
  return (
    VIP_CHIPS.find((c) => c.amount === amount) ||
    (amount >= 5000
      ? VIP_CHIPS[6]
      : amount >= 1000
        ? VIP_CHIPS[5]
        : amount >= 500
          ? VIP_CHIPS[4]
          : amount >= 100
            ? VIP_CHIPS[3]
            : amount >= 25
              ? VIP_CHIPS[2]
              : amount >= 5
                ? VIP_CHIPS[1]
                : VIP_CHIPS[0])
  );
}

interface CasinoJetonProps {
  amount?: number;
  label: string;
  baseColor: string;
  stripeColor: string;
  coreBg: string;
  textColor: string;
  size?: number;
  isSelected?: boolean;
  onClick?: () => void;
}

function CasinoJeton({
  label,
  baseColor,
  stripeColor,
  coreBg,
  textColor,
  size = 40,
  isSelected = false,
  onClick,
}: CasinoJetonProps) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isSelected ? 'translateY(-4px) scale(1.08)' : 'none',
        boxShadow: isSelected
          ? '0 0 16px rgba(212, 175, 55, 0.9), 0 8px 16px rgba(0, 0, 0, 0.75)'
          : '0 4px 10px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        border: isSelected ? '2px solid #FFD700' : '1px solid rgba(0, 0, 0, 0.6)',
        background: `conic-gradient(
          from 0deg,
          ${baseColor} 0deg 25deg,
          ${stripeColor} 25deg 45deg,
          ${baseColor} 45deg 70deg,
          ${stripeColor} 70deg 90deg,
          ${baseColor} 90deg 115deg,
          ${stripeColor} 115deg 135deg,
          ${baseColor} 135deg 160deg,
          ${stripeColor} 160deg 180deg,
          ${baseColor} 180deg 205deg,
          ${stripeColor} 205deg 225deg,
          ${baseColor} 225deg 250deg,
          ${stripeColor} 250deg 270deg,
          ${baseColor} 270deg 295deg,
          ${stripeColor} 295deg 315deg,
          ${baseColor} 315deg 340deg,
          ${stripeColor} 340deg 360deg
        )`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* Inner Bezel with Deep-Tone Core & Gold Inlay Edge */}
      <div
        style={{
          width: size >= 32 ? '76%' : '68%',
          height: size >= 32 ? '76%' : '68%',
          borderRadius: '50%',
          background: coreBg,
          border: '1.5px solid rgba(212, 175, 55, 0.9)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontFamily: 'monospace',
          fontWeight: 1000,
          fontSize: size >= 38 ? '0.86rem' : size >= 34 ? '0.82rem' : '0.68rem',
          letterSpacing: '-0.03em',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.95)',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable 3D Table Chip Stack with Integrated Big Amount (Single Display)
// ---------------------------------------------------------------------------

function TableChipStack({ amount, size = 36 }: { amount: number; size?: number }) {
  const chipDef = getChipDef(amount);
  const formattedAmount = amount >= 1000 ? `$${amount / 1000}k` : `$${amount}`;

  return (
    <div className="table-chip-badge">
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 3D Stack Under-layer for depth */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '1px',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.75)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.95)',
            zIndex: 1,
          }}
        />
        {/* Scaled Main Jeton with Integrated Big Amount */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <CasinoJeton
            label={formattedAmount}
            baseColor={chipDef.baseColor}
            stripeColor={chipDef.stripeColor}
            coreBg={chipDef.coreBg}
            textColor={chipDef.textColor}
            size={size}
          />
        </div>
      </div>
    </div>
  );
}

const FRENCH_SECTORS: { label: string; numbers: number[] }[] = [
  { label: 'Jeu Zéro', numbers: [12, 35, 3, 26, 0, 32, 15] },
  { label: 'Voisins', numbers: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25] },
  { label: 'Orphelins', numbers: [1, 20, 14, 31, 9, 17, 34, 6] },
  { label: 'Tiers', numbers: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33] },
];

const OUTSIDE_BETS: { label: string; type: BetType; bg?: string }[] = [
  { label: '1-18', type: { type: 'RANGE', value: '1-18' } },
  { label: 'EVEN', type: { type: 'EVEN_ODD', value: 'EVEN' } },
  {
    label: 'RED',
    type: { type: 'COLOR', value: 'RED' },
    bg: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
  },
  {
    label: 'BLACK',
    type: { type: 'COLOR', value: 'BLACK' },
    bg: 'linear-gradient(135deg, #1e1e2d 0%, #121218 100%)',
  },
  { label: 'ODD', type: { type: 'EVEN_ODD', value: 'ODD' } },
  { label: '19-36', type: { type: 'RANGE', value: '19-36' } },
];

function betTypeKey(type: BetType): string {
  return `${type.type}:${type.value}`;
}

// ---------------------------------------------------------------------------
// 2. 420px MASTER-KESSEL MIT RADIAL-ZENTRIERUNG & SOFT-GOLD-FUGE (Option A)
// ---------------------------------------------------------------------------

interface RouletteWheelProps {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
}

function LuxuryRouletteWheel({ spinning, winningNumber }: RouletteWheelProps) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44; // 184.8px
  const innerR = size * 0.28; // 117.6px
  const pocketCount = WHEEL_ORDER.length; // 37
  const pocketAngle = 360 / pocketCount; // 9.7297 deg

  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [ballRadius, setBallRadius] = useState(size * 0.445);
  const [isRevealing, setIsRevealing] = useState(false);

  const pockets = useMemo(() => {
    return WHEEL_ORDER.map((num, i) => {
      const angle = i * pocketAngle;
      const rad = (angle - 90) * (Math.PI / 180);
      const startAngle = (angle - pocketAngle / 2 - 90) * (Math.PI / 180);
      const endAngle = (angle + pocketAngle / 2 - 90) * (Math.PI / 180);

      const x1 = cx + innerR * Math.cos(startAngle);
      const y1 = cy + innerR * Math.sin(startAngle);
      const x2 = cx + outerR * Math.cos(startAngle);
      const y2 = cy + outerR * Math.sin(startAngle);
      const x3 = cx + outerR * Math.cos(endAngle);
      const y3 = cy + outerR * Math.sin(endAngle);
      const x4 = cx + innerR * Math.cos(endAngle);
      const y4 = cy + innerR * Math.sin(endAngle);

      const path = `M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1} Z`;

      // Symmetrisch zentrierte Ziffernposition (146px)
      const textR = innerR + (outerR - innerR) * 0.42;
      const textX = cx + textR * Math.cos(rad);
      const textY = cy + textR * Math.sin(rad);

      return {
        num,
        angle,
        path,
        x1,
        y1,
        x2,
        y2,
        textX,
        textY,
      };
    });
  }, [cx, cy, innerR, outerR, pocketAngle]);

  useEffect(() => {
    if (!spinning || !winningNumber) {
      return;
    }

    const targetIndex = WHEEL_ORDER.findIndex((rn) => rn.n === winningNumber.n);
    if (targetIndex === -1) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsRevealing(false);

    // Target angle of winning pocket in wheel coordinates
    const targetPocketAngle = targetIndex * pocketAngle;

    // Wheel spins clockwise: 2 full revolutions (720 deg) + offset to land at 12 o'clock
    const wheelSpins = 2 * 360;
    const targetWheelRot = wheelSpins + (360 - (targetPocketAngle % 360));

    // Ball spins counter-clockwise: 6 full revolutions (-2160 deg) and ends exactly at 12 o'clock
    const ballSpins = -6 * 360;

    setWheelRotation((prev) => prev + targetWheelRot);
    setBallRotation((prev) => prev + ballSpins);
    setBallRadius(size * 0.445);

    // 2-Phase ball drop: Outer Orbit (0-4.0s) -> Pocket Drop above number with Fret Clicks (4.0s-6.25s)
    const dropTimer = setTimeout(() => {
      setBallRadius(outerR - 10);
      soundManager.play('chip');
    }, 4000);

    const bounceTimer1 = setTimeout(() => {
      soundManager.play('chip');
    }, 4600);

    const bounceTimer2 = setTimeout(() => {
      soundManager.play('chip');
    }, 5200);

    const revealTimer = setTimeout(() => {
      setIsRevealing(true);
    }, 6000);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(bounceTimer1);
      clearTimeout(bounceTimer2);
      clearTimeout(revealTimer);
    };
  }, [spinning, winningNumber, innerR, outerR, pocketAngle, size]);

  return (
    <div
      data-testid="roulette-wheel"
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '12px 0',
        perspective: '1200px',
      }}
    >
      {/* 420px 3D Isometric Tilt & Soft-Gold Fuge Showcase */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          transform: spinning
            ? 'rotateX(14deg) rotateY(-3deg) scale(1.02)'
            : isRevealing
              ? 'rotateX(6deg) scale(1.04)'
              : 'rotateX(0deg) scale(1)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease',
          background: 'radial-gradient(circle at 40% 35%, #2a1f10 0%, #151109 50%, #060608 100%)',
          boxShadow: isRevealing
            ? '0 0 0 4px rgba(212, 175, 55, 0.28), 0 0 24px rgba(212, 175, 55, 0.35), 0 35px 80px rgba(0, 0, 0, 0.95), inset 0 0 50px rgba(0, 0, 0, 0.9)'
            : '0 0 0 4px rgba(212, 175, 55, 0.12), 0 35px 80px rgba(0, 0, 0, 0.95), inset 0 0 50px rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Synchronously Rotating Kessel: Numbers Ring + Messing Turret */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: spinning
              ? 'transform 6.25s cubic-bezier(0.2, 0.85, 0.25, 1)'
              : 'transform 0.5s ease-out',
            willChange: 'transform',
          }}
        >
          {/* Außen- und Innenringe mit 24k Goldglanz */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 4}
            fill="none"
            stroke="rgba(212, 175, 55, 0.65)"
            strokeWidth={3.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerR - 1}
            fill="none"
            stroke="rgba(212, 175, 55, 0.5)"
            strokeWidth={2}
          />

          {/* 37 Zahlenfächer mit Gold-Trennungen & radial zentrierter Typografie */}
          {pockets.map((p, i) => {
            const isWinning = !spinning && winningNumber?.n === p.num.n;
            return (
              <g key={`pocket-${i}`}>
                {/* Zahlenfach-Sektor */}
                <path
                  d={p.path}
                  fill={
                    isWinning
                      ? '#FFD700'
                      : p.num.c === 'GREEN'
                        ? '#059669'
                        : p.num.c === 'RED'
                          ? '#DC2626'
                          : '#12121A'
                  }
                  stroke="rgba(212, 175, 55, 0.45)"
                  strokeWidth={1}
                />

                {/* Metallischer Trennsteg (Fret line) */}
                <line
                  x1={p.x1}
                  y1={p.y1}
                  x2={p.x2}
                  y2={p.y2}
                  stroke="rgba(212, 175, 55, 0.85)"
                  strokeWidth={1.5}
                />

                {/* Zentrierte Vektor-Ziffer (12.5px) */}
                <text
                  x={p.textX}
                  y={p.textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isWinning ? '#000000' : '#FFFFFF'}
                  fontSize="12.5"
                  fontWeight="1000"
                  fontFamily="monospace"
                  transform={`rotate(${p.angle}, ${p.textX}, ${p.textY})`}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {p.num.n}
                </text>
              </g>
            );
          })}

          {/* 3D Messing-Turret (Direkt im SVG-Kessel verankert für 100% Synchrondrehung) */}
          <g>
            {/* Turret Konus */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR - 2}
              fill="url(#brassTurretGrad)"
              stroke="rgba(255, 215, 0, 0.7)"
              strokeWidth={2}
            />
            {/* 8 Filigrane Kreuzspeichen */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={`spoke-${deg}`}
                x1={cx}
                y1={cy}
                x2={cx + (innerR - 4) * Math.cos((deg * Math.PI) / 180)}
                y2={cy + (innerR - 4) * Math.sin((deg * Math.PI) / 180)}
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={2.5}
              />
            ))}
            {/* Zentraler Rubin/Obsidian-Knauf mit Goldfassung */}
            <circle
              cx={cx}
              cy={cy}
              r={18}
              fill="url(#rubyCenterGrad)"
              stroke="#FFD700"
              strokeWidth={2}
            />
          </g>

          {/* Defs für metallische Farbverläufe */}
          <defs>
            <radialGradient id="brassTurretGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF099" />
              <stop offset="35%" stopColor="#FFD700" />
              <stop offset="70%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#4A3500" />
            </radialGradient>
            <radialGradient id="rubyCenterGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#3B0764" />
              <stop offset="60%" stopColor="#1E1035" />
              <stop offset="100%" stopColor="#06060A" />
            </radialGradient>
          </defs>
        </svg>

        {/* Echter 2-Phasen Orbital-Kugellauf mit Gold-Lichtschweif (Gegen den Uhrzeigersinn) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `rotate(${ballRotation}deg)`,
            transition: spinning
              ? 'transform 6.25s cubic-bezier(0.2, 0.85, 0.25, 1)'
              : 'transform 0.5s ease-out',
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          {/* Elfenbeinkugel mit dynamischem Gold-Partikel-Schweif */}
          <div
            style={{
              position: 'absolute',
              top: `${cy - ballRadius}px`,
              left: `${cx}px`,
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 30%, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)',
              boxShadow: spinning
                ? '0 0 25px rgba(255, 255, 255, 1), 0 0 15px rgba(212, 175, 55, 0.9), 0 0 35px rgba(212, 175, 55, 0.6), 0 4px 10px rgba(0, 0, 0, 0.9)'
                : '0 0 16px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)',
              transition: 'top 2.25s cubic-bezier(0.34, 1.4, 0.64, 1)',
              zIndex: 35,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function RouletteClient() {
  const isMobile = useCasinoStore((state) => state.isMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const balance = useCasinoStore((state) => state.balance);
  const provablyFairSettings = useCasinoStore((state) => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore((state) => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore((state) => state.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((state) => state.applyServerWalletSnapshot);
  const addToast = useCasinoStore((state) => state.addToast);
  const isProcessing = useCasinoStore((state) => state.isProcessing);
  const setIsProcessing = useCasinoStore((state) => state.setIsProcessing);
  const gameConfig = useCasinoStore((state) => state.gameConfig);

  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [currentBets, setCurrentBets] = useState<BetPlacement[]>([]);
  const [betHistory, setBetHistory] = useState<BetPlacement[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<RouletteNumber | null>(null);
  const [history, setHistory] = useState<RouletteNumber[]>([]);
  const [showRacetrack, setShowRacetrack] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<BetType | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);
  const [feltFlash, setFeltFlash] = useState(false);

  // Session stats
  const [sessionStats, setSessionStats] = useState({
    rounds: 0,
    wins: 0,
    profit: 0,
  });

  // Auto-Pilot state
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoBetSettings, setAutoBetSettings] = useState({
    numberOfBets: 0,
    stopOnProfit: 0,
    stopOnLoss: 0,
  });
  const [autoCount, setAutoCount] = useState(0);

  const totalBetAmount = useMemo(
    () => currentBets.reduce((sum, b) => sum + b.amount, 0),
    [currentBets],
  );

  const maxPotentialWin = useMemo(() => {
    if (currentBets.length === 0) return 0;
    let maxWin = 0;
    for (let i = 0; i <= 36; i++) {
      let winForNumber = 0;
      for (const bet of currentBets) {
        if (CasinoCore.isRouletteWin(bet.type as never, i)) {
          winForNumber +=
            bet.amount * CasinoCore.getRouletteMultiplier(bet.type as never, gameConfig);
        }
      }
      maxWin = Math.max(maxWin, winForNumber);
    }
    return maxWin;
  }, [currentBets, gameConfig]);

  // Sector Stats (Only evaluated with >= 5 history rounds)
  const sectorStats = useMemo(() => {
    if (history.length < 5) {
      return { hot: [], cold: [] };
    }
    const counts: Record<number, number> = {};
    history.forEach((h) => {
      counts[h.n] = (counts[h.n] || 0) + 1;
    });

    // Sort by count descending
    const sorted = Object.entries(counts)
      .map(([n, count]) => ({
        n: Number(n),
        count,
        c: ROULETTE_NUMBERS.find((r) => r.n === Number(n))?.c ?? 'GREEN',
      }))
      .sort((a, b) => b.count - a.count);

    const hot = sorted.slice(0, 3);
    const hitSet = new Set(sorted.map((s) => s.n));
    const unhit = ROULETTE_NUMBERS.filter((rn) => !hitSet.has(rn.n)).slice(0, 3);
    const cold = unhit.length >= 3 ? unhit : [...unhit, ...sorted.slice(-3)].slice(0, 3);

    return {
      hot,
      cold,
    };
  }, [history]);

  // Betting handlers (Left-Click to Add, Right-Click to Subtract)
  const handlePlaceBet = (type: BetType, amountToAdd = selectedChip) => {
    if (spinning || isProcessing) return;
    if (totalBetAmount + amountToAdd > balance) {
      addToast('Insufficient balance!', 'error');
      return;
    }
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    const key = betTypeKey(type);
    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], amount: next[idx].amount + amountToAdd };
        return next;
      }
      return [...prev, { id: crypto.randomUUID(), type, amount: amountToAdd }];
    });
  };

  const handleRemoveBet = (type: BetType, amountToSub = selectedChip) => {
    if (spinning || isProcessing) return;
    const key = betTypeKey(type);
    const existing = currentBets.find((b) => betTypeKey(b.type) === key);
    if (!existing) return;

    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    setCurrentBets((prev) => {
      const idx = prev.findIndex((b) => betTypeKey(b.type) === key);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].amount <= amountToSub) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], amount: next[idx].amount - amountToSub };
      }
      return next;
    });
  };

  const handleClearBets = () => {
    if (spinning || isProcessing || currentBets.length === 0) return;
    soundManager.play('click');
    setBetHistory((prev) => [...prev, currentBets]);
    setCurrentBets([]);
  };

  const handleUndo = () => {
    if (spinning || isProcessing || betHistory.length === 0) return;
    soundManager.play('click');
    const last = betHistory[betHistory.length - 1];
    setBetHistory((prev) => prev.slice(0, -1));
    setCurrentBets(last || []);
  };

  const handleDoubleBets = () => {
    if (spinning || isProcessing || currentBets.length === 0) return;
    if (totalBetAmount * 2 > balance) {
      addToast('Insufficient balance to double bets!', 'error');
      return;
    }
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);
    setCurrentBets((prev) => prev.map((b) => ({ ...b, amount: b.amount * 2 })));
  };

  const handleFrenchBet = (numbers: number[]) => {
    if (spinning || isProcessing) return;
    const unitAmount = selectedChip;
    if (totalBetAmount + unitAmount * numbers.length > balance) {
      addToast('Insufficient balance for sector bet!', 'error');
      return;
    }
    soundManager.play('chip');
    setBetHistory((prev) => [...prev, currentBets]);

    setCurrentBets((prev) => {
      const next = [...prev];
      numbers.forEach((num) => {
        const type: BetType = { type: 'STRAIGHT', value: num };
        const key = betTypeKey(type);
        const idx = next.findIndex((b) => betTypeKey(b.type) === key);
        if (idx !== -1) {
          next[idx] = { ...next[idx], amount: next[idx].amount + unitAmount };
        } else {
          next.push({ id: crypto.randomUUID(), type, amount: unitAmount });
        }
      });
      return next;
    });
  };

  const lastSpinTimeRef = useRef(0);

  // Spin Logic
  const handleSpin = useCallback(async () => {
    if (spinning || isProcessing) return;
    if (currentBets.length === 0) {
      // Trigger visual guide flash on table
      setFeltFlash(true);
      setTimeout(() => setFeltFlash(false), 600);
      addToast('Please place at least one chip on the table!', 'info');
      return;
    }
    const now = Date.now();
    if (now - lastSpinTimeRef.current < 200) return;
    lastSpinTimeRef.current = now;

    const betError = validateBet(totalBetAmount, balance);
    if (betError) {
      setAutoRunning(false);
      addToast(betError, 'error');
      return;
    }

    setSpinning(true);
    setIsProcessing(true);
    soundManager.play('roulette-spin');

    try {
      const sanitizedClientSeed = sanitizeClientSeed(provablyFairSettings.clientSeed);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      let response: Response;
      try {
        response = await fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            gameType: 'ROULETTE',
            amount: totalBetAmount,
            bets: currentBets.map((b) => ({
              amount: b.amount,
              type: b.type,
            })),
            clientSeed: sanitizedClientSeed,
            currentNonce: provablyFairSettings.nonce,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429 || errData.error?.code === 'RATE_LIMITED') {
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error(
          getApiErrorMessage(errData, 'Der Einsatz konnte nicht verarbeitet werden.'),
        );
      }

      const result = await response.json();
      const winningNumObj = ROULETTE_NUMBERS.find((n) => n.n === result.roll) ?? {
        n: result.roll,
        c: 'GREEN',
      };
      setWinningNumber(winningNumObj);

      // Wait for cinematic wheel animation (6.25s)
      setTimeout(() => {
        setSpinning(false);
        setIsProcessing(false);
        setHistory((prev) => [winningNumObj, ...prev].slice(0, 18));
        setLastWinAmount(result.payout);
        setLastMultiplier(
          result.payout > 0 ? parseFloat((result.payout / totalBetAmount).toFixed(2)) : 0,
        );

        setProvablyFairSettings({
          serverSeedHash: result.serverSeedHash,
          nonce: result.nonce,
        });
        applyServerWalletSnapshot(result.wallet);
        processGameResult({
          game: 'ROULETTE',
          amount: totalBetAmount,
          multiplier: result.payout > 0 ? result.payout / totalBetAmount : 0,
          payout: result.payout,
          win: result.win,
          resultId: result.id,
          isFirstBet: result.isFirstBet,
        });

        setSessionStats((prev) => ({
          rounds: prev.rounds + 1,
          wins: prev.wins + (result.win ? 1 : 0),
          profit: prev.profit + (result.win ? result.payout - totalBetAmount : -totalBetAmount),
        }));

        if (result.win) {
          soundManager.play('win');
        }
      }, 6250);
    } catch (error) {
      setSpinning(false);
      setIsProcessing(false);
      setAutoRunning(false);
      CasinoLogger.error('Roulette', 'Spin error', error);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Spin failed. Please try again.', 'error');
      }
    }
  }, [
    spinning,
    isProcessing,
    currentBets,
    totalBetAmount,
    balance,
    provablyFairSettings,
    applyServerWalletSnapshot,
    processGameResult,
    setProvablyFairSettings,
    setIsProcessing,
    addToast,
  ]);

  // Auto-Bet Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning && !spinning && !isProcessing && currentBets.length > 0) {
      const maxAllowed = autoBetSettings.numberOfBets > 0 ? autoBetSettings.numberOfBets : 500;
      if (autoCount >= maxAllowed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast(`Auto-bet stopped: Reached limit of ${maxAllowed} spins`, 'info');
        return;
      }
      if (autoBetSettings.stopOnProfit > 0 && sessionStats.profit >= autoBetSettings.stopOnProfit) {
        setAutoRunning(false);
        addToast('Auto-bet stopped: Profit goal reached!', 'success');
        return;
      }
      if (
        autoBetSettings.stopOnLoss > 0 &&
        Math.abs(sessionStats.profit) >= autoBetSettings.stopOnLoss &&
        sessionStats.profit < 0
      ) {
        setAutoRunning(false);
        addToast('Auto-bet stopped: Loss limit reached', 'info');
        return;
      }

      timer = setTimeout(() => {
        handleSpin();
        setAutoCount((prev) => prev + 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [
    autoRunning,
    spinning,
    isProcessing,
    currentBets,
    autoBetSettings,
    autoCount,
    sessionStats.profit,
    addToast,
    handleSpin,
  ]);

  // Spacebar & Enter Keydown Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!spinning && !isProcessing && currentBets.length > 0) {
          handleSpin();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinning, isProcessing, currentBets, handleSpin]);

  if (!mounted) return null;

  return (
    <GameErrorBoundary gameName="Roulette">
      <div
        className="roulette-page"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '330px 1fr',
          gap: isMobile ? '12px' : '20px',
          padding: isMobile ? '12px' : '20px',
          maxWidth: '1600px',
          width: '100%',
          minWidth: 0,
          margin: '0 auto',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      >
        <style>{`
        .roulette-page {
          display: grid;
          grid-template-columns: 330px 1fr;
          gap: 20px;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        @media (max-width: 1024px) {
          .roulette-page {
            grid-template-columns: 1fr;
          }
          .roulette-left {
            order: 2 !important;
            width: 100% !important;
            min-width: 0 !important;
          }
          .roulette-center {
            order: 1 !important;
            min-width: 0;
            width: 100%;
          }
        }
        .obsidian-glass {
          background: rgba(14, 14, 20, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(212, 175, 55, 0.15);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .gold-btn {
          background: linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8860B 100%);
          color: #050508;
          font-weight: 900;
          box-shadow: 0 6px 25px rgba(212, 175, 55, 0.35);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gold-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(212, 175, 55, 0.5);
          filter: brightness(1.1);
        }
        .gold-btn-inactive {
          background: rgba(212, 175, 55, 0.12);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: #FFD700;
          font-weight: 900;
          transition: all 0.2s ease;
        }
        .gold-btn-inactive:hover {
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.6);
          transform: translateY(-1px);
        }
        .quick-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 8px 0;
          border-radius: 8px;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .quick-chip:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: #FFD700;
          transform: translateY(-1px);
        }
        .quick-chip:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .felt-cell {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-weight: 900;
          font-family: monospace;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
        }
        .felt-cell:hover {
          filter: brightness(1.3);
          transform: scale(1.02);
          z-index: 10;
        }
        .table-chip-badge {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 20;
        }
      `}</style>

        {/* 0. SIDEBAR: OBSIDIAN & GOLD FLIGHT CONTROLS */}
        <div
          className="roulette-left sidebar-left obsidian-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '20px',
            borderRadius: '24px',
            order: isMobile ? 2 : 1,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                <Zap size={18} color="#FFD700" />
              </div>
              <h3
                style={{
                  margin: 0,
                  letterSpacing: '1.5px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  color: '#FFF',
                }}
              >
                ROULETTE CONTROLS
              </h3>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#4ade80',
                fontSize: '0.7rem',
                fontWeight: 800,
              }}
            >
              <span>2.7% EDGE</span>
            </div>
          </div>

          {/* Mode Switcher: Manual / Auto Pilot */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <button
              onClick={() => {
                if (!autoRunning) setIsAutoMode(false);
              }}
              disabled={autoRunning}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: !isAutoMode
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'transparent',
                color: !isAutoMode ? '#FFD700' : '#64748b',
                border: !isAutoMode ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                cursor: autoRunning ? 'not-allowed' : 'pointer',
              }}
            >
              Manual
            </button>
            <button
              onClick={() => {
                if (!autoRunning) setIsAutoMode(true);
              }}
              disabled={autoRunning}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 800,
                background: isAutoMode
                  ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%)'
                  : 'transparent',
                color: isAutoMode ? '#FFD700' : '#64748b',
                border: isAutoMode ? '1px solid rgba(212, 175, 55, 0.4)' : 'none',
                cursor: autoRunning ? 'not-allowed' : 'pointer',
              }}
            >
              Auto Pilot
            </button>
          </div>

          {/* 1. DEEP-TONE HIGH-CONTRAST VIP CASINO JETONS (4x2 Grid) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '1px',
                }}
              >
                SELECT CHIP VALUE
              </label>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#FFD700',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                }}
              >
                ${balance.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.45)',
                padding: '12px 10px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                alignItems: 'center',
                justifyItems: 'center',
              }}
            >
              {VIP_CHIPS.map((chip) => {
                const isSelected = selectedChip === chip.amount;
                return (
                  <CasinoJeton
                    key={chip.amount}
                    amount={chip.amount}
                    label={chip.label}
                    baseColor={chip.baseColor}
                    stripeColor={chip.stripeColor}
                    coreBg={chip.coreBg}
                    textColor={chip.textColor}
                    size={40}
                    isSelected={isSelected}
                    onClick={() => setSelectedChip(chip.amount)}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Action Modifiers (Clear, Undo, Double) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              className="quick-chip"
              disabled={spinning || isProcessing || currentBets.length === 0}
              onClick={handleClearBets}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </div>
            </button>
            <button
              className="quick-chip"
              disabled={spinning || isProcessing || betHistory.length === 0}
              onClick={handleUndo}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <Undo2 size={12} />
                <span>Undo</span>
              </div>
            </button>
            <button
              className="quick-chip"
              disabled={spinning || isProcessing || currentBets.length === 0}
              onClick={handleDoubleBets}
              style={{ color: '#FFD700' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={12} />
                <span>2× Bet</span>
              </div>
            </button>
          </div>

          {/* Total Bet & Max Potential Win HUD */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>
                TOTAL STAKE
              </div>
              <div
                style={{
                  color: '#FFF',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                ${totalBetAmount.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>
                MAX POTENTIAL WIN
              </div>
              <div
                style={{
                  color: '#4ade80',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  fontSize: '1.1rem',
                }}
              >
                ${maxPotentialWin.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Auto Mode Config Section */}
          {isAutoMode && (
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={14} color="#94a3b8" />
                <label
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    letterSpacing: '1px',
                  }}
                >
                  AUTO PILOT CONFIG
                </label>
              </div>
              <div>
                <label
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748b',
                    fontWeight: 700,
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  NUMBER OF SPINS (0 = ∞)
                </label>
                <input
                  type="number"
                  disabled={autoRunning}
                  value={autoBetSettings.numberOfBets}
                  onChange={(e) =>
                    setAutoBetSettings((prev) => ({
                      ...prev,
                      numberOfBets: Number(e.target.value),
                    }))
                  }
                  style={{
                    width: '100%',
                    height: '36px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#FFF',
                    padding: '0 10px',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                  }}
                  placeholder="∞"
                />
              </div>
            </div>
          )}

          {/* Session Performance Card */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}
            >
              <TrendingUp size={14} color="#94a3b8" />
              <label
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '1px',
                }}
              >
                SESSION PERFORMANCE
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700 }}>
                  ROUNDS / WIN RATE
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#FFF',
                    fontSize: '0.85rem',
                  }}
                >
                  {sessionStats.rounds}{' '}
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    (
                    {sessionStats.rounds > 0
                      ? `${((sessionStats.wins / sessionStats.rounds) * 100).toFixed(0)}%`
                      : '—'}
                    )
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700 }}>
                  NET PROFIT
                </div>
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: sessionStats.profit >= 0 ? '#4ade80' : '#f87171',
                  }}
                >
                  {sessionStats.profit >= 0 ? '+' : ''}${sessionStats.profit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Spin Button */}
          <button
            key="roulette-spin-btn"
            className={currentBets.length > 0 ? 'gold-btn' : 'gold-btn-inactive'}
            style={{
              width: '100%',
              height: isMobile ? '60px' : '68px',
              fontSize: '1.2rem',
              borderRadius: '18px',
              cursor: spinning || isProcessing ? 'not-allowed' : 'pointer',
              opacity: spinning || isProcessing ? 0.6 : 1,
            }}
            onClick={() => {
              if (isAutoMode) {
                setAutoRunning(!autoRunning);
              } else {
                handleSpin();
              }
            }}
            disabled={spinning || isProcessing}
          >
            {spinning || isProcessing
              ? 'SPINNING...'
              : isAutoMode
                ? autoRunning
                  ? 'STOP AUTOBET'
                  : 'START AUTOBET'
                : currentBets.length > 0
                  ? `SPIN WHEEL ($${totalBetAmount.toFixed(2)}) (SPACE)`
                  : 'PLACE BETS ON TABLE'}
          </button>

          {/* Provably Fair Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#64748b',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} color="#D4AF37" />
            <span>PROVABLY FAIR SYSTEM ACTIVE</span>
          </div>
        </div>

        {/* 2 & 3. MAIN GAME STAGE & MASTER BETTING FELT */}
        <div
          className="roulette-center game-area obsidian-glass"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: isMobile ? '16px' : '24px',
            borderRadius: '28px',
            order: isMobile ? 1 : 2,
            minWidth: 0,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(circle at 50% 30%, #12121c 0%, #06060a 100%)',
          }}
        >
          {/* Subtle Isometric Background Lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.04,
              backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.4) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Top Bar: Hot & Cold + Last 18 History Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 5,
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            {/* Hot & Cold Pills or Accumulating Badge */}
            {history.length < 5 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#D4AF37',
                    boxShadow: '0 0 6px rgba(212, 175, 55, 0.8)',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#94a3b8',
                    letterSpacing: '0.5px',
                  }}
                >
                  ACCUMULATING STATS ({history.length}/5 SPINS)...
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={14} color="#f97316" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f97316' }}>
                    HOT:
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {sectorStats.hot.map((h) => (
                      <span
                        key={h.n}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          color:
                            h.c === 'RED' ? '#f87171' : h.c === 'BLACK' ? '#cbd5e1' : '#4ade80',
                        }}
                      >
                        {h.n}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Snowflake size={14} color="#38bdf8" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>
                    COLD:
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {sectorStats.cold.map((c) => (
                      <span
                        key={c.n}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          color:
                            c.c === 'RED' ? '#f87171' : c.c === 'BLACK' ? '#cbd5e1' : '#4ade80',
                        }}
                      >
                        {c.n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Last 18 Number Badges */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                maxWidth: '100%',
              }}
            >
              {history.map((h, i) => (
                <div
                  key={`${h.n}-${i}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: '#FFF',
                    background: h.c === 'GREEN' ? '#059669' : h.c === 'RED' ? '#dc2626' : '#1e1e2d',
                    border: `1px solid ${
                      h.c === 'GREEN'
                        ? 'rgba(16, 185, 129, 0.4)'
                        : h.c === 'RED'
                          ? 'rgba(239, 68, 68, 0.4)'
                          : 'rgba(255, 255, 255, 0.15)'
                    }`,
                    boxShadow: i === 0 ? '0 0 10px rgba(212, 175, 55, 0.6)' : 'none',
                  }}
                >
                  {h.n}
                </div>
              ))}
            </div>
          </div>

          {/* 2. 420px MASTER-KESSEL SHOWCASE & WINNER REVEAL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 5,
            }}
          >
            <LuxuryRouletteWheel spinning={spinning} winningNumber={winningNumber} />

            {/* Winner Number Reveal HUD */}
            <AnimatePresence>
              {!spinning && winningNumber && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'rgba(14, 14, 20, 0.95)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    padding: '8px 24px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.3)',
                    marginTop: '-20px',
                    zIndex: 40,
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      color: '#FFF',
                      background:
                        winningNumber.c === 'GREEN'
                          ? '#059669'
                          : winningNumber.c === 'RED'
                            ? '#dc2626'
                            : '#1e1e2d',
                      boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {winningNumber.n}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                      {winningNumber.c}{' '}
                      {winningNumber.n === 0 ? 'ZERO' : winningNumber.n % 2 === 0 ? 'EVEN' : 'ODD'}
                    </div>
                    {lastWinAmount !== null && lastWinAmount > 0 ? (
                      <div
                        style={{
                          color: '#4ade80',
                          fontWeight: 900,
                          fontFamily: 'monospace',
                          fontSize: '1.15rem',
                        }}
                      >
                        +${lastWinAmount.toFixed(2)} ({lastMultiplier}×)
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontWeight: 800, fontSize: '0.85rem' }}>
                        NO WIN
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* French Racetrack Sector Quick Bets Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setShowRacetrack(!showRacetrack)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: showRacetrack
                  ? 'rgba(212, 175, 55, 0.25)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#FFD700',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Compass size={14} />
              <span>{showRacetrack ? 'HIDE FRENCH RACETRACK' : 'SHOW FRENCH RACETRACK'}</span>
            </button>
          </div>

          {/* French Racetrack Sectors */}
          {showRacetrack && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '12px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 175, 55, 0.2)',
              }}
            >
              {FRENCH_SECTORS.map((sec) => (
                <button
                  key={sec.label}
                  className="quick-chip"
                  onClick={() => handleFrenchBet(sec.numbers)}
                  style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ color: '#FFD700', fontWeight: 900 }}>{sec.label}</span>
                  <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                    ({sec.numbers.length} Numbers)
                  </span>
                </button>
              ))}
            </motion.div>
          )}

          {/* MASTER-FELT MIT DEAD-CENTER-TYPOGRAFIE & SKALIERTEN 54PX KOMFORT-ZELLEN (Option A) */}
          <div
            className="roulette-board"
            style={{
              background: '#09090e',
              border: feltFlash ? '2px solid #FFD700' : '2px solid rgba(212, 175, 55, 0.35)',
              borderRadius: '24px',
              padding: '18px 16px',
              boxShadow: feltFlash
                ? '0 0 25px rgba(212, 175, 55, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.9)'
                : 'inset 0 0 30px rgba(0, 0, 0, 0.9), 0 10px 30px rgba(0, 0, 0, 0.5)',
              overflowX: 'auto',
              position: 'relative',
              transition: 'border 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <div
              style={{
                minWidth: '880px',
                display: 'grid',
                gridTemplateColumns: '72px 1fr 64px',
                gap: '5px',
              }}
            >
              {/* Green Zero Cell (Dead Center, Left-Click Add, Right-Click Subtract) */}
              <div
                className="felt-cell"
                onClick={() => handlePlaceBet({ type: 'STRAIGHT', value: 0 })}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleRemoveBet({ type: 'STRAIGHT', value: 0 });
                }}
                onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: 0 })}
                onMouseLeave={() => setHoveredArea(null)}
                style={{
                  gridRow: 'span 3',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  borderRadius: '14px 0 0 14px',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#FFF',
                  fontSize: '1.6rem',
                  fontWeight: 1000,
                  boxShadow:
                    winningNumber?.n === 0 && !spinning
                      ? '0 0 25px rgba(16, 185, 129, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.5)'
                      : 'none',
                }}
              >
                0{/* Placed Chip Badge */}
                {(() => {
                  const bet = currentBets.find((b) => betTypeKey(b.type) === 'STRAIGHT:0');
                  if (!bet) return null;
                  return <TableChipStack amount={bet.amount} size={38} />;
                })()}
              </div>

              {/* 36 Numbers Grid (3 Rows x 12 Cols, 54px Height, Left-Click Add, Right-Click Subtract) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, 1fr)',
                  gridTemplateRows: 'repeat(3, 54px)',
                  gap: '5px',
                }}
              >
                {[
                  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
                  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
                  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
                ].map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    {row.map((num) => {
                      const numData = ROULETTE_NUMBERS.find((rn) => rn.n === num)!;
                      const isWin = winningNumber?.n === num && !spinning;
                      const bet = currentBets.find((b) => betTypeKey(b.type) === `STRAIGHT:${num}`);
                      const isHovered =
                        hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === num;

                      return (
                        <div
                          key={num}
                          className="felt-cell"
                          onClick={() => handlePlaceBet({ type: 'STRAIGHT', value: num })}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleRemoveBet({ type: 'STRAIGHT', value: num });
                          }}
                          onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: num })}
                          onMouseLeave={() => setHoveredArea(null)}
                          style={{
                            background:
                              numData.c === 'RED'
                                ? 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)'
                                : 'linear-gradient(135deg, #181822 0%, #0f0f15 100%)',
                            border: isHovered
                              ? '1.5px solid #FFD700'
                              : '1px solid rgba(212, 175, 55, 0.28)',
                            borderRadius: '8px',
                            color: '#FFF',
                            fontSize: '1.3rem',
                            fontWeight: 1000,
                            boxShadow: isWin
                              ? '0 0 25px rgba(255, 215, 0, 0.9), inset 0 0 15px rgba(255, 255, 255, 0.6)'
                              : 'none',
                          }}
                        >
                          {num}
                          {bet && <TableChipStack amount={bet.amount} size={36} />}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* 2:1 Column Bets (54px Height, Left-Click Add, Right-Click Subtract) */}
              <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 54px)', gap: '5px' }}>
                {[1, 2, 3].map((col) => {
                  const bet = currentBets.find((b) => betTypeKey(b.type) === `COLUMN:${col}`);
                  return (
                    <div
                      key={col}
                      className="felt-cell"
                      onClick={() => handlePlaceBet({ type: 'COLUMN', value: col as 1 | 2 | 3 })}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleRemoveBet({ type: 'COLUMN', value: col as 1 | 2 | 3 });
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(212, 175, 55, 0.28)',
                        borderRadius: '0 8px 8px 0',
                        color: '#FFD700',
                        fontSize: '0.95rem',
                        fontWeight: 900,
                      }}
                    >
                      2:1
                      {bet && <TableChipStack amount={bet.amount} size={36} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dozen Bets (48px Height, Left-Click Add, Right-Click Subtract) */}
            <div
              style={{
                minWidth: '880px',
                display: 'grid',
                gridTemplateColumns: '72px repeat(3, 1fr) 64px',
                gap: '5px',
                marginTop: '5px',
              }}
            >
              <div />
              {[
                { label: '1st 12', val: 1 },
                { label: '2nd 12', val: 2 },
                { label: '3rd 12', val: 3 },
              ].map((dz) => {
                const bet = currentBets.find((b) => betTypeKey(b.type) === `DOZEN:${dz.val}`);
                return (
                  <div
                    key={dz.val}
                    className="felt-cell"
                    onClick={() => handlePlaceBet({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 })}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleRemoveBet({ type: 'DOZEN', value: dz.val as 1 | 2 | 3 });
                    }}
                    style={{
                      height: '48px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '10px',
                      color: '#FFD700',
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      letterSpacing: '1px',
                    }}
                  >
                    {dz.label}
                    {bet && <TableChipStack amount={bet.amount} size={38} />}
                  </div>
                );
              })}
              <div />
            </div>

            {/* Outside Bets (52px Height, Left-Click Add, Right-Click Subtract) */}
            <div
              style={{
                minWidth: '880px',
                display: 'grid',
                gridTemplateColumns: '72px repeat(6, 1fr) 64px',
                gap: '5px',
                marginTop: '5px',
              }}
            >
              <div />
              {OUTSIDE_BETS.map((ob) => {
                const key = betTypeKey(ob.type);
                const bet = currentBets.find((b) => betTypeKey(b.type) === key);
                return (
                  <div
                    key={ob.label}
                    data-testid={ob.label === 'RED' ? 'roulette-bet-red' : undefined}
                    className="felt-cell"
                    onClick={() => handlePlaceBet(ob.type)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleRemoveBet(ob.type);
                    }}
                    style={{
                      height: '52px',
                      background: ob.bg || 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {ob.label}
                    {bet && <TableChipStack amount={bet.amount} size={38} />}
                  </div>
                );
              })}
              <div />
            </div>
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
