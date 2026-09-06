'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  EyeOff,
  Eye,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Move,
} from 'lucide-react';
import { useGameCoPilot, type GameCoPilotContext } from '@/hooks/useGameCoPilot';
import { springs } from '@/lib/design/motion-tokens';

export type HudDockPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface GameCoPilotHudProps {
  context: GameCoPilotContext;
  className?: string;
  isFloating?: boolean;
  defaultExpanded?: boolean;
  style?: React.CSSProperties;
}

export function GameCoPilotHud({
  context,
  className = '',
  isFloating = false,
  defaultExpanded = false,
  style = {},
}: GameCoPilotHudProps) {
  const {
    recommendation,
    isExpanded,
    isVisible,
    mounted,
    toggleExpanded,
    toggleVisible,
    openInRoyaleGuide,
  } = useGameCoPilot(context, { defaultExpanded });

  const [isPillHovered, setIsPillHovered] = useState(false);
  const [isGuideBtnHovered, setIsGuideBtnHovered] = useState(false);
  const [dockPosition, setDockPosition] = useState<HudDockPosition>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(
          'royale_copilot_dock_position',
        ) as HudDockPosition | null;
        if (saved && ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(saved)) {
          return saved;
        }
      } catch {
        // Fallback for private browsing
      }
    }
    return 'top-right';
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useReducedMotion();

  const cycleDockPosition = () => {
    const order: HudDockPosition[] = ['top-right', 'bottom-right', 'bottom-left', 'top-left'];
    const nextIdx = (order.indexOf(dockPosition) + 1) % order.length;
    const nextPos = order[nextIdx];
    setDockPosition(nextPos);
    if (typeof window !== 'undefined') {
      localStorage.setItem('royale_copilot_dock_position', nextPos);
    }
  };

  const getDockCoordinates = (): React.CSSProperties => {
    if (!isFloating) return {};
    switch (dockPosition) {
      case 'top-left':
        return { top: '16px', left: '16px', right: 'auto', bottom: 'auto' };
      case 'bottom-right':
        return { bottom: '16px', right: '16px', top: 'auto', left: 'auto' };
      case 'bottom-left':
        return { bottom: '16px', left: '16px', top: 'auto', right: 'auto' };
      case 'top-right':
      default:
        return { top: '16px', right: '16px', bottom: 'auto', left: 'auto' };
    }
  };

  // Close on Click-Outside when expanded in floating mode
  useEffect(() => {
    if (!isExpanded || !isFloating) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        toggleExpanded();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, isFloating, toggleExpanded]);

  if (!mounted) return null;

  // Obsidian & Cyber Gold Risk Themes
  const theme = {
    low: {
      border: 'rgba(16, 185, 129, 0.4)',
      glow: 'rgba(16, 185, 129, 0.12)',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeText: '#10B981',
      badgeBorder: 'rgba(16, 185, 129, 0.3)',
      barGradient: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
      accentColor: '#10B981',
      icon: ShieldCheck,
    },
    medium: {
      border: 'rgba(212, 175, 55, 0.45)',
      glow: 'rgba(212, 175, 55, 0.16)',
      badgeBg: 'rgba(212, 175, 55, 0.15)',
      badgeText: '#D4AF37',
      badgeBorder: 'rgba(212, 175, 55, 0.35)',
      barGradient: 'linear-gradient(90deg, #D4AF37 0%, #D4AF37 100%)',
      accentColor: '#D4AF37',
      icon: TrendingUp,
    },
    high: {
      border: 'rgba(239, 68, 68, 0.45)',
      glow: 'rgba(239, 68, 68, 0.16)',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeText: '#EF4444',
      badgeBorder: 'rgba(239, 68, 68, 0.35)',
      barGradient: 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
      accentColor: '#EF4444',
      icon: ShieldAlert,
    },
  }[recommendation.riskLevel];

  const RiskIcon = theme.icon;
  const motionTransition = shouldReduceMotion ? { duration: 0.15 } : springs.standard;

  return (
    <AnimatePresence mode="wait">
      {!isVisible ? (
        <motion.button
          key="copilot-hud-hidden"
          onClick={toggleVisible}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={motionTransition}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          style={{
            position: isFloating ? 'absolute' : 'relative',
            top: isFloating ? '16px' : 'auto',
            right: isFloating ? '16px' : 'auto',
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'rgba(11, 14, 20, 0.92)',
            border: '1px solid rgba(212, 175, 55, 0.45)',
            borderRadius: '999px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 14px rgba(212, 175, 55, 0.2)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#D4AF37',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 700,
            ...style,
          }}
          title="Live Co-Pilot einblenden"
          aria-label="Live Co-Pilot einblenden"
        >
          <Sparkles size={14} color="#D4AF37" />
          <span>Co-Pilot</span>
          <Eye size={13} color="#94a3b8" />
        </motion.button>
      ) : !isExpanded ? (
        <motion.div
          key="copilot-hud-pill"
          ref={containerRef}
          className={`obsidian-copilot-pill-wrapper ${className}`}
          initial={{ opacity: 0, scale: 0.94, y: shouldReduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: shouldReduceMotion ? 0 : 6 }}
          transition={motionTransition}
          style={{
            position: isFloating ? 'absolute' : 'relative',
            ...getDockCoordinates(),
            zIndex: 25,
            pointerEvents: 'auto',
            ...style,
          }}
        >
          <motion.button
            onClick={toggleExpanded}
            onMouseEnter={() => setIsPillHovered(true)}
            onMouseLeave={() => setIsPillHovered(false)}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            transition={springs.snappy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '36px',
              padding: '0 12px 0 8px',
              background: isPillHovered ? 'rgba(18, 24, 38, 0.96)' : 'rgba(11, 14, 20, 0.92)',
              border: `1px solid ${isPillHovered ? 'rgba(212, 175, 55, 0.6)' : theme.border}`,
              borderRadius: '999px',
              boxShadow: `0 8px 24px rgba(0, 0, 0, 0.65), 0 0 14px ${theme.glow}, inset 0 1px 0 rgba(255, 215, 0, 0.25)`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              cursor: 'pointer',
              transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            title="Live Co-Pilot: Klicken zum Aufklappen"
            aria-label="Live Co-Pilot öffnen"
          >
            {/* Sparkles Icon Container with live green dot */}
            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Sparkles size={12} color="#D4AF37" />
              <span
                style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '-1px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 4px #10B981',
                }}
              />
            </div>

            {/* Quick Action Title */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 900,
                letterSpacing: '0.4px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {recommendation.action}
            </span>

            {/* Probability Badge */}
            <span
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: theme.accentColor,
                whiteSpace: 'nowrap',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {recommendation.winProbability.toFixed(1)}%
            </span>

            {/* Down Chevron Trigger */}
            <ChevronDown size={14} color="#94a3b8" />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          key="copilot-hud-card"
          ref={containerRef}
          className={`obsidian-copilot-hud ${className}`}
          initial={{ opacity: 0, scale: 0.95, y: shouldReduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: shouldReduceMotion ? 0 : 8 }}
          transition={motionTransition}
          style={{
            position: isFloating ? 'absolute' : 'relative',
            ...getDockCoordinates(),
            zIndex: 25,
            width: isFloating ? '320px' : '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            pointerEvents: 'auto',
            ...style,
          }}
        >
          <div
            style={{
              background: 'rgba(11, 14, 20, 0.94)',
              border: `1px solid ${theme.border}`,
              boxShadow: `0 12px 36px rgba(0, 0, 0, 0.75), 0 0 18px ${theme.glow}, inset 0 1px 0 rgba(255, 215, 0, 0.15)`,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '14px',
              color: '#FFFFFF',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            {/* Header Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              {/* Title & Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={15} color="#D4AF37" />
                  {/* Live Pulsing Dot */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#10B981',
                      boxShadow: '0 0 6px #10B981',
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        letterSpacing: '0.6px',
                        color: '#D4AF37',
                        textTransform: 'uppercase',
                      }}
                    >
                      Live Co-Pilot
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '2px 5px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {context.gameType}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.68rem',
                      color: '#94a3b8',
                      lineHeight: 1.2,
                    }}
                  >
                    {recommendation.badgeText}
                  </p>
                </div>
              </div>

              {/* Action Buttons (Fold / Hide) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {isFloating && (
                  <motion.button
                    onClick={cycleDockPosition}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                    transition={springs.snappy}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      padding: '5px',
                      color: '#cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}
                    title={`Tischecke wechseln (Aktuell: ${
                      dockPosition === 'top-right'
                        ? 'Oben-Rechts'
                        : dockPosition === 'bottom-right'
                          ? 'Unten-Rechts'
                          : dockPosition === 'bottom-left'
                            ? 'Unten-Links'
                            : 'Oben-Links'
                    })`}
                    aria-label="Tischecke wechseln"
                  >
                    <Move size={13} />
                  </motion.button>
                )}
                <motion.button
                  onClick={toggleExpanded}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                  transition={springs.snappy}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '5px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                  title="Einklappen"
                  aria-label="Co-Pilot einklappen"
                >
                  <ChevronUp size={14} />
                </motion.button>
                <motion.button
                  onClick={toggleVisible}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                  transition={springs.snappy}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '5px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                  title="Ausblenden"
                  aria-label="Co-Pilot ausblenden"
                >
                  <EyeOff size={13} />
                </motion.button>
              </div>
            </div>

            {/* Compact Action Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RiskIcon size={15} color={theme.accentColor} />
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '0.4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {recommendation.action}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono), monospace',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                }}
              >
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Chance:</span>
                <span style={{ color: theme.accentColor }}>
                  {recommendation.winProbability.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Expanded Details Section */}
            <div style={{ marginTop: '10px' }}>
              {/* Probability Progress Bar */}
              <div style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: '#94a3b8',
                    marginBottom: '4px',
                    fontFamily: 'var(--font-mono), monospace',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                  }}
                >
                  <span>Mathematische Gewinnchance</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 700 }}>
                    {recommendation.winProbability.toFixed(1)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(3, recommendation.winProbability))}%`,
                      height: '100%',
                      borderRadius: '999px',
                      background: theme.barGradient,
                      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>

              {/* Strategy Reasoning Card */}
              <p
                style={{
                  margin: '0 0 8px 0',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.74rem',
                  lineHeight: 1.45,
                  color: '#cbd5e1',
                  textWrap: 'pretty',
                }}
              >
                {recommendation.reasoning}
              </p>

              {/* Metrics Chips (if any) */}
              {recommendation.metrics && recommendation.metrics.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    marginBottom: '10px',
                  }}
                >
                  {recommendation.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '0.68rem',
                      }}
                    >
                      <span style={{ color: '#94a3b8' }}>{metric.label}:</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono), monospace',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '-0.02em',
                          fontWeight: 700,
                          color: '#f1f5f9',
                        }}
                      >
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* 1-Click Guide Explain Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={() => openInRoyaleGuide()}
                  onMouseEnter={() => setIsGuideBtnHovered(true)}
                  onMouseLeave={() => setIsGuideBtnHovered(false)}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  transition={springs.snappy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: isGuideBtnHovered
                      ? 'rgba(212, 175, 55, 0.25)'
                      : 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.45)',
                    color: '#D4AF37',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                    letterSpacing: '0.3px',
                  }}
                >
                  <HelpCircle size={13} color="#D4AF37" />
                  <span>Im Guide erklären</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
