'use client';

import { motion } from 'framer-motion';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { GUIDE_PERSONAS, PERSONA_META, type GuidePersona } from '@/lib/casino/chat-guide/personas';

const PERSONA_BADGES: Record<
  GuidePersona,
  {
    tag: string;
    sub: string;
    shortLabel: string;
  }
> = {
  math_strategist: {
    tag: 'EV & Quoten',
    sub: 'Analytik & Strategie',
    shortLabel: 'Strategist',
  },
  high_roller: {
    tag: 'VIP Concierge',
    sub: 'High-Stakes & Limits',
    shortLabel: 'VIP Host',
  },
  casual_buddy: {
    tag: 'Spielspaß & FAQ',
    sub: 'Lockere Unterhaltung',
    shortLabel: 'Casual',
  },
};

interface GuideHeaderProps {
  isExpanded: boolean;
  isMobile: boolean;
  activePersona?: GuidePersona;
  onSelectPersona?: (persona: GuidePersona) => void;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function GuideHeader({
  isExpanded,
  isMobile,
  activePersona = 'math_strategist',
  onSelectPersona,
  onToggleExpand,
  onClose,
}: GuideHeaderProps) {
  const activeMeta = PERSONA_META[activePersona] ?? PERSONA_META.math_strategist;

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isExpanded ? '11px' : '9px',
        padding: isExpanded ? '18px 20px 14px 20px' : '16px 16px 10px 16px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        background: 'transparent',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1.5px solid rgba(212, 175, 55, 0.65)',
            boxShadow: '0 0 10px rgba(212, 175, 55, 0.25)',
            flexShrink: 0,
            background: '#0B0E14',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeMeta.imagePath}
            alt={activeMeta.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 18%',
              display: 'block',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong
              id="royale-guide-title"
              style={{
                fontSize: '0.86rem',
                letterSpacing: '0.03em',
                color: '#FFFFFF',
                textWrap: 'balance',
              }}
            >
              Royale Guide
            </strong>
            <span
              style={{
                fontSize: '0.58rem',
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: '4px',
                background: 'hsla(var(--primary), 0.16)',
                border: '1px solid hsla(var(--primary), 0.35)',
                color: 'hsl(var(--primary))',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              AI
            </span>
          </div>
          <span
            style={{ fontSize: '0.66rem', color: 'hsl(var(--text-muted))', textWrap: 'balance' }}
          >
            {isExpanded
              ? `Casino AI Assistant & Knowledge Hub • ${activeMeta.label}`
              : activeMeta.label}
          </span>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Maximize / Minimize Button */}
          {!isMobile && (
            <motion.button
              type="button"
              className="relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:outline-none"
              aria-label={isExpanded ? 'Verkleinern' : 'Vollbild / Großansicht öffnen'}
              title={isExpanded ? 'Auf Standardgröße verkleinern' : '2-Spalten Großansicht öffnen'}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onToggleExpand}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '28px',
                padding: '0 10px',
                border: isExpanded
                  ? '1px solid rgba(212, 175, 55, 0.55)'
                  : '1px solid rgba(212, 175, 55, 0.28)',
                borderRadius: '6px',
                background: isExpanded ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isExpanded ? '#D4AF37' : 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.70rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                cursor: 'pointer',
                boxShadow: 'none',
                transition: 'all 0.18s ease',
              }}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{isExpanded ? 'Standard' : 'Großansicht'}</span>
            </motion.button>
          )}

          {/* Close Button */}
          <motion.button
            type="button"
            className="relative before:absolute before:inset-[-8px] before:content-[''] focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-1 focus-visible:ring-offset-black focus-visible:outline-none"
            aria-label="Close Royale Guide"
            whileHover={{
              scale: 1.05,
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '28px',
              height: '28px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '7px',
              background: 'rgba(18, 23, 34, 0.85)',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={14} aria-hidden />
          </motion.button>
        </div>
      </div>

      {/* Adaptive Persona Selector (Option A: VIP-Concierge Badge-Karten mit Live-Charakter-Tags) */}
      {isExpanded && !isMobile ? (
        /* Expanded Mode: Centered, balanced luxury VIP-Concierge badge cards */
        <div
          role="radiogroup"
          aria-label="Guide Host Persona"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            padding: '6px',
            maxWidth: '720px',
            width: '100%',
            margin: '0 auto',
            background: 'rgba(11, 14, 20, 0.45)',
            border: '1px solid rgba(212, 175, 55, 0.18)',
            borderRadius: '12px',
          }}
        >
          {GUIDE_PERSONAS.map((p) => {
            const meta = PERSONA_META[p];
            const badge = PERSONA_BADGES[p];
            const isSelected = activePersona === p;

            return (
              <motion.button
                key={p}
                type="button"
                role="radio"
                aria-checked={isSelected}
                title={`${meta.label}: ${meta.description}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPersona?.(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 11px',
                  borderRadius: '9px',
                  border: isSelected
                    ? '1px solid rgba(212, 175, 55, 0.70)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(11, 14, 20, 0.85) 100%)'
                    : 'rgba(18, 23, 34, 0.35)',
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? '0 6px 18px rgba(0, 0, 0, 0.55), 0 0 14px rgba(212, 175, 55, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                    : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                {/* 3D Medaillon Avatar with Live Indicator Dot */}
                <div
                  style={{
                    position: 'relative',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    overflow: 'visible',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: isSelected
                        ? '1.5px solid hsl(var(--primary))'
                        : '1.5px solid rgba(255, 255, 255, 0.22)',
                      boxShadow: isSelected
                        ? '0 0 12px hsla(var(--primary), 0.45)'
                        : '0 2px 6px rgba(0, 0, 0, 0.4)',
                      background: '#0B0E14',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meta.imagePath}
                      alt={meta.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 18%',
                      }}
                    />
                  </div>

                  {/* Active Live Indicator Dot */}
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '1.5px solid #0B0E14',
                        boxShadow: '0 0 6px #10b981',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Info Column with Name & Signature Character Tag */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    minWidth: 0,
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#D4AF37' : '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {meta.label}
                  </span>

                  {/* Character Tag (Decolored, Obsidian & Gold Luxury) */}
                  <span
                    style={{
                      fontSize: '0.54rem',
                      fontWeight: 600,
                      lineHeight: 1,
                      padding: '2.5px 7px',
                      borderRadius: '4px',
                      background: isSelected
                        ? 'rgba(212, 175, 55, 0.12)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected
                        ? '1px solid rgba(212, 175, 55, 0.32)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.52)',
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {badge.tag}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        /* Standard / Mobile Mode: Ultra-sleek compact segmented pill selector */
        <div
          role="radiogroup"
          aria-label="Guide Host Persona"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
            padding: '4px',
            background: 'rgba(11, 14, 20, 0.50)',
            border: '1px solid rgba(212, 175, 55, 0.16)',
            borderRadius: '10px',
          }}
        >
          {GUIDE_PERSONAS.map((p) => {
            const meta = PERSONA_META[p];
            const badge = PERSONA_BADGES[p];
            const isSelected = activePersona === p;

            return (
              <motion.button
                key={p}
                type="button"
                role="radio"
                aria-checked={isSelected}
                title={`${meta.label} (${badge.tag}): ${meta.description}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectPersona?.(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '5px 6px',
                  borderRadius: '7px',
                  border: isSelected
                    ? '1px solid rgba(212, 175, 55, 0.55)'
                    : '1px solid rgba(255, 255, 255, 0.04)',
                  background: isSelected ? 'rgba(212, 175, 55, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  minWidth: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    overflow: 'visible',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: isSelected
                        ? '1px solid #D4AF37'
                        : '1px solid rgba(255, 255, 255, 0.20)',
                      background: '#0B0E14',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meta.imagePath}
                      alt={meta.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 18%',
                      }}
                    />
                  </div>
                  {isSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-1px',
                        right: '-1px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '1px solid #0B0E14',
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    minWidth: 0,
                    gap: '1px',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.90)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {badge.shortLabel}
                  </span>
                  <span
                    style={{
                      fontSize: '0.47rem',
                      fontWeight: 500,
                      color: isSelected ? 'rgba(212, 175, 55, 0.85)' : 'rgba(255, 255, 255, 0.45)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {badge.tag}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </header>
  );
}
