'use client';

import React from 'react';
import { GameRippleTransition } from './transitions/GameRippleTransition';

interface GameLayoutProps {
  title?: string;
  gameId?: string;
  triggerSignal?: number | string | boolean;
  children: React.ReactNode;
}

export function GameLayout({
  triggerSignal,
  children,
}: GameLayoutProps) {
  return (
    <div
      data-testid="casino-game-layout"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Ripple Transition Shockwave Wrapper */}
      <GameRippleTransition triggerSignal={triggerSignal}>
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          {children}
        </div>
      </GameRippleTransition>
    </div>
  );
}
