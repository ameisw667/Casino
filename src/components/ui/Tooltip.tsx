'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              x: '-50%',
              marginBottom: '8px',
              padding: '6px 12px',
              background: '#243b4a',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              borderRadius: '6px',
              whiteSpace: 'nowrap',
              zIndex: 3000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
              pointerEvents: 'none',
            }}
          >
            {content}
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                x: '-50%',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid #243b4a',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
