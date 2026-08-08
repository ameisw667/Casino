'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCasinoStore } from '@/store/useCasinoStore'
import type { BlackjackGameState } from '@/lib/games/blackjack'
import BlackjackTable from '@/components/casino/games/blackjack/BlackjackTable'
import BlackjackActions from '@/components/casino/games/blackjack/BlackjackActions'
import { soundManager } from '@/lib/casino/sound-manager'

export default function BlackjackPage() {
  // Store selectors
  const isMobile = useCasinoStore(s => s.isMobile)
  const balance = useCasinoStore(s => s.balance)
  const provablyFairSettings = useCasinoStore(s => s.provablyFairSettings)
  const setProvablyFairSettings = useCasinoStore(s => s.setProvablyFairSettings)
  const processGameResult = useCasinoStore(s => s.processGameResult)
  const applyServerWalletSnapshot = useCasinoStore(s => s.applyServerWalletSnapshot)
  const addToast = useCasinoStore(s => s.addToast)
  const isProcessing = useCasinoStore(s => s.isProcessing)
  const setIsProcessing = useCasinoStore(s => s.setIsProcessing)
  const rawGameStats = useCasinoStore(s => (s.gameStats as Record<string, { totalBets: number; wins: number; losses: number; profit: number } | undefined>)['BLACKJACK'])
  const gameStats = rawGameStats ?? { totalBets: 0, wins: 0, losses: 0, profit: 0 }
  const { betMin, betMax } = useCasinoStore(s => s.gameConfig.limits)

  // Local state
  const mounted = true
  const [betAmount, setBetAmount] = useState(10)
  const [baseBetAmount, setBaseBetAmount] = useState(10)
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [autoRunning, setAutoRunning] = useState(false)
  const [currentAutoCount, setCurrentAutoCount] = useState(0)
  const [autoRounds, setAutoRounds] = useState(100)
  const [stopOnProfit, setStopOnProfit] = useState(0)
  const [stopOnLoss, setStopOnLoss] = useState(0)
  const [history, setHistory] = useState<{ win: boolean; payout: number }[]>([])

  // Stable refs to avoid stale closures in callbacks
  const betAmountRef = useRef(betAmount)
  const baseBetAmountRef = useRef(baseBetAmount)
  const provablyFairRef = useRef(provablyFairSettings)
  const roundIdRef = useRef<string | null>(null)
  const roundVersionRef = useRef(0)
  useEffect(() => { betAmountRef.current = betAmount }, [betAmount])
  useEffect(() => { baseBetAmountRef.current = baseBetAmount }, [baseBetAmount])
  useEffect(() => { provablyFairRef.current = provablyFairSettings }, [provablyFairSettings])

  const applyBlackjackResponse = useCallback((data: {
    gameState: BlackjackGameState
    roundId: string
    version: number
    wallet: Parameters<typeof applyServerWalletSnapshot>[0]
    settled?: boolean
    result?: { id: string; win: boolean; payout: number; multiplier: number }
    serverSeedHash?: string
    nonce?: number
  }, totalBet: number) => {
    applyServerWalletSnapshot(data.wallet)
    roundIdRef.current = data.roundId
    roundVersionRef.current = data.version
    setGameState(data.gameState)
    if (data.serverSeedHash && data.nonce !== undefined) {
      setProvablyFairSettings({ serverSeedHash: data.serverSeedHash, nonce: data.nonce })
    }
    if (data.settled && data.result) {
      processGameResult({
        game: 'BLACKJACK',
        amount: totalBet,
        multiplier: data.result.multiplier,
        payout: data.result.payout,
        win: data.result.win,
        resultId: data.result.id,
      })
      setHistory((previous) => [
        { win: data.result!.win, payout: data.result!.payout },
        ...previous,
      ].slice(0, 8))
      setTimeout(() => {
        setGameState(null)
        roundIdRef.current = null
        roundVersionRef.current = 0
        setBetAmount(baseBetAmountRef.current)
      }, 2500)
    }
  }, [applyServerWalletSnapshot, processGameResult, setProvablyFairSettings])

  const handleDeal = useCallback(async () => {
    if (!mounted || isProcessing) return
    const bet = betAmountRef.current
    if (bet < betMin || bet > betMax || bet > balance) {
      addToast(`Bet must be between $${betMin.toFixed(2)} and $${betMax.toLocaleString()}`, 'error')
      return
    }
    setIsProcessing(true)
    try {
      const clientSeed = provablyFairRef.current.clientSeed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
      const response = await fetch('/api/casino/blackjack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DEAL', requestId: crypto.randomUUID(), amount: bet,
          clientSeed, currentNonce: provablyFairRef.current.nonce,
        }),
      })
      if (!response.ok) throw new Error(`Deal failed with HTTP ${response.status}`)
      applyBlackjackResponse(await response.json(), bet)
      soundManager.play('click')
    } catch {
      addToast('Deal could not be confirmed by the server', 'error')
      setGameState(null)
    } finally {
      setIsProcessing(false)
    }
  }, [mounted, isProcessing, betMin, betMax, balance, addToast, setIsProcessing, applyBlackjackResponse])

  const requestAction = useCallback(async (action: 'HIT' | 'STAND' | 'DOUBLE' | 'SPLIT') => {
    if (!roundIdRef.current || !roundVersionRef.current || isProcessing) return
    setIsProcessing(true)
    try {
      const currentBet = betAmountRef.current
      const totalBet = action === 'DOUBLE' || action === 'SPLIT' ? currentBet * 2 : currentBet
      if (totalBet > balance && (action === 'DOUBLE' || action === 'SPLIT')) {
        throw new Error('Insufficient balance')
      }
      const response = await fetch('/api/casino/blackjack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action, requestId: crypto.randomUUID(), roundId: roundIdRef.current,
          version: roundVersionRef.current,
        }),
      })
      if (!response.ok) throw new Error(`Action failed with HTTP ${response.status}`)
      if (totalBet !== currentBet) {
        setBetAmount(totalBet)
        betAmountRef.current = totalBet
      }
      applyBlackjackResponse(await response.json(), totalBet)
      soundManager.play('click')
    } catch (error) {
      addToast(error instanceof Error && error.message === 'Insufficient balance'
        ? error.message : 'Blackjack action could not be confirmed by the server', 'error')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, balance, addToast, setIsProcessing, applyBlackjackResponse])

  const handleHit = useCallback(() => { void requestAction('HIT') }, [requestAction])
  const handleStand = useCallback(() => { void requestAction('STAND') }, [requestAction])
  const handleDouble = useCallback(() => { void requestAction('DOUBLE') }, [requestAction])
  const handleSplit = useCallback(() => { void requestAction('SPLIT') }, [requestAction])
  // Keyboard shortcuts: H=Hit, S=Stand, D=Double
  useEffect(() => {
    if (!mounted) return
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'h' || e.key === 'H') handleHit()
      if (e.key === 's' || e.key === 'S') handleStand()
      if (e.key === 'd' || e.key === 'D') handleDouble()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mounted, handleHit, handleStand, handleDouble])

  // Auto-Bet Loop
  useEffect(() => {
    if (!autoRunning || isProcessing || gameState !== null) return

    if (currentAutoCount >= autoRounds) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAutoRunning(false)
      addToast(`Auto-bet finished: ${autoRounds} rounds`, 'info')
      return
    }

    if (stopOnProfit > 0 && gameStats.profit >= stopOnProfit) {
      setAutoRunning(false)
      addToast(`Stopped on profit: +$${gameStats.profit.toFixed(2)}`, 'success')
      return
    }

    if (stopOnLoss > 0 && gameStats.profit < -stopOnLoss) {
      setAutoRunning(false)
      addToast(`Stopped on loss: $${gameStats.profit.toFixed(2)}`, 'info')
      return
    }

    const timer = setTimeout(() => {
      handleDeal()
      setCurrentAutoCount(p => p + 1)
    }, 1500)

    return () => clearTimeout(timer)
  }, [autoRunning, isProcessing, gameState, currentAutoCount, autoRounds, gameStats.profit, stopOnProfit, stopOnLoss, addToast, handleDeal])

  // Auto-Play Strategy: stand at >= 16 (active hand)
  useEffect(() => {
    if (!autoRunning || !gameState) return

    if (gameState.phase === 'PLAYER_TURN') {
      if (gameState.playerHand.score >= 16) handleStand()
      else handleHit()
    } else if (gameState.phase === 'PLAYER_TURN_HAND2') {
      const hand2Score = gameState.playerHand2?.score ?? 0
      if (hand2Score >= 16) handleStand()
      else handleHit()
    }
  }, [gameState?.phase, gameState?.playerHand?.score, gameState?.playerHand2?.score, autoRunning, handleStand, handleHit])

  if (!mounted) return null

  const isInGame = gameState !== null && gameState.phase !== 'SETTLEMENT'
  const canDeal = !isProcessing && gameState === null && betAmount >= betMin && betAmount <= balance

  return (
    <div className={`blackjack-container ${isMobile ? 'mobile' : ''}`}>
      {/* ── SIDEBAR ─────────────────────────────────── */}
      <div className="blackjack-sidebar">
        {/* Mode Toggle */}
        <div className="bj-card mode-toggle">
          <button
            className={`mode-btn ${!isAutoMode ? 'active' : ''}`}
            onClick={() => { setIsAutoMode(false); setAutoRunning(false) }}
          >
            Manual
          </button>
          <button
            className={`mode-btn ${isAutoMode ? 'active' : ''}`}
            onClick={() => setIsAutoMode(true)}
          >
            Auto
          </button>
        </div>

        {/* Bet Controls */}
        <div className="bj-card">
          <label className="bj-label">Bet Amount</label>
          <div className="bet-input-group">
            <input
              type="number"
              value={betAmount}
              onChange={e => {
                const v = Math.max(betMin, Math.min(betMax, parseFloat(e.target.value) || 0))
                setBetAmount(v)
                setBaseBetAmount(v)
              }}
              disabled={isInGame}
              min={betMin}
              max={betMax}
              step="0.1"
              className="bet-input"
            />
            <button
              onClick={() => { const v = Math.max(betMin, betAmount / 2); setBetAmount(v); setBaseBetAmount(v) }}
              disabled={isInGame}
              className="bet-adj-btn"
            >½</button>
            <button
              onClick={() => { const v = Math.min(betMax, betAmount * 2); setBetAmount(v); setBaseBetAmount(v) }}
              disabled={isInGame}
              className="bet-adj-btn"
            >2×</button>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="quick-chips">
          {[1, 5, 10, 25, 50, 100].map(chip => (
            <button
              key={chip}
              onClick={() => { setBetAmount(chip); setBaseBetAmount(chip) }}
              disabled={isInGame}
              className="chip-btn"
            >
              ${chip}
            </button>
          ))}
        </div>

        {/* Deal Button */}
        <motion.button
          className="deal-btn"
          onClick={handleDeal}
          disabled={!canDeal}
          whileHover={canDeal ? { scale: 1.02 } : {}}
          whileTap={canDeal ? { scale: 0.97 } : {}}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Shuffling...
            </span>
          ) : isInGame ? 'PLAYING...' : 'DEAL'}
        </motion.button>

        {/* Keyboard Hint */}
        {!isMobile && (
          <div className="keyboard-hint">
            <span>H</span> Hit &nbsp;·&nbsp; <span>S</span> Stand &nbsp;·&nbsp; <span>D</span> Double
          </div>
        )}

        {/* Payout Info */}
        <div className="bj-card">
          <div className="bj-label mb-2">Payouts</div>
          <div className="payout-row"><span>Blackjack</span><span className="text-yellow-400 font-bold">3:2</span></div>
          <div className="payout-row"><span>Win</span><span>1:1</span></div>
          <div className="payout-row"><span>Push</span><span className="text-blue-400">Even</span></div>
          <div className="payout-row"><span>Bust</span><span className="text-red-400">Loss</span></div>
        </div>

        {/* Stats */}
        <div className="bj-card">
          <div className="bj-label mb-2">Stats</div>
          <div className="stat-row">
            <span>Win Rate</span>
            <span className="stat-val">
              {gameStats.totalBets > 0
                ? ((gameStats.wins / gameStats.totalBets) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
          <div className="stat-row">
            <span>Total Bets</span>
            <span className="stat-val">{gameStats.totalBets}</span>
          </div>
          <div className="stat-row">
            <span>Profit</span>
            <span className={`stat-val ${gameStats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gameStats.profit >= 0 ? '+' : ''}${gameStats.profit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Auto-Bet Settings */}
        <AnimatePresence>
          {isAutoMode && (
            <motion.div
              className="bj-card auto-settings"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="bj-label mb-3">Auto-Bet Settings</div>
              <label className="auto-label">
                Rounds
                <input type="number" value={autoRounds}
                  onChange={e => setAutoRounds(Math.max(1, parseInt(e.target.value) || 1))}
                  className="auto-input" min="1" max="500" />
              </label>
              <label className="auto-label">
                Stop on Profit ($)
                <input type="number" value={stopOnProfit}
                  onChange={e => setStopOnProfit(parseFloat(e.target.value) || 0)}
                  className="auto-input" min="0" step="10" />
              </label>
              <label className="auto-label">
                Stop on Loss ($)
                <input type="number" value={stopOnLoss}
                  onChange={e => setStopOnLoss(parseFloat(e.target.value) || 0)}
                  className="auto-input" min="0" step="10" />
              </label>
              <div className="flex gap-2 mt-2">
                <motion.button
                  className={`start-auto-btn flex-1 ${autoRunning ? 'running' : ''}`}
                  onClick={() => {
                    if (autoRunning) {
                      setAutoRunning(false)
                    } else {
                      setAutoRunning(true)
                      setCurrentAutoCount(0)
                    }
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {autoRunning
                    ? `Stop (${currentAutoCount}/${autoRounds})`
                    : 'Start Auto-Bet'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MAIN GAME AREA ─────────────────────────── */}
      <div className="blackjack-main">
        <div className="game-wrapper">
          <AnimatePresence mode="wait">
            {gameState ? (
              <motion.div
                key="game"
                className="w-full flex flex-col gap-6 items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <BlackjackTable
                  dealerHand={gameState.dealerHand}
                  playerHand={gameState.playerHand}
                  playerHand2={gameState.playerHand2}
                  activeHandIndex={gameState.activeHandIndex}
                  betAmount={betAmount}
                  result={gameState.result}
                  result2={gameState.result2}
                  payout={gameState.payout * betAmount}
                  isProcessing={isProcessing}
                />
                <BlackjackActions
                  phase={gameState.phase}
                  canDouble={gameState.canDouble && betAmount * 2 <= balance}
                  canSplit={gameState.canSplit}
                  onHit={handleHit}
                  onStand={handleStand}
                  onDouble={handleDouble}
                  onSplit={handleSplit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="empty-cards"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ♠ ♥ ♣ ♦
                </motion.div>
                <p className="empty-text">Place your bet and click DEAL to start</p>
                {balance < 1 && (
                  <p className="text-red-400 text-sm mt-2">Insufficient balance</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Pills */}
        <div className="history-pills">
          <AnimatePresence>
            {history.map((result, i) => (
              <motion.div
                key={`${i}-${result.payout}`}
                className={`pill ${result.win ? 'win' : 'loss'}`}
                title={`${result.win ? 'Win' : 'Loss'} $${result.payout.toFixed(2)}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .blackjack-container {
          display: flex;
          gap: 24px;
          max-width: 1600px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
          align-items: flex-start;
        }

        .blackjack-container.mobile {
          flex-direction: column;
          padding: 16px;
          gap: 16px;
        }

        .blackjack-sidebar {
          width: 340px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mobile .blackjack-sidebar {
          width: 100%;
          order: 2;
        }

        .blackjack-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        .mobile .blackjack-main {
          order: 1;
        }

        .game-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: hsla(var(--surface-color), 0.5);
          border-radius: 20px;
          border: 1px solid hsla(var(--primary), 0.15);
          padding: 32px 24px;
          min-height: 520px;
          backdrop-filter: blur(12px);
        }

        .mobile .game-wrapper {
          padding: 20px 12px;
          min-height: 400px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-cards {
          font-size: 2.5rem;
          letter-spacing: 12px;
          color: hsla(var(--primary), 0.6);
        }

        .empty-text {
          color: hsla(var(--text-color), 0.5);
          font-size: 1rem;
          text-align: center;
        }

        /* Cards */
        .bj-card {
          padding: 16px;
          background: hsla(var(--surface-color), 0.7);
          border-radius: 14px;
          border: 1px solid hsla(var(--primary), 0.12);
          backdrop-filter: blur(8px);
        }

        .bj-label {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: hsla(var(--text-color), 0.6);
        }

        /* Mode Toggle */
        .mode-toggle {
          display: flex;
          gap: 8px;
          flex-direction: row;
          padding: 8px;
        }

        .mode-btn {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid hsla(var(--primary), 0.25);
          background: transparent;
          border-radius: 10px;
          color: hsla(var(--text-color), 0.6);
          cursor: pointer;
          transition: all 200ms ease;
          font-weight: 600;
          font-size: 0.875rem;
          min-height: 44px;
        }

        .mode-btn.active {
          background: hsla(var(--primary), 0.2);
          color: hsl(var(--primary));
          border-color: hsl(var(--primary));
        }

        /* Bet Input */
        .bet-input-group {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .bet-input {
          flex: 1;
          padding: 10px 12px;
          background: hsla(var(--surface-color), 0.4);
          border: 1px solid hsla(var(--primary), 0.2);
          border-radius: 10px;
          color: hsl(var(--text-color));
          font-size: 1rem;
          font-family: 'Courier New', monospace;
          font-weight: 600;
          min-height: 44px;
        }

        .bet-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .bet-adj-btn {
          padding: 10px 14px;
          background: hsla(var(--primary), 0.15);
          border: 1px solid hsla(var(--primary), 0.25);
          border-radius: 10px;
          color: hsl(var(--primary));
          cursor: pointer;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 150ms ease;
          min-height: 44px;
          min-width: 44px;
        }

        .bet-adj-btn:hover:not(:disabled) { background: hsla(var(--primary), 0.25); }
        .bet-adj-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Quick Chips */
        .quick-chips {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .chip-btn {
          padding: 12px 8px;
          background: hsla(var(--secondary), 0.15);
          border: 1px solid hsla(var(--secondary), 0.25);
          border-radius: 10px;
          color: hsl(var(--secondary));
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 150ms ease;
          min-height: 48px;
        }

        .chip-btn:hover:not(:disabled) {
          background: hsla(var(--secondary), 0.28);
          transform: translateY(-1px);
        }

        .chip-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Deal Button */
        .deal-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(45, 90%, 55%));
          border: none;
          border-radius: 14px;
          color: hsl(20, 10%, 10%);
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 200ms ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          min-height: 56px;
          box-shadow: 0 4px 20px hsla(var(--primary), 0.3);
        }

        .deal-btn:hover:not(:disabled) {
          box-shadow: 0 6px 28px hsla(var(--primary), 0.5);
        }

        .deal-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Keyboard Hint */
        .keyboard-hint {
          text-align: center;
          font-size: 0.75rem;
          color: hsla(var(--text-color), 0.35);
        }

        .keyboard-hint span {
          display: inline-block;
          padding: 1px 6px;
          border: 1px solid hsla(var(--text-color), 0.2);
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
        }

        /* Payout & Stat rows */
        .payout-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 0.875rem;
          color: hsla(var(--text-color), 0.8);
          border-bottom: 1px solid hsla(var(--primary), 0.06);
        }

        .payout-row:last-child { border-bottom: none; }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
          font-size: 0.875rem;
          color: hsla(var(--text-color), 0.75);
        }

        .stat-val {
          font-family: 'Courier New', monospace;
          font-weight: 700;
          color: hsl(var(--primary));
        }

        /* Auto Settings */
        .auto-settings { overflow: hidden; }

        .auto-label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.8rem;
          color: hsla(var(--text-color), 0.75);
          margin-bottom: 10px;
        }

        .auto-input {
          padding: 8px 10px;
          background: hsla(var(--surface-color), 0.4);
          border: 1px solid hsla(var(--secondary), 0.2);
          border-radius: 8px;
          color: hsl(var(--text-color));
          font-size: 0.875rem;
          min-height: 40px;
        }

        .start-auto-btn {
          padding: 12px 16px;
          background: hsla(var(--secondary), 0.25);
          border: 1px solid hsla(var(--secondary), 0.35);
          border-radius: 10px;
          color: hsl(var(--secondary));
          font-weight: 700;
          cursor: pointer;
          transition: all 200ms ease;
          min-height: 48px;
        }

        .start-auto-btn.running {
          background: hsla(var(--error), 0.2);
          border-color: hsla(var(--error), 0.4);
          color: hsl(var(--error));
        }

        .start-auto-btn:hover { filter: brightness(1.15); }

        /* History Pills */
        .history-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          min-height: 20px;
          padding: 8px 0;
        }

        .pill {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          cursor: default;
          transition: transform 200ms;
        }

        .pill:hover { transform: scale(1.3); }
        .pill.win { background: hsl(var(--success)); box-shadow: 0 0 6px hsla(var(--success), 0.5); }
        .pill.loss { background: hsl(var(--error)); box-shadow: 0 0 6px hsla(var(--error), 0.4); }
      `}</style>
    </div>
  )
}
