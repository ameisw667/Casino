'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Play, Zap, Info, Trophy } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { validateBet } from '@/lib/casino/bet-validator';
import { sanitizeClientSeed } from '@/lib/casino/provably-fair';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import { SlotCabinetV2 } from '@/components/casino/games/slots/v2/SlotCabinetV2';
import { GAME_SYMBOLS, STAGGER_DELAYS_MS, TOTAL_SPIN_MS } from '../symbols';
import type { SymbolType } from '@/components/casino/SlotSymbol';

const REEL_COUNT = 5;

type ReelSymbols = [SymbolType, SymbolType, SymbolType];
type WinningRows = [boolean, boolean, boolean];

const POOL_SIZE = GAME_SYMBOLS.length;

function buildReel(idx: number): ReelSymbols {
  return [
    GAME_SYMBOLS[(idx + POOL_SIZE - 1) % POOL_SIZE],
    GAME_SYMBOLS[idx % POOL_SIZE],
    GAME_SYMBOLS[(idx + 1) % POOL_SIZE],
  ];
}

const DEFAULT_REELS: ReelSymbols[] = Array(REEL_COUNT)
  .fill(null)
  .map((_, i) => buildReel(i % POOL_SIZE));

const NO_WIN: WinningRows = [false, false, false];

const PAYTABLE = [
  { symbol: '⚡ ZEUS', tier: 'legendary', mult3: '10×', mult4: '25×', mult5: '75×' },
  { symbol: '♛ CROWN', tier: 'epic', mult3: '5×', mult4: '12×', mult5: '35×' },
  { symbol: '⚗ CHALICE', tier: 'rare', mult3: '4×', mult4: '8×', mult5: '20×' },
  { symbol: 'A', tier: 'uncommon', mult3: '3×', mult4: '6×', mult5: '15×' },
  { symbol: 'K', tier: 'uncommon', mult3: '2.5×', mult4: '5×', mult5: '12×' },
  { symbol: 'Q', tier: 'common', mult3: '2×', mult4: '4×', mult5: '10×' },
  { symbol: 'J', tier: 'common', mult3: '1.5×', mult4: '3×', mult5: '8×' },
  { symbol: '10', tier: 'common', mult3: '1×', mult4: '2×', mult5: '5×' },
];

const QUICK_BETS = [1, 5, 25, 100];

