'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { SIDEBAR_TOPICS } from '@/components/social/casino-guide/guide-config';

interface GuideSidebarProps {
  isSending: boolean;
  onTopicClick: (query: string) => void;
}

// Maps game route slugs to their matching item tag
const ROUTE_TAG_MAP: Record<string, string> = {
  '/games/blackjack': 'BJ',
  '/games/crash': 'CR',
  '/games/roulette': 'RL',
  '/games/dice': 'DC',
  '/games/slots': 'SL',
};

export function GuideSidebar({ isSending, onTopicClick }: GuideSidebarProps) {
  const pathname = usePathname();
  const activeRouteTag = pathname ? ROUTE_TAG_MAP[pathname] : undefined;

  return (
    <aside
      style={{
        width: '210px',
        borderRight: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'rgba(11, 14, 20, 0.22)',
        padding: '10px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: '0.62rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'hsl(var(--primary))',
          padding: '2px 4px 0',
        }}
      >
        Schnellzugriff
      </div>

      {SIDEBAR_TOPICS.map((group) => (
        <div key={group.category} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            style={{
              fontSize: '0.54rem',
              fontWeight: 700,
              color: 'hsl(var(--text-muted))',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              padding: '1px 4px',
            }}
          >
            {group.category}
          </span>
          {group.items.map((item) => {
            const isContextMatch = Boolean(activeRouteTag && item.tag === activeRouteTag);

            return (
              <motion.button
                key={item.label}
                type="button"
                whileHover={{
                  x: 3,
                  borderColor: isContextMatch ? 'hsl(var(--primary))' : 'hsla(var(--primary), 0.5)',
                  backgroundColor: isContextMatch
                    ? 'hsla(var(--primary), 0.22)'
                    : 'rgba(255, 255, 255, 0.08)',
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTopicClick(item.query)}
                disabled={isSending}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: isContextMatch
                    ? '1px solid hsla(var(--primary), 0.75)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isContextMatch
                    ? 'linear-gradient(90deg, hsla(var(--primary), 0.2) 0%, hsla(var(--primary), 0.06) 100%)'
                    : 'rgba(14, 18, 26, 0.40)',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isContextMatch
                    ? '0 0 10px hsla(var(--primary), 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: isContextMatch ? 700 : 500,
                    color: isContextMatch ? 'hsl(var(--primary))' : 'rgba(255, 255, 255, 0.92)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    letterSpacing: '0.01em',
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      ))}

      {/* Subtle Status Footer */}
      <div
        style={{
          marginTop: 'auto',
          padding: '4px 6px 2px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          opacity: 0.7,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 4px #10b981',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '0.56rem',
            color: 'hsl(var(--text-muted))',
            letterSpacing: '0.02em',
          }}
        >
          RAG active
        </span>
      </div>
    </aside>
  );
}
