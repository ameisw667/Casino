import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';
import { WHEEL_ORDER, RouletteNumber } from './types';

interface RouletteWheelProps {
  spinning: boolean;
  winningNumber: RouletteNumber | null;
  wheelRotation: number;
  ballRotation: number;
  turboMode: boolean;
  lastWin?: number | null;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  spinning,
  winningNumber,
  wheelRotation,
  ballRotation,
  turboMode,
  lastWin,
}) => {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{ perspective: '2400px' }}
    >
      {/* Result Overlay */}
      <AnimatePresence>
        {winningNumber && !spinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute z-50 flex flex-col items-center justify-center rounded-full border-2 border-white/10 text-center"
            style={{
              width: 'min(320px, 80vw)',
              height: 'min(320px, 80vw)',
              backdropFilter: 'blur(16px)',
              background: 'rgba(10, 10, 10, 0.95)',
              boxShadow: '0 0 80px hsla(var(--primary), 0.2)',
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="text-8xl font-black tracking-tighter md:text-9xl"
              style={{
                color:
                  winningNumber?.c === 'RED'
                    ? 'hsl(var(--error))'
                    : winningNumber?.c === 'GREEN'
                      ? 'hsl(var(--success))'
                      : 'white',
                textShadow: winningNumber?.c !== 'BLACK' ? `0 0 40px currentColor` : 'none',
              }}
            >
              {winningNumber?.n}
            </motion.div>

            {lastWin !== null && lastWin !== undefined && lastWin > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-primary mt-2 text-3xl font-black md:text-4xl"
              >
                +${lastWin.toLocaleString('en-US')}
              </motion.div>
            )}

            <div className="mt-4 text-[10px] font-black tracking-[0.3em] text-white/20 uppercase">
              Provably Fair
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Wheel Container */}
      <div
        className="relative aspect-square w-[min(520px,90vw)]"
        style={{
          transform: 'rotateX(58deg)',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8))',
        }}
      >
        {/* Ambient Shadow (Occlusion) */}
        <div
          className="absolute inset-[-60px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle, #000 60%, transparent 100%)',
            transform: 'translateZ(-40px)',
          }}
        />

        {/* Outer Wooden/Carbon Rim */}
        <div
          className="absolute inset-[-45px] rounded-full border-[22px] border-[#111]"
          style={{
            background: 'conic-gradient(from 0deg, #0a0a0a, #1a1a1a, #0a0a0a, #1a1a1a, #0a0a0a)',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,1), 0 20px 0 #000',
            transform: 'translateZ(-25px)',
          }}
        >
          {/* Decorative Gold Inner Rim */}
          <div className="border-primary/20 absolute inset-0 rounded-full border" />
        </div>

        {/* Spinning Wheel Body */}
        <div
          className="relative h-full w-full rounded-full"
          style={{
            transition: `transform ${turboMode ? 1.2 : 6.2}s cubic-bezier(0.1, 0, 0.15, 1)`,
            willChange: 'transform',
            transform: `rotate(${wheelRotation}deg)`,
            background: '#050505',
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 60px rgba(0,0,0,1)',
          }}
        >
          {WHEEL_ORDER.map((num, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 h-1/2 w-[32px] origin-bottom -translate-x-1/2 md:w-[42px]"
              style={{
                transform: `rotate(${(i * 360) / 37}deg)`,
                background:
                  num.c === 'RED'
                    ? 'hsl(var(--error))'
                    : num.c === 'BLACK'
                      ? '#0a0a0a'
                      : 'hsl(var(--success))',
                clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
                border: '0.5px solid rgba(255,255,255,0.03)',
              }}
            >
              <span
                className="absolute top-4 left-1/2 -translate-x-1/2 rotate-180 text-[11px] font-black text-white select-none md:text-[13px]"
                style={{ textShadow: '0 3px 6px rgba(0,0,0,1)', letterSpacing: '-0.05em' }}
              >
                {num.n}
              </span>
            </div>
          ))}

          {/* Inner Decorative Polish */}
          <div className="absolute inset-[18%] rounded-full border-4 border-[#0a0a0a] bg-gradient-to-br from-[#111] to-[#000] shadow-inner" />
          <div className="absolute inset-[38%] rounded-full border-2 border-[#111] bg-gradient-to-br from-[#1a1a1a] to-[#050505] shadow-2xl" />

          {/* Dynamic Light Reflection */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 40%, rgba(255,255,255,0.03) 60%, transparent 100%)',
            }}
          />
        </div>

        {/* Ball Track */}
        <div
          className="absolute inset-[8%]"
          style={{
            transition: `transform ${turboMode ? 1 : 6}s cubic-bezier(0.1, 0, 0.2, 1)`,
            transform: `rotate(${ballRotation}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            animate={
              spinning
                ? {
                    y: [0, -4, 0],
                    scale: [1, 1.2, 1],
                    filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'],
                  }
                : {
                    y: winningNumber ? 15 : 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }
            }
            transition={
              spinning
                ? { duration: 0.15, repeat: Infinity, ease: 'linear' }
                : { type: 'spring', damping: 15 }
            }
            className="absolute top-0 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow-[0_0_25px_#fff,inset_-3px_-3px_8px_rgba(0,0,0,0.3)] md:h-5 md:w-5"
            style={{ transform: 'translateZ(20px)' }}
          />
        </div>

        {/* Center Spinner Piece */}
        <div
          className="absolute top-1/2 left-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border-4 border-[#222]"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a, #000)',
            transform: 'translateZ(50px)',
            boxShadow: '0 20px 45px rgba(0,0,0,1)',
          }}
        >
          <Dices
            size={36}
            className={`text-primary ${spinning ? 'animate-spin' : 'animate-pulse'}`}
            style={{ animationDuration: spinning ? '2s' : '4s' }}
          />
          {/* Reflective shine */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/15 to-transparent" />
          <div className="absolute inset-0 rounded-full border-t border-white/5" />
        </div>
      </div>
    </div>
  );
};
