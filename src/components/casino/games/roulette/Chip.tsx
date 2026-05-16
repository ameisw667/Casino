import React from 'react';
import { motion } from 'framer-motion';

interface ChipProps {
  amount: number;
  size?: number;
  onClick?: () => void;
  active?: boolean;
  stacked?: boolean;
  index?: number;
  vipLevel?: number;
}

export const Chip: React.FC<ChipProps> = ({ 
  amount, 
  size = 32, 
  onClick, 
  active, 
  stacked = false, 
  index = 0 
}) => {
  const getChipHSL = (amt: number) => {
    if (amt >= 1000) return 'var(--primary)'; // Gold
    if (amt >= 500) return 'var(--secondary)'; // Purple
    if (amt >= 100) return '210 100% 50%'; // Blue
    if (amt >= 50) return '30 100% 50%'; // Orange
    if (amt >= 10) return '0 100% 50%'; // Red
    return '0 0% 95%'; // White
  };

  const hslValue = getChipHSL(amount);
  const color = hslValue.startsWith('var') ? `hsl(${hslValue})` : `hsl(${hslValue})`;
  
  const stackCount = stacked ? 1 : Math.min(6, Math.max(1, Math.floor(Math.log10(amount / 5 + 1)) + 1));

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ 
        width: size, 
        height: size, 
        zIndex: stacked ? 50 - index : 10 
      }}
    >
      {[...Array(stackCount)].map((_, i) => (
        <motion.button 
          key={i}
          onClick={i === stackCount - 1 ? onClick : undefined}
          whileHover={i === stackCount - 1 ? { scale: 1.15, translateY: -6, filter: 'brightness(1.1)' } : {}}
          whileTap={i === stackCount - 1 ? { scale: 0.9 } : {}}
          className={`absolute rounded-full border-2 border-dashed border-black/20 flex items-center justify-center font-black transition-all duration-300 vibe-tap ${active ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''}`}
          style={{ 
            width: size, 
            height: size, 
            background: color,
            color: amount >= 100 && amount < 1000 ? '#fff' : '#000',
            fontSize: size * 0.35,
            top: 0,
            left: 0,
            zIndex: i,
            pointerEvents: i === stackCount - 1 ? 'auto' : 'none',
            transform: `translateY(${-i * 2}px) ${active ? 'scale(1.15) translateY(-6px)' : (stacked ? `translateY(${-index * 2}px) scale(${1 - index * 0.05})` : 'scale(1)')}`,
            boxShadow: active 
              ? `0 10px 20px hsla(${hslValue.replace('var(', '').replace(')', '')}, 0.4), inset 0 0 8px rgba(0,0,0,0.4)` 
              : '0 4px 10px rgba(0,0,0,0.3), inset 0 0 5px rgba(0,0,0,0.2)'
          }}
        >
          {/* Inner Ring */}
          <div className="absolute inset-1 border border-black/10 rounded-full" />
          
          {/* Amount Label */}
          {i === stackCount - 1 && (
            <span className="relative z-10 drop-shadow-md">
              {amount >= 1000 ? `${amount/1000}k` : amount}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};
