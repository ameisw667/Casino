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

import Image from 'next/image';
import Link from 'next/link';

export default function VaultPage() {
  const { achievements, level, rank, rakebackPool, inventory, claimRakeback, openCase, isMobile } = useCasinoStore();
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Breadcrumbs */}
      <nav style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '12px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-white transition-colors">HOME</Link>
        <span>/</span>
        <span style={{ color: 'hsl(var(--primary))' }}>VAULT</span>
      </nav>

      {/* Header Stats */}
      <section className="glass" style={{ 
        borderRadius: '32px', 
        padding: isMobile ? '40px 24px' : '60px', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        gap: isMobile ? '32px' : '40px',
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid hsla(0,0%,100%,0.05)',
        marginTop: isMobile ? '10px' : '0'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/vault-hero.png" 
            alt="Vault Hero" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.4 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsl(var(--bg-color)) 100%), linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)'
              : 'linear-gradient(to right, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1, textAlign: isMobile ? 'center' : 'left', width: isMobile ? '100%' : 'auto' }}>
          <h1 style={{ fontSize: isMobile ? '2.5rem' : '4rem', fontFamily: "'Outfit', sans-serif", fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>THE <br /> REWARD HUB</h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: isMobile ? '1rem' : '1.2rem', maxWidth: '500px' }}>Your home for rakeback and legendary achievements.</p>
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '24px' : '40px', position: 'relative', zIndex: 1, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>{unlockedCount}/{totalCount}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Unlocked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 900, color: 'hsl(var(--accent))' }}>{level}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Level</div>
          </div>
        </div>
      </section>

      {/* Rewards Row (Rakeback & Cases) */}
      <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '32px' }}>
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
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid hsla(var(--accent), 0.2)', position: 'relative', minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'hsla(var(--accent), 0.1)', color: 'hsl(var(--accent))', borderRadius: '16px' }}>
              <Gift size={32} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Loot-Box Inventory</h2>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Earn cases by leveling up or completing missions.</p>
            </div>
          </div>

          <div style={{ 
            flex: 1,
            background: 'hsla(0,0%,100%,0.02)', 
            borderRadius: '24px', 
            border: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            margin: '12px 0'
          }}>
            {animationPhase === 'idle' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: 900 }}>{inventory.cases}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>CASES READY</div>
              </div>
            )}

            {animationPhase === 'spinning' && (
              <div style={{ textAlign: 'center' }}>
                <div className="animate-spin" style={{ marginBottom: '16px' }}>
                  <Gift size={64} color="hsl(var(--primary))" />
                </div>
                <div style={{ fontWeight: 800, letterSpacing: '0.2em' }} className="animate-pulse">OPENING...</div>
              </div>
            )}

            {animationPhase === 'reveal' && reward && (
              <div className="animate-slide-up" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'hsl(var(--primary))', marginBottom: '8px' }}>YOU UNLOCKED</div>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', textShadow: '0 0 30px hsla(var(--primary), 0.5)' }}>
                  {reward.type === 'balance' ? '$' : '+'}{reward.reward}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>{reward.type.toUpperCase()}</div>
              </div>
            )}
          </div>

          <button 
            disabled={inventory.cases <= 0 || opening}
            onClick={handleOpenCase}
            className="btn btn-primary" 
            style={{ height: '64px', borderRadius: '16px', fontSize: '1.1rem' }}
          >
            {opening ? 'PLEASE WAIT...' : 'OPEN LOOT-BOX'}
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

      {/* Global Progress Header */}
      <section className="glass" style={{ padding: '32px 48px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid hsla(var(--primary), 0.1)' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>BADGE GALLERY</h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>Collect all legendary badges to unlock the Diamond Case.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Completion</div>
          </div>
          <div style={{ width: '200px', height: '12px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`, height: '100%', background: 'hsl(var(--primary))', boxShadow: '0 0 15px hsla(var(--primary), 0.5)' }} />
          </div>
        </div>
      </section>

      {/* Achievement Grid */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: isMobile ? '16px' : '24px' }}>
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
                      borderRadius: '4px',
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
