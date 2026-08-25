'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useGameCoPilot, type GameCoPilotContext } from '@/hooks/useGameCoPilot';

export interface GameCoPilotHudProps {
  context: GameCoPilotContext;
  className?: string;
  isFloating?: boolean;
  style?: React.CSSProperties;
}

export function GameCoPilotHud({
  context,
  className = '',
  isFloating = false,
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
  } = useGameCoPilot(context);

  const [isHovered, setIsHovered] = useState(false);
  const [isGuideBtnHovered, setIsGuideBtnHovered] = useState(false);

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
      badgeText: '#FFD700',
      badgeBorder: 'rgba(212, 175, 55, 0.35)',
      barGradient: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)',
      accentColor: '#FFD700',
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

  // 1. Minimized floating pill when user hid the HUD
  if (!isVisible) {
    return (
      <button
        onClick={toggleVisible}
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
          color: '#FFD700',
          cursor: 'pointer',
          fontSize: '0.78rem',
          fontWeight: 700,
          transition: 'all 0.2s ease',
          ...style,
        }}
        title="Live Co-Pilot einblenden"
      >
        <Sparkles size={14} color="#FFD700" />
        <span>Co-Pilot</span>
        <Eye size={13} color="#94a3b8" />
      </button>
    );
  }

  // 2. Full or Compact Obsidian HUD
  return (
    <div
      className={`obsidian-copilot-hud ${className}`}
      style={{
        position: isFloating ? 'absolute' : 'relative',
        top: isFloating ? '16px' : 'auto',
        right: isFloating ? '16px' : 'auto',
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
              <Sparkles size={15} color="#FFD700" />
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
                    color: '#FFD700',
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
            <button
              onClick={toggleExpanded}
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
              title={isExpanded ? 'Einklappen' : 'Ausklappen'}
              aria-label="Co-Pilot auf/zuklappen"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={toggleVisible}
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
            </button>
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
        {isExpanded && (
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
              <button
                onClick={() => openInRoyaleGuide()}
                onMouseEnter={() => setIsGuideBtnHovered(true)}
                onMouseLeave={() => setIsGuideBtnHovered(false)}
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
                  color: '#FFD700',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.3px',
                }}
              >
                <HelpCircle size={13} color="#FFD700" />
                <span>Im Guide erklären</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
