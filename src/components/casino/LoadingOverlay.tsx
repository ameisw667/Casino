'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function LoadingOverlay() {
  const isLoading = useCasinoStore(state => state.isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'hsla(var(--bg-color), 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px'
          }}
        >
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px solid hsla(var(--primary), 0.1)',
                borderTopColor: 'hsl(var(--primary))',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                inset: '20px',
                borderRadius: '50%',
                background: 'hsl(var(--primary))',
                boxShadow: '0 0 30px hsla(var(--primary), 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: 'black'
              }}
            >
              R
            </motion.div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '2px', color: 'white' }}>
              INITIALIZING ENGINE
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--primary))', marginTop: '4px' }}>
              PROVABLY FAIR VERIFICATION IN PROGRESS
            </div>
          </div>
          
          <div style={{ width: '200px', height: '4px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              animate={{ x: [-200, 200] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
