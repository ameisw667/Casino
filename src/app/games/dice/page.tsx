'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, ShieldCheck, TrendingUp, AlertCircle, Info, Zap, ChevronRight } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';

export default function DicePage() {
  const { isMobile, balance, removeBalance, addBalance, addBet, calculateXp, provablyFairSettings, setProvablyFairSettings, addToast } = useCasinoStore();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(2.00);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ roll: number; win: boolean } | null>(null);
  const [history, setHistory] = useState<{ roll: number, win: boolean }[]>([]);
  const [showFairness, setShowFairness] = useState(false);
  const [isRollOver, setIsRollOver] = useState(true);
  const [winChance, setWinChance] = useState(49.5);
  const [targetPoint, setTargetPoint] = useState(50.50);
  const [winning, setWinning] = useState<boolean | null>(null);
  
  // Simulated Live Bets
  const [liveBets, setLiveBets] = useState<any[]>([]);

  useEffect(() => {
    const users = ['LuckyWhale', 'DiceKing', 'CryptoVibe', 'HighRoller', 'MoonShot'];
    const interval = setInterval(() => {
      const amount = Math.floor(Math.random() * 500) + 10;
      const mult = (Math.random() * 5 + 1).toFixed(2);
      const isWin = Math.random() > 0.5;
      const newBet = {
        user: users[Math.floor(Math.random() * users.length)],
        amount,
        multiplier: mult,
        payout: isWin ? amount * parseFloat(mult) : 0,
        win: isWin,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setLiveBets(prev => [newBet, ...prev].slice(0, 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // New: Auto-betting & Stats
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoSettings, setAutoSettings] = useState({
    onWin: 0,
    onLoss: 0,
    stopOnProfit: 0,
    stopOnLoss: 0,
    numberOfBets: 0
  });
  const [currentAutoCount, setCurrentAutoCount] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [visualResult, setVisualResult] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    profit: 0,
    maxStreak: 0,
    currentStreak: 0
  });

  const profitOnWin = betAmount * (multiplier - 1);

  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    const sounds = {
      roll: '/sounds/dice-roll.mp3', // Dice roll
      win: '/sounds/win.mp3',  // Success
      loss: '/sounds/loss.mp3'  // Thud
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

  const playSound = (name: 'roll' | 'win' | 'loss') => {
    const audio = audioRefs.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  const spawnConfetti = () => {
    const main = document.querySelector('.dice-main');
    if (!main) return;
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.position = 'absolute';
      c.style.left = Math.random() * 100 + '%';
      c.style.top = '20%';
      c.style.backgroundColor = ['#00e701', '#ffd700', '#fff'][Math.floor(Math.random() * 3)];
      c.style.width = Math.random() * 10 + 5 + 'px';
      c.style.height = c.style.width;
      main.appendChild(c);
      setTimeout(() => c.remove(), 2000);
    }
  };

  const updateFromWinChance = (chance: number) => {
    const val = Math.max(0.01, Math.min(98, chance));
    setWinChance(val);
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
    const val = Math.max(2, Math.min(98, target));
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
    const x = 'touches' in e ? (e as any).touches[0].clientX : (e as MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
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

  const handleRoll = async () => {
    if (betAmount > balance) {
      setAutoRunning(false);
      addToast('Insufficient balance!', 'error');
      return;
    }
    
    setLoading(true);
    playSound('roll');
    
    // Simulate slight delay for "vibe"
    await new Promise(r => setTimeout(r, 400));

    const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
    const nonce = provablyFairSettings.nonce + 1;
    
    const roll = await ProvablyFairEngine.getDiceRoll(seed, provablyFairSettings.clientSeed, nonce);
    setProvablyFairSettings({ serverSeedHash: hash, nonce });

    const isWin = isRollOver ? roll > targetPoint : roll < targetPoint;
    
    setVisualResult(roll);
    setWinning(isWin);

    if (removeBalance(betAmount)) {
      if (isWin) {
        playSound('win');
        const winAmount = betAmount * multiplier;
        addBalance(winAmount);
        if (multiplier >= 10) spawnConfetti();
        addBet({
          id: Math.random().toString(36),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          game: 'DICE',
          user: 'You',
          amount: betAmount,
          multiplier: multiplier,
          payout: winAmount,
          win: true
        });
        if (isAutoMode && autoSettings.onWin > 0) {
          setBetAmount(prev => prev + (prev * (autoSettings.onWin / 100)));
        }
      } else {
        playSound('loss');
        addBet({
          id: Math.random().toString(36),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          game: 'DICE',
          user: 'You',
          amount: betAmount,
          multiplier: multiplier,
          payout: 0,
          win: false
        });
        if (isAutoMode && autoSettings.onLoss > 0) {
          setBetAmount(prev => prev + (prev * (autoSettings.onLoss / 100)));
        }
      }
      calculateXp(betAmount);
    }
    const outcomeResult = { roll, win: isWin };
    setLastResult(outcomeResult);
    setHistory(prev => [outcomeResult, ...prev].slice(0, 10));
    
    setSessionStats(prev => {
      const isWinResult = isWin;
      const profitChange = isWinResult ? (betAmount * (multiplier - 1)) : -betAmount;
      const newProfit = prev.profit + profitChange;
      const newStreak = isWinResult ? (prev.currentStreak > 0 ? prev.currentStreak + 1 : 1) : (prev.currentStreak < 0 ? prev.currentStreak - 1 : -1);
      
      return {
        totalBets: prev.totalBets + 1,
        wins: isWinResult ? prev.wins + 1 : prev.wins,
        losses: isWinResult ? prev.losses : prev.losses + 1,
        profit: newProfit,
        currentStreak: newStreak,
        maxStreak: Math.max(prev.maxStreak, Math.abs(newStreak))
      };
    });

    setLoading(false);
  };

  // Auto-Bet Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoRunning && !loading) {
      if (autoSettings.stopOnProfit > 0 && sessionStats.profit >= autoSettings.stopOnProfit) {
        setAutoRunning(false);
        return;
      }
      if (autoSettings.stopOnLoss > 0 && Math.abs(sessionStats.profit) >= autoSettings.stopOnLoss && sessionStats.profit < 0) {
        setAutoRunning(false);
        return;
      }
      if (autoSettings.numberOfBets > 0 && currentAutoCount >= autoSettings.numberOfBets) {
        setAutoRunning(false);
        return;
      }

      timer = setTimeout(() => {
        handleRoll();
        setCurrentAutoCount(prev => prev + 1);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [autoRunning, loading, sessionStats.profit, currentAutoCount]);

  // Persistence & Reset Logic
  useEffect(() => {
    if (!autoRunning) {
      setCurrentAutoCount(0);
      setInitialBalance(balance);
    }
  }, [autoRunning]);

  useEffect(() => {
    const saved = localStorage.getItem('dice_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBetAmount(parsed.betAmount || 1);
      setIsRollOver(parsed.isRollOver ?? true);
      setTargetPoint(parsed.targetPoint || 50.5);
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
        handleRoll();
      }
      
      if (e.key === 'a') setBetAmount(prev => prev / 2);
      if (e.key === 's') setBetAmount(prev => prev * 2);
      if (e.key === 'd') setBetAmount(1);
      if (e.key === 'f') setBetAmount(balance);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [betAmount, multiplier, targetPoint, loading, balance]);

  return (
    <div className="dice-container" style={{ 
      maxWidth: '1600px', 
      margin: '0 auto', 
      display: 'grid', 
      gap: '2px', 
      background: '#0f212e', 
      minHeight: isMobile ? 'auto' : 'min(800px, 85vh)', 
      borderRadius: '16px', 
      overflow: 'hidden' 
    }}>
      
      <div className="dice-sidebar" style={{ 
        background: '#1a2c38', 
        padding: isMobile ? '16px' : '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '16px' : '24px',
        order: isMobile ? 2 : 1
      }}>
        <div style={{ display: 'flex', background: '#0f212e', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setIsAutoMode(false)}
            style={{ 
              flex: 1, 
              padding: isMobile ? '12px' : '10px', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              background: !isAutoMode ? '#2f4553' : 'transparent',
              color: !isAutoMode ? '#fff' : '#b1bad3',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Manual
          </button>
          <button 
            onClick={() => setIsAutoMode(true)}
            style={{ 
              flex: 1, 
              padding: isMobile ? '12px' : '10px', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              background: isAutoMode ? '#2f4553' : 'transparent',
              color: isAutoMode ? '#fff' : '#b1bad3',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Auto
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b1bad3' }}>Bet Amount</label>
            <span style={{ fontSize: '0.7rem', color: '#b1bad3' }}>${balance.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '2px', background: '#2f4553', borderRadius: '8px', overflow: 'hidden', border: '2px solid #2f4553' }}>
            <input 
              type="number" 
              className="mono" 
              value={betAmount} 
              style={{ flex: 1, background: '#0f212e', border: 'none', color: '#fff', padding: '12px', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
              onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))} 
            />
            <button style={{ background: '#2f4553', color: '#fff', border: 'none', padding: '0 16px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => setBetAmount(betAmount / 2)}>1/2</button>
            <button style={{ background: '#2f4553', color: '#fff', border: 'none', padding: '0 16px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => setBetAmount(betAmount * 2)}>2x</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b1bad3' }}>Profit on Win</label>
          <div style={{ background: '#0f212e', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', border: '2px solid #2f4553' }}>
            <span className="mono" style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>${profitOnWin.toFixed(2)}</span>
            <Zap size={16} style={{ marginLeft: 'auto', color: '#b1bad3' }} />
          </div>
        </div>

        {isAutoMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b1bad3', display: 'block', marginBottom: '8px' }}>Number of Bets</label>
              <input 
                type="number" 
                value={autoSettings.numberOfBets}
                onChange={(e) => setAutoSettings(prev => ({ ...prev, numberOfBets: Number(e.target.value) }))}
                style={{ width: '100%', background: '#0f212e', border: '2px solid #2f4553', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '1rem' }} 
                placeholder="∞" 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#b1bad3', display: 'block', marginBottom: '4px' }}>On Profit</label>
                <input 
                  type="number" 
                  value={autoSettings.stopOnProfit}
                  onChange={(e) => setAutoSettings(prev => ({ ...prev, stopOnProfit: Number(e.target.value) }))}
                  style={{ width: '100%', background: '#0f212e', border: '2px solid #2f4553', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#b1bad3', display: 'block', marginBottom: '4px' }}>On Loss</label>
                <input 
                  type="number" 
                  value={autoSettings.stopOnLoss}
                  onChange={(e) => setAutoSettings(prev => ({ ...prev, stopOnLoss: Number(e.target.value) }))}
                  style={{ width: '100%', background: '#0f212e', border: '2px solid #2f4553', color: '#fff', padding: '10px', borderRadius: '6px', fontSize: '0.9rem' }} 
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: isMobile ? '8px' : 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#b1bad3' }}>
              <Zap size={14} color="#00e701" /> Instant Settlement
            </div>
            <button 
              onClick={() => setSessionStats({ totalBets: 0, wins: 0, losses: 0, profit: 0, maxStreak: 0, currentStreak: 0 })}
              style={{ background: 'transparent', border: 'none', color: '#b1bad3', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Reset Stats
            </button>
          </div>
        </div>

        <button 
          onClick={() => isAutoMode ? setAutoRunning(!autoRunning) : handleRoll()}
          disabled={loading}
          style={{ 
            background: isAutoMode && autoRunning ? '#2f4553' : '#00e701', 
            color: isAutoMode && autoRunning ? '#fff' : '#000', 
            border: 'none', 
            padding: isMobile ? '16px' : 'clamp(12px, 3vw, 16px)', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: 800, 
            cursor: 'pointer',
            marginTop: isMobile ? '8px' : '0'
          }}
        >
          {loading ? 'Rolling...' : isAutoMode ? (autoRunning ? 'Stop Autobet' : 'Start Autobet') : 'Bet'}
        </button>
      </div>

      <div className="dice-main" style={{ 
        background: '#0f212e', 
        padding: isMobile ? '24px 16px' : 'clamp(20px, 5vw, 40px)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '24px' : 'clamp(20px, 5vw, 40px)', 
        position: 'relative',
        order: isMobile ? 1 : 2
      }}>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          {history.map((h, i) => (
            <div key={i} style={{ 
              width: '40px', 
              height: '6px', 
              borderRadius: '3px', 
              background: h.win ? '#00e701' : '#ff4444',
              opacity: 1 - (i * 0.08)
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: isMobile ? '150px' : 'clamp(150px, 30vh, 300px)', position: 'relative' }}>
           {lastResult && (
            <div className={`animate-slide-up`} style={{ 
              fontSize: isMobile ? '5rem' : 'clamp(4rem, 20vw, 10rem)', 
              fontWeight: 900, 
              color: lastResult.win ? '#00e701' : '#ff4444',
              filter: `drop-shadow(0 0 40px ${lastResult.win ? 'rgba(0,231,1,0.2)' : 'rgba(255,68,68,0.2)'})`
            }}>
              {lastResult.roll.toFixed(2)}
            </div>
          )}
        </div>

        {/* Dice Slider */}
        <div 
          ref={sliderRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{ position: 'relative', padding: isMobile ? '40px 0' : '30px 0', cursor: 'pointer', touchAction: 'none' }}
        >
          <div style={{ 
            height: isMobile ? '16px' : '12px', 
            width: '100%', 
            background: '#2f4553', 
            borderRadius: '8px', 
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Visual Result Marker */}
            {(visualResult !== null || loading) && (
              <div style={{ 
                position: 'absolute', 
                left: `${visualResult !== null ? visualResult : 50}%`, 
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '52px' : '60px',
                height: isMobile ? '52px' : '60px',
                background: visualResult !== null ? (winning ? '#00e701' : '#ff4444') : '#fff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                color: '#000',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                zIndex: 10,
                transition: loading ? 'none' : 'left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.2s',
                opacity: loading ? 0.3 : 1
              }}>
                {visualResult !== null ? visualResult.toFixed(1) : ''}
              </div>
            )}
            {/* Win Zone */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: isRollOver ? `${targetPoint}%` : 0, 
              right: isRollOver ? 0 : `${100 - targetPoint}%`,
              background: '#00e701',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
            
            {/* Loss Zone */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: isRollOver ? 0 : `${targetPoint}%`, 
              right: isRollOver ? `${100 - targetPoint}%` : 0,
              background: '#ff4444',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          {/* Slider Thumb / Marker */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: `${targetPoint}%`, 
              transform: 'translate(-50%, -50%)',
              width: isMobile ? '48px' : '40px',
              height: isMobile ? '48px' : '40px',
              background: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              transition: 'none'
            }}
          >
            <div style={{ width: '3px', height: '20px', background: '#2f4553', margin: '0 2px', borderRadius: '2px' }} />
            <div style={{ width: '3px', height: '20px', background: '#2f4553', margin: '0 2px', borderRadius: '2px' }} />
          </div>

          {/* Scale */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', color: '#b1bad3', fontSize: '0.75rem', fontWeight: 700 }}>
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Target Inputs (Bottom Row) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '12px', background: '#1a2c38', padding: '12px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b1bad3' }}>Multiplier</label>
            <input 
              type="number" 
              className="mono" 
              value={multiplier} 
              style={{ background: '#0f212e', border: '2px solid #2f4553', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', fontSize: '0.9rem' }}
              onChange={(e) => updateFromMultiplier(parseFloat(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b1bad3' }}>{isRollOver ? 'Roll Over' : 'Roll Under'}</label>
            <div style={{ display: 'flex', gap: '4px', background: '#0f212e', border: '2px solid #2f4553', borderRadius: '6px', padding: '4px' }}>
              <input 
                type="number" 
                className="mono" 
                value={targetPoint} 
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '0.9rem', width: '40px', paddingLeft: '8px' }}
                onChange={(e) => updateFromTarget(parseFloat(e.target.value))}
              />
              <button onClick={toggleRollMode} style={{ background: '#2f4553', border: 'none', color: '#fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: isMobile ? 'span 2' : 'auto' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 800, color: '#b1bad3' }}>Win Chance</label>
            <input 
              type="number" 
              className="mono" 
              value={winChance} 
              style={{ background: '#0f212e', border: '2px solid #2f4553', color: '#fff', padding: '10px', borderRadius: '6px', outline: 'none', fontSize: '0.9rem' }}
              onChange={(e) => updateFromWinChance(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Live Bets Sidebar (Right) */}
      <div className="live-bets-sidebar" style={{ background: '#1a2c38', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#b1bad3' }}>Live Bets</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {liveBets.map((bet, i) => (
            <div key={i} style={{ background: '#0f212e', padding: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>{bet.user}</span>
                <span style={{ color: '#b1bad3' }}>${bet.amount.toFixed(2)}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: bet.win ? '#00e701' : '#ff4444', fontWeight: 800 }}>{bet.multiplier}x</span>
                <div style={{ color: '#b1bad3' }}>{bet.win ? `+$${(bet.payout - bet.amount).toFixed(2)}` : '-$0.00'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
