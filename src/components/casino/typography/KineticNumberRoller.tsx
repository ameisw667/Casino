'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface KineticNumberRollerProps {
  formatted: string;
  className?: string;
  isMobile?: boolean;
}

function KineticChar({ char, index }: { char: string; index: number }) {
  const isCurrency = char === '$';
  const isSeparator = char === ',' || char === '.';
  const isStatic = isCurrency || isSeparator || char === '―' || char === ' ';

  if (isCurrency) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFE885',
          fontSize: '0.85em',
          fontWeight: 900,
          marginRight: '6px',
          filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))',
          letterSpacing: '0.02em',
          userSelect: 'none',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        $
      </span>
    );
  }

  if (isSeparator) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F5E08C',
          fontWeight: 900,
          margin: '0 2px',
          fontSize: char === ',' ? '1.05em' : '1.15em',
          filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))',
          userSelect: 'none',
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        {char}
      </span>
    );
  }

  if (isStatic) {
    return (
      <span
        style={{
          display: 'inline-block',
          margin: '0 2px',
          opacity: 0.6,
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        {char}
      </span>
    );
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        position: 'relative',
        height: '1.28em',
        width: '0.64em',
        overflow: 'hidden',
        verticalAlign: 'middle',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 1px',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{
            y: '65%',
            opacity: 0.2,
            filter: 'blur(1.5px)',
          }}
          animate={{
            y: '0%',
            opacity: 1,
            filter: 'blur(0px)',
          }}
          exit={{
            y: '-65%',
            opacity: 0.2,
            filter: 'blur(1.5px)',
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 28,
            delay: (index % 4) * 0.015,
          }}
          style={{
            position: 'absolute',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'var(--font-mono, monospace)',
            width: '100%',
            height: '100%',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5E08C 35%, #D4AF37 75%, #AA8010 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 6px rgba(212, 175, 55, 0.45))',
            fontWeight: 900,
            zIndex: 1,
          }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export const KineticNumberRoller = memo(function KineticNumberRoller({
  formatted,
  className = '',
}: KineticNumberRollerProps) {
  const chars = formatted.split('');

  return (
    <div
      className={className}
      aria-label={formatted}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 22px',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, #161D27 0%, #0D121A 45%, #07090F 100%)',
        border: '1px solid rgba(212, 175, 55, 0.42)',
        boxShadow:
          'inset 0 2px 6px rgba(0, 0, 0, 0.9), inset 0 -1px 2px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.75), 0 0 28px rgba(212, 175, 55, 0.15)',
        backdropFilter: 'blur(16px)',
        letterSpacing: '0.02em',
        overflow: 'hidden',
      }}
    >
      {/* Oberer Glass-Reflex des Odometer-Chassis */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '35%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Mechanische Walzen-Tiefenblende oben und unten (Odometer Slit Vignette) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(7, 9, 15, 0.82) 0%, transparent 26%, transparent 74%, rgba(7, 9, 15, 0.82) 100%)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Wandernder 24k Gold-Glanz-Reflex */}
      <motion.div
        animate={{
          x: ['-140%', '250%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 4.2,
          ease: 'easeInOut',
          repeatDelay: 2.5,
        }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '35%',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.16) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Einheitliche monolithische Ziffern- und Symbolreihe */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {chars.map((ch, i) => (
          <KineticChar
            key={i + '-' + (ch === ',' || ch === '.' || ch === '$' ? ch : 'num')}
            char={ch}
            index={i}
          />
        ))}
      </div>
    </div>
  );
});
