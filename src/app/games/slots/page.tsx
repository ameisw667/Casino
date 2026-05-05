'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Dices, 
  ShieldCheck, 
  TrendingUp, 
  Info, 
  RotateCcw, 
  Zap, 
  ChevronRight, 
  Coins, 
  History as HistoryIcon,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
// --- Constants ---
const SYMBOLS = [
  { id: 'cherry', label: '🍒', multiplier: 2, color: '#ff4d4d' },
  { id: 'lemon', label: '🍋', multiplier: 3, color: '#fffb00' },
  { id: 'orange', label: '🍊', multiplier: 4, color: '#ffae00' },
  { id: 'grapes', label: '🍇', multiplier: 5, color: '#a200ff' },
  { id: 'bell', label: '🔔', multiplier: 10, color: '#ffd700' },
  { id: 'diamond', label: '💎', multiplier: 25, color: '#00f2ff' },
  { id: 'seven', label: '7️⃣', multiplier: 50, color: '#ff0055' },
  { id: 'wild', label: '⭐', multiplier: 1, isWild: true, color: '#ffffff' },
];
const REEL_COUNT = 5;
const ROW_COUNT = 3;
const SYMBOL_COUNT = SYMBOLS.length;
// Paylines (simplistic approach: 20 fixed lines)
const PAYLINES = [
  [1, 1, 1, 1, 1], // Middle row
  [0, 0, 0, 0, 0], // Top row
  [2, 2, 2, 2, 2], // Bottom row
  [0, 1, 2, 1, 0], // V-shape
  [2, 1, 0, 1, 2], // Inverted V
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
];
// Metadata moved to layout or server component
export default function SlotsPage() {
  const balance = useCasinoStore(state => state.balance);
  const provablyFairSettings = useCasinoStore(state => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore(state => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore(state => state.processGameResult);
  const addToast = useCasinoStore(state => state.addToast);
  const isProcessing = useCasinoStore(state => state.isProcessing);
  const setIsProcessing = useCasinoStore(state => state.setIsProcessing);
  const isMobile = useCasinoStore(state => state.isMobile);

  
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<number[][]>(Array(REEL_COUNT).fill(Array(ROW_COUNT).fill(0)));
  const [history, setHistory] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  useEffect(() => {
    const sounds = {
      spin: '/sounds/dice-roll.mp3', // Reusing for now
      stop: '/sounds/dice-roll.mp3',
      win: '/sounds/win.mp3',
      loss: '/sounds/loss.mp3'
    };
    Object.entries(sounds).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.3;
      audioRefs.current[name] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach(a => {
        a.pause();
        a.src = '';
      });
    };
  }, []);
  const playSound = (name: string) => {
    const audio = audioRefs.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };
  const calculateWins = (currentReels: number[][]) => {
    let totalWin = 0;
    const lines: number[] = [];
    PAYLINES.forEach((line, lineIndex) => {
      // Find the first non-wild symbol to determine the line type
      let firstNonWildIdx = -1;
      for (let i = 0; i < REEL_COUNT; i++) {
        const symbolIdx = currentReels[i][line[i]];
        if (!SYMBOLS[symbolIdx].isWild) {
          firstNonWildIdx = i;
          break;
        }
      }
      // If all symbols are wild or we found a non-wild
      const targetSymbolIdx = firstNonWildIdx === -1 ? currentReels[0][line[0]] : currentReels[firstNonWildIdx][line[firstNonWildIdx]];
      const targetSymbol = SYMBOLS[targetSymbolIdx];
      
      let matchCount = 0;
      for (let i = 0; i < REEL_COUNT; i++) {
        const currentSymbolIdx = currentReels[i][line[i]];
        const currentSymbol = SYMBOLS[currentSymbolIdx];
        
        if (currentSymbol.id === targetSymbol.id || currentSymbol.isWild) {
          matchCount++;
        } else {
          break; // Must be consecutive from left
        }
      }
      if (matchCount >= 3) {
        // Multiplier based on match count: 3x -> 1x, 4x -> 2x, 5x -> 5x of the symbol multiplier
        const countMult = matchCount === 5 ? 5 : matchCount === 4 ? 2 : 1;
        const winAmount = (betAmount / PAYLINES.length) * targetSymbol.multiplier * countMult;
        totalWin += winAmount;
        lines.push(lineIndex);
      }
    });
    return { totalWin, lines };
  };
  const handleSpin = async () => {
    if (isSpinning) return;
    
    if (betAmount < 0.1 || betAmount > 10000) {
      addToast('Bet amount must be between $0.10 and $10,000!', 'error');
      return;
    }
    
    if (balance < betAmount) {
      addToast('Insufficient balance!', 'error');
      return;
    }
    setIsProcessing(true);
    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);
    
    playSound('spin');
    try {
      // Provably Fair Result
      const { clientSeed, nonce } = provablyFairSettings;
      const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
      
      const resultIndices = await ProvablyFairEngine.getSlotsResult(seed, clientSeed, nonce, REEL_COUNT, SYMBOL_COUNT);
      
      // Update nonce and hash for history
      setProvablyFairSettings({ serverSeedHash: hash, nonce: nonce + REEL_COUNT });
    // Simulate reel animation
    const newReels = resultIndices.map(idx => {
      // For each reel, we'll have a window of 3 symbols
      return [
        idx,
        (idx + 1) % SYMBOL_COUNT,
        (idx + 2) % SYMBOL_COUNT
      ];
    });
    // Spinning duration
    setTimeout(() => {
      setReels(newReels);
      setIsSpinning(false);
      
      const { totalWin, lines } = calculateWins(newReels);
      
      if (totalWin > 0) {
        setLastWin(totalWin);
        setWinningLines(lines);
        playSound('win');
      } else {
        playSound('loss');
      }
      processGameResult({
        game: 'SLOTS',
        amount: betAmount,
        multiplier: totalWin / betAmount,
        payout: totalWin,
        win: totalWin > 0,
        resultId: Math.random().toString(36).substring(2, 11)
      });
      setHistory(prev => [{
        result: newReels,
        win: totalWin,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));
      setIsProcessing(false);
    }, 1000);
    } catch (error) {
      console.error("Slots spin error:", error);
      setIsSpinning(false);
      setIsProcessing(false);
      addToast('Failed to spin', 'error');
    }
  };
  return (
    <GameErrorBoundary gameName="Slots">
      <div className="slots-container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px',
        minHeight: '80vh'
      }}>
      <div className="game-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontWeight: 900, letterSpacing: '-0.05em' }}>NEON SLOTS</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)' }}>Spin to win big in the neon city 🌃</p>
      </div>

      <div className="slots-layout" style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Controls Sidebar */}
        <div className="glass-card" style={{ 
          width: isMobile ? '100%' : '300px',
          padding: 'clamp(16px, 4vw, 24px)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          backdropFilter: 'blur(20px)',
          background: 'hsla(var(--bg-card), 0.7)',
          border: '1px solid hsla(var(--primary), 0.1)',
          order: isMobile ? 2 : 1
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '8px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bet Amount
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                className="input"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                style={{ paddingLeft: '40px', fontWeight: 700 }}
              />
              <Coins size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setBetAmount(Math.max(0.1, betAmount / 2))} className="btn btn-secondary" style={{ padding: '8px', fontSize: '0.8rem' }}>1/2</button>
              <button onClick={() => setBetAmount(Math.min(10000, betAmount * 2))} className="btn btn-secondary" style={{ padding: '8px', fontSize: '0.8rem' }}>2x</button>
            </div>
          </div>
          <button 
            onClick={handleSpin} 
            disabled={isSpinning || isProcessing}
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: '64px', 
              fontSize: '1.25rem',
              fontWeight: 900,
              boxShadow: '0 8px 32px hsla(var(--primary), 0.3)',
              background: (isSpinning || isProcessing) ? 'hsl(var(--surface-raised))' : 'hsl(var(--primary))'
            }}
          >
            {isSpinning || isProcessing ? <RotateCcw className="animate-spin" size={24} /> : <Play fill="currentColor" size={24} />}
            <span style={{ marginLeft: '8px' }}>{isSpinning || isProcessing ? 'SPINNING...' : 'SPIN'}</span>
          </button>
          <div className="stats-box" style={{ background: 'hsla(0,0%,0%,0.3)', padding: '20px', borderRadius: '16px', border: '1px solid hsla(var(--primary), 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Last Win</span>
              <span style={{ fontWeight: 800, color: lastWin > 0 ? 'hsl(var(--success))' : '#fff', fontSize: '1rem' }}>
                ${lastWin.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Balance</span>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>${balance.toFixed(2)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} aria-label="Settings"><Settings size={18} /></button>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} aria-label="History"><HistoryIcon size={18} /></button>
          </div>
        </div>

        {/* Reels Display */}
        <div className="reels-container" style={{ 
          background: 'hsla(var(--bg-color), 0.5)', 
          borderRadius: '32px', 
          padding: '24px',
          border: '1px solid hsla(var(--primary), 0.1)',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Neon Glow Accents */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'hsla(var(--primary), 0.1)', filter: 'blur(80px)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'hsla(var(--primary), 0.05)', filter: 'blur(80px)', borderRadius: '50%' }} />

          {/* Reel Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${REEL_COUNT}, 1fr)`, 
            gap: '10px',
            background: '#0f212e',
            borderRadius: '12px',
            padding: isMobile ? '4px' : '10px',
            minHeight: isMobile ? '280px' : '400px'
          }}>
            {reels.map((reel, rIdx) => (
              <div key={rIdx} className={`reel ${isSpinning ? 'spinning' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                padding: isMobile ? '4px' : '10px',
                transition: 'transform 0.1s ease-out',
                position: 'relative'
              }}>
                {reel.map((symbolIdx, sIdx) => {
                  const symbol = SYMBOLS[symbolIdx];
                  return (
                    <div key={sIdx} className="symbol" style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '1.75rem' : '3rem',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      boxShadow: lastWin > 0 ? `0 0 20px ${symbol.color}22` : 'none',
                      filter: isSpinning ? 'blur(4px)' : 'none'
                    }}>
                      {symbol.label}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Winning Line Overlays (Mental Map) */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Payline visualization could go here */}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes reel-spin {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
        .spinning {
          animation: reel-spin 0.1s infinite linear;
        }
      `}</style>
    </div>
    </GameErrorBoundary>
  );
}