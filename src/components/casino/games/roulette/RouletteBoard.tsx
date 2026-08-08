import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chip } from './Chip';
import { ROULETTE_NUMBERS, BetType, BetPlacement, WHEEL_ORDER, RouletteNumber } from './types';
import { CasinoCore, RouletteBetType } from '@/lib/casino/casino-core';

interface RouletteBoardProps {
  currentBets: BetPlacement[];
  onPlaceBet: (type: BetType) => void;
  spinning: boolean;
  winningNumber: number | null;
  vipLevel: number;
  history: RouletteNumber[];
}

export const RouletteBoard: React.FC<RouletteBoardProps> = ({
  currentBets,
  onPlaceBet,
  spinning,
  winningNumber,
  vipLevel,
  history = []
}) => {
  const [hoveredArea, setHoveredArea] = useState<BetType | null>(null);

  const isHighlighted = (num: number) => {
    if (!hoveredArea) return false;
    return CasinoCore.isRouletteWin(hoveredArea as unknown as RouletteBetType, num);
  };

  const getHeatColor = (num: number) => {
    const frequency = history.filter(h => h.n === num).length;
    if (frequency === 0) return 'rgba(255,255,255,0.02)';
    const intensity = Math.min(frequency * 0.2, 0.8);
    return `rgba(0, 231, 1, ${intensity})`; // Primary color green intensity
  };

  const renderNumberTile = (num: number) => {
    const data = ROULETTE_NUMBERS.find(n => n.n === num)!;
    const bet = currentBets.find(b => b.type.type === 'STRAIGHT' && b.type.value === num);
    const highlighted = isHighlighted(num);
    const isWinner = winningNumber === num && !spinning;
    const heat = getHeatColor(num);

    return (
      <motion.div
        key={num}
        onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: num })}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => !spinning && onPlaceBet({ type: 'STRAIGHT', value: num })}
        whileHover={{ scale: 0.98, filter: 'brightness(1.2)' }}
        whileTap={{ scale: 0.95 }}
        className={`relative flex items-center justify-center h-14 md:h-16 cursor-pointer font-black text-lg transition-all duration-300 border border-white/5 select-none
          ${isWinner ? 'ring-4 ring-white z-20 shadow-glow-white scale-105' : ''}
          ${highlighted ? 'z-10' : ''}`}
        style={{
          background: data.c === 'RED' ? `linear-gradient(135deg, hsl(var(--error)), ${heat})` : 
                     data.c === 'BLACK' ? `linear-gradient(135deg, #0a0a0a, ${heat})` : `linear-gradient(135deg, hsl(var(--success)), ${heat})`,
          boxShadow: highlighted ? 'inset 0 0 30px rgba(255,255,255,0.4), 0 0 20px hsla(var(--primary), 0.2)' : 'none',
          filter: highlighted ? 'brightness(1.5)' : 'none'
        }}
      >
        <span className="relative z-10">{num}</span>
        {bet && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Chip amount={bet.amount} size={28} stacked vipLevel={vipLevel} />
          </div>
        )}
      </motion.div>
    );
  };

  const renderSideBet = (label: string, type: BetType, className: string = "") => {
    const bet = currentBets.find(b => JSON.stringify(b.type) === JSON.stringify(type));
    const active = hoveredArea && JSON.stringify(hoveredArea) === JSON.stringify(type);

    return (
      <motion.div
        onMouseEnter={() => setHoveredArea(type)}
        onMouseLeave={() => setHoveredArea(null)}
        onClick={() => !spinning && onPlaceBet(type)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        className={`relative flex items-center justify-center cursor-pointer font-black text-[10px] md:text-xs uppercase tracking-widest border border-white/5 transition-all glass-subtle hover:z-10 ${className} ${active ? 'brightness-150 ring-2 ring-white/20' : ''}`}
        style={{
           boxShadow: active ? '0 0 20px hsla(var(--primary), 0.1)' : 'none'
        }}
      >
        {label}
        {bet && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Chip amount={bet.amount} size={28} stacked vipLevel={vipLevel} />
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-8 overflow-x-auto pb-4 no-scrollbar">
      
      {/* Racetrack Visual (Simplified) */}
      <div className="flex justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
        <div className="flex h-12 bg-black/40 rounded-full border border-white/10 px-6 items-center gap-1 overflow-hidden">
          {WHEEL_ORDER.map((num, i) => (
            <div 
              key={i}
              className={`w-4 h-full transition-all duration-300 ${isHighlighted(num.n) ? 'brightness-150 scale-y-110' : ''}`}
              style={{ 
                background: num.c === 'RED' ? 'hsl(var(--error))' : num.c === 'BLACK' ? '#222' : 'hsl(var(--success))',
                opacity: isHighlighted(num.n) ? 1 : 0.4
              }}
            />
          ))}
        </div>
      </div>

        <div className="min-w-[850px] grid grid-cols-[70px_1fr_90px] gap-1 p-1 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-xl">
          
          {/* Zero */}
          <div 
            onClick={() => !spinning && onPlaceBet({ type: 'STRAIGHT', value: 0 })}
            onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: 0 })}
            onMouseLeave={() => setHoveredArea(null)}
            className={`row-span-3 flex items-center justify-center bg-[hsl(var(--success))] cursor-pointer font-black text-3xl rounded-l-xl border border-white/5 transition-all relative overflow-hidden
              ${winningNumber === 0 && !spinning ? 'ring-4 ring-white z-20' : ''}
              ${hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === 0 ? 'brightness-150 shadow-glow-success' : ''}`}
          >
            0
            {currentBets.find(b => b.type.type === 'STRAIGHT' && b.type.value === 0) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Chip amount={currentBets.find(b => b.type.type === 'STRAIGHT' && b.type.value === 0)!.amount} size={36} stacked vipLevel={vipLevel} />
              </div>
            )}
          </div>
  
          {/* Numbers Grid */}
          <div className="grid grid-cols-[repeat(12,1fr)] gap-1">
            {/* Top Row (3, 6, 9...) */}
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map(renderNumberTile)}
            {/* Middle Row (2, 5, 8...) */}
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map(renderNumberTile)}
            {/* Bottom Row (1, 4, 7...) */}
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(renderNumberTile)}
          </div>
  
          {/* Columns */}
          <div className="grid grid-rows-3 gap-1">
            {renderSideBet("2:1", { type: 'COLUMN', value: 3 }, "rounded-tr-xl h-full")}
            {renderSideBet("2:1", { type: 'COLUMN', value: 2 }, "h-full")}
            {renderSideBet("2:1", { type: 'COLUMN', value: 1 }, "rounded-br-xl h-full")}
          </div>
  
          {/* Dozens */}
          <div className="col-start-2 grid grid-cols-3 gap-1 mt-1">
            {renderSideBet("1st 12", { type: 'DOZEN', value: 1 }, "h-12 md:h-14")}
            {renderSideBet("2nd 12", { type: 'DOZEN', value: 2 }, "h-12 md:h-14")}
            {renderSideBet("3rd 12", { type: 'DOZEN', value: 3 }, "h-12 md:h-14")}
          </div>
  
          {/* Outside Bets */}
          <div className="col-start-2 grid grid-cols-6 gap-1 mt-1">
            {renderSideBet("1-18", { type: 'RANGE', value: '1-18' }, "h-12 md:h-14 rounded-bl-xl")}
            {renderSideBet("EVEN", { type: 'EVEN_ODD', value: 'EVEN' }, "h-12 md:h-14")}
            {renderSideBet("RED", { type: 'COLOR', value: 'RED' }, "h-12 md:h-14 bg-[hsl(var(--error))] text-white border-none")}
            {renderSideBet("BLACK", { type: 'COLOR', value: 'BLACK' }, "h-12 md:h-14 bg-black text-white border-none")}
            {renderSideBet("ODD", { type: 'EVEN_ODD', value: 'ODD' }, "h-12 md:h-14")}
            {renderSideBet("19-36", { type: 'RANGE', value: '19-36' }, "h-12 md:h-14 rounded-br-xl")}
          </div>
        </div>
    </div>
  );
};
