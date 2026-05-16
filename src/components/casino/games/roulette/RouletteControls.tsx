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
  history
}) => {
  const [tab, setTab] = useState<'MANUAL' | 'AUTO'>('MANUAL');

  const colorStats = React.useMemo(() => {
    if (history.length === 0) return { red: 50, black: 50 };
    const reds = history.filter(h => h.c === 'RED').length;
    const blacks = history.filter(h => h.c === 'BLACK').length;
    const total = reds + blacks;
    if (total === 0) return { red: 50, black: 50 };
    return {
      red: Math.round((reds / total) * 100),
      black: Math.round((blacks / total) * 100)
    };
  }, [history]);

  return (
    <div className="flex flex-col gap-4 h-full font-inter overflow-hidden">
      {/* Wallet Display */}
      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Wallet size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Balance</span>
            <span className="text-sm font-black text-white">${balance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
        <button 
          onClick={() => setTab('MANUAL')}
          className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all tracking-widest vibe-tap ${tab === 'MANUAL' ? 'bg-primary text-black shadow-glow-primary' : 'text-white/40 hover:text-white/60'}`}
        >
          MANUAL
        </button>
        <button 
          onClick={() => setTab('AUTO')}
          className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all tracking-widest vibe-tap ${tab === 'AUTO' ? 'bg-primary text-black shadow-glow-primary' : 'text-white/40 hover:text-white/60'}`}
        >
          AUTO
        </button>
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Chip Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Chip Value</label>
            <button 
              onClick={() => setTurboMode(!turboMode)}
              className={`transition-all duration-300 vibe-tap ${turboMode ? 'text-primary drop-shadow-glow scale-110' : 'text-white/20 hover:text-white/40'}`}
            >
              <FastForward size={18} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {CHIPS.map(c => (
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
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Special Bets</label>
            <div className="flex flex-col gap-2">
              {(['VOISINS', 'TIERS', 'ORPHELINS'] as const).map(f => (
                <motion.button 
                  key={f}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onPlaceFrenchBet(f)}
                  disabled={spinning || isProcessing}
                  className="w-full py-3.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black text-left flex items-center justify-between transition-all group vibe-tap"
                >
                  <span className="group-hover:text-primary transition-colors">{f}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/20 group-hover:text-white/40">ANNOUNCE</span>
                    <TrendingUp size={12} className="text-white/20 group-hover:text-primary" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Auto: Strategies */}
        {tab === 'AUTO' && (
          <div className="flex flex-col gap-4 animate-slide-up">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Strategy</label>
              <div className="grid grid-cols-2 gap-2">
                {(['MARTINGALE', 'PAROLI'] as const).map(s => (
                  <button 
                    key={s}
                    disabled={autoBetting}
                    onClick={() => setStrategy(s)}
                    className={`py-3 rounded-xl border transition-all text-[10px] font-black tracking-tighter vibe-tap ${strategy === s ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Auto Rounds</span>
                <span className="text-white">{autoBetStats.total}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Wins / Losses</span>
                <div className="flex gap-2">
                  <span className="text-success">{autoBetStats.wins}W</span>
                  <span className="text-error">{autoBetStats.losses}L</span>
                </div>
              </div>
              {autoBetting && (
                <button 
                  onClick={() => setAutoBetting(false)}
                  className="w-full py-3 bg-error/10 hover:bg-error/20 border border-error/20 text-error text-[10px] font-black rounded-xl transition-all uppercase tracking-widest mt-2 vibe-tap"
                >
                  Stop Autobet
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-auto flex flex-col gap-4">
          <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col gap-3 backdrop-blur-md">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Est. Profit</span>
              <span className="text-primary drop-shadow-glow">
                {estProfit > 0 ? `+$${estProfit.toLocaleString()}` : '$0'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Total Bet</span>
              <span className="text-white">${totalWagered.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">Color Distribution</span>
                <div className="flex gap-2">
                  <span className="text-error">{colorStats.red}%</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white">{colorStats.black}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/5">
                <div style={{ width: `${colorStats.red}%` }} className="h-full bg-error transition-all duration-500" />
                <div style={{ width: `${colorStats.black}%` }} className="h-full bg-white/20 transition-all duration-500" />
              </div>
            </div>

            <div className="h-px bg-white/5 w-full my-1" />
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
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
              className={`w-full h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-glow-primary relative overflow-hidden vibe-tap
                ${spinning || isProcessing || (totalWagered === 0 && !autoBetting) ? 'bg-primary/50 text-black/50 cursor-not-allowed opacity-50' : 
                  autoBetting ? 'bg-error text-white shadow-glow-error' : 'bg-primary text-black hover:brightness-110'}`}
            >
              {spinning || isProcessing ? (
                <RotateCcw className="animate-spin" size={24} />
              ) : autoBetting ? (
                <span className="tracking-tighter">STOP AUTO</span>
              ) : (
                <>
                  <Zap size={20} fill="currentColor" />
                  <span className="tracking-tighter">{tab === 'AUTO' ? 'START AUTO' : 'PLACE YOUR BETS'}</span>
                </>
              )}
              {/* Shimmer effect */}
              {!spinning && !isProcessing && totalWagered > 0 && !autoBetting && (
                <div className="absolute inset-0 shimmer opacity-20 pointer-events-none" />
              )}
            </motion.button>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={onClear}
                disabled={spinning || isProcessing || totalWagered === 0}
                className="h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all disabled:opacity-30 vibe-tap"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={onUndo}
                disabled={spinning || isProcessing}
                className="h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all disabled:opacity-30 vibe-tap"
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
