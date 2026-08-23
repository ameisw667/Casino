'use client';

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

export function CasinoJeton({
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
