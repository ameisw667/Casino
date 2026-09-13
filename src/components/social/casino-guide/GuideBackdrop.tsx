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
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            background: isMobile
              ? 'rgba(0, 0, 0, 0.72)'
              : isExpanded
                ? 'hsla(0, 0%, 0%, 0.65)'
                : 'hsla(0, 0%, 0%, 0.38)',
            backdropFilter: isMobile
              ? 'blur(8px)'
              : isExpanded
                ? 'blur(12px)'
                : 'blur(6px)',
            WebkitBackdropFilter: isMobile
              ? 'blur(8px)'
              : isExpanded
                ? 'blur(12px)'
                : 'blur(6px)',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Mesh Light Orbs (Warme Gold-Sphären) */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '15%',
              right: isMobile ? '10%' : '25%',
              width: '440px',
              height: '380px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.16) 0%, transparent 70%)',
              filter: 'blur(80px)',
              pointerEvents: 'none',
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '10%',
              right: isMobile ? '5%' : '15%',
              width: '400px',
              height: '340px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180, 140, 30, 0.12) 0%, transparent 70%)',
              filter: 'blur(90px)',
              pointerEvents: 'none',
            }}
          />
          {/* Third Ambient Gold Orb for Expanded 880px Modal */}
          {isExpanded && !isMobile && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute',
                top: '25%',
                left: '18%',
                width: '420px',
                height: '420px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(212, 175, 55, 0.14) 0%, transparent 70%)',
                filter: 'blur(95px)',
                pointerEvents: 'none',
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
