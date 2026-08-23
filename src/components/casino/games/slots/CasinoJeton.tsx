'use client';

interface CasinoJetonProps {
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
  size = 38,
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
        transform: isSelected ? 'translateY(-3px) scale(1.08)' : 'none',
        boxShadow: isSelected
          ? '0 0 14px rgba(212, 175, 55, 0.9), 0 6px 14px rgba(0, 0, 0, 0.75)'
          : '0 3px 8px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
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
      <div
        style={{
          width: '72%',
          height: '72%',
          borderRadius: '50%',
          background: coreBg,
          border: '1px solid rgba(212, 175, 55, 0.9)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontFamily: 'monospace',
          fontWeight: 900,
          fontSize: '0.78rem',
          letterSpacing: '-0.03em',
        }}
      >
        {label}
      </div>
    </div>
  );
}
