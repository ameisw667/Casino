'use client';
import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { GameErrorBoundary } from '@/components/casino/GameErrorBoundary';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Metadata moved to layout or server component
export default function DicePage() {
  const isMobile = useCasinoStore(state => state.isMobile);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);


  const balance = useCasinoStore(state => state.balance);
  const xp = useCasinoStore(state => state.xp);
  const provablyFairSettings = useCasinoStore(state => state.provablyFairSettings);
  const setProvablyFairSettings = useCasinoStore(state => state.setProvablyFairSettings);
  const processGameResult = useCasinoStore(state => state.processGameResult);
  const allBets = useCasinoStore(state => state.allBets);
  const addToast = useCasinoStore(state => state.addToast);
  const isProcessing = useCasinoStore(state => state.isProcessing);
  const setIsProcessing = useCasinoStore(state => state.setIsProcessing);
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
  
  useEffect(() => {
    const users = ['LuckyWhale', 'DiceKing', 'CryptoVibe', 'HighRoller', 'MoonShot'];
    const interval = setInterval(() => {
      const amount = Math.floor(Math.random() * 500) + 10;
      const mult = (Math.random() * 5 + 1).toFixed(2);
      const isWin = Math.random() > 0.5;
      const newBet = {
        user: users[Math.floor(Math.random() * users.length)],
        resultId: Math.random().toString(36).slice(2, 11),
        win: isWin,
      };
      
      // Show result
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  // New: Auto-betting & Stats
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoBetSettings = useCasinoStore(state => state.autoBetSettings.dice);
  const setAutoBetSettings = useCasinoStore(state => state.setAutoBetSettings);
  const updateAutoSettings = (updater: ((prev: typeof autoBetSettings) => typeof autoBetSettings) | Partial<typeof autoBetSettings>) => {
    const newSettings = typeof updater === 'function' ? updater(autoBetSettings) : { ...autoBetSettings, ...updater };
    setAutoBetSettings('dice', newSettings);
  };

  
  const [currentAutoCount, setCurrentAutoCount] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [visualResult, setVisualResult] = useState<number | null>(null);
  const [baseBetAmount, setBaseBetAmount] = useState(10);

  const gameStats = useCasinoStore(state => state.gameStats.DICE);
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
  const handleRoll = async () => {
    if (betAmount < 0.1 || betAmount > 10000) {
      addToast('Bet amount must be between $0.10 and $10,000!', 'error');
      return;
    }
    if (betAmount > balance) {
      setAutoRunning(false);
      addToast('Insufficient balance!', 'error');
      return;
    }
    
    setIsProcessing(true);
    setLoading(true);
    // Input Sanitization (XSS & Logical)
    const sanitizedClientSeed = provablyFairSettings.clientSeed.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
    try {
      const response = await fetch('/api/casino/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'DICE',
          amount: betAmount,
          multiplier,
          target: targetPoint,
          condition: isRollOver ? 'OVER' : 'UNDER',
          clientSeed: sanitizedClientSeed,
          currentNonce: provablyFairSettings.nonce
        })
      });
      if (!response.ok) throw new Error('API failed');
      const result = await response.json();
      setProvablyFairSettings({ 
        serverSeedHash: result.serverSeedHash,
        nonce: result.nonce 
      });
      processGameResult({
        game: 'DICE',
        amount: betAmount,
        multiplier: multiplier,
        payout: result.payout,
        win: result.win,
        resultId: result.id
      });
      if (result.win) {
        playSound('win');
        if (multiplier >= 10) spawnConfetti();
        if (isAutoMode) {
          if (autoBetSettings.onWin > 0) {
            setBetAmount(prev => prev + (prev * (autoBetSettings.onWin / 100)));
          } else {
            setBetAmount(baseBetAmount);
          }
        }
      } else {
        playSound('loss');
        if (isAutoMode) {
          if (autoBetSettings.onLoss > 0) {
            setBetAmount(prev => prev + (prev * (autoBetSettings.onLoss / 100)));
          } else {
            setBetAmount(baseBetAmount);
          }
        }
      }
      const outcomeResult = { roll: result.roll, win: result.win };

      setLastResult(outcomeResult);
      setHistory(prev => [outcomeResult, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Dice bet error:", error);
      addToast('Bet failed. Please try again.', 'error');
    } finally {
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
      // Safety Cap: Bet amount cannot exceed $10,000 in auto-mode
      if (betAmount > 10000) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast('Auto-bet stopped: Bet amount exceeded $10,000 limit', 'error');
        return;
      }
      if (autoBetSettings.stopOnProfit > 0 && gameStats.profit >= autoBetSettings.stopOnProfit) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast('Auto-bet stopped: Profit goal reached!', 'success');
        return;
      }
      if (autoBetSettings.stopOnLoss > 0 && Math.abs(gameStats.profit) >= autoBetSettings.stopOnLoss && gameStats.profit < 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAutoRunning(false);
        addToast('Auto-bet stopped: Loss limit reached', 'info');
        return;
      }
      timer = setTimeout(() => {
        handleRoll();
        setCurrentAutoCount(prev => prev + 1);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [autoRunning, loading, gameStats.profit, currentAutoCount, betAmount, autoBetSettings]);
  // Persistence & Reset Logic
  useEffect(() => {
    if (!autoRunning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentAutoCount(0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialBalance(balance);
    }
  }, [autoRunning]);
  useEffect(() => {
    const saved = localStorage.getItem('dice_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBetAmount(parsed.betAmount || 1);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRollOver(parsed.isRollOver ?? true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        if (!loading) handleRoll();
      }
      
      if (e.key === 'a') setBetAmount(prev => prev / 2);
      if (e.key === 's') setBetAmount(prev => prev * 2);
      if (e.key === 'd') setBetAmount(1);
      if (e.key === 'f') setBetAmount(balance);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [betAmount, multiplier, targetPoint, loading, balance]);

  if (!mounted) return null;

  return (

    <GameErrorBoundary gameName="Dice">
      <div className="dice-container" style={{ 
        maxWidth: '1600px', 
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
        boxShadow: 'var(--shadow-lg)'
      }}>
        <style jsx>{`
          @media (max-width: 1024px) {
            .dice-container { flex-direction: column !important; min-height: auto !important; }
            .dice-sidebar { width: 100% !important; order: 2 !important; border-right: none !important; border-top: 1px solid var(--glass-border) !important; }
            .dice-main { order: 1 !important; padding: var(--space-md) !important; }
          }
        `}</style>

      
      <div className="dice-sidebar" style={{ 
        background: 'hsla(var(--surface-color), 0.8)', 
        padding: 'var(--space-md)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-md)',
        width: '350px',
        flexShrink: 0,
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--glass-border)'
      }}>

        <div style={{ display: 'flex', background: 'hsla(var(--bg-color), 0.5)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
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
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Auto
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>Bet Amount</label>
            <span style={{ fontSize: 'var(--font-xs)', color: 'hsl(var(--primary))', fontWeight: 600 }}>${balance.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', gap: '1px', background: 'var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--glass-border)', padding: '1px' }}>
            <input 
              type="number" 
              className="mono" 
              value={betAmount} 
              style={{ flex: 1, background: 'hsl(var(--bg-color))', border: 'none', color: '#fff', padding: '14px', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
              onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))} 
            />
            <button style={{ background: 'hsla(var(--surface-raised), 0.5)', color: '#fff', border: 'none', padding: isMobile ? '0 8px' : '0 16px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => setBetAmount(betAmount / 2)}>1/2</button>
            <button style={{ background: 'hsla(var(--surface-raised), 0.5)', color: '#fff', border: 'none', padding: isMobile ? '0 8px' : '0 16px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }} onClick={() => setBetAmount(betAmount * 2)}>2x</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>Profit on Win</label>
          <div style={{ background: 'hsla(var(--bg-color), 0.3)', borderRadius: 'var(--radius-lg)', padding: '14px', display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', backdropFilter: 'blur(5px)' }}>
            <span className="mono" style={{ color: 'hsl(var(--success))', fontWeight: 700, fontSize: '1rem' }}>+${profitOnWin.toFixed(2)}</span>
            <Zap size={16} style={{ marginLeft: 'auto', color: 'hsl(var(--text-dim))' }} />
          </div>
        </div>

        {isAutoMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '8px' }}>Number of Bets</label>
              <input 
                type="number" 
                value={autoBetSettings.numberOfBets}
                onChange={(e) => updateAutoSettings({ numberOfBets: Number(e.target.value) })}
                style={{ width: '100%', background: 'hsl(var(--bg-color))', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '1rem' }} 
                placeholder="∞" 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>On Win</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => updateAutoSettings({ onWin: 0 })} style={{ flex: 1, fontSize: '0.6rem', padding: '6px', background: autoBetSettings.onWin === 0 ? 'hsla(var(--primary), 0.2)' : 'transparent', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>Reset</button>
                  <input 
                    type="number" 
                    value={autoBetSettings.onWin}
                    onChange={(e) => updateAutoSettings({ onWin: Number(e.target.value) })}
                    style={{ width: '50px', background: 'hsl(var(--bg-color))', border: '1px solid var(--glass-border)', color: '#fff', padding: '4px', borderRadius: '4px', fontSize: '0.75rem' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '4px' }}>On Loss</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => updateAutoSettings({ onLoss: 0 })} style={{ flex: 1, fontSize: '0.6rem', padding: '6px', background: autoBetSettings.onLoss === 0 ? 'hsla(var(--primary), 0.2)' : 'transparent', border: '1px solid var(--glass-border)', borderRadius: '4px' }}>Reset</button>
                  <input 
                    type="number" 
                    value={autoBetSettings.onLoss}
                    onChange={(e) => updateAutoSettings({ onLoss: Number(e.target.value) })}
                    style={{ width: '50px', background: 'hsl(var(--bg-color))', border: '1px solid var(--glass-border)', color: '#fff', padding: '4px', borderRadius: '4px', fontSize: '0.75rem' }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: isMobile ? '8px' : 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              <Zap size={14} color="hsl(var(--success))" /> Instant Settlement
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
            background: isAutoMode && autoRunning ? 'hsla(var(--primary), 0.1)' : 'hsl(var(--primary))', 
            color: isAutoMode && autoRunning ? 'hsl(var(--primary))' : '#000', 
            border: isAutoMode && autoRunning ? '1px solid hsla(var(--primary), 0.3)' : 'none', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-lg)', 
            fontSize: '1rem', 
            fontWeight: 800, 
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: isAutoMode && autoRunning ? 'none' : 'var(--glow-primary)'
          }}
        >
          {loading || isProcessing ? 'Rolling...' : isAutoMode ? (autoRunning ? 'Stop Autobet' : 'Start Autobet') : 'Bet'}
        </button>


      </div>
      <div className="dice-main" style={{ 
        background: 'hsl(var(--bg-color))', 
        padding: 'var(--space-lg)', 
        display: 'flex', 
        flex: 1,
        flexDirection: 'column', 
        gap: 'var(--space-lg)', 
        position: 'relative',
        minWidth: 0
      }}>
        {/* Lucky 777 Backdrop */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.1, zIndex: 0 }}>
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '100%', height: '100%', position: 'relative' }}
          >
            <Image src="/images/lucky-777-neon-3d.png" alt="777 Background" fill style={{ objectFit: 'contain', filter: 'blur(10px)' }} />
          </motion.div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : 'clamp(20px, 5vw, 40px)' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {history.map((h, i) => (
            <div key={i} style={{ 
              width: '40px', 
              height: '8px', 
              borderRadius: '4px', 
              background: h.win ? 'hsl(var(--success))' : 'hsl(var(--error))',
              opacity: 1 - (i * 0.1),
              boxShadow: h.win ? '0 0 10px hsla(var(--success), 0.4)' : 'none'
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: isMobile ? '120px' : '300px', position: 'relative' }}>
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
                fontFamily: 'var(--font-outfit)'
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
          style={{ position: 'relative', padding: isMobile ? '20px 0' : '40px 0', cursor: 'pointer', touchAction: 'none' }}
        >
          <div style={{ 
            height: '16px', 
            width: '100%', 
            background: 'hsla(var(--border-color), 0.5)', 
            borderRadius: '8px', 
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {/* Visual Result Marker */}
            {(visualResult !== null || loading) && (
              <div style={{ 
                position: 'absolute', 
                left: `${visualResult !== null ? visualResult : 50}%`, 
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                background: visualResult !== null ? (winning ? 'hsl(var(--success))' : 'hsl(var(--error))') : 'hsl(var(--text-main))',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                color: '#000',
                boxShadow: 'var(--shadow-lg)',
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
              background: 'hsl(var(--success))',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
            }} />
            
            {/* Loss Zone */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              bottom: 0, 
              left: isRollOver ? 0 : `${targetPoint}%`, 
              right: isRollOver ? `${100 - targetPoint}%` : 0,
              background: 'hsl(var(--error))',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)'
            }} />
          </div>
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
              boxShadow: 'var(--shadow-md)',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              transition: 'none',
              border: '2px solid hsl(var(--bg-color))'
            }}
          >
            <div style={{ width: '3px', height: '22px', background: 'hsl(var(--text-dim))', margin: '0 2px', borderRadius: '2px' }} />
            <div style={{ width: '3px', height: '22px', background: 'hsl(var(--text-dim))', margin: '0 2px', borderRadius: '2px' }} />
          </div>
          {/* Scale */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', color: 'hsl(var(--text-dim))', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 800 }}>
            <span>0</span>
            <span style={{ display: isMobile ? 'none' : 'block' }}>25</span>
            <span>50</span>
            <span style={{ display: isMobile ? 'none' : 'block' }}>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Target Inputs (Bottom Row) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', 
          gap: '12px', 
          background: 'hsla(var(--surface-color), 0.5)', 
          padding: '16px', 
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>Multiplier</label>
            <input 
              type="number" 
              className="mono" 
              value={multiplier} 
              style={{ background: 'hsl(var(--bg-color))', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '1rem', fontWeight: 700 }}
              onChange={(e) => updateFromMultiplier(parseFloat(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>{isRollOver ? 'Roll Over' : 'Roll Under'}</label>
            <div style={{ display: 'flex', gap: '1px', background: 'var(--glass-border)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1px', overflow: 'hidden' }}>
              <input 
                type="number" 
                className="mono" 
                value={targetPoint} 
                style={{ flex: 1, background: 'hsl(var(--bg-color))', border: 'none', color: '#fff', outline: 'none', fontSize: '1rem', paddingLeft: '12px', fontWeight: 700 }}
                onChange={(e) => updateFromTarget(parseFloat(e.target.value))}
              />
              <button onClick={toggleRollMode} style={{ background: 'hsla(var(--surface-raised), 0.5)', border: 'none', color: '#fff', padding: '0 12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: isMobile ? 'span 2' : 'auto' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>Win Chance</label>
            <input 
              type="number" 
              className="mono" 
              value={winChance} 
              style={{ background: 'hsl(var(--bg-color))', border: '1px solid var(--glass-border)', color: '#fff', padding: '12px', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '1rem', fontWeight: 700 }}
              onChange={(e) => updateFromWinChance(parseFloat(e.target.value))}
            />
          </div>
        </div>

      </div>
      </div>
      {/* Live Bets Sidebar (Right) */}
      {!isMobile && (
        <div className="live-bets-sidebar" style={{ 
          background: 'hsla(var(--surface-color), 0.8)', 
          padding: 'var(--space-md)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-md)',
          borderLeft: '1px solid var(--glass-border)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allBets.filter(b => b.game === 'DICE').slice(0, 15).map((bet) => (
              <div key={bet.id} style={{ 
                background: 'hsla(var(--bg-color), 0.4)', padding: '14px', borderRadius: 'var(--radius-lg)', 
                display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem',
                border: '1px solid var(--glass-border)',
                animation: 'slideIn 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'hsl(var(--text-main))', fontWeight: 800 }}>{bet.user}</span>
                  <span style={{ color: 'hsl(var(--text-dim))', fontWeight: 700 }}>${bet.amount.toFixed(2)}</span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: bet.isWin ? 'hsl(var(--success))' : 'hsl(var(--text-dim))', fontWeight: 900 }}>{bet.multiplier.toFixed(2)}x</span>
                  <div style={{ color: bet.isWin ? 'hsl(var(--success))' : 'hsl(var(--text-dim))', fontSize: '0.65rem', fontWeight: 800 }}>
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