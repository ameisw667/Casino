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
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 224, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '224px',
        borderRight: '1px solid rgba(212, 175, 55, 0.18)',
        background:
          'linear-gradient(180deg, rgba(11, 14, 20, 0.72) 0%, rgba(11, 14, 20, 0.42) 100%)',
        backdropFilter: 'blur(12px)',
        padding: '14px 10px 10px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', minWidth: '204px' }}>
        {/* Header Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px 2px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          <span
            style={{
              fontSize: '0.50rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'rgba(212, 175, 55, 0.85)',
              background: 'rgba(212, 175, 55, 0.10)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              borderRadius: '999px',
              padding: '1px 6px',
            }}
          >
            VIP Hub
          </span>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {SIDEBAR_TOPICS.map((group, groupIdx) => (
            <div
              key={group.category}
              style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}
            >
              {/* Category Header with luxury gold hairline divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: groupIdx > 0 ? '4px 4px 2px 4px' : '0 4px 2px 4px',
                  borderTop:
                    groupIdx > 0
                      ? '1px solid rgba(212, 175, 55, 0.12)'
                      : 'none',
                }}
              >
                <span
                  style={{
                    fontSize: '0.50rem',
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.42)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.09em',
                  }}
                >
                  {group.category}
                </span>
              </div>

              {/* Items in this category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
                          : 'rgba(212, 175, 55, 0.40)',
                        backgroundColor: isContextMatch
                          ? 'rgba(212, 175, 55, 0.22)'
                          : 'rgba(255, 255, 255, 0.06)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTopicClick(item.query)}
                      disabled={isSending}
                      className="group relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        width: '100%',
                        textAlign: 'left',
                        padding: '4.5px 7px 4.5px 9px',
                        borderRadius: '7px',
                        border: isContextMatch
                          ? '1px solid rgba(212, 175, 55, 0.70)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                        background: isContextMatch
                          ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.20) 0%, rgba(212, 175, 55, 0.05) 100%)'
                          : 'rgba(18, 23, 34, 0.45)',
                        cursor: isSending ? 'not-allowed' : 'pointer',
                        transition: 'border-color 0.16s ease, background-color 0.16s ease',
                        boxShadow: isContextMatch
                          ? '0 0 10px rgba(212, 175, 55, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.10)'
                          : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Left Gold Accent Indicator Bar */}
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '10%',
                          bottom: '10%',
                          width: '3px',
                          borderRadius: '0 2px 2px 0',
                          backgroundColor: isContextMatch ? '#D4AF37' : 'transparent',
                          boxShadow: isContextMatch ? '0 0 8px rgba(212, 175, 55, 0.75)' : 'none',
                          transition: 'all 0.18s ease',
                        }}
                        className={
                          isContextMatch
                            ? ''
                            : 'group-hover:bg-[#D4AF37]/80 group-hover:shadow-[0_0_8px_rgba(212,175,55,0.60)]'
                        }
                      />

                      {/* Left Icon Pill */}
                      <div
                        style={{
                          display: 'grid',
                          placeItems: 'center',
                          width: '21px',
                          height: '21px',
                          borderRadius: '5px',
                          background: isContextMatch
                            ? 'rgba(212, 175, 55, 0.28)'
                            : 'rgba(255, 255, 255, 0.05)',
                          border: isContextMatch
                            ? '1px solid rgba(212, 175, 55, 0.55)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isContextMatch ? '#D4AF37' : 'rgba(255, 255, 255, 0.65)',
                          flexShrink: 0,
                          transition: 'all 0.16s ease',
                        }}
                        className="group-hover:border-[#D4AF37]/50 group-hover:text-[#D4AF37] group-hover:scale-105"
                      >
                        <Icon size={12} />
                      </div>

                      {/* Label & Subtitle Text Column */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: 0,
                          flex: 1,
                          gap: '1px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: isContextMatch ? 700 : 500,
                              color: isContextMatch ? '#D4AF37' : 'rgba(255, 255, 255, 0.88)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              letterSpacing: '0.01em',
                            }}
                            className="group-hover:text-[#D4AF37] transition-colors"
                          >
                            {item.label}
                          </span>
                          {isContextMatch && (
                            <span
                              style={{
                                fontSize: '0.46rem',
                                fontWeight: 700,
                                color: '#10b981',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2.5px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                padding: '0 3.5px',
                                borderRadius: '3px',
                                border: '1px solid rgba(16, 185, 129, 0.28)',
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  width: '3.5px',
                                  height: '3.5px',
                                  borderRadius: '50%',
                                  background: '#10b981',
                                  boxShadow: '0 0 4px #10b981',
                                }}
                              />
                              Aktiv
                            </span>
                          )}
                        </div>

                        <span
                          style={{
                            fontSize: '0.52rem',
                            color: isContextMatch
                              ? 'rgba(212, 175, 55, 0.75)'
                              : 'rgba(255, 255, 255, 0.40)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            lineHeight: 1.15,
                          }}
                        >
                          {item.sub}
                        </span>
                      </div>

                      {/* Micro-Chevron with glide */}
                      <ChevronRight
                        size={11}
                        style={{
                          color: isContextMatch ? '#D4AF37' : 'rgba(255, 255, 255, 0.25)',
                          flexShrink: 0,
                          transition: 'transform 0.18s ease, color 0.18s ease',
                        }}
                        className="group-hover:translate-x-0.5 group-hover:text-[#D4AF37]"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Status Footer with pulsing Live-Radar-Dot */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '8px',
          borderTop: '1px solid rgba(212, 175, 55, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: 0.85,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              position: 'relative',
              width: '7px',
              height: '7px',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#10b981',
                opacity: 0.65,
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 6px #10b981',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '0.55rem',
              color: 'rgba(255, 255, 255, 0.60)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Knowledge Hub • Live
          </span>
        </div>
        <span
          style={{
            fontSize: '0.50rem',
            fontWeight: 700,
            color: '#D4AF37',
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}
        >
          v2.4
        </span>
      </div>
    </motion.aside>
  );
}
