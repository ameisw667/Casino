'use client';

import { useEffect, useMemo, useState } from 'react';
import { soundManager } from '@/lib/casino/sound-manager';
import { WHEEL_ORDER, type RouletteNumber } from './types';

// ---------------------------------------------------------------------------
// PHOTOREALISTIC MASTER CASINO ROULETTE ENGINE (TCS John Huxley Mark VII Standard)
// ---------------------------------------------------------------------------

interface RouletteWheelProps {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
  onSettled?: (winningNumber: RouletteNumber) => void;
}

export function LuxuryRouletteWheel({ spinning, winningNumber, onSettled }: RouletteWheelProps) {
  const [size, setSize] = useState(440);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const compute = () => {
      const w = window.innerWidth;
      setSize(w < 768 ? Math.min(440, w - 32) : 440);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.435; // 191.4px
  const innerR = size * 0.275; // 121px
  const pocketCount = WHEEL_ORDER.length; // 37
  const pocketAngle = 360 / pocketCount; // 9.7297 deg

  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [ballRadius, setBallRadius] = useState(size * 0.445);
  const [ballBounce, setBallBounce] = useState({
    r: 0,
    scale: 1,
    shadowOffset: 4,
    shadowOpacity: 0.8,
  });
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

      const textR = innerR + (outerR - innerR) * 0.43;
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

    const targetPocketAngle = targetIndex * pocketAngle;
    const wheelSpins = 2 * 360;
    const ballSpins = -6 * 360;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(callback, delay);
      timers.push(timer);
    };

    const animationFrame = requestAnimationFrame(() => {
      // Strict reset: No winner highlight until exact physical rest at 6.25s.
      setIsRevealing(false);
      setBallBounce({ r: 0, scale: 1, shadowOffset: 4, shadowOpacity: 0.8 });

      setWheelRotation((prev) => {
        const currentNorm = ((prev % 360) + 360) % 360;
        const neededDeg = (360 - (targetPocketAngle % 360) - currentNorm + 720) % 360;
        return prev + wheelSpins + neededDeg;
      });
      setBallRotation((prev) => prev + ballSpins);
      setBallRadius(size * 0.445);

      schedule(() => {
        setBallRadius(innerR + (outerR - innerR) * 0.68);
        setBallBounce({ r: 0, scale: 1.02, shadowOffset: 6, shadowOpacity: 0.85 });
      }, 3600);
      schedule(() => {
        soundManager.play('chip');
        setBallBounce({ r: 9.5, scale: 1.28, shadowOffset: 15, shadowOpacity: 0.38 });
        schedule(
          () => setBallBounce({ r: -3.8, scale: 0.92, shadowOffset: 2, shadowOpacity: 0.92 }),
          160,
        );
      }, 4500);
      schedule(() => {
        soundManager.play('chip');
        setBallBounce({ r: 6.5, scale: 1.18, shadowOffset: 10, shadowOpacity: 0.52 });
        schedule(
          () => setBallBounce({ r: -2.2, scale: 0.95, shadowOffset: 2, shadowOpacity: 0.92 }),
          140,
        );
      }, 4980);
      schedule(() => {
        soundManager.play('chip');
        setBallBounce({ r: 3.8, scale: 1.1, shadowOffset: 6.5, shadowOpacity: 0.68 });
        schedule(
          () => setBallBounce({ r: -1.2, scale: 0.97, shadowOffset: 2.5, shadowOpacity: 0.94 }),
          120,
        );
      }, 5420);
      schedule(() => {
        const textR = innerR + (outerR - innerR) * 0.43;
        setBallRadius(textR);
        setBallBounce({ r: 1.0, scale: 1.02, shadowOffset: 3, shadowOpacity: 0.96 });
      }, 5820);
      schedule(() => {
        const textR = innerR + (outerR - innerR) * 0.43;
        setBallRadius(textR);
        setBallBounce({ r: 0, scale: 1, shadowOffset: 2, shadowOpacity: 0.96 });
        setIsRevealing(true);
        onSettled?.(winningNumber);
      }, 6250);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      timers.forEach(clearTimeout);
    };
  }, [spinning, winningNumber, innerR, outerR, pocketAngle, size, onSettled]);

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
        perspective: '1400px',
      }}
    >
      {/* ── 3D STATOR TIMBER BOWL (80CM CASINO HOUSING · SOVEREIGN MAHOGANY) ── */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          transform: spinning
            ? 'rotateX(13deg) rotateY(-2deg) scale(1.02)'
            : isRevealing
              ? 'rotateX(6deg) scale(1.045)'
              : 'rotateX(0deg) scale(1)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease',
          background:
            'radial-gradient(circle at 35% 30%, #5E2616 0%, #341209 45%, #180603 80%, #080201 100%)',
          boxShadow: isRevealing
            ? '0 0 0 5px rgba(212, 175, 55, 0.35), 0 0 40px rgba(212, 175, 55, 0.45), 0 45px 95px rgba(0, 0, 0, 0.99), inset 0 3px 8px rgba(255, 255, 255, 0.35)'
            : '0 0 0 4px rgba(212, 175, 55, 0.2), 0 40px 90px rgba(0, 0, 0, 0.99), inset 0 2px 6px rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Äußerer Kessellaufring (Velstone Ball Track mit Lichtreflex) */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2.5px solid rgba(212, 175, 55, 0.65)',
            boxShadow:
              'inset 0 10px 25px rgba(0, 0, 0, 0.95), inset 0 -4px 12px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none',
          }}
        />

        {/* 8 Massiv-Messing Diamant-Deflektoren (Ball Stops) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <div
            key={`deflector-${deg}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '10px',
              height: '18px',
              background:
                'linear-gradient(135deg, #FFFDE0 0%, #FFD700 35%, #B8860B 70%, #3B2602 100%)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.9), 0 3px 6px rgba(0, 0, 0, 0.9)',
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${size * 0.455}px)`,
              pointerEvents: 'none',
              zIndex: 8,
            }}
          />
        ))}

        {/* ── DER ROTIERENDE ROTOR (ROTOR HEAD MIT POCKETS & 3D TURRET) ── */}
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
          {/* Außen- und Innenringe der Rotor-Fassung */}
          <circle
            cx={cx}
            cy={cy}
            r={outerR + 3}
            fill="none"
            stroke="url(#goldRimGrad)"
            strokeWidth={3}
          />
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="none"
            stroke="url(#goldRimGrad)"
            strokeWidth={2.5}
          />

          {/* 37 Authentische Zahlenfächer mit gefrästen 3D-Frets & Emaille-Plaques */}
          {pockets.map((p, i) => {
            const isWinningPocket = isRevealing && winningNumber?.n === p.num.n;
            const isRed = p.num.c === 'RED';
            const isGreen = p.num.c === 'GREEN';

            const fillGrad = isWinningPocket
              ? 'url(#realWinPlaqueGrad)'
              : isGreen
                ? 'url(#realGreenPlaqueGrad)'
                : isRed
                  ? 'url(#realRedPlaqueGrad)'
                  : 'url(#realBlackPlaqueGrad)';

            return (
              <g key={`pocket-${i}`}>
                {/* 1. Hochglanz-Emaille Plaque */}
                <path d={p.path} fill={fillGrad} stroke="none" />

                {/* 2. Vertiefter Taschenboden-Schatten (4.5mm CNC Well Depth) */}
                <path d={p.path} fill="url(#realPocketWellShadow)" opacity={0.42} />

                {/* 3. Massive 3D-Prismen-Trennstege (Double-Radius Solid Frets) */}
                <line
                  x1={p.x1 - 1}
                  y1={p.y1 - 1}
                  x2={p.x2 - 1}
                  y2={p.y2 - 1}
                  stroke="rgba(10, 5, 1, 0.95)"
                  strokeWidth={1.4}
                />
                <line
                  x1={p.x1}
                  y1={p.y1}
                  x2={p.x2}
                  y2={p.y2}
                  stroke="url(#realBrassFretGrad)"
                  strokeWidth={2.2}
                />
                <line
                  x1={p.x1 + 0.6}
                  y1={p.y1 + 0.6}
                  x2={p.x2 + 0.6}
                  y2={p.y2 + 0.6}
                  stroke="rgba(255, 255, 255, 0.85)"
                  strokeWidth={0.7}
                />

                {/* 4. Präzise eingravierte Casino-Ziffer mit Tiefprägung */}
                <text
                  x={p.textX}
                  y={p.textY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isWinningPocket ? '#1E1201' : '#FFFFFF'}
                  fontSize="13.5"
                  fontWeight="900"
                  fontFamily="Georgia, 'Times New Roman', 'Playfair Display', serif"
                  letterSpacing="0.4px"
                  transform={`rotate(${p.angle}, ${p.textX}, ${p.textY})`}
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    filter: isWinningPocket
                      ? 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.95))'
                      : 'drop-shadow(0 2px 2.5px rgba(0, 0, 0, 0.95))',
                  }}
                >
                  {p.num.n}
                </text>
              </g>
            );
          })}

          {/* Rotor-Kegel Schräge (Apron Cone mit radialer Anisotropie) */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR}
            fill="url(#realApronConeGrad)"
            stroke="rgba(212, 175, 55, 0.7)"
            strokeWidth={2}
          />

          {/* ── 3D MEISTER-TURRET (TCS JOHN HUXLEY MARK VII SOLID BRASS) ── */}
          <g filter="url(#realTurretShadow)">
            {/* CNC-gedrehter gestufter Messing-Kegelfuß */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR * 0.92}
              fill="url(#huxleyConeOuterGrad)"
              stroke="rgba(212, 175, 55, 0.95)"
              strokeWidth={2}
            />
            <circle
              cx={cx}
              cy={cy}
              r={innerR * 0.72}
              fill="url(#huxleyConeMidGrad)"
              stroke="rgba(110, 80, 10, 0.9)"
              strokeWidth={1.5}
            />
            <circle
              cx={cx}
              cy={cy}
              r={innerR * 0.48}
              fill="url(#huxleyConeInnerGrad)"
              stroke="rgba(255, 235, 150, 0.7)"
              strokeWidth={1.2}
            />

            {/* 4 Geschwungene John Huxley Barock-Messinggriffe mit Schlagschatten */}
            {[0, 90, 180, 270].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const handleLen = innerR * 0.93;
              const endX = cx + handleLen * Math.cos(rad);
              const endY = cy + handleLen * Math.sin(rad);
              const perpX = -Math.sin(rad);
              const perpY = Math.cos(rad);

              return (
                <g key={`huxley-arm-${deg}`}>
                  {/* Reeller Schlagschatten auf dem Konus */}
                  <path
                    d={`M ${cx + 3 * perpX} ${cy + 3 * perpY} Q ${cx + handleLen * 0.5 * Math.cos(rad) + 7 * perpX} ${cy + handleLen * 0.5 * Math.sin(rad) + 7 * perpY} ${endX + 3} ${endY + 4} Q ${cx + handleLen * 0.5 * Math.cos(rad) - 7 * perpX} ${cy + handleLen * 0.5 * Math.sin(rad) - 7 * perpY} ${cx - 3 * perpX} ${cy - 3 * perpY} Z`}
                    fill="rgba(0, 0, 0, 0.5)"
                    filter="url(#realSoftBlur)"
                  />
                  {/* Massiver gefräster Messing-Arm */}
                  <path
                    d={`M ${cx + 4.5 * perpX} ${cy + 4.5 * perpY} Q ${cx + handleLen * 0.55 * Math.cos(rad) + 6 * perpX} ${cy + handleLen * 0.55 * Math.sin(rad) + 6 * perpY} ${endX} ${endY} Q ${cx + handleLen * 0.55 * Math.cos(rad) - 6 * perpX} ${cy + handleLen * 0.55 * Math.sin(rad) - 6 * perpY} ${cx - 4.5 * perpX} ${cy - 4.5 * perpY} Z`}
                    fill="url(#realBrassArmGrad)"
                    stroke="rgba(255, 235, 170, 0.9)"
                    strokeWidth={1.2}
                  />
                  {/* Tropfenförmiger Knauf */}
                  <circle
                    cx={endX}
                    cy={endY}
                    r={6}
                    fill="url(#realBrassTeardropGrad)"
                    stroke="#FFD700"
                    strokeWidth={1.2}
                  />
                  <circle cx={endX - 1.8} cy={endY - 1.8} r={2} fill="rgba(255, 255, 255, 0.95)" />
                </g>
              );
            })}

            {/* Ziselierte Zentralkrone mit Obsidian-/Saphirkern */}
            <circle
              cx={cx}
              cy={cy}
              r={innerR * 0.28}
              fill="url(#realBrassCrownGrad)"
              stroke="#FFD700"
              strokeWidth={2}
            />
            <circle
              cx={cx}
              cy={cy}
              r={innerR * 0.17}
              fill="url(#realObsidianGemGrad)"
              stroke="rgba(255, 215, 0, 0.85)"
              strokeWidth={1.5}
            />
            <ellipse
              cx={cx - 3}
              cy={cy - 3.8}
              rx={4.2}
              ry={2.4}
              fill="rgba(255, 255, 255, 0.9)"
              transform={`rotate(-25, ${cx - 3}, ${cy - 3.8})`}
            />
          </g>

          {/* ── METALLISCHE VERLÄUFE & FILTER DEFINITIONEN ── */}
          <defs>
            <filter id="realTurretShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="5"
                stdDeviation="7"
                floodColor="#000000"
                floodOpacity="0.85"
              />
            </filter>
            <filter id="realSoftBlur">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>

            {/* Emaille Pocket Plaques */}
            <linearGradient id="realRedPlaqueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="35%" stopColor="#991B1B" />
              <stop offset="80%" stopColor="#580C0C" />
              <stop offset="100%" stopColor="#2D0505" />
            </linearGradient>
            <linearGradient id="realBlackPlaqueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#252836" />
              <stop offset="35%" stopColor="#131620" />
              <stop offset="80%" stopColor="#08090E" />
              <stop offset="100%" stopColor="#020305" />
            </linearGradient>
            <linearGradient id="realGreenPlaqueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="35%" stopColor="#047857" />
              <stop offset="80%" stopColor="#02402B" />
              <stop offset="100%" stopColor="#011F15" />
            </linearGradient>
            <linearGradient id="realWinPlaqueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF7B2" />
              <stop offset="35%" stopColor="#FFD700" />
              <stop offset="80%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#6E4C06" />
            </linearGradient>

            {/* Fret Gradients & Depth */}
            <radialGradient id="realPocketWellShadow" cx="50%" cy="100%" r="95%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#000000" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="realBrassFretGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF0" />
              <stop offset="35%" stopColor="#F5D77F" />
              <stop offset="70%" stopColor="#B8860B" />
              <stop offset="100%" stopColor="#FFE899" />
            </linearGradient>

            {/* Apron Cone Radial */}
            <radialGradient id="realApronConeGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#4A3408" />
              <stop offset="40%" stopColor="#2E1F03" />
              <stop offset="85%" stopColor="#170E01" />
              <stop offset="100%" stopColor="#080400" />
            </radialGradient>

            {/* Huxley Spindle Gradients */}
            <radialGradient id="huxleyConeOuterGrad" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#FFF5BA" />
              <stop offset="25%" stopColor="#E5C158" />
              <stop offset="60%" stopColor="#9E7618" />
              <stop offset="85%" stopColor="#4A3408" />
              <stop offset="100%" stopColor="#1E1402" />
            </radialGradient>
            <radialGradient id="huxleyConeMidGrad" cx="42%" cy="36%" r="65%">
              <stop offset="0%" stopColor="#FFFCE0" />
              <stop offset="30%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#7A560A" />
              <stop offset="100%" stopColor="#2A1B02" />
            </radialGradient>
            <radialGradient id="huxleyConeInnerGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#F5D77F" />
              <stop offset="80%" stopColor="#8C6510" />
              <stop offset="100%" stopColor="#382502" />
            </radialGradient>
            <linearGradient id="realBrassArmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="20%" stopColor="#FCE7A1" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="85%" stopColor="#805908" />
              <stop offset="100%" stopColor="#3B2602" />
            </linearGradient>
            <radialGradient id="realBrassTeardropGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FFD700" />
              <stop offset="75%" stopColor="#996E0A" />
              <stop offset="100%" stopColor="#332002" />
            </radialGradient>
            <radialGradient id="realBrassCrownGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFCE6" />
              <stop offset="45%" stopColor="#E5C158" />
              <stop offset="85%" stopColor="#6E4C06" />
              <stop offset="100%" stopColor="#1F1400" />
            </radialGradient>
            <radialGradient id="realObsidianGemGrad" cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#381D47" />
              <stop offset="50%" stopColor="#1A0C24" />
              <stop offset="100%" stopColor="#050208" />
            </radialGradient>

            {/* Rim Gradients */}
            <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBE6" />
              <stop offset="25%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#FFF2B2" />
              <stop offset="75%" stopColor="#7A560A" />
              <stop offset="100%" stopColor="#E5C158" />
            </linearGradient>
          </defs>
        </svg>

        {/* ── 4-PHASEN ORBITAL-KUGEL MIT PHYSIKALISCHEM PRELL-SCHATTEN ── */}
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
          {/* Echter 3D-Kugelschatten mit dynamischem Höhenabstand */}
          <div
            style={{
              position: 'absolute',
              top: `${cy - (ballRadius + ballBounce.r) + ballBounce.shadowOffset}px`,
              left: `${cx + 2}px`,
              transform: 'translate(-50%, -50%)',
              width: '19px',
              height: '14px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 50% 50%, rgba(0, 0, 0, ${ballBounce.shadowOpacity}) 0%, rgba(0, 0, 0, 0) 80%)`,
              transition: 'top 0.15s ease, transform 0.15s ease',
              zIndex: 34,
            }}
          />

          {/* Polierte Elfenbeinkugel mit Subsurface Highlight */}
          <div
            style={{
              position: 'absolute',
              top: `${cy - (ballRadius + ballBounce.r)}px`,
              left: `${cx}px`,
              transform: `translate(-50%, -50%) scale(${ballBounce.scale})`,
              width: '15.5px',
              height: '15.5px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 28% 22%, #FFFFFF 0%, #F8FAFC 35%, #CBD5E1 75%, #475569 100%)',
              boxShadow: spinning
                ? '0 0 16px rgba(255, 255, 255, 0.95), 0 0 28px rgba(212, 175, 55, 0.6), inset -2px -2px 3px rgba(0, 0, 0, 0.6), inset 1.5px 1.5px 2px rgba(255, 255, 255, 1)'
                : '0 3px 8px rgba(0, 0, 0, 0.85), inset -2px -2px 3px rgba(0, 0, 0, 0.6), inset 1.5px 1.5px 2px rgba(255, 255, 255, 1)',
              transition: 'top 0.15s ease, transform 0.15s ease',
              zIndex: 35,
            }}
          />
        </div>

        {/* ── AMBIENT SPECULAR GLASS & CASINO SPOTLIGHT OVERLAY ── */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 40,
          }}
        >
          {/* Oberer gewölbter Lichtreflex-Bogen */}
          <path
            d={`M ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy} Q ${cx} ${cy - innerR * 0.45} ${cx - outerR} ${cy} Z`}
            fill="url(#realAmbientSheen)"
            opacity={0.26}
          />
          {/* Unterer Kessel-Gegenlicht-Schimmer */}
          <path
            d={`M ${cx - outerR * 0.85} ${cy + outerR * 0.65} Q ${cx} ${cy + outerR * 0.95} ${cx + outerR * 0.85} ${cy + outerR * 0.65} Q ${cx} ${cy + outerR * 0.8} ${cx - outerR * 0.85} ${cy + outerR * 0.65} Z`}
            fill="rgba(255, 215, 0, 0.14)"
          />
          <defs>
            <linearGradient id="realAmbientSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#FFF9E6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
