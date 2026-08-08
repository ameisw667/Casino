'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PlayingCardV2 from './PlayingCardV2';

interface Card {
  suit: 'spades' | 'clubs' | 'hearts' | 'diamonds';
  value: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  numericValue: number;
  faceDown?: boolean;
}

interface BlackjackHand {
  cards: Card[];
  score: number;
  isBust: boolean;
  isBlackjack: boolean;
  isSoft: boolean;
}

interface CardHandProps {
  hand: BlackjackHand | null;
  label: 'Dealer' | 'Player';
  isActive?: boolean;
  hideScore?: boolean;
}

export default function CardHandV2({
  hand,
  label,
  isActive = false,
  hideScore = false,
}: CardHandProps) {
  if (!hand) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-semibold text-gray-400">{label}</div>
        <div className="w-20 h-28 rounded-lg border-2 border-dashed border-gray-600/30 flex items-center justify-center">
          <span className="text-gray-500 text-xs">Empty</span>
        </div>
      </div>
    );
  }

  // Score Badge Color Logic
  let badgeBgColor = 'bg-gray-700';
  let badgeTextColor = 'text-white';

  if (hand.isBust) {
    badgeBgColor = 'bg-red-900/80';
    badgeTextColor = 'text-red-200';
  } else if (hand.isBlackjack || hand.score === 21) {
    badgeBgColor = 'bg-emerald-600/80';
    badgeTextColor = 'text-emerald-100';
  } else if (isActive) {
    badgeBgColor = 'bg-yellow-600/80';
    badgeTextColor = 'text-yellow-100';
  } else {
    badgeBgColor = 'bg-blue-900/60';
    badgeTextColor = 'text-blue-100';
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label */}
      <motion.div
        className="text-sm font-semibold uppercase tracking-wide"
        animate={{
          color: isActive ? 'hsl(45, 80%, 50%)' : 'rgb(209, 213, 219)',
        }}
      >
        {label}
      </motion.div>

      {/* Cards Container */}
      <div className="relative h-32 flex items-center justify-center">
        <AnimatePresence>
          {hand.cards.map((card, index) => (
            <motion.div
              key={`${card.suit}-${card.value}-${index}`}
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                left: `${index * 35}px`,
                zIndex: index,
              }}
            >
              <PlayingCardV2
                card={card}
                faceDown={card.faceDown || false}
                size="md"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Score Badge */}
      {!hideScore && (
        <motion.div
          className={`rounded-full px-4 py-2 font-mono font-bold text-center ${badgeBgColor} ${badgeTextColor} backdrop-blur-md border border-white/20 min-w-20`}
          animate={{
            scale: isActive ? 1.1 : 1,
            y: isActive ? -2 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-lg">{hand.score}</div>
          {hand.isBust && <div className="text-xs leading-none mt-0.5">BUST</div>}
          {hand.isBlackjack && !hand.isBust && (
            <div className="text-xs leading-none mt-0.5">BJ</div>
          )}
          {hand.isSoft && !hand.isBust && hand.score !== 21 && (
            <div className="text-xs leading-none mt-0.5">Soft</div>
          )}
        </motion.div>
      )}

      {/* Soft 17 Indicator (Dealer Only) */}
      {label === 'Dealer' && hand.isSoft && hand.score === 17 && !hand.isBust && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-yellow-400/70 font-semibold uppercase tracking-wider"
        >
          Soft 17 (Must Hit)
        </motion.div>
      )}
    </div>
  );
}
