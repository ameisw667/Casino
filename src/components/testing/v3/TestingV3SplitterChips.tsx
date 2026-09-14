'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function TestingV3SplitterChips() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 12,
      }}
    >
      {/* Splitter Chip 1 (Top-Right Floating Foreground Chip) */}
      <motion.div
        animate={{
          y: [-12, 14, -12],
          x: [6, -8, 6],
          rotateZ: [15, 28, 15],
        }}
        transition={{
          duration: 6.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-18%',
          width: '130px',
          height: '130px',
          filter:
            'drop-shadow(0 20px 35px rgba(0,0,0,0.85)) drop-shadow(0 0 25px rgba(212,175,55,0.4))',
        }}
      >
        <Image
          src="/images/testing-v3/splitter-chip-gold.png"
          alt="VIP Gold Shard"
          fill
          sizes="130px"
          style={{ objectFit: 'contain' }}
        />
      </motion.div>

      {/* Splitter Shard 2 (Bottom-Left Floating Crystal Shield) */}
      <motion.div
        animate={{
          y: [10, -12, 10],
          x: [-8, 6, -8],
          rotateZ: [-25, -12, -25],
        }}
        transition={{
          duration: 5.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: '-12%',
          left: '-22%',
          width: '115px',
          height: '115px',
          filter:
            'drop-shadow(0 20px 30px rgba(0,0,0,0.9)) drop-shadow(0 0 20px rgba(255,215,0,0.35))',
        }}
      >
        <Image
          src="/images/testing-v3/splitter-shard-crystal.png"
          alt="Crystal VIP Fragment"
          fill
          sizes="115px"
          style={{ objectFit: 'contain' }}
        />
      </motion.div>
    </div>
  );
}
