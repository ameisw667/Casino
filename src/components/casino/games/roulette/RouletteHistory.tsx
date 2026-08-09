import React from 'react';
import { History, Flame, Snowflake } from 'lucide-react';
import { RouletteNumber } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface RouletteHistoryProps {
  history: RouletteNumber[];
}

export const RouletteHistory: React.FC<RouletteHistoryProps> = ({ history }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={14} className="text-primary" />
          <div className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
            Recent Results
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex cursor-help items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100">
            <Flame size={12} className="text-error" />
            <span className="text-error text-[9px] font-black uppercase">Hot</span>
          </div>
          <div className="flex cursor-help items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100">
            <Snowflake size={12} className="text-info" />
            <span className="text-info text-[9px] font-black uppercase">Cold</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-[40px] flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold tracking-tighter text-white/10 uppercase italic"
            >
              Waiting for first spin...
            </motion.div>
          ) : (
            history.slice(0, 12).map((h, i) => (
              <motion.div
                key={`${h.n}-${i}`}
                initial={{ scale: 0, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300, delay: i * 0.05 }}
                className={`group relative flex h-9 w-9 cursor-default items-center justify-center overflow-hidden rounded-full border border-white/5 text-xs font-black shadow-2xl transition-all hover:scale-110 ${
                  h.c === 'RED'
                    ? 'bg-[hsl(var(--error))] text-white'
                    : h.c === 'BLACK'
                      ? 'border-white/10 bg-[#0a0a0a] text-white'
                      : 'bg-[hsl(var(--success))] text-black'
                }`}
              >
                <span className="relative z-10">{h.n}</span>
                {/* Subtle Glow */}
                <div
                  className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-20 ${h.c === 'RED' ? 'bg-white' : h.c === 'BLACK' ? 'bg-primary' : 'bg-white'}`}
                />

                {/* Winner indicator for the very last one */}
                {i === 0 && (
                  <motion.div
                    layoutId="last-win-glow"
                    className="absolute inset-0 animate-pulse rounded-full border-2 border-white/40"
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
