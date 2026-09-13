'use client';

import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

interface GuideTriggerButtonProps {
  isOpen: boolean;
  isMobile?: boolean;
  panelBottom: string;
  unreadCount?: number;
  onOpen: () => void;
}

export function GuideTriggerButton({
  isOpen,
  isMobile = false,
  panelBottom,
  unreadCount = 0,
  onOpen,
}: GuideTriggerButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  // Magnetic cursor attraction (Desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile || shouldReduceMotion || !buttonRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (clientX - centerX) * 0.28;
    const deltaY = (clientY - centerY) * 0.28;
    setMagneticOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  if (isOpen) {
    return null;
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      data-testid="royale-guide-trigger"
      aria-label="Royale VIP Guide öffnen"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: magneticOffset.x,
        ...(shouldReduceMotion
          ? {}
          : {
              boxShadow: [
                '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 12px hsla(45, 85%, 55%, 0.16), inset 0 1px 0 hsla(45, 100%, 75%, 0.3)',
                '0 12px 30px rgba(0, 0, 0, 0.75), 0 0 20px hsla(45, 85%, 55%, 0.26), inset 0 1px 0 hsla(45, 100%, 75%, 0.45)',
                '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 12px hsla(45, 85%, 55%, 0.16), inset 0 1px 0 hsla(45, 100%, 75%, 0.3)',
              ],
            }),
      }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 8 }}
      transition={{
        opacity: { duration: 0.2 },
        scale: { duration: 0.25 },
        x: { type: 'spring', stiffness: 350, damping: 20, mass: 0.1 },
        y: { type: 'spring', stiffness: 350, damping: 20, mass: 0.1 },
        boxShadow: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' },
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.045,
              borderColor: 'rgba(212, 175, 55, 0.75)',
            }
      }
      whileTap={{ scale: 0.94 }}
      onClick={onOpen}
      style={{
        position: 'fixed',
        right: isMobile ? '12px' : '24px',
        bottom: panelBottom,
        zIndex: 46,
        display: 'inline-flex',
        alignItems: 'center',
        gap: isMobile ? '7px' : '10px',
        border: '1px solid rgba(212, 175, 55, 0.48)',
        borderRadius: '999px',
        padding: isMobile ? '8px 14px' : '12px 20px',
        background: 'linear-gradient(135deg, rgba(18, 23, 34, 0.96) 0%, rgba(11, 14, 20, 0.94) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontSize: isMobile ? '0.68rem' : '0.76rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      {/* 24k Gold Mascot / Icon */}
      <div
        style={{
          position: 'relative',
          width: isMobile ? 18 : 22,
          height: isMobile ? 18 : 22,
          flexShrink: 0,
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
        }}
      >
        <Image
          src="/images/royale-guide-mascot-icon.png"
          alt=""
          width={isMobile ? 18 : 22}
          height={isMobile ? 18 : 22}
          aria-hidden
          style={{ objectFit: 'contain' }}
        />
      </div>

      <span>{isMobile ? 'GUIDE' : 'Royale Guide'}</span>

      {/* AI Chip Badge */}
      <span
        style={{
          fontSize: isMobile ? '0.55rem' : '0.62rem',
          lineHeight: 1,
          padding: isMobile ? '2px 5px' : '3px 6px',
          borderRadius: '4px',
          background: 'rgba(212, 175, 55, 0.18)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          color: '#D4AF37',
          fontWeight: 900,
          letterSpacing: '0.05em',
        }}
      >
        AI
      </span>

      {/* Live Radar Ping Dot & Ring */}
      <div
        style={{
          position: 'relative',
          width: isMobile ? '8px' : '10px',
          height: isMobile ? '8px' : '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '2px',
        }}
      >
        {!shouldReduceMotion && (
          <motion.span
            animate={{
              scale: [1, 2.3],
              opacity: [0.75, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: '#10b981',
              pointerEvents: 'none',
            }}
            aria-hidden
          />
        )}
        <span
          style={{
            width: isMobile ? '6px' : '7px',
            height: isMobile ? '6px' : '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981',
            position: 'relative',
            zIndex: 1,
          }}
          aria-hidden
        />
      </div>

      {/* Optional Unread Notification Badge */}
      {unreadCount > 0 && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '16px',
            height: '16px',
            padding: '0 4px',
            borderRadius: '999px',
            background: '#D4AF37',
            color: '#0B0E14',
            fontSize: '0.58rem',
            fontWeight: 900,
            lineHeight: 1,
            boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </motion.button>
  );
}

