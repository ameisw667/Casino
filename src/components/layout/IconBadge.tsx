'use client';
import type { ReactNode } from 'react';

export function IconBadge({
  children,
  tone,
  size = 26,
}: {
  children: ReactNode;
  tone: 'gold' | 'green';
  size?: number;
}) {
  const background =
    tone === 'gold'
      ? 'linear-gradient(135deg, hsl(45,100%,58%), hsl(38,100%,46%))'
      : 'linear-gradient(135deg, hsl(150,70%,48%), hsl(155,70%,36%))';
  const glow = tone === 'gold' ? 'hsla(45,100%,50%,0.35)' : 'hsla(150,70%,45%,0.35)';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background,
        boxShadow: `0 0 10px ${glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}
