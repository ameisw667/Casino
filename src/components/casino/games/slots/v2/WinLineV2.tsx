'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface WinLineV2Props {
  rowIndex: 0 | 1 | 2 | null;
  isVisible: boolean;
}

const ROW_TOP_PERCENT: Record<0 | 1 | 2, number> = {
  0: 16.7,
  1: 50,
  2: 83.3,
};

export function WinLineV2({ rowIndex, isVisible }: WinLineV2Props) {
  if (rowIndex === null) return null;

  const topPercent = ROW_TOP_PERCENT[rowIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={`winline-v2-${rowIndex}`}
          style={{
            position: 'absolute',
            left: -10,
            right: -10,
            top: `${topPercent}%`,
            transform: 'translateY(-50%)',
            height: 8,
            pointerEvents: 'none',
            zIndex: 20,
            borderRadius: 4,
            background:
              'linear-gradient(90deg, transparent 0%, #D4AF37 8%, #FFD700 50%, #D4AF37 92%, transparent 100%)',
            animation: 'slot-v2-winline-pulse 1.1s ease-in-out infinite',
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
