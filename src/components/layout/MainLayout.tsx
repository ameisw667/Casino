'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import DailyRewardModal from '@/components/casino/DailyRewardModal';
import ChallengesModal from '@/components/casino/ChallengesModal';
import BigWinOverlay from '@/components/casino/BigWinOverlay';
import { useCasinoStore } from '@/store/useCasinoStore';
import { 
  Home, 
  Gamepad2, 
  History, 
  Trophy, 
  Wallet, 
  User, 
  Settings, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CircleDollarSign,
  Gift,
  Star,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info as InfoIcon,
  X,
  ShieldCheck
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [bigWin, setBigWin] = useState<{amount: number, multiplier: number} | null>(null);
  const [dailyReward, setDailyReward] = useState<number | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const { balance, level, xp, rank, achievements, streak, claimDailyReward, addChatMessage, triggerTrivia, bets, theme, toasts, removeToast, addToast } = useCasinoStore();

  // Theme application
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'neon') {
      root.style.setProperty('--primary', '320 100% 60%'); // Neon Pink
      root.style.setProperty('--accent', '180 100% 50%');   // Cyan
      root.style.setProperty('--bg-color', '260 30% 5%');  // Deep Purple Black
    } else if (theme === 'gold') {
      root.style.setProperty('--primary', '45 100% 50%');  // Gold
      root.style.setProperty('--accent', '0 0% 100%');     // White
      root.style.setProperty('--bg-color', '0 0% 2%');     // Pure Black
    } else {
      // Default
      root.style.setProperty('--primary', '262 80% 50%');
      root.style.setProperty('--accent', '262 80% 50%');
      root.style.setProperty('--bg-color', '240 10% 4%');
    }
  }, [theme]);

  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);

  // Big Win detection
  React.useEffect(() => {
    const latestBet = bets[0];
    if (latestBet && latestBet.win) {
      const multiplier = latestBet.payout / latestBet.amount;
      if (multiplier >= 20 || latestBet.payout >= 500) {
        // Prevent double trigger for the same bet
        const lastNotified = localStorage.getItem('last_big_win_bet');
        if (lastNotified !== latestBet.id) {
          setBigWin({ amount: latestBet.payout, multiplier });
          localStorage.setItem('last_big_win_bet', latestBet.id);
        }
      }
    }
  }, [bets]);

  // Level up detection
  React.useEffect(() => {
    const prevLevel = localStorage.getItem('last_known_level');
    if (prevLevel && parseInt(prevLevel) < level) {
      addChatMessage({
        user: 'System',
        text: `🚀 Level Up! You've reached Level ${level} and are now rank ${rank}!`,
        vipTier: 100
      });
    }
    localStorage.setItem('last_known_level', level.toString());
  }, [level, rank, addChatMessage]);

  // Achievement unlock detection
  React.useEffect(() => {
    const newlyUnlocked = achievements.find(a => a.unlocked && !localStorage.getItem(`ach_notified_${a.id}`));
    if (newlyUnlocked) {
      setUnlockedAchievement(newlyUnlocked);
      localStorage.setItem(`ach_notified_${newlyUnlocked.id}`, 'true');
      
      addChatMessage({
        user: 'System',
        text: `🏆 Achievement Unlocked: ${newlyUnlocked.title}!`,
        vipTier: 100
      });

      const timer = setTimeout(() => setUnlockedAchievement(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [achievements, addChatMessage]);

  // Trivia Bot Interval
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 2 minutes
        triggerTrivia();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [triggerTrivia]);

  // Automated Rain Events
  React.useEffect(() => {
    const triggerRain = () => {
      const amount = Math.floor(Math.random() * 200) + 50;
      useCasinoStore.getState().triggerRain(amount);
      
      // Schedule next rain (between 30 and 60 minutes)
      const nextRain = (Math.random() * 30 + 30) * 60000;
      setTimeout(triggerRain, nextRain);
    };

    const initialTimer = setTimeout(triggerRain, 15 * 60000); // First rain after 15 mins
    return () => clearTimeout(initialTimer);
  }, []);

  const [showLevelUp, setShowLevelUp] = useState<number | null>(null);

  useEffect(() => {
    const handleLevelUp = (e: any) => {
      setShowLevelUp(e.detail.level);
      setTimeout(() => setShowLevelUp(null), 6000);
    };
    window.addEventListener('level-up', handleLevelUp);
    return () => window.removeEventListener('level-up', handleLevelUp);
  }, []);

  const handleClaimDaily = () => {
    const reward = claimDailyReward();
    if (reward) {
      setDailyReward(reward);
      setShowDailyModal(true);
      addToast(`Claimed $${reward} daily reward!`, 'success');
      
      addChatMessage({
        user: 'System',
        text: `🎁 You've claimed your daily reward of $${reward}! Come back tomorrow for more.`,
        vipTier: 100
      });
    } else {
      addToast('You already claimed your reward today!', 'error');
    }
  };

  const menuItems = [
    { icon: <Home size={20} />, label: 'Lobby', path: '/' },
    { icon: <Gamepad2 size={20} />, label: 'Games', path: '/games' },
    { icon: <History size={20} />, label: 'My Bets', path: '/history' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Target size={20} />, label: 'Vault', path: '/vault' },
    { icon: <Zap size={20} />, label: 'Challenges', path: '#', onClick: () => setShowChallengesModal(true) },
    { icon: <ShieldCheck size={20} />, label: 'Fairness', path: '/fairness' },
    { icon: <CircleDollarSign size={20} />, label: 'Affiliate', path: '/affiliate' },
  ];

  return (
    <div className={`theme-${theme}`} style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--bg-color))', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside className="glass" style={{ 
        width: sidebarOpen ? '240px' : '80px', 
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--glass-border)',
        zIndex: 50,
        height: '100vh',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' 
          }} />
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>CASINO</span>}
        </div>

        <nav style={{ flex: 1, padding: '12px' }}>
          {menuItems.map((item) => {
            const active = pathname === item.path;
            const content = (
              <>
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </>
            );

            if (item.onClick) {
              return (
                <button key={item.label} onClick={item.onClick} className="btn btn-ghost" style={{
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  width: '100%',
                  marginBottom: '4px',
                  color: 'hsl(var(--text-muted))',
                  padding: sidebarOpen ? '12px 16px' : '12px'
                }}>
                  {content}
                </button>
              );
            }

            return (
              <Link key={item.path} href={item.path} className="btn btn-ghost" style={{
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                width: '100%',
                marginBottom: '4px',
                color: active ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                background: active ? 'hsla(0, 0%, 100%, 0.05)' : 'transparent',
                padding: sidebarOpen ? '12px 16px' : '12px'
              }}>
                {content}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost" 
          style={{ margin: '12px', justifyContent: 'center' }}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Theme Switcher */}
        {sidebarOpen && (
          <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-muted))', letterSpacing: '0.1em', marginBottom: '12px', padding: '0 16px' }}>THEME</div>
            <div style={{ display: 'flex', gap: '8px', padding: '0 16px' }}>
              {['default', 'neon', 'gold'].map((t) => (
                <button 
                  key={t}
                  onClick={() => useCasinoStore.getState().setTheme(t as any)}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    border: theme === t ? '2px solid hsl(var(--primary))' : '1px solid var(--glass-border)',
                    background: t === 'neon' ? 'hsl(320 100% 60%)' : t === 'gold' ? 'hsl(45 100% 50%)' : 'hsl(262 80% 50%)',
                    cursor: 'pointer',
                    padding: '0'
                  }}
                  title={t.toUpperCase()}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Topbar */}
        <header className="glass" style={{ 
          height: '72px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 24px',
          borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid hsla(var(--primary), 0.2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={12} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>{rank}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-main))', fontWeight: 700 }}>Level {level}</span>
              </div>
              <div style={{ width: '120px', height: '6px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', width: '50px', animation: 'shimmer 2s infinite' }} />
              </div>
            </div>

            <button onClick={handleClaimDaily} className="btn btn-secondary" style={{ padding: '8px 16px', gap: '8px', color: 'hsl(var(--accent))', borderColor: 'hsla(var(--accent), 0.2)' }}>
              <Gift size={18} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>DAILY</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Wallet size={18} color="hsl(var(--primary))" />
              <span className="mono" style={{ fontWeight: 700 }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Deposit</button>
            </div>
            
            <div className="btn btn-ghost" style={{ padding: '8px' }}>
              <User size={20} />
            </div>

            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="btn btn-ghost" 
              style={{ padding: '8px', color: chatOpen ? 'hsl(var(--primary))' : 'inherit' }}
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Achievement Toast */}
        {unlockedAchievement && (
          <div className="glass animate-slide-up" style={{ 
            position: 'fixed', 
            bottom: '40px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            padding: '24px 40px',
            borderRadius: '24px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            background: 'hsla(var(--bg-color), 0.8)',
            border: '2px solid hsl(var(--primary))',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            minWidth: '400px'
          }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '16px', 
              background: 'hsla(var(--primary), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--primary))'
            }}>
              <Star size={32} fill="currentColor" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Achievement Unlocked</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{unlockedAchievement.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>{unlockedAchievement.description}</div>
            </div>
          </div>
        )}
      </main>

      {/* Chat Sidebar */}
      {chatOpen && (
        <aside className="glass" style={{ 
          width: '320px', 
          borderLeft: '1px solid var(--glass-border)',
          height: '100vh',
          position: 'sticky',
          top: 0
        }}>
          <ChatSidebar />
        </aside>
      )}

      {/* Daily Reward Modal */}
      <DailyRewardModal 
        isOpen={showDailyModal} 
        onClose={() => setShowDailyModal(false)} 
        rewardAmount={dailyReward} 
        streak={streak} 
      />

      {/* Challenges Modal */}
      <ChallengesModal 
        isOpen={showChallengesModal} 
        onClose={() => setShowChallengesModal(false)} 
      />

      {/* Big Win Overlay */}
      {bigWin && (
        <BigWinOverlay 
          amount={bigWin.amount} 
          multiplier={bigWin.multiplier} 
          isOpen={!!bigWin} 
          onClose={() => setBigWin(null)} 
        />
      )}
      {/* Level Up Celebration */}
      {showLevelUp && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)'
        }}>
          <div className="animate-slide-up" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '40px' }}>
              <Star size={160} color="hsl(var(--primary))" fill="hsla(var(--primary), 0.1)" className="animate-pulse" />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '4rem',
                fontWeight: 900,
                color: 'hsl(var(--primary))',
                textShadow: '0 0 20px hsla(var(--primary), 0.5)'
              }}>
                {showLevelUp}
              </div>
            </div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em', marginBottom: '12px' }}>LEVEL UP!</h2>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', marginBottom: '40px' }}>You've reached a new milestone on your journey.</p>
            
            <div className="glass" style={{ padding: '24px 48px', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', gap: '16px', border: '1px solid hsla(var(--success), 0.3)' }}>
              <Gift size={32} color="hsl(var(--success))" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>REWARD UNLOCKED</div>
                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>1x Premium Loot-Box added to Vault</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div style={{ position: 'fixed', top: '88px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10000, pointerEvents: 'none' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="glass animate-slide-in-right" style={{ 
            padding: '16px 20px', 
            borderRadius: '16px', 
            minWidth: '300px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: toast.type === 'error' ? 'hsla(var(--error), 0.15)' : toast.type === 'success' ? 'hsla(var(--success), 0.15)' : 'hsla(var(--bg-color), 0.8)',
            border: `1px solid ${toast.type === 'error' ? 'hsl(var(--error))' : toast.type === 'success' ? 'hsl(var(--success))' : 'var(--glass-border)'}`,
            backdropFilter: 'blur(10px)',
            pointerEvents: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            {toast.type === 'success' && <CheckCircle2 size={20} color="hsl(var(--success))" />}
            {toast.type === 'error' && <AlertCircle size={20} color="hsl(var(--error))" />}
            {(toast.type === 'info' || !toast.type) && <InfoIcon size={20} color="hsl(var(--primary))" />}
            {toast.type === 'win' && <Trophy size={20} color="hsl(var(--primary))" />}
            
            <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</div>
            
            <button onClick={() => removeToast(toast.id)} style={{ color: 'hsl(var(--text-muted))', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
