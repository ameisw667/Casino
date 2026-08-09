'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function LoadingOverlay() {
  const isMobile = useCasinoStore((state) => state.isMobile);
  const isLoading = useCasinoStore((state) => state.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          style={{
            position: 'fixed',
            bottom: isMobile ? '88px' : '24px',
            right: isMobile ? '12px' : '24px',
            left: isMobile ? '12px' : 'auto',
            zIndex: 99999,
            background: 'hsla(var(--bg-color), 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid hsla(var(--primary), 0.2)',
            borderRadius: '24px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ position: 'relative', width: '40px', height: '40px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2px solid hsla(var(--primary), 0.1)',
                borderTopColor: 'hsl(var(--primary))',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: '10px',
                borderRadius: '50%',
                background: 'hsl(var(--primary))',
                boxShadow: '0 0 15px hsla(var(--primary), 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 900,
                color: 'black',
              }}
            >
              R
            </motion.div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div
              style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px', color: 'white' }}
            >
              INITIALIZING ENGINE
            </div>
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 800,
                color: 'hsl(var(--primary))',
                marginTop: '2px',
              }}
            >
              PROVABLY FAIR VERIFICATION
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
