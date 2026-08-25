'use client';

import React from 'react';
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
}

export function GameCoPilotHud({ context, className = '' }: GameCoPilotHudProps) {
  const {
    recommendation,
    isExpanded,
    isVisible,
    mounted,
    toggleExpanded,
    toggleVisible,
    openInRoyaleGuide,
  } = useGameCoPilot(context);

  if (!mounted) return null;

  // Color mapping based on risk level
  const riskStyles = {
    low: {
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      progressBg: 'from-emerald-500 to-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      icon: ShieldCheck,
    },
    medium: {
      border: 'border-[#D4AF37]/30 hover:border-[#D4AF37]/50',
      badgeBg: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
      progressBg: 'from-[#D4AF37] to-[#F3E5AB]',
      glow: 'shadow-[0_0_15px_rgba(212,175,55,0.15)]',
      icon: TrendingUp,
    },
    high: {
      border: 'border-rose-500/30 hover:border-rose-500/50',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      progressBg: 'from-rose-600 to-rose-400',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      icon: ShieldAlert,
    },
  }[recommendation.riskLevel];

  const RiskIcon = riskStyles.icon;

  // 1. Minimized floating re-open pill when hidden
  if (!isVisible) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleVisible}
        className={`fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#0B0E14]/90 px-3.5 py-2 text-xs font-medium text-[#D4AF37] shadow-xl backdrop-blur-md transition-all hover:bg-[#121722] ${className}`}
        title="Live Co-Pilot einblenden"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
        <span>Co-Pilot</span>
        <Eye className="h-3.5 w-3.5 text-zinc-400" />
      </motion.button>
    );
  }

  return (
    <div
      className={`relative z-20 w-full select-none transition-all duration-300 ${className}`}
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`overflow-hidden rounded-xl border bg-[#0B0E14]/95 p-3.5 shadow-2xl backdrop-blur-xl ${riskStyles.border} ${riskStyles.glow}`}
      >
        {/* Top Bar / Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-wider text-zinc-200 uppercase">
                  Live Co-Pilot
                </span>
                <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400 uppercase">
                  {context.gameType}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">{recommendation.badgeText}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleExpanded}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              title={isExpanded ? 'Einklappen' : 'Ausklappen'}
              aria-label={isExpanded ? 'Co-Pilot einklappen' : 'Co-Pilot ausklappen'}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={toggleVisible}
              className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              title="Ausblenden"
              aria-label="Co-Pilot ausblenden"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Compact View Summary */}
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-zinc-800/60 pt-2.5">
          <div className="flex items-center gap-2">
            <RiskIcon className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs font-bold tracking-wide text-zinc-100 uppercase">
              {recommendation.action}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
            <span className="text-zinc-400 text-[10px]">Chance:</span>
            <span className="text-emerald-400">{recommendation.winProbability.toFixed(1)}%</span>
          </div>
        </div>

        {/* Expanded View Details */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Win Chance Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                  <span>Mathematische Gewinnchance</span>
                  <span className="text-zinc-200">{recommendation.winProbability.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(2, recommendation.winProbability))}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`h-full bg-gradient-to-r ${riskStyles.progressBg}`}
                  />
                </div>
              </div>

              {/* Reasoning Description */}
              <p className="mt-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 p-2 text-[11px] leading-relaxed text-zinc-300">
                {recommendation.reasoning}
              </p>

              {/* Dynamic Metrics if present */}
              {recommendation.metrics && recommendation.metrics.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
                  {recommendation.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border border-zinc-800/40 bg-zinc-900/40 px-2 py-1"
                    >
                      <span className="text-zinc-400">{metric.label}:</span>
                      <span className="font-mono font-semibold text-zinc-200">{metric.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 1-Click Explain in Royale Guide Button */}
              <div className="mt-3 flex items-center justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openInRoyaleGuide()}
                  className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/20 hover:text-white"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Im Guide erklären</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
