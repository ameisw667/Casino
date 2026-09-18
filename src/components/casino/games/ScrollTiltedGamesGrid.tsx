'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameMeta } from '@/app/games/_components';
import { ElevatedGameCard } from '@/app/games/_components';

interface ScrollTiltedGamesGridProps {
  games: readonly GameMeta[];
  isMobile: boolean;
}

export function ScrollTiltedGamesGrid({ games, isMobile }: ScrollTiltedGamesGridProps) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Sanfte, unaufdringliche 3D-Bühnenneigung ohne Kartenverzerrung
    const rotX = ((y - centerY) / centerY) * -1.2;
    const rotY = ((x - centerX) / centerX) * 1.4;
    setTilt({ rotateX: rotX, rotateY: rotY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        perspective: isMobile ? 'none' : 1200,
        perspectiveOrigin: '50% 30%',
        paddingTop: 4,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic ambient gold floor reflection */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: '10%',
            right: '10%',
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(30px)',
          }}
        />
      )}

      {/* 3D Tilted Perspective Grid Stage */}
      <motion.div
        data-testid="scroll-tilted-games-grid"
        animate={{
          rotateX: isMobile ? 0 : tilt.rotateX,
          rotateY: isMobile ? 0 : tilt.rotateY,
        }}
        transition={{
          type: 'spring',
          stiffness: 240,
          damping: 28,
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(2, minmax(0, 1fr))'
            : 'repeat(6, minmax(0, 1fr))',
          gap: isMobile ? 10 : 12,
          alignItems: 'stretch',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <AnimatePresence mode="popLayout">
          {games.map((game, index) => (
            <div
              key={game.id}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ElevatedGameCard game={game} index={index} isMobile={isMobile} />
            </div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ScrollTiltedGamesGrid;
