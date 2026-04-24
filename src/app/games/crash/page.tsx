'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp, ShieldCheck, Info, RotateCcw, Zap, Rocket, AlertTriangle, History, Target, Users, ArrowUpRight, Coins, MessageSquare, Send, Keyboard } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';

// Types for the particle system
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface LiveBet {
  user: string;
  amount: number;
  multiplier: number | null;
  payout: number | null;
}

export default function CrashPage() {
  const { 
    isMobile,
    balance, 
    removeBalance, 
    addBalance, 
    addBet, 
    calculateXp, 
    chatMessages, 
    addChatMessage,
    crashHistory,
    addCrashHistory,
    provablyFairSettings,
    setProvablyFairSettings,
    addToast
  } = useCasinoStore();

  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const [cashoutAt, setCashoutAt] = useState<number | null>(null);
  const [autoCashout, setAutoCashout] = useState<number>(2.00);
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState(false);
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [message, setMessage] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [bigWin, setBigWin] = useState<{ amount: number, multiplier: number } | null>(null);
  
  // Auto-betting state
  const [isAutoBetting, setIsAutoBetting] = useState(false);
  const [onLoss, setOnLoss] = useState<'RESET' | 'DOUBLE'>('RESET');
  const [onWin, setOnWin] = useState<'RESET' | 'DOUBLE'>('RESET');
  const baseBetRef = useRef(10);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastUpdateRef = useRef<number>(0);
  const pointsRef = useRef<{x: number, y: number}[]>([]);
  const crashPointRef = useRef<number>(2.00);
  
  // Audio Refs (Infrastructure for Lever 13)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Game constants
  const GROWTH_FACTOR = 0.0006; 
  const MAX_POINTS = 500;

  // Initialize Audio
  useEffect(() => {
    const sounds = {
      engine: '/sounds/engine.mp3', // Rocket launch
      cashout: '/sounds/win.mp3', // Ding
      crash: '/sounds/loss.mp3'   // Explosion
    };

    Object.entries(sounds).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.volume = 0.4;
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
      audio.play().catch(e => console.warn('Audio playback failed:', e));
    }
  };

  // Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (status !== 'RUNNING') handleStart();
        else handleCashout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, betAmount, isAutoBetting]);

  // Generate fake live bets
  useEffect(() => {
    if (status === 'RUNNING') {
      const users = ['LuckyShark', 'MoonWalker', 'DegenKing', 'WhaleWatcher', 'CryptoAce', 'VibeCoder', 'AlphaWhale', 'BetMaster'];
      const initialBets = users.map(u => ({
        user: u,
        amount: Math.floor(Math.random() * 500) + 10,
        multiplier: null,
        payout: null
      }));
      setLiveBets(initialBets);
      playSound('engine');
    } else if (status === 'IDLE') {
      setLiveBets([]);
      if (isAutoBetting) {
        if (balance >= betAmount) {
          setTimeout(handleStart, 1500);
        } else {
          setIsAutoBetting(false);
        }
      }
    }
  }, [status, isAutoBetting]);

  // Update live bets during game
  useEffect(() => {
    if (status === 'RUNNING') {
      const interval = setInterval(() => {
        setLiveBets(prev => prev.map(bet => {
          if (bet.multiplier === null && Math.random() < 0.04 && multiplier > 1.2) {
            return { ...bet, multiplier: multiplier, payout: bet.amount * multiplier };
          }
          return bet;
        }));
      }, 400);
      return () => clearInterval(interval);
    }
  }, [status, multiplier]);

  // Particle System Logic
  const createExplosion = (x: number, y: number) => {
    const colors = ['#ff4d4d', '#ff944d', '#ffcc00', '#fff', '#ff0000'];
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 25,
        vy: (Math.random() - 0.5) * 25,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 2
      });
    }
    playSound('crash');
  };

  const createTail = (x: number, y: number) => {
    particlesRef.current.push({
      x,
      y,
      vx: -4 - Math.random() * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      color: multiplier > 5 ? 'hsla(280, 100%, 70%, 0.6)' : 'hsla(180, 100%, 50%, 0.4)',
      size: Math.random() * 5 + 1
    });
  };

  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  };

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
    const deltaTime = timestamp - lastUpdateRef.current;

    if (status === 'RUNNING') {
      setMultiplier(prev => {
        const next = prev + prev * GROWTH_FACTOR * (deltaTime / 16);
        
        if (isAutoCashoutEnabled && !cashoutAt && next >= autoCashout) {
          handleCashout(next);
        }

        if (next >= crashPointRef.current) {
          setStatus('CRASHED');
          addCrashHistory(parseFloat(next.toFixed(2)));
          
          if (isAutoBetting && !cashoutAt) {
            if (onLoss === 'DOUBLE') setBetAmount(b => b * 2);
            else setBetAmount(baseBetRef.current);
          }

          const canvas = canvasRef.current;
          if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const scaleX = width / Math.max(100, pointsRef.current.length);
            const scaleY = height / Math.max(5, next + 1);
            createExplosion(
              pointsRef.current.length * scaleX,
              height - (next - 1) * scaleY
            );
          }
          return next;
        }

        pointsRef.current.push({ x: pointsRef.current.length, y: next });
        if (pointsRef.current.length > MAX_POINTS) pointsRef.current.shift();
        
        return next;
      });
    }

    draw();
    lastUpdateRef.current = timestamp;
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [status, isAutoCashoutEnabled, autoCashout, cashoutAt, isAutoBetting, onLoss, addCrashHistory]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }
    
    ctx.save();
    ctx.scale(dpr, dpr);
    const width = displayWidth;
    const height = displayHeight;

    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      const x = (width / 10) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }

    if (pointsRef.current.length < 2) {
      updateParticles(ctx);
      ctx.restore();
      return;
    }

    const scaleX = width / Math.max(100, pointsRef.current.length);
    const scaleY = height / Math.max(5, multiplier + 1);

    // Area
    ctx.beginPath();
    ctx.moveTo(0, height);
    pointsRef.current.forEach((p, i) => {
      ctx.lineTo(i * scaleX, height - (p.y - 1) * scaleY);
    });
    ctx.lineTo(pointsRef.current.length * scaleX, height);
    const areaGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    areaGradient.addColorStop(0, multiplier > 5 ? 'rgba(255, 0, 255, 0.15)' : 'rgba(0, 255, 255, 0.1)');
    areaGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = areaGradient;
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const gradient = ctx.createLinearGradient(0, height, width, 0);
    gradient.addColorStop(0, 'hsl(180, 100%, 50%)');
    gradient.addColorStop(1, status === 'CRASHED' ? 'hsl(0, 85%, 60%)' : multiplier > 5 ? 'hsl(300, 100%, 65%)' : 'hsl(200, 100%, 60%)');
    ctx.strokeStyle = gradient;

    ctx.moveTo(0, height - (pointsRef.current[0].y - 1) * scaleY);
    pointsRef.current.forEach((p, i) => {
      const x = i * scaleX;
      const y = height - (p.y - 1) * scaleY;
      ctx.lineTo(x, y);
      if (status === 'RUNNING' && i === pointsRef.current.length - 1) createTail(x, y);
    });
    ctx.stroke();

    // Rocket
    if (status === 'RUNNING') {
      const last = pointsRef.current[pointsRef.current.length - 1];
      const rocketX = pointsRef.current.length * scaleX;
      const rocketY = height - (last.y - 1) * scaleY;
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(-Math.atan2(scaleY, scaleX) * 1.5);
      ctx.shadowBlur = 30;
      ctx.shadowColor = multiplier > 5 ? 'magenta' : 'cyan';
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'orange';
      ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-28, -6); ctx.lineTo(-22, 0); ctx.lineTo(-28, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    updateParticles(ctx);
    ctx.restore();
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [gameLoop]);

  const handleStart = async () => {
    if (removeBalance(betAmount)) {
      const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
      const nonce = provablyFairSettings.nonce + 1;
      const crashPoint = await ProvablyFairEngine.getCrashMultiplier(seed, provablyFairSettings.clientSeed, nonce);
      
      setProvablyFairSettings({ serverSeedHash: hash, nonce });
      crashPointRef.current = crashPoint;
      setMultiplier(1.00);
      pointsRef.current = [{x: 0, y: 1}];
      particlesRef.current = [];
      setStatus('RUNNING');
      setCashoutAt(null);
      setBigWin(null);
    } else {
      setIsAutoBetting(false);
      addToast('Insufficient balance!', 'error');
    }
  };

  const handleCashout = (specificMultiplier?: number) => {
    if (status === 'RUNNING' && !cashoutAt) {
      const m = specificMultiplier || multiplier;
      setCashoutAt(m);
      const winAmount = betAmount * m;
      addBalance(winAmount);
      addBet({
        id: Math.random().toString(36),
        time: new Date().toLocaleTimeString(),
        game: 'CRASH',
        user: 'You',
        amount: betAmount,
        multiplier: m,
        payout: winAmount,
        win: true
      });
      calculateXp(betAmount);
      playSound('cashout');

      if (m >= 5) {
        setBigWin({ amount: winAmount, multiplier: m });
      }

      if (isAutoBetting) {
        if (onWin === 'DOUBLE') setBetAmount(b => b * 2);
        else setBetAmount(baseBetRef.current);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    addChatMessage({ user: 'You', text: message });
    setMessage('');
  };

  return (
    <div className="crash-container" style={{ 
      maxWidth: '1600px', 
      margin: '0 auto', 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '350px 1fr 350px',
      gap: isMobile ? '16px' : '24px',
      padding: isMobile ? '12px' : '24px'
    }}>
      <style>{`
        .crash-container {
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 350px 1fr 350px;
          gap: 24px;
          padding: clamp(12px, 3vw, 24px);
        }
        @media (max-width: 1400px) {
          .crash-container {
            grid-template-columns: 300px 1fr;
          }
          .sidebar-right { display: none; }
        }
        @media (max-width: 900px) {
          .crash-container {
            grid-template-columns: 1fr;
          }
          .sidebar-left { order: 2; }
          .game-area { order: 1; }
        }
        .big-win-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.5s ease;
          padding: 20px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="big-win-overlay" onClick={() => setShowTutorial(false)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: 'clamp(24px, 5vw, 40px)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <Info size={48} color="hsl(var(--primary))" style={{ marginBottom: '24px', margin: '0 auto' }} />
            <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.2rem, 5vw, 2rem)' }}>HOW TO PLAY</h2>
            <p style={{ color: 'hsl(var(--text-muted))', lineHeight: '1.6', fontSize: 'clamp(0.85rem, 3vw, 1rem)' }}>
              1. Place your bet before the rocket takes off.<br/>
              2. Watch the multiplier grow higher and higher.<br/>
              3. Cash out before the rocket explodes to win!<br/>
              4. If the rocket crashes first, you lose your bet.
            </p>
            <button className="btn btn-primary" style={{ marginTop: '24px', width: '100%', height: '56px' }} onClick={() => setShowTutorial(false)}>GOT IT!</button>
          </div>
        </div>
      )}

      {/* Big Win Celebration */}
      {bigWin && (
        <div className="big-win-overlay" onClick={() => setBigWin(null)}>
          <div className="animate-bounce" style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(3rem, 15vw, 6rem)', color: 'gold', textShadow: '0 0 50px gold' }}>BIG WIN!</h1>
            <h2 style={{ fontSize: 'clamp(1.5rem, 8vw, 3rem)', color: '#fff' }}>${bigWin.amount.toFixed(2)}</h2>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 2rem)', color: 'hsl(var(--success))' }}>{bigWin.multiplier.toFixed(2)}x</div>
          </div>
        </div>
      )}
      
      {/* Sidebar Left: Control Panel */}
      <div className="sidebar-left glass-card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: isMobile ? '16px' : '20px', 
        padding: isMobile ? '20px 16px' : '24px', 
        borderRadius: '24px',
        order: isMobile ? 2 : 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Zap size={20} color="hsl(var(--primary))" />
            <h3 style={{ margin: 0, letterSpacing: '1px', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>CONTROL</h3>
          </div>
          <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setShowTutorial(true)}>
            <Info size={16} />
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '1px' }}>BET AMOUNT</label>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))' }}>${balance.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="number" 
                className="input mono" 
                value={betAmount} 
                style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, flex: 1, minHeight: isMobile ? '48px' : '56px' }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setBetAmount(val);
                  if (!isAutoBetting) baseBetRef.current = val;
                }} 
              />
              {!isMobile && (
                <>
                  <button className="btn btn-secondary" style={{ padding: '0 10px' }} onClick={() => setBetAmount(prev => prev / 2)}>1/2</button>
                  <button className="btn btn-secondary" style={{ padding: '0 10px' }} onClick={() => setBetAmount(prev => prev * 2)}>2x</button>
                </>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.7rem', minHeight: '36px' }} onClick={() => setBetAmount(prev => prev / 2)}>1/2</button>
              <button className="btn btn-secondary" style={{ fontSize: '0.7rem', minHeight: '36px' }} onClick={() => setBetAmount(prev => prev * 2)}>2x</button>
              {[10, 50].map(val => (
                <button key={val} className="btn btn-secondary" style={{ fontSize: '0.7rem', minHeight: '36px' }} onClick={() => setBetAmount(prev => prev + val)}>+{val}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto Cashout */}
        <div className="glass" style={{ padding: isMobile ? '12px' : '16px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isAutoCashoutEnabled ? '#fff' : 'hsl(var(--text-muted))' }}>AUTO CASHOUT</span>
            <input 
              type="checkbox" 
              checked={isAutoCashoutEnabled} 
              onChange={(e) => setIsAutoCashoutEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
          </div>
          <input 
            type="number" 
            className="input mono" 
            disabled={!isAutoCashoutEnabled}
            value={autoCashout} 
            step="0.1"
            style={{ fontSize: '0.9rem', width: '100%', opacity: isAutoCashoutEnabled ? 1 : 0.5, minHeight: '44px' }}
            onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 1.1)} 
          />
        </div>

        {status !== 'RUNNING' ? (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', height: isMobile ? '60px' : '70px', fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 900, borderRadius: '20px' }} 
            onClick={handleStart}
          >
            {isAutoBetting ? 'AUTO ON' : 'BET'}
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              height: isMobile ? '60px' : '70px', 
              fontSize: isMobile ? '1.25rem' : '1.5rem', 
              fontWeight: 900, 
              borderRadius: '20px',
              background: cashoutAt ? 'rgba(255,255,255,0.05)' : 'hsl(var(--success))', 
              boxShadow: cashoutAt ? 'none' : '0 10px 40px hsla(145, 80%, 50%, 0.4)',
            }} 
            onClick={() => handleCashout()}
            disabled={!!cashoutAt}
          >
            {cashoutAt ? `WIN $${(betAmount * cashoutAt).toFixed(2)}` : `CASHOUT`}
          </button>
        )}
      </div>

      {/* Main Center: Game Area */}
      <div className="game-area" style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px', order: isMobile ? 1 : 2 }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {crashHistory.slice(0, 15).map((h, i) => (
            <div key={i} className="glass" style={{ 
              padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
              color: h >= 2 ? 'hsl(var(--success))' : 'hsl(var(--error))',
              border: `1px solid ${h >= 2 ? 'hsla(145, 80%, 50%, 0.2)' : 'hsla(0, 85%, 60%, 0.2)'}`,
              minWidth: '55px', textAlign: 'center'
            }}>
              {h.toFixed(2)}x
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ 
          position: 'relative', flex: 1, minHeight: isMobile ? '300px' : 'clamp(300px, 50vh, 550px)', padding: 0, overflow: 'hidden',
          background: 'radial-gradient(circle at 10% 90%, #1a1a1a 0%, #000 100%)',
          borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ 
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
            textAlign: 'center', zIndex: 10, pointerEvents: 'none', width: '100%'
          }}>
            <h1 style={{ 
              fontSize: isMobile ? '4.5rem' : 'min(10rem, 20vw)', fontWeight: 900, color: status === 'CRASHED' ? 'hsl(var(--error))' : '#fff',
              textShadow: status === 'CRASHED' ? '0 0 80px rgba(231, 76, 60, 0.4)' : '0 0 80px rgba(0, 255, 255, 0.2)',
              margin: 0, fontFamily: 'Outfit', fontVariantNumeric: 'tabular-nums', lineHeight: 1
            }}>
              {multiplier.toFixed(2)}x
            </h1>
            {status === 'CRASHED' && (
              <div className="animate-slide-up" style={{ fontSize: isMobile ? '1rem' : '1.5rem', fontWeight: 800, color: 'hsl(var(--error))', letterSpacing: isMobile ? '4px' : '8px' }}>
                CRASHED
              </div>
            )}
          </div>

          <canvas ref={canvasRef} width={1200} height={800} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>

        {/* Live Bets */}
        <div className="glass-card" style={{ padding: isMobile ? '16px' : '20px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Users size={18} color="hsl(var(--primary))" />
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>LIVE BETS ({liveBets.length})</h4>
          </div>
          <div style={{ maxHeight: isMobile ? '120px' : '160px', overflowY: 'auto', fontSize: '0.75rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'hsl(var(--text-muted))', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>USER</th>
                  <th style={{ padding: '6px' }}>BET</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>MULT</th>
                </tr>
              </thead>
              <tbody>
                {liveBets.map((bet, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '6px', fontWeight: 600 }}>{isMobile ? bet.user.substring(0, 8) + '..' : bet.user}</td>
                    <td style={{ padding: '6px' }}>${bet.amount.toFixed(0)}</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 700, color: bet.multiplier ? 'hsl(var(--success))' : 'inherit' }}>
                      {bet.multiplier ? `${bet.multiplier.toFixed(2)}x` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar Right: Chat & Social */}
      <div className="sidebar-right glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MessageSquare size={20} color="hsl(var(--primary))" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>CHAT</h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 800, color: msg.vipTier ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', marginRight: '6px' }}>{msg.user}:</span>
              <span style={{ color: '#fff' }}>{msg.text}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
          <input className="input" placeholder="Say something..." value={message} onChange={e => setMessage(e.target.value)} style={{ fontSize: '0.85rem' }} />
          <button className="btn btn-primary" style={{ padding: '0 12px' }}><Send size={16} /></button>
        </form>

        <div className="card" style={{ padding: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>CLIENT SEED</div>
          <input 
            className="input mono" 
            value={provablyFairSettings.clientSeed}
            onChange={(e) => setProvablyFairSettings({ clientSeed: e.target.value })}
            style={{ fontSize: '0.75rem' }}
          />
          <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))', marginTop: '8px', wordBreak: 'break-all' }}>
            Hash: {provablyFairSettings.serverSeedHash || 'Pending next round...'}
          </div>
        </div>
      </div>
    </div>
  );
}
