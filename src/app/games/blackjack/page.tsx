'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCasinoStore } from '@/store/useCasinoStore'
// TODO: Phase 2 - Import BlackjackEngine, BlackjackGameState from '@/lib/games/blackjack'
// TODO: Phase 2 - Import BlackjackTable, BlackjackActions components
import { ProvablyFairEngine } from '@/lib/casino/provably-fair'
import { soundManager } from '@/lib/casino/sound-manager'

// Placeholder types for Phase 2 component integration
interface BlackjackGameState {
  phase: 'IDLE' | 'DEALING' | 'PLAYER_TURN' | 'PLAYER_TURN_HAND2' | 'DEALER_TURN' | 'SETTLEMENT'
  playerHand: { score: number; cards: any[] }
  playerHand2?: { score: number; cards: any[] }
  dealerHand: { score: number; cards: any[] }
  canDouble: boolean
  canSplit: boolean
  payout: number
  payoutMultiplier: number
}

class BlackjackEngine {
  static createDeck(numDecks?: number) { return [] }
  static shuffleDeck(deck: any[], seeds: number[]) { return deck }
  static deal(deck: any[]) { return {} as BlackjackGameState }
  static hit(state: BlackjackGameState) { return state }
  static stand(state: BlackjackGameState) { return state }
  static double(state: BlackjackGameState) { return state }
  static split(state: BlackjackGameState) { return state }
  static playDealerHand(state: BlackjackGameState) { return state }
  static settleGame(state: BlackjackGameState) { return state }
}

