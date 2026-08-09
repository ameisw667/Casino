'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CornerDownRight, AlertCircle, Copy, TrendingUp } from 'lucide-react';

type GamePhase =
  'IDLE' | 'DEALING' | 'PLAYER_TURN' | 'PLAYER_TURN_HAND2' | 'DEALER_TURN' | 'SETTLEMENT';

interface BlackjackActionsProps {
  phase: GamePhase;
  canDouble: boolean;
  canSplit: boolean;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
}

export default function BlackjackActions({
  phase,
  canDouble,
  canSplit,
  onHit,
  onStand,
  onDouble,
  onSplit,
}: BlackjackActionsProps) {
  const isPlayerTurn = phase === 'PLAYER_TURN' || phase === 'PLAYER_TURN_HAND2';

  return (
    <AnimatePresence>
      {isPlayerTurn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {/* HIT Button */}
          <motion.button
            onClick={onHit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-bold tracking-wide text-white uppercase shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
          >
            <CornerDownRight size={18} />
            Hit
          </motion.button>

          {/* STAND Button */}
          <motion.button
            onClick={onStand}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-3 font-bold tracking-wide text-white uppercase shadow-lg transition-all duration-200 hover:from-slate-700 hover:to-slate-800"
          >
            <AlertCircle size={18} />
            Stand
          </motion.button>

          {/* DOUBLE Button (Conditional) */}
          <AnimatePresence>
            {canDouble && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={onDouble}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 font-bold tracking-wide text-white uppercase shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-emerald-800"
              >
                <TrendingUp size={18} />
                Double
              </motion.button>
            )}
          </AnimatePresence>

          {/* SPLIT Button (Conditional) */}
          <AnimatePresence>
            {canSplit && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={onSplit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 font-bold tracking-wide text-white uppercase shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-purple-800"
              >
                <Copy size={18} />
                Split
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
