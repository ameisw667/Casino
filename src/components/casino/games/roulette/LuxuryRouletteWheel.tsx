'use client';

import { useEffect, useMemo, useState } from 'react';
import { soundManager } from '@/lib/casino/sound-manager';
import { WHEEL_ORDER, type RouletteNumber } from './types';

// ---------------------------------------------------------------------------
// 2. 420px MASTER-KESSEL MIT RADIAL-ZENTRIERUNG & SOFT-GOLD-FUGE (Option A)
// ---------------------------------------------------------------------------

interface RouletteWheelProps {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
}

export function LuxuryRouletteWheel({ spinning, winningNumber }: RouletteWheelProps) {
  // Responsive Rad-Größe: auf <=768px auf Viewport-breite skalieren, damit das
  // 420px-Rad auf 375px nicht horizontal überfließt. Interne Geometrie (cx/cy/ Radien/
  // pockets-Memo) leitet sich vollständig von `size` ab und skaliert automatisch mit.
  // Desktop (>=769px) bleibt bei fixen 420px — unverändert.
  const [size, setSize] = useState(420);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const w = window.innerWidth;
      setSize(w < 768 ? Math.min(420, w - 32) : 420);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

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
