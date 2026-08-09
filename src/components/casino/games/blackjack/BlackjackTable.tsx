'use client';

import { motion } from 'framer-motion';
import CardHand from './CardHand';

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

interface BlackjackTableProps {
  dealerHand: BlackjackHand | null;
  playerHand: BlackjackHand | null;
  playerHand2?: BlackjackHand | null;
  activeHandIndex?: 0 | 1;
  betAmount: number;
  result?: 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK' | 'BUST';
  result2?: 'WIN' | 'LOSS' | 'PUSH' | 'BUST';
  payout: number;
  isProcessing?: boolean;
}

const getResultColor = (result?: string) => {
  switch (result) {
    case 'WIN':
    case 'BLACKJACK':
      return 'from-emerald-500 to-green-600';
    case 'LOSS':
    case 'BUST':
      return 'from-red-500 to-red-600';
    case 'PUSH':
      return 'from-amber-500 to-yellow-600';
    default:
      return 'from-blue-500 to-blue-600';
  }
};

const getResultLabel = (result?: string) => {
  switch (result) {
    case 'WIN':
      return '🎉 YOU WIN';
    case 'LOSS':
      return '😞 YOU LOSE';
    case 'PUSH':
      return '🤝 PUSH';
    case 'BLACKJACK':
      return '✨ BLACKJACK!';
    case 'BUST':
      return '💥 BUST';
    default:
      return '';
  }
};

export default function BlackjackTable({
  dealerHand,
  playerHand,
  playerHand2,
  activeHandIndex = 0,
  betAmount,
  result,
  result2,
  payout,
  isProcessing = false,
}: BlackjackTableProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Table Container */}
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(135deg, hsla(var(--surface-color), 0.95) 0%, hsla(145, 30%, 15%, 0.4) 100%)`,
          backdropFilter: 'blur(10px)',
          border: '2px solid hsla(45, 80%, 50%, 0.2)',
        }}
      >
        {/* Dealer Area */}
        <div className="p-8 pt-10">
          <div className="flex justify-center">
            <CardHand
              hand={dealerHand}
              label="Dealer"
              isActive={false}
              hideScore={dealerHand?.cards.some((c) => c.faceDown) ?? false}
            />
          </div>
        </div>

        {/* Separator Line with Text */}
        <motion.div
          className="relative py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4">
            <div
              className="h-px flex-1"
              style={{
                background:
                  'linear-gradient(90deg, transparent, hsla(45, 80%, 50%, 0.3), transparent)',
              }}
            />
            <div className="text-sm font-bold tracking-widest whitespace-nowrap text-yellow-600/80 uppercase">
              Blackjack Pays 3:2
            </div>
            <div
              className="h-px flex-1"
              style={{
                background:
                  'linear-gradient(90deg, transparent, hsla(45, 80%, 50%, 0.3), transparent)',
              }}
            />
          </div>
        </motion.div>

        {/* Player Area (One or Two Hands) */}
        <div className="p-8 pb-10">
          {playerHand2 ? (
            // Split Hands Layout
            <div className="flex justify-center gap-12">
              <motion.div
                animate={{
                  scale: activeHandIndex === 0 ? 1.05 : 0.95,
                  filter: activeHandIndex === 0 ? 'brightness(1)' : 'brightness(0.7)',
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-bold tracking-wide text-yellow-600/70 uppercase">
                    Hand 1 {activeHandIndex === 0 && '→ Active'}
                  </div>
                  <CardHand
                    hand={playerHand}
                    label="Player"
                    isActive={activeHandIndex === 0}
                    hideScore={false}
                  />
                </div>
              </motion.div>

              <motion.div
                animate={{
                  scale: activeHandIndex === 1 ? 1.05 : 0.95,
                  filter: activeHandIndex === 1 ? 'brightness(1)' : 'brightness(0.7)',
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-bold tracking-wide text-yellow-600/70 uppercase">
                    Hand 2 {activeHandIndex === 1 && '→ Active'}
                  </div>
                  <CardHand
                    hand={playerHand2}
                    label="Player"
                    isActive={activeHandIndex === 1}
                    hideScore={false}
                  />
                </div>
              </motion.div>
            </div>
          ) : (
            // Single Hand Layout
            <div className="flex justify-center">
              <CardHand hand={playerHand} label="Player" isActive={true} hideScore={false} />
            </div>
          )}

          {/* Bet Chip Display */}
          {betAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex justify-center"
            >
              <div
                className="rounded-full px-6 py-3 font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, hsl(45, 80%, 50%), hsl(40, 90%, 60%))',
                  boxShadow: '0 0 20px hsla(45, 80%, 50%, 0.5)',
                }}
              >
                Bet: ${betAmount}
              </div>
            </motion.div>
          )}
        </div>

        {/* Result Overlays */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className={`bg-gradient-to-r ${getResultColor(result)} rounded-xl px-8 py-4 text-lg font-bold tracking-wider text-white uppercase shadow-2xl`}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {getResultLabel(result)}
              {payout > 0 && <div className="mt-2 font-mono text-sm">+${payout}</div>}
            </motion.div>
          </motion.div>
        )}

        {result2 && playerHand2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-4 bottom-4 rounded-lg px-3 py-2 text-xs font-bold tracking-wider uppercase"
            style={{
              background: `linear-gradient(135deg, ${getResultColor(result2)})`,
              color: 'white',
            }}
          >
            Hand 2: {getResultLabel(result2)}
          </motion.div>
        )}

        {/* Loading Overlay */}
        {isProcessing && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-8 w-8 rounded-full border-3 border-yellow-500/50 border-t-yellow-500"
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
