'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  CircleDollarSign, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  History, 
  TrendingUp, 
  Info,
  ChevronRight,
  Dices,
  Trash2,
  Undo2,
  Trophy,
  Activity,
  BarChart3,
  Settings,
  Volume2,
  VolumeX,
  FastForward,
  Star
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { ProvablyFairEngine } from '@/lib/casino/provably-fair';

// --- Constants & Types ---

type Color = 'RED' | 'BLACK' | 'GREEN';

interface RouletteNumber {
  n: number;
  c: Color;
}

const ROULETTE_NUMBERS: RouletteNumber[] = [
  { n: 0, c: 'GREEN' }, { n: 32, c: 'RED' }, { n: 15, c: 'BLACK' }, { n: 19, c: 'RED' }, { n: 4, c: 'BLACK' },
  { n: 21, c: 'RED' }, { n: 2, c: 'BLACK' }, { n: 25, c: 'RED' }, { n: 17, c: 'BLACK' }, { n: 34, c: 'RED' },
  { n: 6, c: 'BLACK' }, { n: 27, c: 'RED' }, { n: 13, c: 'BLACK' }, { n: 36, c: 'RED' }, { n: 11, c: 'BLACK' },
  { n: 30, c: 'RED' }, { n: 8, c: 'BLACK' }, { n: 23, c: 'RED' }, { n: 10, c: 'BLACK' }, { n: 5, c: 'RED' },
  { n: 24, c: 'BLACK' }, { n: 16, c: 'RED' }, { n: 33, c: 'BLACK' }, { n: 1, c: 'RED' }, { n: 20, c: 'BLACK' },
  { n: 14, c: 'RED' }, { n: 31, c: 'BLACK' }, { n: 9, c: 'RED' }, { n: 22, c: 'BLACK' }, { n: 18, c: 'RED' },
  { n: 29, c: 'BLACK' }, { n: 7, c: 'RED' }, { n: 28, c: 'BLACK' }, { n: 12, c: 'RED' }, { n: 35, c: 'BLACK' },
  { n: 3, c: 'RED' }, { n: 26, c: 'BLACK' }
];

const WHEEL_ORDER = [...ROULETTE_NUMBERS];

type BetType = 
  | { type: 'STRAIGHT', value: number }
  | { type: 'COLOR', value: Color }
  | { type: 'EVEN_ODD', value: 'EVEN' | 'ODD' }
  | { type: 'RANGE', value: '1-18' | '19-36' }
  | { type: 'DOZEN', value: 1 | 2 | 3 }
  | { type: 'COLUMN', value: 1 | 2 | 3 }
  | { type: 'FRENCH', value: 'VOISINS' | 'TIERS' | 'ORPHELINS' };

interface BetPlacement {
  id: string;
  type: BetType;
  amount: number;
}

const CHIPS = [1, 5, 10, 50, 100, 500, 1000];

const FRENCH_BETS_MAP = {
  VOISINS: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25],
  TIERS: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
  ORPHELINS: [1, 20, 14, 31, 9, 17, 34, 6]
};

// --- Helper Components ---

const Chip = ({ amount, size = 32, onClick, active, stacked = false, index = 0, vipLevel = 1 }: { 
  amount: number, size?: number, onClick?: () => void, active?: boolean, stacked?: boolean, index?: number, vipLevel?: number 
}) => {
  const getChipColor = (amt: number) => {
    if (amt >= 1000) return vipLevel > 10 ? '#ffd700' : '#f1c40f';
    if (amt >= 500) return '#9b59b6'; 
    if (amt >= 100) return '#3498db'; 
    if (amt >= 50) return '#e67e22'; 
    if (amt >= 10) return '#e74c3c'; 
    return '#ecf0f1'; 
  };

  const stackCount = stacked ? 1 : Math.min(6, Math.max(1, Math.floor(Math.log10(amount / 5 + 1)) + 1));

  return (
    <div style={{ position: 'relative', width: size, height: size, zIndex: stacked ? 50 - index : 10 }}>
      {[...Array(stackCount)].map((_, i) => (
        <button 
          key={i}
          onClick={i === stackCount - 1 ? onClick : undefined}
          className={`chip-button ${active ? 'active' : ''}`}
          style={{ 
            width: size, height: size, borderRadius: '50%', background: getChipColor(amount),
            border: `3px dashed rgba(0,0,0,0.2)`,
            boxShadow: active ? `0 0 20px ${getChipColor(amount)}, inset 0 0 5px rgba(0,0,0,0.5)` : '0 4px 6px rgba(0,0,0,0.3), inset 0 0 5px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: amount >= 100 && amount < 1000 ? '#fff' : '#000',
            fontSize: size * 0.35, fontWeight: 900, cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: `translateY(${-i * 2}px) ${active ? 'scale(1.1) translateY(-4px)' : (stacked ? `translateY(${-index * 2}px) scale(${1 - index * 0.05})` : 'scale(1)')}`,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: i,
            pointerEvents: i === stackCount - 1 ? 'auto' : 'none'
          }}
        >
          <div style={{ position: 'absolute', inset: '2px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50%' }} />
          {i === stackCount - 1 && (amount >= 1000 ? `${amount/1000}k` : amount)}
        </button>
      ))}
    </div>
  );
};

