'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface WinLineProps {
  rowIndex: 0 | 1 | 2 | null;
  isVisible: boolean;
}

const ROW_TOP_PERCENT: Record<0 | 1 | 2, number> = {
  0: 16.7,
  1: 50,
  2: 83.3,
};

export function WinLine({ rowIndex, isVisible }: WinLineProps) {
  if (rowIndex === null) return null;

  const topPercent = ROW_TOP_PERCENT[rowIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`winline-${rowIndex}`}
          style={{
            position: 'absolute',
            left: -10,
            right: -10,
            top: `${topPercent}%`,
            transform: 'translateY(-50%)',
            height: 4,
            pointerEvents: 'none',
            zIndex: 20,
            borderRadius: 2,
            background: 'linear-gradient(90deg, transparent 0%, #D4AF37 8%, #FFD700 50%, #D4AF37 92%, transparent 100%)',
            boxShadow: '0 0 10px #D4AF37, 0 0 22px #D4AF3780, 0 0 38px #D4AF3740',
            transformOrigin: 'center center',
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0, scaleX: 0.6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        />
      )}
    </AnimatePresence>
  );
}
