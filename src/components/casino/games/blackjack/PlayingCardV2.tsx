'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface Card {
  suit: 'spades' | 'clubs' | 'hearts' | 'diamonds';
  value: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  numericValue: number;
  faceDown?: boolean;
}

interface PlayingCardProps {
  card: Card | null;
  faceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: { width: 60, height: 84, fontSize: 12 },
  md: { width: 80, height: 112, fontSize: 16 },
  lg: { width: 100, height: 140, fontSize: 20 },
};

const getSuitSymbol = (suit: string): string => {
  const symbols: Record<string, string> = {
    spades: '♠',
    clubs: '♣',
    hearts: '♥',
    diamonds: '♦',
  };
  return symbols[suit] || '♠';
};

const isSuitRed = (suit: string): boolean => suit === 'hearts' || suit === 'diamonds';

export default function PlayingCardV2({ card, faceDown = false, size = 'md' }: PlayingCardProps) {
  const config = sizeConfig[size];
  const isEmpty = !card;

  return (
    <motion.div
      className="relative inline-block"
      style={{
        width: config.width,
        height: config.height,
        perspective: 1000,
      }}
      animate={{ rotateY: faceDown ? 0 : 180 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Card Container */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
        }}
        animate={{ rotateY: faceDown ? 0 : 180 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Back Face (Face Down) */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg"
          style={{
            backfaceVisibility: 'hidden',
            backgroundColor: 'hsla(var(--surface-color), 0.95)',
            border: '2px solid hsla(45, 80%, 50%, 0.6)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          }}
        >
          <Image
            src="/images/blackjack/card-back.png"
            alt="Card Back"
            fill
            sizes={`${config.width}px`}
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Front Face (Face Up) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-lg p-1"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#f8f4e8',
            border: '1px solid #e0dcc8',
            color: isSuitRed(card?.suit || '') ? '#c1121f' : '#1a1a1a',
          }}
        >
          {isEmpty ? (
            <div className="text-gray-300">?</div>
          ) : (
            <>
              {/* Top-Left Corner */}
              <div
                className="absolute top-1 left-1 text-center leading-none"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                <div className="font-bold">{card?.value}</div>
                <div className="text-xs">{getSuitSymbol(card?.suit || '')}</div>
              </div>

              {/* Center Suit Symbol (Large) */}
              <div style={{ fontSize: `${config.fontSize * 1.5}px` }} className="font-bold">
                {getSuitSymbol(card?.suit || '')}
              </div>

              {/* Bottom-Right Corner (Upside Down) */}
              <div
                className="absolute right-1 bottom-1 rotate-180 transform text-center leading-none"
                style={{ fontSize: `${config.fontSize}px` }}
              >
                <div className="font-bold">{card?.value}</div>
                <div className="text-xs">{getSuitSymbol(card?.suit || '')}</div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
