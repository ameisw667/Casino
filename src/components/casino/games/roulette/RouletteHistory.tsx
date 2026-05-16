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
          <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Recent Results</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
            <Flame size={12} className="text-error" />
            <span className="text-[9px] font-black uppercase text-error">Hot</span>
          </div>
          <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity cursor-help">
            <Snowflake size={12} className="text-info" />
            <span className="text-[9px] font-black uppercase text-info">Cold</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        <AnimatePresence mode="popLayout">
          {history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-bold text-white/10 uppercase italic tracking-tighter"
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
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border border-white/5 shadow-2xl transition-all hover:scale-110 cursor-default relative overflow-hidden group
                  ${h.c === 'RED' ? 'bg-[hsl(var(--error))] text-white' : 
                    h.c === 'BLACK' ? 'bg-[#0a0a0a] text-white border-white/10' : 
                    'bg-[hsl(var(--success))] text-black'}`}
              >
                <span className="relative z-10">{h.n}</span>
                {/* Subtle Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity
                  ${h.c === 'RED' ? 'bg-white' : h.c === 'BLACK' ? 'bg-primary' : 'bg-white'}`} />
                
                {/* Winner indicator for the very last one */}
                {i === 0 && (
                  <motion.div 
                    layoutId="last-win-glow"
                    className="absolute inset-0 border-2 border-white/40 rounded-full animate-pulse" 
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
