'use client';

import { motion } from 'framer-motion';

import { QUICK_CHIPS } from '@/components/social/casino-guide/guide-config';

interface GuideQuickChipsProps {
  isSending: boolean;
  onChipClick: (query: string) => void;
}

export function GuideQuickChips({ isSending, onChipClick }: GuideQuickChipsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        padding: '8px 12px',
        overflowX: 'auto',
        borderTop: '1px solid hsla(var(--primary), 0.1)',
        background: 'hsla(var(--primary), 0.02)',
      }}
    >
      {QUICK_CHIPS.map((chip) => {
        const IconComponent = chip.icon;
        return (
          <motion.button
            key={chip.label}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChipClick(chip.query)}
            disabled={isSending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              padding: '5px 9px',
              borderRadius: '8px',
              background: 'hsla(var(--bg-color), 0.7)',
              border: '1px solid hsla(var(--primary), 0.22)',
              color: 'hsl(var(--text-main))',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.6 : 1,
            }}
          >
            <IconComponent size={12} color="hsl(var(--primary))" />
            <span>{chip.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
