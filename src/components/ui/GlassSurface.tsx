'use client';

import React from 'react';

/**
 * GlassSurface — single source of truth for glassmorphism containers
 * (SOP 04 §2): exact obsidian values plus the project-wide radius scale
 * (Shape Consistency Lock). Replaces the diverging ad-hoc glass variants
 * that previously lived inline in the lobby sections.
 */

export type GlassRadius = 'sm' | 'md' | 'lg' | 'pill';

const RADIUS_SCALE: Record<GlassRadius, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 9999,
};

type GlassElevation = 1 | 2 | 3;

const ELEVATION_SHADOW: Record<GlassElevation, string> = {
  1: '0 4px 16px rgba(0, 0, 0, 0.3)',
  2: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  3: '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
};

export interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  radius?: GlassRadius;
  elevation?: GlassElevation;
  /** Adds the subtle top-edge light line used by premium glass panels */
  withTopSheen?: boolean;
}

export function GlassSurface({
  radius = 'md',
  elevation = 2,
  withTopSheen = false,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: RADIUS_SCALE[radius],
        background: 'var(--bg-obsidian-surface, rgba(11, 14, 20, 0.75))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass, rgba(255, 255, 255, 0.08))',
        boxShadow: ELEVATION_SHADOW[elevation],
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {withTopSheen && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.22) 50%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      {children}
    </div>
  );
}
