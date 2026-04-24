'use client';

import React from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { Trophy, Lock, CheckCircle2, Star, Zap, Target, Flame, Rocket, TrendingUp, Gift } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  '🎯': <Target size={32} />,
  '🐋': <Zap size={32} />,
  '🔥': <Flame size={32} />,
  '🚀': <Rocket size={32} />,
};

export default function VaultPage() {
  const { achievements, level, rank, rakebackPool, inventory, claimRakeback, openCase } = useCasinoStore();
  const [opening, setOpening] = React.useState(false);
  const [reward, setReward] = React.useState<{reward: number, type: 'balance' | 'xp'} | null>(null);
  const [animationPhase, setAnimationPhase] = React.useState<'idle' | 'spinning' | 'reveal'>('idle');

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const handleOpenCase = () => {
    setOpening(true);
    setAnimationPhase('spinning');
    setReward(null);
    
    setTimeout(() => {
      try {
        const result = openCase();
        setReward(result);
        setAnimationPhase('reveal');
        
        setTimeout(() => {
          setOpening(false);
          setAnimationPhase('idle');
          setReward(null);
        }, 4000);
      } catch (e) {
        alert("No cases available!");
        setOpening(false);
        setAnimationPhase('idle');
      }
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {/* Header Stats */}
      <section className="glass" style={{ borderRadius: '32px', padding: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', background: 'hsla(var(--primary), 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1 style={{ fontSize: '4rem', fontFamily: "'Outfit', sans-serif", fontWeight: 900, letterSpacing: '-0.04em' }}>THE REWARD HUB</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '500px' }}>Your home for rakeback, loot-boxes, and your legendary achievements.</p>
        </div>

        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>{unlockedCount}/{totalCount}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Unlocked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'hsl(var(--accent))' }}>{level}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Level</div>
          </div>
        </div>
      </section>

      {/* Rewards Row (Rakeback & Cases) */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Rakeback Card */}
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid hsla(var(--primary), 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '16px' }}>
              <TrendingUp size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Rakeback Pool</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Earn while you wager. 1% of every bet back to you.</p>
            </div>
          </div>
          
          <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
            ${rakebackPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <button 
            disabled={rakebackPool <= 0}
            onClick={() => {
              const amount = claimRakeback();
              alert(`Claimed $${amount.toFixed(2)} rakeback!`);
            }}
            className="btn btn-primary" 
            style={{ height: '56px', borderRadius: '16px', fontSize: '1.1rem' }}
          >
            CLAIM RAKEBACK
          </button>
        </div>

        {/* Loot-Box Card */}
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid hsla(var(--accent), 0.2)', position: 'relative' }}>
          {opening && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px' }}>
              <div className="animate-pulse" style={{ textAlign: 'center' }}>
                <Rocket size={64} color="hsl(var(--accent))" style={{ marginBottom: '16px' }} />
                <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>OPENING CASE...</div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'hsla(var(--accent), 0.1)', color: 'hsl(var(--accent))', borderRadius: '16px' }}>
              <Gift size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Loot-Box Inventory</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Earn cases by leveling up or completing missions.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              {inventory.cases}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'hsl(var(--text-muted))', marginBottom: '12px' }}>CASES AVAILABLE</div>
          </div>

          {reward && (
            <div className="animate-slide-up" style={{ padding: '12px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '12px', textAlign: 'center', fontWeight: 800 }}>
              WIN: {reward.type === 'balance' ? '$' : '+'}{reward.reward} {reward.type.toUpperCase()}!
            </div>
          )}

          <button 
            disabled={inventory.cases <= 0 || opening}
            onClick={handleOpenCase}
            className="btn btn-secondary" 
            style={{ height: '56px', borderRadius: '16px', fontSize: '1.1rem', background: 'hsla(var(--accent), 0.1)', borderColor: 'hsla(var(--accent), 0.2)', color: 'hsl(var(--accent))' }}
          >
            OPEN CASE
          </button>
        </div>
      </section>

      {/* Ranks Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
        {['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((r) => {
          const isCurrent = r === rank;
          return (
            <div key={r} className="glass-card" style={{ 
              padding: '24px', 
              textAlign: 'center', 
              opacity: isCurrent ? 1 : 0.5,
              border: isCurrent ? '2px solid hsl(var(--primary))' : '1px solid hsla(0, 0%, 100%, 0.05)',
              transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}>
              <Star size={24} fill={isCurrent ? 'hsl(var(--primary))' : 'transparent'} color={isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'} style={{ marginBottom: '12px' }} />
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{r}</div>
              {isCurrent && <div style={{ fontSize: '0.7rem', color: 'hsl(var(--primary))', fontWeight: 700, marginTop: '4px' }}>CURRENT RANK</div>}
            </div>
          );
        })}
      </section>

      {/* Achievement Grid */}
      <section>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '32px', fontFamily: "'Outfit', sans-serif" }}>ACHIEVEMENTS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {achievements.map((ach) => {
            const progressPercent = (ach.progress / ach.total) * 100;
            
            return (
              <div key={ach.id} className="glass-card" style={{ 
                padding: '32px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                opacity: ach.unlocked ? 1 : 0.8,
                position: 'relative'
              }}>
                {!ach.unlocked && <Lock size={16} style={{ position: 'absolute', top: '24px', right: '24px', color: 'hsl(var(--text-muted))' }} />}
                {ach.unlocked && <CheckCircle2 size={16} style={{ position: 'absolute', top: '24px', right: '24px', color: 'hsl(var(--success))' }} />}

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '16px', 
                    background: ach.unlocked ? 'hsla(var(--primary), 0.1)' : 'hsla(0, 0%, 100%, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ach.unlocked ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
                  }}>
                    {ICON_MAP[ach.icon] || <Trophy size={32} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{ach.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{ach.description}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                    <span style={{ color: ach.unlocked ? 'hsl(var(--success))' : 'hsl(var(--text-muted))' }}>
                      {ach.unlocked ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                    <span>{ach.progress}/{ach.total}</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${progressPercent}%`, 
                      height: '100%', 
                      background: ach.unlocked ? 'hsl(var(--success))' : 'hsl(var(--primary))', 
                      borderRa