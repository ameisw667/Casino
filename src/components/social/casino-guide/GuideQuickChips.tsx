'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

import { SIDEBAR_TOPICS } from '@/components/social/casino-guide/guide-config';
import { springs } from '@/lib/design/motion-tokens';

interface GuideQuickChipsProps {
  isSending: boolean;
  onChipClick: (query: string) => void;
}

// Flat list of all 10 topics
const ALL_TOPICS = SIDEBAR_TOPICS.flatMap((group) =>
  group.items.map((item) => ({
    label: item.label,
    query: item.query,
    tag: item.tag,
  })),
);

const ROUTE_TAG_MAP: Record<string, string> = {
  '/games/blackjack': 'BJ',
  '/games/crash': 'CR',
  '/games/roulette': 'RL',
  '/games/dice': 'DC',
  '/games/slots': 'SL',
};

export function GuideQuickChips({ isSending, onChipClick }: GuideQuickChipsProps) {
  const pathname = usePathname();
  const activeRouteTag = pathname ? ROUTE_TAG_MAP[pathname] : undefined;

  const shouldReduceMotion = useReducedMotion();

  // Sort matched game topic to the very front
  const sortedTopics = [...ALL_TOPICS].sort((a, b) => {
    if (a.tag === activeRouteTag) return -1;
    if (b.tag === activeRouteTag) return 1;
    return 0;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.02,
      },
    },
  };

  const chipVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springs.snappy,
    },
  };

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        gap: '8px',
        padding: '10px 14px',
        overflowX: 'auto',
        borderTop: '1px solid hsla(var(--primary), 0.12)',
        background: 'rgba(11, 14, 20, 0.40)',
        scrollbarWidth: 'none',
      }}
    >
      {sortedTopics.map((item) => {
        const isCurrentTable = Boolean(activeRouteTag && item.tag === activeRouteTag);

        return (
          <motion.button
            key={item.label}
            type="button"
            variants={shouldReduceMotion ? undefined : chipVariants}
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    scale: 1.04,
                    borderColor: 'hsla(var(--primary), 0.7)',
                    backgroundColor: 'hsla(var(--primary), 0.18)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4), 0 0 10px hsla(var(--primary), 0.25)',
                  }
            }
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            transition={springs.snappy}
            onClick={() => onChipClick(item.query)}
            disabled={isSending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              padding: '6px 13px',
              borderRadius: '8px',
              border: isCurrentTable
                ? '1px solid hsla(var(--primary), 0.8)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              background: isCurrentTable
                ? 'linear-gradient(135deg, hsla(var(--primary), 0.28) 0%, hsla(var(--primary), 0.12) 100%)'
                : 'rgba(255, 255, 255, 0.04)',
              color: isCurrentTable ? 'hsl(var(--primary))' : '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: isCurrentTable ? 700 : 600,
              cursor: isSending ? 'not-allowed' : 'pointer',
              opacity: isSending ? 0.6 : 1,
              transition: 'border-color 0.18s ease, background-color 0.18s ease',
              boxShadow: isCurrentTable
                ? '0 0 12px hsla(var(--primary), 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              flexShrink: 0,
            }}
          >
            {item.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
