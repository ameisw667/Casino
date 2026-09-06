'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Spade,
  Rocket,
  CircleDot,
  Dices,
  Sparkles,
  Crown,
  ShieldCheck,
  Scale,
  Compass,
  Terminal,
  ChevronRight,
  Zap,
} from 'lucide-react';

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

const ITEM_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
> = {
  BJ: Spade,
  CR: Rocket,
  RL: CircleDot,
  DC: Dices,
  SL: Sparkles,
  VIP: Crown,
  PF: ShieldCheck,
  LIM: Scale,
  NAV: Compass,
  CMD: Terminal,
};

export function GuideSidebar({ isSending, onTopicClick }: GuideSidebarProps) {
  const pathname = usePathname();
  const activeRouteTag = pathname ? ROUTE_TAG_MAP[pathname] : undefined;

  return (
    <aside
      style={{
        width: '224px',
        borderRight: '1px solid rgba(212, 175, 55, 0.15)',
        background:
          'linear-gradient(180deg, rgba(11, 14, 20, 0.55) 0%, rgba(11, 14, 20, 0.25) 100%)',
        padding: '14px 10px 10px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Header Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 4px 2px 4px',
          }}
        >
          <Zap size={11} color="#D4AF37" aria-hidden />
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.10em',
              color: '#D4AF37',
            }}
          >
            Schnellzugriff
          </span>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SIDEBAR_TOPICS.map((group, groupIdx) => (
            <div
              key={group.category}
              style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
            >
              {/* Category Header with subtle divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: groupIdx > 0 ? '4px 4px 2px 4px' : '0 4px 2px 4px',
                  borderTop: groupIdx > 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.52rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.40)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {group.category}
                </span>
              </div>

              {/* Items in this category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
                {group.items.map((item) => {
                  const isContextMatch = Boolean(activeRouteTag && item.tag === activeRouteTag);
                  const Icon = ITEM_ICONS[item.tag] ?? Sparkles;

                  return (
                    <motion.button
                      key={item.label}
                      type="button"
                      whileHover={{
                        x: 3,
                        borderColor: isContextMatch
                          ? 'rgba(212, 175, 55, 0.85)'
                          : 'rgba(212, 175, 55, 0.35)',
                        backgroundColor: isContextMatch
                          ? 'rgba(212, 175, 55, 0.22)'
                          : 'rgba(255, 255, 255, 0.06)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTopicClick(item.query)}
                      disabled={isSending}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        textAlign: 'left',
                        padding: '5.5px 8px',
                        borderRadius: '7px',
                        border: isContextMatch
                          ? '1px solid rgba(212, 175, 55, 0.70)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        background: isContextMatch
                          ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.20) 0%, rgba(212, 175, 55, 0.05) 100%)'
                          : 'rgba(18, 23, 34, 0.45)',
                        cursor: isSending ? 'not-allowed' : 'pointer',
                        transition: 'all 0.16s ease',
                        boxShadow: isContextMatch
                          ? '0 0 10px rgba(212, 175, 55, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : 'none',
                      }}
                    >
                      {/* Left Icon Pill */}
                      <div
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '5px',
                          background: isContextMatch
                            ? 'rgba(212, 175, 55, 0.25)'
                            : 'rgba(255, 255, 255, 0.05)',
                          color: isContextMatch ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)',
                          flexShrink: 0,
                          transition: 'all 0.16s ease',
                        }}
                      >
                        <Icon size={12} />
                      </div>

                      {/* Label Text */}
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: isContextMatch ? 700 : 500,
                          color: isContextMatch ? '#D4AF37' : 'rgba(255, 255, 255, 0.88)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          letterSpacing: '0.01em',
                          flex: 1,
                        }}
                      >
                        {item.label}
                      </span>

                      {/* Subtle Right Chevron */}
                      <ChevronRight
                        size={11}
                        style={{
                          color: isContextMatch ? '#D4AF37' : 'rgba(255, 255, 255, 0.25)',
                          flexShrink: 0,
                        }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Status Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: 0.75,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 5px #10b981',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '0.56rem',
            color: 'hsl(var(--text-muted))',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          Knowledge Hub • Live
        </span>
      </div>
    </aside>
  );
}