export default function SlotsV2Page() {
  const balance = useCasinoStore((s) => s.balance);
  const provablyFair = useCasinoStore((s) => s.provablyFairSettings);
  const setPF = useCasinoStore((s) => s.setProvablyFairSettings);
  const processResult = useCasinoStore((s) => s.processGameResult);
  const applyServerWalletSnapshot = useCasinoStore((s) => s.applyServerWalletSnapshot);
  const addToast = useCasinoStore((s) => s.addToast);
  const setProcessing = useCasinoStore((s) => s.setIsProcessing);
  const { betMin, betMax } = useCasinoStore((s) => s.gameConfig.limits);

  type LastResult = { type: 'win' | 'loss' | 'idle'; amount: number };

  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [lastResult, setLastResult] = useState<LastResult>({ type: 'idle', amount: 0 });
  const [finalReels, setFinalReels] = useState<ReelSymbols[]>(DEFAULT_REELS);
  const [winRows, setWinRows] = useState<WinningRows[]>(Array(REEL_COUNT).fill(NO_WIN));
  const [winningRowIndex, setWinningRowIndex] = useState<0 | 1 | 2 | null>(null);
  const [sessionProfit, setSessionProfit] = useState(0);
  const [sessionSpins, setSessionSpins] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  useEffect(() => {
    const sounds = {
      spin: '/sounds/dice-roll.mp3',
      win: '/sounds/win.mp3',
      loss: '/sounds/loss.mp3',
    };
    const created: HTMLAudioElement[] = [];
    Object.entries(sounds).forEach(([k, url]) => {
      const a = new Audio(url);
      a.volume = 0.3;
      audioRefs.current[k] = a;
      created.push(a);
    });
    return () =>
      created.forEach((a) => {
        a.pause();
        a.src = '';
      });
  }, []);

  const playSound = useCallback((name: string) => {
    const a = audioRefs.current[name];
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
  }, []);

  const lastSpinTimeRef = useRef(0);
  const handleSpin = useCallback(async () => {
    if (isSpinning) return;
    const now = Date.now();
    if (now - lastSpinTimeRef.current < 200) return;
    lastSpinTimeRef.current = now;

    const betError = validateBet(betAmount, balance);
    if (betError) {
      setIsAuto(false);
      addToast(betError, 'error');
      return;
    }

    setIsSpinning(true);
    setProcessing(true);
    setWinRows(Array(REEL_COUNT).fill(NO_WIN));
    setWinningRowIndex(null);
    setLastResult({ type: 'idle', amount: 0 });
    playSound('spin');

    const sanitizedSeed = sanitizeClientSeed(provablyFair.clientSeed);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const [res] = await Promise.all([
        fetch('/api/casino/bet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: crypto.randomUUID(),
            gameType: 'SLOTS',
            amount: betAmount,
            clientSeed: sanitizedSeed,
            currentNonce: provablyFair.nonce,
          }),
          signal: controller.signal,
        }),
        new Promise((r) => setTimeout(r, TOTAL_SPIN_MS)),
      ]);

      clearTimeout(timeoutId);
      if (!res.ok) {
        if (res.status === 429) {
          const errData = await res.json().catch(() => ({}));
          const retry = errData.retryAfter || 2;
          throw new Error(`RATE_LIMIT:${retry}`);
        }
        throw new Error('API error');
      }
      const data = await res.json();

      setPF({ serverSeedHash: data.serverSeedHash, nonce: data.nonce });

      const engineSymbols: number[] = data.symbols ?? [];
      const newReels =
        engineSymbols.length === REEL_COUNT ? engineSymbols.map(buildReel) : DEFAULT_REELS;

      setFinalReels(newReels);

      if (data.payout > 0) {
        setLastResult({ type: 'win', amount: data.payout });
        playSound('win');
      } else {
        setLastResult({ type: 'loss', amount: betAmount });
        playSound('loss');
      }

      if (data.win && engineSymbols.length > 0) {
        const counts: Record<number, number> = {};
        engineSymbols.forEach((s: number) => {
          counts[s] = (counts[s] ?? 0) + 1;
        });
        const winningSym = Object.entries(counts).find(([, c]) => c >= 3)?.[0];

        const newWinRows: WinningRows[] = newReels.map((reel) =>
          winningSym !== undefined
            ? (reel.map((s) => s === GAME_SYMBOLS[Number(winningSym)]) as WinningRows)
            : NO_WIN,
        );
        setWinRows(newWinRows);

        const rowIdx =
          ([0, 1, 2] as const).find((r) => newWinRows.every((reel) => reel[r])) ?? null;
        setWinningRowIndex(rowIdx);
      }

      const net = (data.payout ?? 0) - betAmount;
      setSessionProfit((p) => p + net);
      setSessionSpins((s) => s + 1);

      applyServerWalletSnapshot(data.wallet);
      processResult({
        game: 'SLOTS',
        amount: betAmount,
        multiplier: data.payout > 0 ? data.payout / betAmount : 0,
        payout: data.payout ?? 0,
        win: data.win ?? false,
        resultId: data.id ?? Math.random().toString(36).slice(2),
      });
    } catch (error) {
      clearTimeout(timeoutId);
      setIsAuto(false);
      if (error instanceof Error && error.message.startsWith('RATE_LIMIT:')) {
        const retrySec = error.message.split(':')[1] || '2';
        addToast(`Rate limit reached. Please wait ${retrySec}s.`, 'error');
      } else {
        addToast('Spin failed. Try again.', 'error');
      }
    } finally {
      setIsSpinning(false);
      setProcessing(false);
    }
  }, [
    isSpinning,
    betAmount,
    balance,
    provablyFair,
    addToast,
    setPF,
    processResult,
    applyServerWalletSnapshot,
    playSound,
    setProcessing,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSpin]);

  useEffect(() => {
    if (!isAuto || isSpinning) return;

    const timer = setTimeout(
      () => {
        if (balance < betAmount) {
          setIsAuto(false);
          return;
        }
        void handleSpin();
      },
      balance < betAmount ? 0 : 800,
    );

    return () => clearTimeout(timer);
  }, [isAuto, isSpinning, balance, betAmount, handleSpin]);

  return (
    <GameErrorBoundary gameName="Slots V2">
      <div className="slots-page">
        {showTutorial && (
          <div className="slot-tutorial-overlay" onClick={() => setShowTutorial(false)}>
            <div className="slot-tutorial-card" onClick={(e) => e.stopPropagation()}>
              <Info size={40} color="hsl(var(--primary))" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ marginBottom: '12px' }}>HOW TO WIN</h2>
              <p>
                Match 3–5 identical symbols across the center row to win.
                <br />
                ZEUS pays up to 75× your bet.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => setShowTutorial(false)}
              >
                GOT IT
              </button>
            </div>
          </div>
        )}

        <div className="slots-grid">
          <aside className="slot-legend">
            <div className="slot-legend-header">
              <Trophy size={18} color="hsl(var(--primary))" />
              <span>PAYTABLE</span>
            </div>
            <div className="slot-legend-rule">
              Match 3–5 symbols on the <strong>center line</strong> to win.
            </div>
            <div className="slot-legend-rows">
              {PAYTABLE.map((row) => (
                <div key={row.symbol} className={`slot-legend-row tier-${row.tier}`}>
                  <span className="slot-legend-sym">{row.symbol}</span>
                  <div className="slot-legend-mults">
                    <span className="slot-mult-chip">
                      3× <strong>{row.mult3}</strong>
                    </span>
                    <span className="slot-mult-chip">
                      4× <strong>{row.mult4}</strong>
                    </span>
                    <span className="slot-mult-chip">
                      5× <strong>{row.mult5}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="slot-machine-area">
            <SlotCabinetV2
              finalReels={finalReels}
              isSpinning={isSpinning}
              winRows={winRows}
              winningRowIndex={winningRowIndex}
              lastResult={lastResult}
              sessionSpins={sessionSpins}
              sessionProfit={sessionProfit}
              stopDelays={STAGGER_DELAYS_MS}
              symbolPool={GAME_SYMBOLS}
            />
          </section>

          <aside className="slot-control-panel">
            <div className="slot-panel-header">
              <Zap size={20} color="hsl(var(--primary))" />
              <h3>CONTROL</h3>
              <button
                className="btn btn-secondary"
                style={{ padding: '8px' }}
                onClick={() => setShowTutorial(true)}
                aria-label="How to play"
              >
                <Info size={16} />
              </button>
            </div>

            <div className="slot-balance-card">
              <div className="slot-balance-label">BALANCE</div>
              <div className="slot-balance-value mono">${balance.toFixed(2)}</div>
            </div>

            <div className="slot-bet-section">
              <div className="slot-section-label">
                <span>BET AMOUNT</span>
              </div>
              <div className="slot-bet-input-row">
                <button
                  className="slot-bet-half"
                  onClick={() =>
                    setBetAmount((v) => Math.max(betMin, parseFloat((v / 2).toFixed(2))))
                  }
                >
                  1/2
                </button>
                <input
                  type="number"
                  className="input mono slot-bet-input"
                  value={betAmount}
                  onChange={(e) =>
                    setBetAmount(
                      Math.min(betMax, Math.max(betMin, parseFloat(e.target.value) || betMin)),
                    )
                  }
                  aria-label="Bet amount"
                />
                <button
                  className="slot-bet-double"
                  onClick={() =>
                    setBetAmount((v) => Math.min(betMax, parseFloat((v * 2).toFixed(2))))
                  }
                >
                  2×
                </button>
              </div>
              <div className="slot-quick-bets">
                {QUICK_BETS.map((v) => (
                  <button
                    key={v}
                    className={`slot-quick-bet${betAmount === v ? 'active' : ''}`}
                    onClick={() => setBetAmount(v)}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            <div className="slot-auto-row">
              <button
                className={`slot-auto-toggle${isAuto ? 'active' : ''}`}
                onClick={() => setIsAuto((v) => !v)}
                disabled={isSpinning}
              >
                {isAuto ? 'AUTO ON' : 'AUTO'}
              </button>
            </div>

            <motion.button
              className="slot-spin-btn btn btn-primary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              onClick={handleSpin}
              disabled={isSpinning}
              aria-label={isSpinning ? 'Spinning' : 'Spin'}
            >
              {isSpinning ? (
                <>
                  <RotateCcw size={28} className="animate-spin" />
                  <span>SPINNING…</span>
                </>
              ) : (
                <>
                  <Play size={28} fill="currentColor" />
                  <span>SPIN</span>
                </>
              )}
            </motion.button>

            <div className="slot-session-card">
              <div className="slot-session-label">SESSION STATS</div>
              <div className="slot-session-grid">
                <div>
                  <div className="slot-session-sub">SPINS</div>
                  <div className="mono">{sessionSpins}</div>
                </div>
                <div>
                  <div className="slot-session-sub">PROFIT</div>
                  <div className={`mono ${sessionProfit >= 0 ? 'slot-positive' : 'slot-negative'}`}>
                    {sessionProfit >= 0 ? '+' : ''}${sessionProfit.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
