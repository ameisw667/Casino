'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

export default function SlotsPage() {
  const { balance, removeBalance, addBalance, addBet, calculateXp, provablyFairSettings, setProvablyFairSettings, addToast } = useCasinoStore();
  
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<number[][]>(Array(REEL_COUNT).fill(Array(ROW_COUNT).fill(0)));
  const [history, setHistory] = useState<any[]>([]);
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
      const firstSymbolIdx = currentReels[0][line[0]];
      const firstSymbol = SYMBOLS[firstSymbolIdx];
      
      let matchCount = 1;
      for (let i = 1; i < REEL_COUNT; i++) {
        const currentSymbolIdx = currentReels[i][line[i]];
        const currentSymbol = SYMBOLS[currentSymbolIdx];
        
        if (currentSymbol.id === firstSymbol.id || currentSymbol.isWild || firstSymbol.isWild) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const winAmount = betAmount * firstSymbol.multiplier * (matchCount / 3);
        totalWin += winAmount;
        lines.push(lineIndex);
      }
    });

    return { totalWin, lines };
  };

  const handleSpin = async () => {
    if (isSpinning || balance < betAmount) {
      if (balance < betAmount) addToast('Insufficient balance!', 'error');
      return;
    }

    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);
    removeBalance(betAmount);
    playSound('spin');

    // Provably Fair Result
    const { clientSeed, serverSeedHash, nonce } = provablyFairSettings;
    // Note: In a real app, serverSeed would come from the backend. Using a placeholder for now.
    const mockServerSeed = 'mock-server-seed-' + Math.random();
    
    // We need indices for 5 reels, each showing 3 rows.
    // Actually, we can just get 5 indices and they represent the 'stop' position.
    const resultIndices = await ProvablyFairEngine.getSlotsResult(mockServerSeed, clientSeed, nonce, REEL_COUNT, SYMBOL_COUNT);
    
    // Update nonce
    setProvablyFairSettings({ nonce: nonce + REEL_COUNT });

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
        addBalance(totalWin);
        playSound('win');
        
        addBet({
          id: Math.random().toString(36).substr(2, 9),
          time: new Date().toLocaleTimeString(),
          game: 'Slots',
          user: 'You',
          amount: betAmount,
          multiplier: totalWin / betAmount,
          payout: totalWin,
          win: true
        });
      } else {
        playSound('loss');
        addBet({
          id: Math.random().toString(36).substr(2, 9),
          time: new Date().toLocaleTimeString(),
          game: 'Slots',
          user: 'You',
          amount: betAmount,
          multiplier: 0,
          payout: 0,
          win: false
        });
      }

      setHistory(prev => [{
        result: newReels,
        win: totalWin,
        time: new Date().toLocaleTimeString()
      }, ...prev].slice(0, 10));

    }, 2000);
  };

  return (
    <div className="slots-container" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      minHeight: '80vh'
    }}>
      <div className="game-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '10px' }}>NEON SLOTS</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Spin to win big in the neon city 🌃</p>
      </div>

      <div className="slots-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: '300px 1fr', 
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Controls Sidebar */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
              Bet Amount
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                className="input"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                style={{ paddingLeft: '40px' }}
              />
              <Coins size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary))' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <button onClick={() => setBetAmount(Math.max(1, betAmount / 2))} className="btn btn-secondary" style={{ padding: '8px' }}>1/2</button>
              <button onClick={() => setBetAmount(betAmount * 2)} className="btn btn-secondary" style={{ padding: '8px' }}>2x</button>
            </div>
          </div>

          <button 
            onClick={handleSpin} 
            disabled={isSpinning}
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: '60px', 
              fontSize: '1.2rem',
              background: isSpinning ? 'hsl(var(--surface-raised))' : 'hsl(var(--primary))'
            }}
          >
            {isSpinning ? <RotateCcw className="animate-spin" /> : <Play fill="currentColor" />}
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>

          <div className="stats-box" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Last Win</span>
              <span style={{ fontWeight: 700, color: lastWin > 0 ? 'hsl(var(--success))' : '#fff' }}>
                ${lastWin.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Balance</span>
              <span style={{ fontWeight: 700 }}>${balance.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }}><Settings size={18} /></button>
            <button className="btn btn-secondary" style={{ flex: 1 }}><HistoryIcon size={18} /></button>
          </div>
        </div>

        {/* Reels Display */}
        <div className="reels-container" style={{ 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '20px', 
          padding: '20px',
          border: '4px solid #1a2c38',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Reel Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${REEL_COUNT}, 1fr)`, 
            gap: '10px',
            background: '#0f212e',
            borderRadius: '12px',
            padding: '10px',
            minHeight: '400px'
          }}>
            {reels.map((reel, rIdx) => (
              <div key={rIdx} className={`reel ${isSpinning ? 'spinning' : ''}`} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                padding: '10px',
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
                      fontSize: '3rem',
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
  );
}