export default function RoulettePage() {
  const { balance, removeBalance, addBalance, addBet, calculateXp, level, xp, provablyFairSettings, setProvablyFairSettings } = useCasinoStore();
  
  const [currentBets, setCurrentBets] = useState<BetPlacement[]>([]);
  const [lastBets, setLastBets] = useState<BetPlacement[]>([]);
  const [betHistory, setBetHistory] = useState<BetPlacement[][]>([]);
  const [selectedChip, setSelectedChip] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [winningNumber, setWinningNumber] = useState<RouletteNumber | null>(null);
  const [history, setHistory] = useState<RouletteNumber[]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [hoveredArea, setHoveredArea] = useState<BetType | null>(null);
  const [nextSeedHash, setNextSeedHash] = useState(Math.random().toString(36).substring(2, 15));

  const [sessionWagered, setSessionWagered] = useState(0);
  const [sessionWins, setSessionWins] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spinning) return;
      if (e.code === 'Space') { e.preventDefault(); handleSpin(); }
      else if (e.code === 'Escape') { handleClearBets(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinning, currentBets]);

  const totalWagered = useMemo(() => currentBets.reduce((acc, bet) => acc + bet.amount, 0), [currentBets]);

  const estProfit = useMemo(() => {
    let maxWin = 0;
    for (let i = 0; i <= 36; i++) {
      let currentNumWin = 0;
      currentBets.forEach(bet => {
        if (isWinForNumber(bet.type, i)) {
          currentNumWin += bet.amount * getMultiplier(bet.type);
        }
      });
      if (currentNumWin > maxWin) maxWin = currentNumWin;
    }
    return maxWin;
  }, [currentBets]);

  function isWinForNumber(bet: BetType, n: number): boolean {
    const numData = ROULETTE_NUMBERS.find(rn => rn.n === n)!;
    switch (bet.type) {
      case 'STRAIGHT': return n === bet.value;
      case 'COLOR': return numData.c === bet.value;
      case 'EVEN_ODD': return n === 0 ? false : (bet.value === 'EVEN' ? n % 2 === 0 : n % 2 !== 0);
      case 'RANGE': return n === 0 ? false : (bet.value === '1-18' ? (n >= 1 && n <= 18) : (n >= 19 && n <= 36));
      case 'DOZEN': return n === 0 ? false : Math.ceil(n / 12) === bet.value;
      case 'COLUMN': return n === 0 ? false : ((n - 1) % 3) + 1 === bet.value;
      case 'FRENCH': return FRENCH_BETS_MAP[bet.value].includes(n);
    }
    return false;
  }

  function getMultiplier(bet: BetType): number {
    switch (bet.type) {
      case 'STRAIGHT': return 36;
      case 'COLOR': return 2;
      case 'EVEN_ODD': return 2;
      case 'RANGE': return 2;
      case 'DOZEN': return 3;
      case 'COLUMN': return 3;
      case 'FRENCH': {
        const count = FRENCH_BETS_MAP[bet.value].length;
        return 36 / count;
      }
    }
    return 0;
  }

  const handlePlaceBet = (type: BetType) => {
    if (spinning) return;
    if (balance < selectedChip) return;

    if (removeBalance(selectedChip)) {
      setBetHistory([...betHistory, [...currentBets]]);
      const existingBetIndex = currentBets.findIndex(b => JSON.stringify(b.type) === JSON.stringify(type));
      if (existingBetIndex > -1) {
        const newBets = [...currentBets];
        newBets[existingBetIndex].amount += selectedChip;
        setCurrentBets(newBets);
      } else {
        setCurrentBets([...currentBets, { id: Math.random().toString(36), type, amount: selectedChip }]);
      }
      calculateXp(selectedChip);
      setSessionWagered(prev => prev + selectedChip);
    }
  };

  const handleClearBets = () => {
    if (spinning || currentBets.length === 0) return;
    addBalance(totalWagered);
    setCurrentBets([]);
    setBetHistory([]);
  };

  const handleSpin = async () => {
    if (spinning || currentBets.length === 0) return;
    setSpinning(true);
    setWinningNumber(null);
    setLastBets([...currentBets]);

    const { seed, hash } = await ProvablyFairEngine.generateServerSeed();
    const nonce = provablyFairSettings.nonce + 1;
    const resultNum = await ProvablyFairEngine.getRouletteNumber(seed, provablyFairSettings.clientSeed, nonce);
    setProvablyFairSettings({ serverSeedHash: hash, nonce });

    const result = ROULETTE_NUMBERS.find(n => n.n === resultNum)!;

    const duration = turboMode ? 1000 : 6000;
    const spins = turboMode ? 2 : 5;
    const extraRotation = Math.random() * 360;
    const targetWheelRotation = wheelRotation + (spins * 360) + extraRotation;
    const pocketDegrees = 360 / 37;
    const pocketIndex = WHEEL_ORDER.findIndex(n => n.n === result.n);
    const ballSpins = turboMode ? 3 : 8;
    const targetBallRotation = ballRotation - (ballSpins * 360) + (extraRotation + pocketIndex * pocketDegrees);

    setWheelRotation(targetWheelRotation);
    setBallRotation(targetBallRotation);

    setTimeout(() => {
      processResult(result);
      setNextSeedHash(Math.random().toString(36).substring(2, 15));
    }, duration);
  };

  const processResult = (result: RouletteNumber) => {
    setWinningNumber(result);
    setSpinning(false);
    setHistory(prev => [result, ...prev].slice(0, 30));

    let totalWin = 0;
    currentBets.forEach(bet => {
      if (isWinForNumber(bet.type, result.n)) {
        totalWin += bet.amount * getMultiplier(bet.type);
      }
    });

    if (totalWin > 0) {
      setLastWin(totalWin);
      setSessionWins(prev => prev + totalWin);
      addBalance(Math.round(totalWin * 100) / 100);
    } else {
      setLastWin(0);
    }

    addBet({
      id: Math.random().toString(36),
      time: new Date().toLocaleTimeString(),
      game: 'ROULETTE',
      user: 'You',
      amount: totalWagered,
      multiplier: totalWin > 0 ? Math.round((totalWin / totalWagered) * 100) / 100 : 0,
      payout: totalWin,
      win: totalWin > 0
    });

    setTimeout(() => {
      setCurrentBets([]);
      setWinningNumber(null);
      setLastWin(null);
    }, 4000);
  };

  const renderNumber = (num: number) => {
    const data = ROULETTE_NUMBERS.find(n => n.n === num)!;
    const bet = currentBets.find(b => b.type.type === 'STRAIGHT' && b.type.value === num);
    const isHighlighted = hoveredArea ? isWinForNumber(hoveredArea, num) : false;

    return (
      <div 
        key={num}
        onClick={() => handlePlaceBet({ type: 'STRAIGHT', value: num })}
        onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: num })}
        onMouseLeave={() => setHoveredArea(null)}
        className={`roulette-tile ${winningNumber?.n === num ? 'winner' : ''} ${isHighlighted ? 'highlight' : ''}`}
        style={{
          background: data.c === 'RED' ? 'hsl(var(--error))' : data.c === 'BLACK' ? '#111' : 'hsl(var(--success))',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', cursor: 'pointer',
          transition: 'all 0.2s', fontSize: '1.2rem', fontWeight: 900, color: '#fff', position: 'relative'
        }}
      >
        {num}
        {bet && <Chip amount={bet.amount} size={28} stacked index={0} vipLevel={level} />}
      </div>
    );
  };

  return (
    <div className="roulette-page" style={{ maxWidth: '1800px', margin: '0 auto', padding: '20px', display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
      <style jsx global>{`
        @media (min-width: 1400px) { .roulette-page { grid-template-columns: 350px 1fr 400px !important; padding: 40px !important; } }
        .roulette-tile.highlight { box-shadow: inset 0 0 15px #fff; filter: brightness(1.4); z-index: 5; }
        .roulette-tile.winner { animation: winner-glow-anim 0.6s infinite alternate; z-index: 10; border: 2px solid #fff !important; }
        @keyframes winner-glow-anim { from { filter: brightness(1.2); transform: scale(1); } to { filter: brightness(1.8); transform: scale(1.05); } }
        .wheel-pocket { clip-path: polygon(50% 100%, 0 0, 100% 0); transform-origin: bottom center; }
      `}</style>

      {/* Left Sidebar */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 900 }}>
            <span>VIP LVL {level}</span>
            <span>{Math.round((xp / (Math.pow(level, 2) * 100)) * 100)}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(xp / (Math.pow(level, 2) * 100)) * 100}%`, height: '100%', background: 'hsl(var(--primary))' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}><History size={14} className="text-primary" /> LAST RESULTS</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {history.slice(0, 15).map((h, i) => (
              <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: h.c === 'RED' ? 'hsl(var(--error))' : h.c === 'BLACK' ? '#222' : 'hsl(var(--success))', fontSize: '0.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>{h.n}</div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 900 }}>FRENCH BETS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['VOISINS', 'TIERS', 'ORPHELINS'] as const).map(f => (
              <button key={f} onClick={() => handlePlaceBet({ type: 'FRENCH', value: f })} onMouseEnter={() => setHoveredArea({ type: 'FRENCH', value: f })} onMouseLeave={() => setHoveredArea(null)} className="btn btn-secondary" style={{ fontSize: '0.7rem', fontWeight: 900 }}>{f} DU CYLINDRE</button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div className="glass-card flex-center" style={{ height: '480px', background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)', perspective: '1500px', overflow: 'hidden' }}>
          
          {/* Result Overlay */}
          {winningNumber && !spinning && (
            <div style={{ position: 'absolute', zIndex: 100, textAlign: 'center', background: 'rgba(0,0,0,0.85)', padding: '60px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '7rem', fontWeight: 900, color: winningNumber.c === 'RED' ? 'hsl(var(--error))' : winningNumber.c === 'GREEN' ? 'hsl(var(--success))' : '#fff' }}>{winningNumber.n}</div>
              {lastWin !== null && lastWin > 0 && <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: 900 }}>+${lastWin.toLocaleString()}</div>}
            </div>
          )}

          {/* Corrected 3D Wheel */}
          <div style={{ width: '450px', height: '450px', position: 'relative', transform: 'rotateX(45deg) rotateZ(0deg)', transformStyle: 'preserve-3d', filter: 'drop-shadow(0 50px 100px rgba(0,0,0,0.8))' }}>
            {/* Outer Rim */}
            <div style={{ position: 'absolute', inset: '-30px', borderRadius: '50%', border: '15px solid #2a2a2a', background: 'linear-gradient(135deg, #333, #000)', boxShadow: 'inset 0 0 40px rgba(0,0,0,1), 0 10px 0 #111', transform: 'translateZ(-10px)' }} />
            
            {/* Spinning Parts */}
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', position: 'relative', transition: `transform ${turboMode ? 1 : 6}s cubic-bezier(0.1, 0, 0.1, 1)`, transform: `rotate(${wheelRotation}deg)`, background: '#000', transformStyle: 'preserve-3d' }}>
              {WHEEL_ORDER.map((num, i) => (
                <div key={i} className="wheel-pocket" style={{ 
                  position: 'absolute', top: '0', left: '50%', width: '40px', height: '50%',
                  transform: `translateX(-50%) rotate(${(i * 360/37)}deg)`,
                  background: num.c === 'RED' ? 'hsl(var(--error))' : num.c === 'BLACK' ? '#111' : 'hsl(var(--success))',
                  display: 'flex', justifyContent: 'center', paddingTop: '15px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  border: '0.5px solid rgba(255,255,255,0.05)'
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', transform: 'rotate(180deg)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{num.n}</span>
                </div>
              ))}
              {/* Inner Bowl */}
              <div style={{ position: 'absolute', inset: '80px', borderRadius: '50%', background: 'radial-gradient(circle at center, #222 0%, #000 100%)', border: '8px solid #111', boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.5)' }} />
            </div>

            {/* Ball Track */}
            <div style={{ position: 'absolute', inset: '0', transition: `transform ${turboMode ? 1 : 6}s cubic-bezier(0.1, 0, 0.2, 1)`, transform: `rotate(${ballRotation}deg)`, transformStyle: 'preserve-3d' }}>
              <div style={{ position: 'absolute', top: '35px', left: '50%', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 20px #fff, inset -2px -2px 5px rgba(0,0,0,0.2)', transform: 'translateZ(10px)' }} />
            </div>
            
            {/* Center Piece */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '120px', height: '120px', transform: 'translate(-50%, -50%) translateZ(30px)', background: 'linear-gradient(135deg, #333, #111)', borderRadius: '50%', border: '4px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
              <Dices size={48} className="text-primary" style={{ filter: 'drop-shadow(0 0 10px hsla(var(--primary), 0.5))' }} />
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="glass-card" style={{ padding: '24px', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px', gap: '2px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px' }}>
            <div onClick={() => handlePlaceBet({ type: 'STRAIGHT', value: 0 })} onMouseEnter={() => setHoveredArea({ type: 'STRAIGHT', value: 0 })} onMouseLeave={() => setHoveredArea(null)} className={`roulette-tile ${hoveredArea?.type === 'STRAIGHT' && hoveredArea.value === 0 ? 'highlight' : ''}`} style={{ gridRow: '1/4', background: 'hsl(var(--success))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 900, color: '#fff', cursor: 'pointer', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
              0
              {currentBets.filter(b => b.type.type === 'STRAIGHT' && b.type.value === 0).map((b, i) => <Chip key={i} amount={b.amount} stacked index={i} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2px' }}>
              {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map(renderNumber)}
              {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map(renderNumber)}
              {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(renderNumber)}
            </div>
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(3, 1fr)', gap: '2px' }}>
              {[1, 2, 3].map(c => <div key={c} onClick={() => handlePlaceBet({ type: 'COLUMN', value: c as any })} onMouseEnter={() => setHoveredArea({ type: 'COLUMN', value: c as any })} onMouseLeave={() => setHoveredArea(null)} className="glass flex-center hover-glow" style={{ cursor: 'pointer', fontWeight: 900 }}>2:1</div>)}
            </div>
            <div style={{ gridColumn: '2/3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginTop: '2px' }}>
              {[1, 2, 3].map(d => <div key={d} onClick={() => handlePlaceBet({ type: 'DOZEN', value: d as any })} onMouseEnter={() => setHoveredArea({ type: 'DOZEN', value: d as any })} onMouseLeave={() => setHoveredArea(null)} className="glass flex-center hover-glow" style={{ height: '40px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900 }}>{d === 1 ? '1ST' : d === 2 ? '2ND' : '3RD'} 12</div>)}
            </div>
            <div style={{ gridColumn: '2/3', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '2px', marginTop: '2px' }}>
              {[{ l: '1-18', t: 'RANGE', v: '1-18' }, { l: 'EVEN', t: 'EVEN_ODD', v: 'EVEN' }, { l: 'RED', t: 'COLOR', v: 'RED', c: 'hsl(var(--error))' }, { l: 'BLACK', t: 'COLOR', v: 'BLACK', c: '#000' }, { l: 'ODD', t: 'EVEN_ODD', v: 'ODD' }, { l: '19-36', t: 'RANGE', v: '19-36' }].map((b, i) => (
                <div key={i} onClick={() => handlePlaceBet({ type: b.t as any, value: b.v as any })} onMouseEnter={() => setHoveredArea({ type: b.t as any, value: b.v as any })} onMouseLeave={() => setHoveredArea(null)} className="glass flex-center hover-glow" style={{ height: '40px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 900, background: b.c || 'rgba(255,255,255,0.02)' }}>{b.l}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}><Settings size={20} className="text-primary" /> CONTROLS</h2>
          <button onClick={() => setTurboMode(!turboMode)} style={{ color: turboMode ? 'hsl(var(--primary))' : '#555' }}><FastForward size={20} /></button>
        </div>

        <div>
          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', display: 'block', marginBottom: '16px' }}>CHIP VALUE</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {CHIPS.map(c => <Chip key={c} amount={c} active={selectedChip === c} onClick={() => setSelectedChip(c)} />)}
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}><span>EST. PROFIT</span><span className="text-primary" style={{ fontWeight: 900 }}>+${estProfit.toLocaleString()}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}><span>TOTAL BET</span><span style={{ color: '#fff', fontWeight: 900 }}>${totalWagered.toLocaleString()}</span></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-primary" style={{ height: '72px', fontSize: '1.5rem', fontWeight: 900, borderRadius: '20px' }} onClick={handleSpin} disabled={spinning || currentBets.length === 0}>{spinning ? <RotateCcw className="animate-spin" /> : 'PLACE BET'}</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ height: '50px' }} onClick={handleClearBets} disabled={spinning}><Trash2 size={18} /></button>
            <button className="btn btn-secondary" style={{ height: '50px' }} onClick={() => { if (spinning || betHistory.length === 0) return; setCurrentBets(betHistory[betHistory.length-1]); setBetHistory(betHistory.slice(0, -1)); }} disabled={spinning}><Undo2 size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
