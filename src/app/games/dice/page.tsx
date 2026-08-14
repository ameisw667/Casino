'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw, Zap, Percent, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { CasinoLogger } from '@/lib/casino/logger';
import { soundManager } from '@/lib/casino/sound-manager';
import Image from 'next/image';
import { motion } from 'framer-motion';

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 22%, 20%)`;
}

// Metadata moved to layout or server component
export default function DicePage() {
  const isMobile = useCasinoStore((state) => state.isMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const balance = useCasinoStore((state) => state.balance);
  const provablyFairSettings = useCasinoStore((state) => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore((state) => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore((state) => state.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((state) => state.applyServerWalletSnapshot);
  const allBets = useCasinoStore((state) => state.allBets);
  const addToast = useCasinoStore((state) => state.addToast);
  const isProcessing = useCasinoStore((state) => state.isProcessing);
  const setIsProcessing = useCasinoStore((state) => state.setIsProcessing);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef(false);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(2.0);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ roll: number; win: boolean } | null>(null);
  const [history, setHistory] = useState<{ roll: number; win: boolean }[]>([]);
  const [isRollOver, setIsRollOver] = useState(true);
  const [winChance, setWinChance] = useState(49.5);
  const [targetPoint, setTargetPoint] = useState(50.5);
  const [winning, setWinning] = useState<boolean | null>(null);

  // Live bet feed from Zustand store (real player activity)
  useEffect(() => {
    // Optionally display live dice bets in sidebar if space becomes available
    // For now, allBets is available via store for future UI additions
    // Filter: const diceBets = allBets.filter(b => b.game === 'DICE').slice(0, 15);
  }, [allBets]);
  // New: Auto-betting & Stats
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoBetSettings = useCasinoStore((state) => state.autoBetSettings.dice);
  const setAutoBetSettings = useCasinoStore((state) => state.setAutoBetSettings);
  const updateAutoSettings = (
    updater:
      ((prev: typeof autoBetSettings) => typeof autoBetSettings) | Partial<typeof autoBetSettings>,
  ) => {
    const newSettings =
      typeof updater === 'function' ? updater(autoBetSettings) : { ...autoBetSettings, ...updater };
    setAutoBetSettings('dice', newSettings);
  };

  const [currentAutoCount, setCurrentAutoCount] = useState(0);
  const [visualResult, setVisualResult] = useState<number | null>(null);
  const [baseBetAmount, setBaseBetAmount] = useState(10);

  const gameStats = useCasinoStore((state) => state.gameStats.DICE);
  const { betMin, betMax } = useCasinoStore((state) => state.gameConfig.limits);
  const profitOnWin = useMemo(() => betAmount * (multiplier - 1), [betAmount, multiplier]);
  const spawnConfetti = () => {
    const main = document.querySelector('.dice-main');
    if (!main) return;
    // CSS-based confetti (deterministic, no randomness)
    const burst = document.createElement('div');
    burst.className = 'confetti-burst';
    burst.style.left = '50%';
    burst.style.top = '50%';
    burst.style.transform = 'translate(-50%, -50%)';
    main.appendChild(burst);
    setTimeout(() => burst.remove(), 2500);
  };
  const updateFromWinChance = (chance: number) => {
    const val = Math.max(0.01, Math.min(98.99, chance));
    setWinChance(val);
    // Standard 1% House Edge calculation: (100 - HouseEdge) / Chance
    const newMult = 99 / val;
    setMultiplier(parseFloat(newMult.toFixed(4)));
    setTargetPoint(isRollOver ? 100 - val : val);
  };
  const updateFromMultiplier = (mult: number) => {
    const val = Math.max(1.0102, Math.min(9900, mult));
    setMultiplier(val);
    const newChance = 99 / val;
    setWinChance(parseFloat(newChance.toFixed(2)));
    setTargetPoint(isRollOver ? 100 - newChance : newChance);
  };
  const updateFromTarget = (target: number) => {
    const val = Math.max(0.01, Math.min(99.99, target));
    setTargetPoint(val);
    const newChance = isRollOver ? 100 - val : val;
    setWinChance(parseFloat(newChance.toFixed(2)));
    setMultiplier(parseFloat((99 / newChance).toFixed(4)));
  };
  const toggleRollMode = () => {
    const newMode = !isRollOver;
    setIsRollOver(newMode);
    setTargetPoint(100 - targetPoint);
  };
  const handleSliderDrag = (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }
    const position = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(2, Math.min(98, position));
    updateFromTarget(parseFloat(clamped.toFixed(2)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleSliderDrag(e);
    const onMouseMove = (moveEvent: MouseEvent) => handleSliderDrag(moveEvent);
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  const onTouchStart = (e: React.TouchEvent) => {
    handleSliderDrag(e);
    const onTouchMove = (moveEvent: TouchEvent) => handleSliderDrag(moveEvent);
    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };
  const lastBetTimeRef = useRef(0);
  const handleRoll = async () => {
    if (isRunningRef.current) return;
    const now = Date.now();
    if (now - lastBetTimeRef.current < 150) return;
    lastBetTimeRef.current = now;

    const betError = validateBet(betAmount, balance);
    if (betError) {
      setAutoRunning(false);
      addToast(betError, 'error');
      return;
    }
    isRunningRef.current = true;
    setIsProcessing(true);
    setLoading(true);
    soundManager.play('dice-roll');
    try {
      // Input Sanitization — inside try so a null/undefined clientSeed is caught
      const sanitizedClientSeed = sanitizeClientSeed(provablyFairSettings.clientSeed);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      let response: Response;
      try {
        response = await fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            gameType: 'DICE',
            amount: betAmount,
            multiplier,
            target: targetPoint,
            condition: isRollOver ? 'OVER' : 'UNDER',
            clientSeed: sanitizedClientSeed,
            currentNonce: provablyFairSettings.nonce,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }
      if (!response.ok) {
        if (response.status === 429) {
          const errData = await response.json().catch(() => ({}));
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error('API failed');
      }
      const result = await response.json();
      setProvablyFairSettings({
        serverSeedHash: result.serverSeedHash,
        nonce: result.nonce,
      });
      applyServerWalletSnapshot(result.wallet);
      processGameResult({
        game: 'DICE',
        amount: betAmount,
        multiplier: multiplier,
        payout: result.payout,
        win: result.win,
        resultId: result.id,
      });
      if (result.win) {
        if (multiplier >= 10) spawnConfetti();
        if (isAutoMode) {
          if (autoBetSettings.onWin > 0) {
            setBetAmount((prev) => prev + prev * (autoBetSettings.onWin / 100));
          } else {
            setBetAmount(baseBetAmount);
          }
        }
      } else {
        if (isAutoMode) {
          if (autoBetSettings.onLoss > 0) {
            setBetAmount((prev) => prev + prev * (autoBetSettings.onLoss / 100));
          } else {
            setBetAmount(baseBetAmount);
          }
        }
      }
      const outcomeResult = { roll: result.roll, win: result.win };

      setLastResult(outcomeResult);
      setHistory((prev) => [outcomeResult, ...prev].slice(0, 10));
      setVisualResult(result.roll);
      setWinning(result.win);
    } catch (error) {
      setAutoRunning(false);
      CasinoLogger.error('Dice', 'Bet error', error);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Bet failed. Please try again.', 'error');
      }
    } finally {
      isRunningRef.current = false;
      setLoading(false);
      setIsProcessing(false);
    }
  };
  // Auto-Bet Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning && !loading) {
      // Safety Cap: Max 500 consecutive bets if not specified
      const maxAllowed = autoBetSettings.numberOfBets > 0 ? autoBetSettings.numberOfBets : 500;

      if (currentAutoCount >= maxAllowed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast(`Auto-bet stopped: Reached limit of ${maxAllowed} bets`, 'info');
        return;
      }
      // Safety Cap: Bet amount cannot exceed configured max in auto-mode
      if (betAmount > betMax) {
        setAutoRunning(false);
        addToast(
          `Auto-bet stopped: Bet amount exceeded $${betMax.toLocaleString()} limit`,
          'error',
        );
        return;
      }
      if (autoBetSettings.stopOnProfit > 0 && gameStats.profit >= autoBetSettings.stopOnProfit) {
        setAutoRunning(false);
        addToast('Auto-bet stopped: Profit goal reached!', 'success');
        return;
      }
      if (
        autoBetSettings.stopOnLoss > 0 &&
        Math.abs(gameStats.profit) >= autoBetSettings.stopOnLoss &&
        gameStats.profit < 0
      ) {
        setAutoRunning(false);
        addToast('Auto-bet stopped: Loss limit reached', 'info');
        return;
      }
      timer = setTimeout(() => {
        handleRoll();
        setCurrentAutoCount((prev) => prev + 1);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [autoRunning, loading, gameStats.profit, currentAutoCount, betAmount, autoBetSettings]);
  // Persistence & Reset Logic
  useEffect(() => {
    if (!autoRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentAutoCount(0);
    }
  }, [autoRunning]);
  useEffect(() => {
    const saved = localStorage.getItem('dice_settings');
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBetAmount(parsed.betAmount || 1);
      setIsRollOver(parsed.isRollOver ?? true);
      setTargetPoint(parsed.targetPoint || 50.5);
    } catch {
      localStorage.removeItem('dice_settings');
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('dice_settings', JSON.stringify({ betAmount, isRollOver, targetPoint }));
  }, [betAmount, isRollOver, targetPoint]);
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!loading) handleRoll();
      }

      if (e.key === 'a') setBetAmount((prev) => prev / 2);
      if (e.key === 's') setBetAmount((prev) => prev * 2);
      if (e.key === 'd') setBetAmount(1);
      if (e.key === 'f') setBetAmount(balance);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [betAmount, multiplier, targetPoint, loading, balance]);

  if (!mounted) return null;

  const markerColor =
    visualResult !== null
      ? winning
        ? 'hsl(var(--success))'
        : 'hsl(var(--error))'
      : 'hsl(0, 0%, 100%)';
  const markerGlass =
    visualResult !== null
      ? winning
        ? 'hsla(var(--success), 0.55)'
        : 'hsla(var(--error), 0.55)'
      : 'hsla(0, 0%, 100%, 0.2)';
  const markerBorder =
    visualResult !== null
      ? winning
        ? 'hsla(var(--success), 0.8)'
        : 'hsla(var(--error), 0.8)'
      : 'hsla(0, 0%, 100%, 0.5)';
  const markerGlow =
    visualResult !== null
      ? winning
        ? 'hsla(var(--success), 0.6)'
        : 'hsla(var(--error), 0.6)'
      : 'transparent';

  const MULTIPLIER_BAR_CAP = 20;
  const multiplierBarWidth = Math.min(100, Math.max(6, (multiplier / MULTIPLIER_BAR_CAP) * 100));
  const winChanceBarWidth = Math.min(100, Math.max(0, winChance));

  return (
    <GameErrorBoundary gameName="Dice">
      <div
        className="dice-container"
        style={{
          maxWidth: '1600px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1px',
          background: 'hsla(var(--border-color), 0.5)',
          minHeight: 'min(850px, 90vh)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <style jsx>{`
          @media (max-width: 1024px) {
            .dice-container {
              flex-direction: column !important;
              flex-wrap: nowrap !important;
              min-height: auto !important;
            }
            .dice-sidebar {
              width: 100% !important;
              min-width: 0 !important;
              box-sizing: border-box !important;
              order: 2 !important;
              border-right: none !important;
              border-top: 1px solid var(--glass-border) !important;
            }
            .dice-main {
              width: 100% !important;
              align-self: stretch !important;
              order: 1 !important;
              padding: var(--space-md) !important;
            }
            .dice-stat-grid {
              grid-template-columns: 1fr 1fr !important;
              min-width: 0 !important;
            }
            .dice-stat-grid > div {
              min-width: 0 !important;
            }
            .dice-stat-grid > div:last-child {
              grid-column: span 2 !important;
            }
          }
        `}</style>

        <div
          className="dice-sidebar"
          style={{
            background: 'hsla(var(--surface-color), 0.8)',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            width: '350px',
            flexShrink: 0,
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid var(--glass-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              background: 'hsla(var(--bg-color), 0.5)',
              padding: '4px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <button
              onClick={() => setIsAutoMode(false)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: !isAutoMode ? 'hsla(var(--primary), 0.15)' : 'transparent',
                color: !isAutoMode ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                border: !isAutoMode ? '1px solid hsla(var(--primary), 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Manual
            </button>
            <button
              onClick={() => setIsAutoMode(true)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: isAutoMode ? 'hsla(var(--primary), 0.15)' : 'transparent',
                color: isAutoMode ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                border: isAutoMode ? '1px solid hsla(var(--primary), 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Auto
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label
                style={{
                  fontSize: 'var(--font-xs)',
                  fontWeight: 800,
                  color: 'hsl(var(--text-muted))',
                }}
              >
                Bet Amount
              </label>
              <span
                style={{
                  fontSize: 'var(--font-xs)',
                  color: 'hsl(var(--primary))',
                  fontWeight: 600,
                }}
              >
                ${balance.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '1px',
                background: 'var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--glass-border)',
                padding: '1px',
              }}
            >
              <input
                type="number"
                className="mono"
                value={betAmount}
                style={{
                  flex: 1,
                  background: 'hsl(var(--bg-color))',
                  border: 'none',
                  color: '#fff',
                  padding: '14px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
                onChange={(e) =>
                  setBetAmount(
                    Math.min(betMax, Math.max(betMin, parseFloat(e.target.value) || betMin)),
                  )
                }
              />
              <button
                style={{
                  background: 'hsla(var(--surface-raised), 0.5)',
                  color: '#fff',
                  border: 'none',
                  padding: isMobile ? '0 8px' : '0 16px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
                onClick={() => setBetAmount(betAmount / 2)}
              >
                1/2
              </button>
              <button
                style={{
                  background: 'hsla(var(--surface-raised), 0.5)',
                  color: '#fff',
                  border: 'none',
                  padding: isMobile ? '0 8px' : '0 16px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
                onClick={() => setBetAmount(betAmount * 2)}
              >
                2x
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 800,
                color: 'hsl(var(--text-muted))',
              }}
            >
              Profit on Win
            </label>
            <div
              style={{
                background: 'hsla(var(--bg-color), 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <span
                className="mono"
                style={{ color: 'hsl(var(--success))', fontWeight: 700, fontSize: '1rem' }}
              >
                +${profitOnWin.toFixed(2)}
              </span>
              <Zap size={16} style={{ marginLeft: 'auto', color: 'hsl(var(--text-dim))' }} />
            </div>
          </div>

          <button
            onClick={() => {
              if (isAutoMode) {
                if (!autoRunning) {
                  setBaseBetAmount(betAmount);
                  setAutoRunning(true);
                } else {
                  setAutoRunning(false);
                }
              } else {
                handleRoll();
              }
            }}
            disabled={loading || isProcessing}
            style={{
              background:
                isAutoMode && autoRunning ? 'hsla(var(--primary), 0.1)' : 'hsl(var(--primary))',
              color: isAutoMode && autoRunning ? 'hsl(var(--primary))' : '#000',
              border: `1px solid ${isAutoMode && autoRunning ? 'hsla(var(--primary), 0.3)' : 'transparent'}`,
              minHeight: '56px',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isAutoMode && autoRunning ? 'none' : 'var(--glow-primary)',
            }}
          >
            {loading || isProcessing
              ? 'Rolling...'
              : isAutoMode
                ? autoRunning
                  ? 'Stop Autobet'
                  : 'Start Autobet'
                : 'Bet'}
          </button>

          {isAutoMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label
                  style={{
                    fontSize: 'var(--font-xs)',
                    fontWeight: 800,
                    color: 'hsl(var(--text-muted))',
                    display: 'block',
                    marginBottom: '8px',
                  }}
                >
                  Number of Bets
                </label>
                <input
                  type="number"
                  value={autoBetSettings.numberOfBets}
                  onChange={(e) => updateAutoSettings({ numberOfBets: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    background: 'hsl(var(--bg-color))',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1rem',
                  }}
                  placeholder="∞"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      fontSize: '0.65rem',
                      color: 'hsl(var(--text-muted))',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    On Win
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => updateAutoSettings({ onWin: 0 })}
                      style={{
                        flex: 1,
                        fontSize: '0.6rem',
                        padding: '6px',
                        background:
                          autoBetSettings.onWin === 0 ? 'hsla(var(--primary), 0.2)' : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                      }}
                    >
                      Reset
                    </button>
                    <input
                      type="number"
                      value={autoBetSettings.onWin}
                      onChange={(e) => updateAutoSettings({ onWin: Number(e.target.value) })}
                      style={{
                        width: '50px',
                        background: 'hsl(var(--bg-color))',
                        border: '1px solid var(--glass-border)',
                        color: '#fff',
                        padding: '4px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: '0.65rem',
                      color: 'hsl(var(--text-muted))',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    On Loss
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => updateAutoSettings({ onLoss: 0 })}
                      style={{
                        flex: 1,
                        fontSize: '0.6rem',
                        padding: '6px',
                        background:
                          autoBetSettings.onLoss === 0
                            ? 'hsla(var(--primary), 0.2)'
                            : 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '4px',
                      }}
                    >
                      Reset
                    </button>
                    <input
                      type="number"
                      value={autoBetSettings.onLoss}
                      onChange={(e) => updateAutoSettings({ onLoss: Number(e.target.value) })}
                      style={{
                        width: '50px',
                        background: 'hsl(var(--bg-color))',
                        border: '1px solid var(--glass-border)',
                        color: '#fff',
                        padding: '4px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.75rem',
              color: 'hsl(var(--text-muted))',
            }}
          >
            <Zap size={14} color="hsl(var(--success))" /> Instant Settlement
          </div>
        </div>
        <div
          className="dice-main"
          style={{
            background: 'hsl(var(--bg-color))',
            padding: 'var(--space-lg)',
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: 'var(--space-lg)',
            position: 'relative',
            minWidth: 0,
          }}
        >
          {/* Lucky 777 Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
              opacity: 0.2,
              zIndex: 0,
            }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.05, 1],
                rotate: [-2, 2, -2],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', position: 'relative' }}
            >
              <Image
                src="/images/dice/lucky-777-neon-3d.png"
                alt="777 Background"
                fill
                style={{ objectFit: 'cover' }}
                loading="lazy"
                priority={false}
              />
            </motion.div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '24px' : 'clamp(20px, 5vw, 40px)',
            }}
          >
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '40px',
                    height: '8px',
                    borderRadius: '4px',
                    background: h.win ? 'hsl(var(--success))' : 'hsl(var(--error))',
                    opacity: 1 - i * 0.1,
                    boxShadow: h.win ? '0 0 10px hsla(var(--success), 0.4)' : 'none',
                  }}
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: isMobile ? '120px' : '300px',
                position: 'relative',
              }}
            >
              {lastResult && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`animate-slide-up`}
                  style={{
                    fontSize: isMobile ? '5rem' : 'var(--font-3xl)',
                    fontWeight: 900,
                    color: lastResult.win ? 'hsl(var(--success))' : 'hsl(var(--error))',
                    filter: `drop-shadow(0 0 40px ${lastResult.win ? 'hsla(var(--success), 0.3)' : 'hsla(var(--error), 0.3)'})`,
                    fontFamily: 'var(--font-outfit)',
                  }}
                >
                  {lastResult.roll.toFixed(2)}
                </motion.div>
              )}
            </div>

            {/* Dice Slider */}
            <div
              ref={sliderRef}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              style={{
                position: 'relative',
                padding: isMobile ? '20px 0' : '40px 0',
                cursor: 'pointer',
                touchAction: 'none',
              }}
            >
              <div
                style={{
                  height: '16px',
                  width: '100%',
                  background: 'hsla(var(--surface-raised), 0.4)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {/* Win Zone */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: isRollOver ? `${targetPoint}%` : 0,
                    right: isRollOver ? 0 : `${100 - targetPoint}%`,
                    background: 'hsl(var(--success))',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                  }}
                />

                {/* Loss Zone */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: isRollOver ? 0 : `${targetPoint}%`,
                    right: isRollOver ? `${100 - targetPoint}%` : 0,
                    background: 'hsl(var(--error))',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                  }}
                />
              </div>
              {/* Visual Result Marker (Pin) — sibling of the track, not clipped by its overflow:hidden */}
              {(visualResult !== null || loading) && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${visualResult !== null ? visualResult : 50}%`,
                    top: `${(isMobile ? 20 : 40) + 8}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '6px',
                    height: '34px',
                    zIndex: 15,
                    transition: loading
                      ? 'none'
                      : 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    opacity: loading ? 0.3 : 1,
                  }}
                >
                  {/* Pin tip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: `8px solid ${markerColor}`,
                      filter: visualResult !== null ? `drop-shadow(0 0 6px ${markerGlow})` : 'none',
                    }}
                  />
                  {/* Pin stem */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '3px',
                      background: markerGlass,
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      border: `1.5px solid ${markerBorder}`,
                      boxShadow: visualResult !== null ? `0 0 16px ${markerGlow}` : 'none',
                      transition: loading ? 'none' : 'background 0.2s',
                    }}
                  />
                </div>
              )}
              {/* Slider Thumb / Marker */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${targetPoint}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '44px',
                  height: '44px',
                  background: '#fff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow:
                    'var(--shadow-md), 0 0 0 4px hsla(var(--primary), 0.18), 0 0 18px hsla(var(--primary), 0.45)',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  transition: 'none',
                  border: '2px solid hsl(var(--bg-color))',
                }}
              >
                <div
                  style={{
                    width: '3px',
                    height: '22px',
                    background: 'hsl(var(--text-dim))',
                    margin: '0 2px',
                    borderRadius: '2px',
                  }}
                />
                <div
                  style={{
                    width: '3px',
                    height: '22px',
                    background: 'hsl(var(--text-dim))',
                    margin: '0 2px',
                    borderRadius: '2px',
                  }}
                />
              </div>
              {/* Scale */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  color: 'hsl(var(--text-dim))',
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  fontWeight: 800,
                }}
              >
                <span>0</span>
                <span style={{ display: isMobile ? 'none' : 'block' }}>25</span>
                <span>50</span>
                <span style={{ display: isMobile ? 'none' : 'block' }}>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Target Inputs (Bottom Row) — fused glass bar */}
            <div
              className="dice-stat-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
                background: 'hsla(var(--surface-raised), 0.35)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--glass-border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '14px 16px',
                  borderRight: '1px solid var(--glass-border)',
                  borderBottom: isMobile ? '1px solid var(--glass-border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Zap
                    size={11}
                    style={{ opacity: 0.45, flexShrink: 0 }}
                    color="hsl(var(--primary))"
                  />
                  <label
                    style={{
                      fontSize: 'var(--font-xs)',
                      fontWeight: 800,
                      color: 'hsl(var(--text-muted))',
                    }}
                  >
                    Multiplier
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <input
                    type="number"
                    className="mono"
                    value={multiplier}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: 0,
                      outline: 'none',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                    onChange={(e) => updateFromMultiplier(parseFloat(e.target.value))}
                  />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'hsla(var(--primary), 0.75)',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </span>
                </div>
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    background: 'var(--glass-border)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${multiplierBarWidth}%`,
                      background:
                        'linear-gradient(90deg, hsla(var(--primary), 0.5), hsl(var(--primary)))',
                      borderRadius: '2px',
                      transition: 'width 0.2s',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '14px 16px',
                  borderRight: isMobile ? 'none' : '1px solid var(--glass-border)',
                  borderBottom: isMobile ? '1px solid var(--glass-border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {isRollOver ? (
                    <ArrowUpRight
                      size={11}
                      style={{ opacity: 0.45, flexShrink: 0 }}
                      color="hsl(var(--text-muted))"
                    />
                  ) : (
                    <ArrowDownRight
                      size={11}
                      style={{ opacity: 0.45, flexShrink: 0 }}
                      color="hsl(var(--text-muted))"
                    />
                  )}
                  <label
                    style={{
                      fontSize: 'var(--font-xs)',
                      fontWeight: 800,
                      color: 'hsl(var(--text-muted))',
                    }}
                  >
                    {isRollOver ? 'Roll Over' : 'Roll Under'}
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    className="mono"
                    value={targetPoint}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '1.25rem',
                      padding: 0,
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                    onChange={(e) => updateFromTarget(parseFloat(e.target.value))}
                  />
                  <button
                    onClick={toggleRollMode}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'hsl(var(--text-muted))',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      flexShrink: 0,
                      transition: 'color 0.2s',
                    }}
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'var(--glass-border)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: isRollOver ? `${targetPoint}%` : 0,
                      right: isRollOver ? 0 : `${100 - targetPoint}%`,
                      background: 'hsla(var(--success), 0.7)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: isRollOver ? 0 : `${targetPoint}%`,
                      right: isRollOver ? `${100 - targetPoint}%` : 0,
                      background: 'hsla(var(--error), 0.7)',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  padding: '14px 16px',
                  gridColumn: isMobile ? 'span 2' : 'auto',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Percent
                    size={11}
                    style={{ opacity: 0.45, flexShrink: 0 }}
                    color="hsl(var(--success))"
                  />
                  <label
                    style={{
                      fontSize: 'var(--font-xs)',
                      fontWeight: 800,
                      color: 'hsl(var(--text-muted))',
                    }}
                  >
                    Win Chance
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <input
                    type="number"
                    className="mono"
                    value={winChance}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      padding: 0,
                      outline: 'none',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                    onChange={(e) => updateFromWinChance(parseFloat(e.target.value))}
                  />
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'hsla(var(--success), 0.75)',
                      flexShrink: 0,
                    }}
                  >
                    %
                  </span>
                </div>
                <div
                  style={{
                    height: '4px',
                    width: '100%',
                    background: 'var(--glass-border)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${winChanceBarWidth}%`,
                      background:
                        'linear-gradient(90deg, hsla(var(--success), 0.5), hsl(var(--success)))',
                      borderRadius: '2px',
                      transition: 'width 0.2s',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Live Bets Sidebar (Right) */}
        {!isMobile && (
          <div
            className="live-bets-sidebar"
            style={{
              background: 'hsla(var(--surface-color), 0.8)',
              padding: 'var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              borderLeft: '1px solid var(--glass-border)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 800,
                color: 'hsl(var(--text-muted))',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Live Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allBets
                .filter((b) => b.game === 'DICE')
                .slice(0, 15)
                .map((bet) => (
                  <div
                    key={bet.id}
                    style={{
                      background: bet.isWin
                        ? 'hsla(var(--success), 0.08)'
                        : 'hsla(var(--surface-raised), 0.25)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.75rem',
                      border: bet.isWin
                        ? '1px solid hsla(var(--success), 0.35)'
                        : '1px solid var(--glass-border)',
                      boxShadow: bet.isWin ? '0 0 16px hsla(var(--success), 0.15)' : 'none',
                      opacity: bet.isWin ? 1 : 0.65,
                      animation: 'slideIn 0.3s ease-out',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: getAvatarColor(bet.user),
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: 'hsl(var(--text-main))',
                      }}
                    >
                      {bet.user.charAt(0).toUpperCase()}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          color: 'hsl(var(--text-main))',
                          fontWeight: 800,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {bet.user}
                      </span>
                      <span style={{ color: 'hsl(var(--text-dim))', fontWeight: 700 }}>
                        ${bet.amount.toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          color: bet.isWin ? 'hsl(var(--success))' : 'hsl(var(--text-dim))',
                          fontWeight: 900,
                          fontSize: bet.isWin ? '0.95rem' : '0.75rem',
                        }}
                      >
                        {bet.multiplier.toFixed(2)}x
                      </span>
                      <div
                        style={{
                          color: bet.isWin ? 'hsl(var(--success))' : 'hsl(var(--text-dim))',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                        }}
                      >
                        {bet.isWin ? `+$${bet.payout.toFixed(2)}` : '-$0.00'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </GameErrorBoundary>
  );
}