export default function BlackjackPage() {
  // Store selectors
  const isMobile = useCasinoStore(s => s.isMobile)
  const balance = useCasinoStore(s => s.balance)
  const provablyFairSettings = useCasinoStore(s => s.provablyFairSettings)
  const setProvablyFairSettings = useCasinoStore(s => s.setProvablyFairSettings)
  const processGameResult = useCasinoStore(s => s.processGameResult)
  const addToast = useCasinoStore(s => s.addToast)
  const isProcessing = useCasinoStore(s => s.isProcessing)
  const setIsProcessing = useCasinoStore(s => s.setIsProcessing)
  // TODO: Phase 1.5 - Add BLACKJACK to store autoBetSettings and gameStats
  const autoBetSettings = useCasinoStore(s => (s.autoBetSettings as any).blackjack) || { numberOfBets: 100, stopOnProfit: 0, stopOnLoss: 0 }
  // TODO: Phase 1.5 - Store needs to support BLACKJACK in setAutoBetSettings
  const setAutoBetSettings = useCasinoStore(s => s.setAutoBetSettings) as any
  const gameStats = useCasinoStore(s => (s.gameStats as any).BLACKJACK) || { totalBets: 0, totalWins: 0, totalLosses: 0, biggestWin: 0, profit: 0 }

  // Local state
  const [mounted, setMounted] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [baseBetAmount, setBaseBetAmount] = useState(10)
  const [gameState, setGameState] = useState<BlackjackGameState | null>(null)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [autoRunning, setAutoRunning] = useState(false)
  const [currentAutoCount, setCurrentAutoCount] = useState(0)
  const [history, setHistory] = useState<{ win: boolean; payout: number }[]>([])

  // Hydration guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // handleDeal: validate, seed, shuffle, deal
  const handleDeal = useCallback(async () => {
    if (!mounted || isProcessing) return

    // Validate bet amount
    if (betAmount < 0.1 || betAmount > 10000 || betAmount > balance) {
      addToast('Invalid bet amount', 'error')
      return
    }

    setIsProcessing(true)

    try {
      // Sanitize seed
      const sanitizedSeed = provablyFairSettings.clientSeed
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 32)

      // TODO: Phase 1.2 - Add getBlackjackDeal() to ProvablyFairEngine
      // For now, generate random seed indices as placeholder
      const seedIndices = Array.from({ length: 312 }, (_, i) => i)

      // Shuffle deck with provably fair seeds
      const deck = BlackjackEngine.shuffleDeck(
        BlackjackEngine.createDeck(6),
        seedIndices
      )

      // Deal initial hand
      const newState = BlackjackEngine.deal(deck)
      setGameState(newState)

      // Increment nonce by 312 (full deck size)
      setProvablyFairSettings({
        ...provablyFairSettings,
        nonce: provablyFairSettings.nonce + 312,
      })

      soundManager.play('click')
    } catch (error) {
      console.error('Deal error:', error)
      addToast('Deal failed', 'error')
      setGameState(null)
    } finally {
      setIsProcessing(false)
    }
  }, [
    mounted,
    isProcessing,
    betAmount,
    balance,
    provablyFairSettings,
    addToast,
    setIsProcessing,
    setProvablyFairSettings,
  ])

  // handleHit: add card to active hand
  const handleHit = useCallback(() => {
    if (!gameState || gameState.phase !== 'PLAYER_TURN') return

    const next = BlackjackEngine.hit(gameState)
    setGameState(next)
    soundManager.play('click')

    // Check if bust → move to dealer
    if (next.phase === 'DEALER_TURN' || next.phase === 'SETTLEMENT') {
      // Will settle after dealer plays
    }
  }, [gameState])

  // handleStand: dealer plays then settle
  const handleStand = useCallback(() => {
    if (!gameState || gameState.phase !== 'PLAYER_TURN') return

    const afterStand = BlackjackEngine.stand(gameState)
    const withDealer = BlackjackEngine.playDealerHand(afterStand)
    const settled = BlackjackEngine.settleGame(withDealer)
    setGameState(settled)
    soundManager.play('click')

    // Settle after a short delay for animations
    setTimeout(() => handleSettlement(settled), 800)
  }, [gameState])

  // handleDouble: double bet, hit once, stand
  const handleDouble = useCallback(() => {
    if (!gameState || gameState.phase !== 'PLAYER_TURN' || betAmount * 2 > balance) {
      addToast('Cannot double down', 'error')
      return
    }

    setBetAmount(betAmount * 2)

    const doubled = BlackjackEngine.double(gameState)
    const withDealer = BlackjackEngine.playDealerHand(doubled)
    const settled = BlackjackEngine.settleGame(withDealer)
    setGameState(settled)
    soundManager.play('click')

    setTimeout(() => handleSettlement(settled), 800)
  }, [gameState, betAmount, balance, addToast])

  // handleSplit: split pair into two hands
  const handleSplit = useCallback(() => {
    if (!gameState || gameState.phase !== 'PLAYER_TURN') {
      addToast('Cannot split', 'error')
      return
    }

    const split = BlackjackEngine.split(gameState)
    setGameState(split)
    soundManager.play('click')
  }, [gameState, addToast])

  // handleSettlement: atomic processGameResult + fire-and-forget API call
  const handleSettlement = useCallback(
    (settled: BlackjackGameState) => {
      // Atomic settlement via store
      processGameResult({
        game: 'BLACKJACK',
        amount: betAmount,
        multiplier: settled.payoutMultiplier,
        payout: settled.payout,
        win: settled.payout > betAmount,
        resultId: crypto.randomUUID(),
      })

      // Fire-and-forget API call
      fetch('/api/casino/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'BLACKJACK',
          amount: betAmount,
          payout: settled.payout,
          win: settled.payout > betAmount,
          clientSeed: provablyFairSettings.clientSeed,
          currentNonce: provablyFairSettings.nonce - 312,
        }),
      }).catch(console.error)

      // Update history (last 8 rounds)
      setHistory(prev =>
        [
          { win: settled.payout > betAmount, payout: settled.payout },
          ...prev,
        ].slice(0, 8)
      )

      // Reset to IDLE after 2.5s
      setTimeout(() => {
        setGameState(null)
        setBetAmount(baseBetAmount)
        if (autoRunning && isAutoMode) {
          // Auto-bet loop will trigger next round
        }
      }, 2500)
    },
    [
      betAmount,
      baseBetAmount,
      processGameResult,
      provablyFairSettings,
      autoRunning,
      isAutoMode,
    ]
  )

  // Auto-Bet Loop: self-triggering setTimeout
  useEffect(() => {
    if (!autoRunning || isProcessing || gameState?.phase !== 'IDLE') return

    const maxBets = autoBetSettings.numberOfBets || 500
    if (currentAutoCount >= maxBets) {
      setAutoRunning(false)
      return
    }

    if (
      autoBetSettings.stopOnProfit > 0 &&
      gameStats.profit >= autoBetSettings.stopOnProfit
    ) {
      setAutoRunning(false)
      addToast(`Stopped on profit: +$${gameStats.profit.toFixed(2)}`, 'success')
      return
    }

    if (
      autoBetSettings.stopOnLoss > 0 &&
      gameStats.profit < -autoBetSettings.stopOnLoss
    ) {
      setAutoRunning(false)
      addToast(`Stopped on loss: $${gameStats.profit.toFixed(2)}`, 'info')
      return
    }

    const timer = setTimeout(() => {
      handleDeal()
      setCurrentAutoCount(prev => prev + 1)
    }, 1500)

    return () => clearTimeout(timer)
  }, [
    autoRunning,
    isProcessing,
    gameState?.phase,
    currentAutoCount,
    gameStats.profit,
    autoBetSettings,
    addToast,
    handleDeal,
  ])

  // Auto-Play Strategy: stand at >= 16
  useEffect(() => {
    if (!autoRunning || !gameState) return

    if (
      gameState.phase === 'PLAYER_TURN' ||
      gameState.phase === 'PLAYER_TURN_HAND2'
    ) {
      if (gameState.playerHand.score >= 16) {
        handleStand()
      } else {
        handleHit()
      }
    }
  }, [gameState?.phase, gameState?.playerHand?.score, autoRunning, handleStand, handleHit])

  if (!mounted) return null

  return (
    <div className="blackjack-container">
      <div className="blackjack-sidebar">
        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${!isAutoMode ? 'active' : ''}`}
            onClick={() => setIsAutoMode(false)}
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
        <div className="bet-section">
          <label>Bet Amount</label>
          <div className="bet-input-group">
            <input
              type="number"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(0.1, parseFloat(e.target.value) || 0))}
              disabled={gameState?.phase !== 'IDLE' && gameState !== null}
              min="0.1"
              max="10000"
              step="0.1"
            />
            <button onClick={() => setBetAmount(Math.max(0.1, betAmount / 2))}>½</button>
            <button onClick={() => setBetAmount(Math.min(10000, betAmount * 2))}>2×</button>
          </div>
        </div>

        {/* Quick Chips */}
        <div className="quick-chips">
          {[1, 5, 10, 25, 50, 100].map(chip => (
            <button
              key={chip}
              onClick={() => setBetAmount(chip)}
              className="chip-btn"
            >
              ${chip}
            </button>
          ))}
        </div>

        {/* Payout Info */}
        <div className="payout-info">
          <h4>Payouts</h4>
          <div className="payout-row">
            <span>Blackjack</span>
            <span>3:2</span>
          </div>
          <div className="payout-row">
            <span>Win</span>
            <span>1:1</span>
          </div>
          <div className="payout-row">
            <span>Push</span>
            <span>1:1</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat">
            <span>Win Rate</span>
            <span className="stat-value">
              {gameStats.totalBets > 0
                ? ((gameStats.totalWins / gameStats.totalBets) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <div className="stat">
            <span>Biggest Win</span>
            <span className="stat-value">${gameStats.biggestWin.toFixed(2)}</span>
          </div>
          <div className="stat">
            <span>Profit</span>
            <span className={`stat-value ${gameStats.profit >= 0 ? 'win' : 'loss'}`}>
              ${gameStats.profit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Deal Button */}
        <button
          className="deal-btn"
          onClick={handleDeal}
          disabled={
            isProcessing ||
            (gameState?.phase !== 'IDLE' && gameState !== null) ||
            betAmount > balance ||
            betAmount < 0.1
          }
        >
          {gameState?.phase === 'IDLE' || gameState === null ? 'DEAL' : 'PLAYING...'}
        </button>

        {/* Auto-Bet Settings */}
        <AnimatePresence>
          {isAutoMode && (
            <motion.div
              className="auto-settings"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label>
                Rounds
                <input
                  type="number"
                  value={autoBetSettings.numberOfBets}
                  onChange={e =>
                    setAutoBetSettings('blackjack', {
                      ...autoBetSettings,
                      numberOfBets: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  max="500"
                />
              </label>
              <label>
                Stop on Profit ($)
                <input
                  type="number"
                  value={autoBetSettings.stopOnProfit}
                  onChange={e =>
                    setAutoBetSettings('blackjack', {
                      ...autoBetSettings,
                      stopOnProfit: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="10"
                />
              </label>
              <label>
                Stop on Loss ($)
                <input
                  type="number"
                  value={autoBetSettings.stopOnLoss}
                  onChange={e =>
                    setAutoBetSettings('blackjack', {
                      ...autoBetSettings,
                      stopOnLoss: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                  step="10"
                />
              </label>
              <button
                className="start-auto-btn"
                onClick={() => {
                  setAutoRunning(true)
                  setCurrentAutoCount(0)
                }}
                disabled={autoRunning}
              >
                {autoRunning ? `Running... (${currentAutoCount})` : 'Start Auto-Bet'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Game Area */}
      <div className="blackjack-main">
        <div className="game-wrapper">
          {gameState && (
            <div style={{ textAlign: 'center', color: 'hsla(var(--text-color), 0.7)' }}>
              {/* TODO: Phase 2 - Add BlackjackTable component */}
              <p style={{ fontSize: '1.125rem', marginBottom: '20px' }}>Blackjack Table (Phase 2)</p>
              <p style={{ fontSize: '0.875rem' }}>Player Score: {gameState.playerHand.score} | Dealer Score: {gameState.dealerHand.score}</p>
            </div>
          )}

          {gameState && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {/* TODO: Phase 2 - Add BlackjackActions component */}
              <button onClick={handleHit} style={{ padding: '12px 24px', background: 'hsla(var(--primary), 0.3)', border: '1px solid hsla(var(--primary), 0.5)', borderRadius: '8px', color: 'hsl(var(--primary))', cursor: 'pointer', fontWeight: '600' }}>HIT</button>
              <button onClick={handleStand} style={{ padding: '12px 24px', background: 'hsla(var(--secondary), 0.3)', border: '1px solid hsla(var(--secondary), 0.5)', borderRadius: '8px', color: 'hsl(var(--secondary))', cursor: 'pointer', fontWeight: '600' }}>STAND</button>
              <button onClick={handleDouble} disabled={!gameState.canDouble || betAmount * 2 > balance} style={{ padding: '12px 24px', background: gameState.canDouble && betAmount * 2 <= balance ? 'hsla(var(--success), 0.3)' : 'hsla(var(--text-dim), 0.1)', border: '1px solid hsla(var(--success), 0.3)', borderRadius: '8px', color: 'hsl(var(--success))', cursor: 'pointer', fontWeight: '600', opacity: gameState.canDouble && betAmount * 2 <= balance ? 1 : 0.5 }}>DOUBLE</button>
              <button onClick={handleSplit} disabled={!gameState.canSplit} style={{ padding: '12px 24px', background: gameState.canSplit ? 'hsla(var(--accent), 0.3)' : 'hsla(var(--text-dim), 0.1)', border: '1px solid hsla(var(--accent), 0.3)', borderRadius: '8px', color: 'hsl(var(--accent))', cursor: 'pointer', fontWeight: '600', opacity: gameState.canSplit ? 1 : 0.5 }}>SPLIT</button>
            </div>
          )}

          {!gameState && !isProcessing && (
            <div className="empty-state">
              <p>Place your bet and click DEAL to start</p>
            </div>
          )}
        </div>

        {/* History Pills */}
        <div className="history-pills">
          {history.map((result, i) => (
            <motion.div
              key={i}
              className={`pill ${result.win ? 'win' : 'loss'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          ))}
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
        }

        .blackjack-sidebar {
          width: 350px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .blackjack-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .game-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: hsla(var(--surface-color), 0.5);
          border-radius: 16px;
          border: 1px solid hsla(var(--primary), 0.2);
          padding: 40px;
          min-height: 500px;
        }

        .empty-state {
          text-align: center;
          color: hsla(var(--text-color), 0.6);
          font-size: 1.125rem;
        }

        .mode-toggle,
        .bet-section,
        .payout-info,
        .stats-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: hsla(var(--surface-color), 0.6);
          border-radius: 12px;
          border: 1px solid hsla(var(--primary), 0.1);
        }

        .mode-toggle {
          flex-direction: row;
          gap: 8px;
        }

        .mode-btn {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid hsla(var(--primary), 0.3);
          background: transparent;
          border-radius: 8px;
          color: hsla(var(--text-color), 0.7);
          cursor: pointer;
          transition: all 200ms ease;
        }

        .mode-btn.active {
          background: hsla(var(--primary), 0.2);
          color: hsl(var(--primary));
          border-color: hsl(var(--primary));
        }

        .bet-input-group {
          display: flex;
          gap: 8px;
        }

        .bet-input-group input {
          flex: 1;
          padding: 10px 12px;
          background: hsla(var(--surface-color), 0.5);
          border: 1px solid hsla(var(--primary), 0.2);
          border-radius: 8px;
          color: hsl(var(--text-color));
          font-size: 1rem;
        }

        .bet-input-group button {
          padding: 10px 12px;
          background: hsla(var(--primary), 0.2);
          border: 1px solid hsla(var(--primary), 0.3);
          border-radius: 8px;
          color: hsl(var(--primary));
          cursor: pointer;
          font-weight: 600;
          transition: all 200ms ease;
        }

        .bet-input-group button:hover {
          background: hsla(var(--primary), 0.3);
        }

        .quick-chips {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .chip-btn {
          padding: 12px 8px;
          background: hsla(var(--secondary), 0.2);
          border: 1px solid hsla(var(--secondary), 0.3);
          border-radius: 8px;
          color: hsl(var(--secondary));
          cursor: pointer;
          font-weight: 600;
          transition: all 200ms ease;
        }

        .chip-btn:hover {
          background: hsla(var(--secondary), 0.3);
          transform: scale(1.05);
        }

        .payout-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: hsla(var(--text-color), 0.8);
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-value {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: hsl(var(--primary));
        }

        .stat-value.win {
          color: hsl(var(--success));
        }

        .stat-value.loss {
          color: hsl(var(--error));
        }

        .deal-btn {
          width: 100%;
          padding: 16px;
          background: hsla(var(--primary), 0.8);
          border: 1px solid hsla(var(--primary), 0.5);
          border-radius: 12px;
          color: hsl(var(--text-color));
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 200ms ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .deal-btn:hover:not(:disabled) {
          background: hsla(var(--primary), 1);
          transform: scale(1.02);
          box-shadow: 0 0 20px hsla(var(--primary), 0.4);
        }

        .deal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .auto-settings {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: hsla(var(--secondary), 0.1);
          border-radius: 12px;
          border: 1px solid hsla(var(--secondary), 0.2);
        }

        .auto-settings label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.875rem;
          color: hsla(var(--text-color), 0.8);
        }

        .auto-settings input {
          padding: 8px 10px;
          background: hsla(var(--surface-color), 0.5);
          border: 1px solid hsla(var(--secondary), 0.2);
          border-radius: 8px;
          color: hsl(var(--text-color));
          font-size: 0.875rem;
        }

        .start-auto-btn {
          padding: 12px 16px;
          background: hsla(var(--secondary), 0.3);
          border: 1px solid hsla(var(--secondary), 0.4);
          border-radius: 8px;
          color: hsl(var(--secondary));
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
        }

        .start-auto-btn:hover:not(:disabled) {
          background: hsla(var(--secondary), 0.4);
        }

        .start-auto-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .history-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pill {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: hsl(var(--primary));
        }

        .pill.win {
          background: hsl(var(--success));
        }

        .pill.loss {
          background: hsl(var(--error));
        }

        @media (max-width: 1024px) {
          .blackjack-container {
            flex-direction: column;
            gap: 20px;
          }

          .blackjack-sidebar {
            width: 100%;
          }

          .deal-btn {
            padding: 14px;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
