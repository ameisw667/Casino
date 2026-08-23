'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export function AuthHeaderBtn({
  href,
  variant,
  compact,
  children,
}: {
  href: string;
  variant: 'glass' | 'gold';
  compact?: boolean;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 800,
    textDecoration: 'none',
    letterSpacing: '0.04em',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
    padding: compact ? '7px 10px' : '7px 14px',
    whiteSpace: 'nowrap' as const,
  };
  const glassStyle: React.CSSProperties = {
    ...base,
    background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
    boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
  };
  const goldStyle: React.CSSProperties = {
    ...base,
    background: hovered
      ? 'linear-gradient(135deg, hsl(45,100%,58%), hsl(38,100%,48%))'
      : 'linear-gradient(135deg, hsl(45,100%,50%), hsl(38,100%,42%))',
    color: '#000',
    border: 'none',
    boxShadow: hovered
      ? '0 0 20px hsla(45,100%,50%,0.55), 0 4px 12px rgba(0,0,0,0.3)'
      : '0 0 10px hsla(45,100%,50%,0.3)',
  };
  return (
    <Link
      href={href}
      className={variant === 'gold' && !hovered ? 'animate-gold-pulse' : ''}
      style={variant === 'gold' ? goldStyle : glassStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}
