'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface JackpotLetterCascadeProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  staggerDelay?: number;
  interactive?: boolean;
}

export function JackpotLetterCascade({
  text,
  style,
  staggerDelay = 0.035,
  interactive = true,
}: JackpotLetterCascadeProps) {
  const [cascadeKey, setCascadeKey] = useState(0);

  const handleTrigger = () => {
    if (interactive) {
      setCascadeKey((prev) => prev + 1);
    }
  };

  const words = text.split(' ');

  return (
    <span
      data-testid="jackpot-letter-cascade"
      role="text"
      aria-label={text}
      onMouseEnter={handleTrigger}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.35em',
        cursor: interactive ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {words.map((word, wordIdx) => (
        <span key={`${wordIdx}-${cascadeKey}`} style={{ display: 'inline-flex' }}>
          {word.split('').map((char, charIdx) => {
            const totalIndex = wordIdx * 10 + charIdx;
            return (
              <motion.span
                key={`${char}-${charIdx}-${cascadeKey}`}
                aria-hidden="true"
                initial={{
                  opacity: 0,
                  y: -24,
                  rotateZ: (totalIndex % 2 === 0 ? 1 : -1) * (8 + (totalIndex % 3) * 4),
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateZ: 0,
                  scale: 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 22,
                  delay: totalIndex * staggerDelay,
                }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #D4AF37 55%, #8C6B1B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 8px rgba(212, 175, 55, 0.4))',
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

export default JackpotLetterCascade;
