import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trash2, Undo2, FastForward, Zap, TrendingUp, Wallet } from 'lucide-react';
import { Chip } from './Chip';
import { CHIPS, RouletteNumber } from './types';

interface RouletteControlsProps {
  balance: number;
  totalWagered: number;
  estProfit: number;
  selectedChip: number;
  setSelectedChip: (val: number) => void;
  onSpin: () => void;
  onClear: () => void;
  onUndo: () => void;
  spinning: boolean;
  isProcessing: boolean;
  turboMode: boolean;
  setTurboMode: (val: boolean) => void;
  vipLevel: number;
  onPlaceFrenchBet: (type: 'VOISINS' | 'TIERS' | 'ORPHELINS') => void;
  autoBetting: boolean;
  setAutoBetting: (val: boolean) => void;
  autoBetStats: { wins: number; losses: number; total: number };
  strategy: 'NONE' | 'MARTINGALE' | 'PAROLI';
  setStrategy: (val: 'NONE' | 'MARTINGALE' | 'PAROLI') => void;
  history: RouletteNumber[];
}

export const RouletteControls: React.FC<RouletteControlsProps> = ({
  balance,
  totalWagered,
  estProfit,
  selectedChip,
  setSelectedChip,
  onSpin,
  onClear,
  onUndo,
  spinning,
  isProcessing,
  turboMode,
  setTurboMode,
  vipLevel,
  onPlaceFrenchBet,
  autoBetting,
  setAutoBetting,
  autoBetStats,
  strategy,
  setStrategy,
  history,
}) => {
  const [tab, setTab] = useState<'MANUAL' | 'AUTO'>('MANUAL');

  const colorStats = React.useMemo(() => {
    if (history.length === 0) return { red: 50, black: 50 };
    const reds = history.filter((h) => h.c === 'RED').length;
    const blacks = history.filter((h) => h.c === 'BLACK').length;
    const total = reds + blacks;
    if (total === 0) return { red: 50, black: 50 };
    return {
      red: Math.round((reds / total) * 100),
      black: Math.round((blacks / total) * 100),
    };
  }, [history]);

  return (
    <div className="font-inter flex h-full flex-col gap-4 overflow-hidden">
      {/* Wallet Display */}
      <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary border-primary/20 flex h-10 w-10 items-center justify-center rounded-xl border">
            <Wallet size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              Balance
            </span>
            <span className="text-sm font-black text-white">
              ${balance.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-xl border border-white/5 bg-black/40 p-1">
        <button
          onClick={() => setTab('MANUAL')}
          className={`vibe-tap flex-1 rounded-lg py-2.5 text-[10px] font-black tracking-widest transition-all ${tab === 'MANUAL' ? 'bg-primary shadow-glow-primary text-black' : 'text-white/40 hover:text-white/60'}`}
        >
          MANUAL
        </button>
        <button
          onClick={() => setTab('AUTO')}
          className={`vibe-tap flex-1 rounded-lg py-2.5 text-[10px] font-black tracking-widest transition-all ${tab === 'AUTO' ? 'bg-primary shadow-glow-primary text-black' : 'text-white/40 hover:text-white/60'}`}
        >
          AUTO
        </button>
      </div>

      <div className="no-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto">
        {/* Chip Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              Chip Value
            </label>
            <button
              onClick={() => setTurboMode(!turboMode)}
              className={`vibe-tap transition-all duration-300 ${turboMode ? 'text-primary drop-shadow-glow scale-110' : 'text-white/20 hover:text-white/40'}`}
            >
              <FastForward size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {CHIPS.map((c) => (
              <Chip
                key={c}
                amount={c}
                active={selectedChip === c}
                onClick={() => setSelectedChip(c)}
                size={42}
                vipLevel={vipLevel}
              />
            ))}
          </div>
        </div>

        {/* Manual: French Bets */}
        {tab === 'MANUAL' && (
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
              Special Bets
            </label>
            <div className="flex flex-col gap-2">
              {(['VOISINS', 'TIERS', 'ORPHELINS'] as const).map((f) => (
                <motion.button
                  key={f}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onPlaceFrenchBet(f)}
                  disabled={spinning || isProcessing}
                  className="group vibe-tap flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-left text-[10px] font-black transition-all hover:bg-white/10"
                >
                  <span className="group-hover:text-primary transition-colors">{f}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/20 group-hover:text-white/40">ANNOUNCE</span>
                    <TrendingUp size={12} className="group-hover:text-primary text-white/20" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Auto: Strategies */}
        {tab === 'AUTO' && (
          <div className="animate-slide-up flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                Strategy
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['MARTINGALE', 'PAROLI'] as const).map((s) => (
                  <button
                    key={s}
                    disabled={autoBetting}
                    onClick={() => setStrategy(s)}
                    className={`vibe-tap rounded-xl border py-3 text-[10px] font-black tracking-tighter transition-all ${strategy === s ? 'bg-primary/20 border-primary text-primary' : 'border-white/5 bg-white/5 text-white/40 hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-white/40">Auto Rounds</span>
                <span className="text-white">{autoBetStats.total}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-white/40">Wins / Losses</span>
                <div className="flex gap-2">
                  <span className="text-success">{autoBetStats.wins}W</span>
                  <span className="text-error">{autoBetStats.losses}L</span>
                </div>
              </div>
              {autoBetting && (
                <button
                  onClick={() => setAutoBetting(false)}
                  className="bg-error/10 hover:bg-error/20 border-error/20 text-error vibe-tap mt-2 w-full rounded-xl border py-3 text-[10px] font-black tracking-widest uppercase transition-all"
                >
                  Stop Autobet
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-auto flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/40 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
              <span className="text-white/40">Est. Profit</span>
              <span className="text-primary drop-shadow-glow">
                {estProfit > 0 ? `+$${estProfit.toLocaleString('en-US')}` : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
              <span className="text-white/40">Total Bet</span>
              <span className="text-white">${totalWagered.toLocaleString('en-US')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                <span className="text-white/40">Color Distribution</span>
                <div className="flex gap-2">
                  <span className="text-error">{colorStats.red}%</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white">{colorStats.black}%</span>
                </div>
              </div>
              <div className="flex h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-black/40">
                <div
                  style={{ width: `${colorStats.red}%` }}
                  className="bg-error h-full transition-all duration-500"
                />
                <div
                  style={{ width: `${colorStats.black}%` }}
                  className="h-full bg-white/20 transition-all duration-500"
                />
              </div>
            </div>

            <div className="my-1 h-px w-full bg-white/5" />
            <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
              <span className="text-white/40">Max Possible Payout</span>
              <span className="text-white/60">x36.00</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (tab === 'AUTO') {
                  setAutoBetting(!autoBetting);
                } else {
                  onSpin();
                }
              }}
              disabled={spinning || isProcessing || (totalWagered === 0 && !autoBetting)}
              className={`shadow-glow-primary vibe-tap relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-black transition-all ${
                spinning || isProcessing || (totalWagered === 0 && !autoBetting)
                  ? 'bg-primary/50 cursor-not-allowed text-black/50 opacity-50'
                  : autoBetting
                    ? 'bg-error shadow-glow-error text-white'
                    : 'bg-primary text-black hover:brightness-110'
              }`}
            >
              {spinning || isProcessing ? (
                <RotateCcw className="animate-spin" size={24} />
              ) : autoBetting ? (
                <span className="tracking-tighter">STOP AUTO</span>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  <span className="tracking-tighter">
                    {tab === 'AUTO' ? 'START AUTO' : 'PLACE YOUR BETS'}
                  </span>
                </>
              )}
              {/* Shimmer effect */}
              {!spinning && !isProcessing && totalWagered > 0 && !autoBetting && (
                <div className="shimmer pointer-events-none absolute inset-0 opacity-20" />
              )}
            </motion.button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClear}
                disabled={spinning || isProcessing || totalWagered === 0}
                className="vibe-tap flex h-14 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={onUndo}
                disabled={spinning || isProcessing}
                className="vibe-tap flex h-14 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
              >
                <Undo2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
