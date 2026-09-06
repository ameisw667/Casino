'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { springs } from '@/lib/design/motion-tokens';
import type { CategoryType } from '@/app/games/_components/config';

// ──── Filter-Tabs mit layoutId-Shared-Element-Pill (motion.dev: Layout-Animation) ────
// Die Gold-Pill ist EIN Element mit stabiler layoutId — bei Tab-Wechsel wandert sie
// springend zum aktiven Tab, statt pro Tab neu gemountet zu werden.
export function MotionFilterTabs({
  categories,
  selected,
  onSelect,
}: {
  categories: readonly CategoryType[];
  selected: CategoryType;
  onSelect: (category: CategoryType) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Spielkategorien"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
        <Layers size={14} color="#D4AF37" />
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
          }}
        >
          Filter:
        </span>
      </div>
      {categories.map((category) => {
        const isActive = selected === category;
        return (
          <motion.button
            key={category}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(category)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={springs.snappy}
            style={{
              position: 'relative',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              isolation: 'isolate',
              border: isActive ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              background: isActive ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
              color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="games2-active-tab"
                transition={springs.gentle}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  background:
                    'linear-gradient(90deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.06) 100%)',
                  border: '1px solid #D4AF37',
                  boxShadow: '0 0 16px rgba(212, 175, 55, 0.22)',
                  zIndex: -1,
                }}
              />
            )}
            {category}
          </motion.button>
        );
      })}
    </div>
  );
}
