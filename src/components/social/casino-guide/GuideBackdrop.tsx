'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface GuideBackdropProps {
  isOpen: boolean;
  isExpanded: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export function GuideBackdrop({ isOpen, isExpanded, isMobile, onClose }: GuideBackdropProps) {
  return (
    <AnimatePresence>
      {isOpen && isExpanded && !isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            background: 'hsla(0, 0%, 0%, 0.65)',
            backdropFilter: 'blur(8px)',
          }}
        />
      )}
    </AnimatePresence>
  );
}
