'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculatePasswordStrength } from '@/lib/security/password-strength';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const result = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password || password.length === 0) {
    return null;
  }

  const segments = [1, 2, 3, 4] as const;

  return (
    <div
      aria-live="polite"
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginTop: '2px',
        marginBottom: '2px',
      }}
    >
      {/* 4 Segment Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          height: '4px',
          width: '100%',
        }}
      >
        {segments.map((seg) => {
          const isActive = result.score >= seg;
          return (
            <div
              key={seg}
              style={{
                height: '100%',
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: isActive ? 1 : 0,
                  backgroundColor: result.color,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                style={{
                  height: '100%',
                  width: '100%',
                  transformOrigin: 'left center',
                  boxShadow: isActive ? `0 0 8px ${result.color}80` : 'none',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Label & Dynamic Tip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          lineHeight: 1.3,
        }}
      >
        <span
          style={{
            color: result.color,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {result.score >= 3 ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
          {result.label}
        </span>

        <AnimatePresence mode="wait">
          {result.feedback.length > 0 && (
            <motion.span
              key={result.feedback[0]}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
              transition={{ duration: 0.15 }}
              style={{
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'right',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '65%',
              }}
            >
              {result.feedback[0]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
