'use client';

import React, { useState } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useRouter } from 'next/navigation';
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Star, 
  Zap, 
  Target, 
  Flame, 
  Rocket, 
  TrendingUp, 
  Gift, 
  Wallet, 
  ArrowUpRight, 
  ShieldCheck,
  ChevronRight,
  Users,
  Copy,
  Info,
  Calendar,
  Settings,
  Bell,
  Globe,
  Camera,
  Activity,
  Award,
  CircleDollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function VaultPage() {
  const { 
    balance, 
    xp, 
    level, 
    rank, 
    achievements, 
    rakebackPool, 
    inventory, 
    claimRakeback, 
    openCase, 
    isMobile,
    streak,
    onboardingStep,
    setOnboardingStep,
    addToast
  } = useCasinoStore();

  const router = useRouter();

  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<{reward: number, type: 'balance' | 'xp'} | null>(null);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'spinning' | 'reveal'>('idle');

  // Progress Calculation
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);

  // 4. Auto-trigger Case Opening for Onboarding
  React.useEffect(() => {
    if (onboardingStep === 'OPEN_CASE' && inventory.cases > 0 && !opening) {
      setTimeout(() => {
        handleOpenCase();
      }, 1000);
    }
  }, [onboardingStep]);

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
        setOpening(false);
        setAnimationPhase('idle');
      }
    }, 3000);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px 120px' }}>
      
      {/* Header Profile Dashboard */}
      <header style={{ 
        marginTop: '20px',
        padding: isMobile ? '32px 20px' : '48px',
        borderRadius: '32px',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.05))',
        border: '1px solid hsla(var(--primary), 0.2)',
        position: 'relative'
      }}>
        {/* Pro Badge */}
        <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 16px', background: 'hsl(var(--primary))', color: 'black', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 950, boxShadow: '0 0 20px hsla(var(--primary), 0.4)' }}>
          PRO ROYALE MEMBER
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '48px', alignItems: 'center' }}>
          {/* Avatar & XP Hub */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{ width: '220px', height: '220px', margin: '0 auto', position: 'relative' }}>
              {/* Circular Progress */}
              <svg width="220" height="220" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
                <circle cx="50" cy="50" r="46" fill="none" stroke="hsla(0,0%,100%,0.05)" strokeWidth="4" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray={`${progress * 2.89} 289`} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              
              {/* Avatar Image */}
              <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', overflow: 'hidden', border: '4px solid hsl(var(--bg-color))', background: 'hsla(0,0%,100%,0.02)' }}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vibe" alt="avatar" style={{ width: '100%', height: '100%' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="hover:bg-black/80 transition-colors">
                  <Camera size={16} color="white" />
                </div>
              </div>

              {/* Level Badge */}
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '48px', height: '48px', borderRadius: '16px', background: 'hsl(var(--primary))', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: '1.2rem', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', border: '4px solid hsl(var(--bg-color))' }}>
                {level}
              </div>
            </div>
            
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>VibeCoder_Royale</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--primary))', marginTop: '4px' }}>GLOBAL RANK: #4,124</div>
            </div>
          </div>

          {/* User Stats Dashboard */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--success))', fontSize: '0.85rem', fontWeight: 800 }}>
                  <ShieldCheck size={18} /> VERIFIED
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff5722', fontSize: '0.85rem', fontWeight: 800 }}>
                  <Flame size={18} /> {streak} DAY STREAK
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2196f3', fontSize: '0.85rem', fontWeight: 800 }}>
                  <Users size={18} /> 12 REFS
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ width: '48px', height: '48px', padding: 0 }}><Settings size={20} /></button>
                <button className="btn btn-primary" style={{ padding: '0 24px', height: '48px', borderRadius: '14px', fontWeight: 900 }}>WITHDRAW</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'TOTAL BALANCE', value: `$${balance.toLocaleString()}`, color: 'hsl(var(--primary))', icon: Wallet },
                { label: 'RAKEBACK', value: `$${rakebackPool.toFixed(2)}`, color: 'hsl(var(--success))', icon: TrendingUp },
                { label: 'TOTAL EARNED', value: '$12,420', color: '#fff', icon: CircleDollarSign },
                { label: 'WAGERED', value: '$45,820', color: '#fff', icon: Activity },
              ].map((s, i) => (
                <div key={i} className="glass" style={{ padding: '20px', borderRadius: '20px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <s.icon size={14} color="hsl(var(--text-dim))" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.1em' }}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '32px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Level Roadmap */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingUp color="hsl(var(--primary))" /> LEVEL REWARDS ROADMAP
            </h3>
            <div style={{ position: 'relative', padding: '20px 0' }}>
              <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '2px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {[level, level+1, level+2, level+3, level+4].map((l, i) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      background: i === 0 ? 'hsl(var(--primary))' : 'hsl(var(--bg-color))', 
                      border: `2px solid ${i === 0 ? 'white' : 'hsla(0,0%,100%,0.1)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: i === 0 ? 'black' : 'white',
                      fontWeight: 900,
                      margin: '0 auto 12px'
                    }}>
                      {l}
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: i === 0 ? 'white' : 'hsl(var(--text-dim))' }}>
                      {i === 0 ? 'CURRENT' : i === 4 ? '$100 CASE' : '+1% RB'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Actions & Inventory */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gift size={18} color="hsl(var(--primary))" /> INVENTORY
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{inventory.cases}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>CASES</div>
                  <button onClick={handleOpenCase} disabled={inventory.cases === 0} className="btn btn-primary" style={{ width: '100%', height: '32px', marginTop: '12px', fontSize: '0.7rem', padding: 0 }}>OPEN</button>
                </div>
                <div style={{ padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center', opacity: 0.4 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>0</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>BOOSTS</div>
                  <button disabled className="btn btn-secondary" style={{ width: '100%', height: '32px', marginTop: '12px', fontSize: '0.7rem', padding: 0 }}>USE</button>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="hsl(var(--success))" /> SECURITY
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>2FA Status</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--error))' }}>DISABLED</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Support ID</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-muted))' }}>#RY-8291</div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Showroom */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award color="hsl(var(--primary))" /> ACHIEVEMENT SHOWROOM
              </h3>
              <Link href="/history" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))', textDecoration: 'none' }}>VIEW ALL</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {achievements.slice(0, 3).map((ach) => (
                <div key={ach.id} style={{ padding: '24px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '24px', border: '1px solid hsla(0,0%,100%,0.05)', textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{ach.unlocked ? '🏆' : '🔒'}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>{ach.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '4px' }}>{ach.description}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Earnings Analytics */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>7-DAY ANALYTICS</h3>
            <div style={{ height: '120px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0' }}>
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? 'hsl(var(--primary))' : 'hsla(var(--primary), 0.2)', borderRadius: '4px', position: 'relative' }}>
                  {i === 6 && <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', fontWeight: 900 }}>$142</div>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>
              <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
          </section>

          {/* Quick Withdrawal Hub */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>QUICK CASHOUT</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { name: 'PayPal', color: '#0070ba', label: 'P' },
                { name: 'Bitcoin', color: '#f7931a', label: 'B' },
              ].map(m => (
                <button key={m.name} className="btn btn-secondary" style={{ height: '70px', flexDirection: 'column', gap: '6px', borderRadius: '16px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '10px' }}>{m.label}</div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>{m.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Settings & Preferences */}
          <section className="glass-card" style={{ padding: '32px', borderRadius: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '24px' }}>PREFERENCES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe size={18} color="hsl(var(--text-dim))" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Language</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>ENGLISH</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Bell size={18} color="hsl(var(--text-dim))" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                </div>
                <div style={{ width: '36px', height: '20px', background: 'hsl(var(--primary))', borderRadius: '10px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: '2px', top: '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%' }} />
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>

      {/* Opening Animation Overlay */}
      {opening && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            {animationPhase === 'spinning' ? (
              <>
                <div className="animate-bounce" style={{ marginBottom: '40px' }}>
                  <Gift size={120} color="hsl(var(--primary))" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '0.3em' }} className="animate-pulse">OPENING CASE...</h2>
              </>
            ) : reward && (
              <div className="animate-slide-up">
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'hsl(var(--primary))', marginBottom: '16px' }}>CONGRATULATIONS!</div>
                <div style={{ fontSize: '6rem', fontWeight: 950, color: '#fff', textShadow: '0 0 50px hsla(var(--primary), 0.5)' }}>
                  {reward.type === 'balance' ? '$' : '+'}{reward.reward}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'hsl(var(--text-muted))' }}>{reward.type.toUpperCase()} ADDED</div>
                <button 
                  onClick={() => {
                    setOnboardingStep('COMPLETED');
                    router.push('/games/crash');
                    addToast('Good luck! Your $10.00 is ready to be multiplied.', 'success');
                  }}
                  className="btn btn-primary" 
                  style={{ marginTop: '40px', height: '64px', padding: '0 40px', borderRadius: '16px', fontWeight: 950, fontSize: '1.2rem' }}
                >
                  START PLAYING CRASH <Rocket size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
