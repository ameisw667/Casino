'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MobileNav from './MobileNav';
import DailyRewardModal from '@/components/casino/DailyRewardModal';
import ChallengesModal from '@/components/casino/ChallengesModal';
import BigWinOverlay from '@/components/casino/BigWinOverlay';
import WalletModal from '@/components/casino/WalletModal';
import SettingsModal from '@/components/casino/SettingsModal';
import RankBenefitsModal from '@/components/casino/RankBenefitsModal';
import PlayerProfileModal from '@/components/casino/PlayerProfileModal';
import { useCasinoStore } from '@/store/useCasinoStore';
import { 
  Home, 
  Gamepad2, 
  History, 
  Trophy, 
  Wallet, 
  User, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Gift,
  Star,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info as InfoIcon,
  X,
  ShieldCheck,
  Crown
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [bigWin, setBigWin] = useState<{amount: number, multiplier: number} | null>(null);
  const [dailyReward, setDailyReward] = useState<number | null>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { balance, level, xp, rank, achievements, streak, claimDailyReward, bets, toasts, removeToast, addToast, isMobile, setIsMobile } = useCasinoStore();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);

  // Theme application (Locked to Gold)
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', '45 100% 50%');  // Gold
    root.style.setProperty('--accent', '0 0% 100%');     // White
    root.style.setProperty('--bg-color', '0 0% 2%');     // Pure Black
  }, []);

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
    localStorage.setItem('last_known_level', level.toString());
  }, [level]);

  // Achievement unlock detection
  React.useEffect(() => {
    const newlyUnlocked = achievements.find(a => a.unlocked && !localStorage.getItem(`ach_notified_${a.id}`));
    if (newlyUnlocked) {
      setUnlockedAchievement(newlyUnlocked);
      localStorage.setItem(`ach_notified_${newlyUnlocked.id}`, 'true');
      
      const timer = setTimeout(() => setUnlockedAchievement(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [achievements]);

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
    { icon: <Settings size={20} />, label: 'Settings', path: '#', onClick: () => setShowSettings(true) },
  ];

  return (
    <div className="theme-gold" style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--bg-color))', overflow: 'hidden', position: 'relative' }}>
      {/* Global Live Ticker */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '32px', 
        background: 'black', 
        borderBottom: '1px solid hsla(var(--primary), 0.2)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <div className="ticker-track" style={{ display: 'flex', whiteSpace: 'nowrap', gap: '40px', padding: '0 20px' }}>
          {[
            { user: 'Bochmann88', action: 'withdrew', amount: '$182.00', via: 'PayPal' },
            { user: 'Neon_Sniper', action: 'claimed', amount: '$5.00', via: 'Daily Ladder' },
            { user: 'CryptoKing', action: 'withdrew', amount: '$1,200.00', via: 'Bitcoin' },
            { user: 'SarahSlot', action: 'won', amount: '$450.00', via: 'Crash' },
            { user: 'VibeGamer', action: 'claimed', amount: '$10.00', via: 'Quest' },
            { user: 'LazyJoe', action: 'withdrew', amount: '$25.00', via: 'Litecoin' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>{item.user}</span>
              <span style={{ color: '#fff' }}>{item.action}</span>
              <span style={{ color: 'hsl(var(--primary))' }}>{item.amount}</span>
              <span style={{ color: 'hsl(var(--text-dim))' }}>via {item.via}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            { user: 'Bochmann88', action: 'withdrew', amount: '$182.00', via: 'PayPal' },
            { user: 'Neon_Sniper', action: 'claimed', amount: '$5.00', via: 'Daily Ladder' },
            { user: 'CryptoKing', action: 'withdrew', amount: '$1,200.00', via: 'Bitcoin' },
          ].map((item, i) => (
            <div key={`d-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 700 }}>
              <span style={{ color: 'hsl(var(--text-muted))' }}>{item.user}</span>
              <span style={{ color: '#fff' }}>{item.action}</span>
              <span style={{ color: 'hsl(var(--primary))' }}>{item.amount}</span>
              <span style={{ color: 'hsl(var(--text-dim))' }}>via {item.via}</span>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            animation: ticker 30s linear infinite;
          }
        `}</style>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} 
        />
      )}

      {/* Sidebar (Responsive) */}
      <aside className="glass" style={{ 
        width: isMobile ? (mobileSidebarOpen ? '280px' : '0px') : (sidebarOpen ? '240px' : '80px'), 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--glass-border)',
        zIndex: 150,
        height: 'calc(100vh - 32px)',
        position: isMobile ? 'fixed' : 'sticky',
        left: 0,
        top: '32px',
        overflow: 'hidden',
        background: 'hsl(var(--bg-color))'
      }}>
        <Link href="/" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'black',
            boxShadow: '0 0 20px hsla(var(--primary), 0.3)',
            flexShrink: 0
          }}>
            <Crown size={24} fill="currentColor" />
          </div>
          {sidebarOpen && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-1px', lineHeight: 1 }}>CASINO</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'hsl(var(--primary))', color: 'black', padding: '1px 4px', borderRadius: '3px', transform: 'translateY(-2px)' }}>PRO</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: '0.65rem', color: 'hsl(var(--primary))', letterSpacing: '0.2em', marginTop: '2px' }}>ROYALE</span>
            </div>
          )}
        </Link>

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

        {!isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost" 
            style={{ margin: '12px', justifyContent: 'center' }}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Topbar */}
        <header className="glass" style={{ 
          height: isMobile ? '64px' : '72px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: isMobile ? '0 16px' : '0 24px',
          borderBottom: '1px solid var(--glass-border)',
          flexShrink: 0,
          position: 'sticky',
          top: '32px',
          zIndex: 40,
          background: 'hsla(var(--bg-color), 0.8)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            {isMobile && (
              <button 
                onClick={() => setMobileSidebarOpen(true)}
                className="btn btn-ghost" 
                style={{ padding: '8px' }}
              >
                <div style={{ width: '20px', height: '2px', background: 'currentColor', boxShadow: '0 6px 0 currentColor, 0 -6px 0 currentColor' }} />
              </button>
            )}
            <button 
              onClick={() => setShowRankInfo(true)}
              className="glass-card" 
              style={{ padding: '6px 12px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid hsla(var(--primary), 0.2)', cursor: 'pointer', background: 'hsla(var(--primary), 0.05)' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {!isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={10} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>{rank}</span>
                  </div>
                )}
                <span style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: 'hsl(var(--text-main))', fontWeight: 700 }}>LVL {level}</span>
              </div>
              {!isMobile && (
                <div style={{ width: '80px', height: '4px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
              )}
            </button>

            {!isMobile && (
              <button onClick={handleClaimDaily} className="btn btn-secondary" style={{ padding: '8px 16px', gap: '8px', color: 'hsl(var(--accent))', borderColor: 'hsla(var(--accent), 0.2)' }}>
                <Gift size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>DAILY</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            <div className="glass-card" style={{ padding: isMobile ? '6px 10px' : '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={isMobile ? 14 : 16} color="hsl(var(--primary))" />
                  <span className="mono" style={{ fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem' }}>${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {!isMobile && (
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px', opacity: 0.8 }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--success))' }}>INSTANT CASHOUT</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', background: '#0070ba', borderRadius: '2px', fontSize: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>P</div>
                      <div style={{ width: '10px', height: '10px', background: '#f7931a', borderRadius: '2px', fontSize: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>B</div>
                    </div>
                  </div>
                )}
              </div>
              {!isMobile && <button onClick={() => setShowWallet(true)} className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 800 }}>Deposit</button>}
            </div>
            
            {!isMobile && (
              <button 
                onClick={() => setShowProfile(true)}
                className="btn btn-ghost" 
                style={{ padding: '8px' }}
              >
                <User size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'auto', paddingBottom: isMobile ? '100px' : '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>

          {/* Professional Footer */}
          <footer style={{ 
            marginTop: '80px', 
            padding: '60px 0 40px', 
            borderTop: '1px solid var(--glass-border)',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
            gap: '40px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' 
                }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-1px' }}>CASINO ROYALE</span>
              </div>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.6 }}>
                Experience the world's most advanced provably fair gaming platform. Built for the future of decentralized entertainment.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                {['Twitter', 'Discord', 'Telegram'].map(s => (
                  <button key={s} className="btn btn-ghost" style={{ padding: '8px', fontSize: '0.8rem' }}>{s}</button>
                ))}
              </div>
            </div>

            {!isMobile && (
              <>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.75rem', color: 'hsl(var(--text-muted))', letterSpacing: '0.1em', marginBottom: '20px' }}>PLATFORM</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link href="/games" style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textDecoration: 'none' }}>All Games</Link>
                    <Link href="/fairness" style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textDecoration: 'none' }}>Provably Fair</Link>
                    <Link href="/leaderboard" style={{ color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textDecoration: 'none' }}>Leaderboards</Link>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.75rem', color: 'hsl(var(--text-muted))', letterSpacing: '0.1em', marginBottom: '20px' }}>SUPPORT</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', padding: 0, color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>Help Center</button>
                    <button style={{ background: 'none', border: 'none', padding: 0, color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>API Docs</button>
                    <button style={{ background: 'none', border: 'none', padding: 0, color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>Security</button>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.75rem', color: 'hsl(var(--text-muted))', letterSpacing: '0.1em', marginBottom: '20px' }}>LEGAL</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button style={{ background: 'none', border: 'none', padding: 0, color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>Privacy Policy</button>
                    <button style={{ background: 'none', border: 'none', padding: 0, color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>Terms of Service</button>
                    <button style={{ background: 'none', border: 'none', padding: 0, color: 'hsl(var(--text-dim))', fontSize: '0.9rem', textAlign: 'left', cursor: 'pointer' }}>AML Policy</button>
                  </div>
                </div>
              </>
            )}
          </footer>
          
          <div style={{ 
            padding: '24px 0', 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center',
            borderTop: '1px solid hsla(0,0%,100%,0.03)',
            fontSize: '0.8rem',
            color: 'hsl(var(--text-dim))',
            gap: '16px'
          }}>
            <div>© 2026 CASINO ROYALE. ALL RIGHTS RESERVED.</div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span>18+ RESPONSIBLE GAMING</span>
              <span>CERTIFIED PROVABLY FAIR</span>
            </div>
          </div>
        </div>

        {/* Achievement Toast */}
        {unlockedAchievement && (
          <div className="glass animate-slide-up" style={{ 
            position: 'fixed', 
            bottom: isMobile ? '80px' : '40px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: isMobile ? 'calc(100% - 32px)' : 'min(90vw, 450px)',
            padding: isMobile ? '16px' : '24px 40px',
            borderRadius: '24px',
            zIndex: 6000,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '24px',
            background: 'hsla(var(--bg-color), 0.9)',
            border: '2px solid hsl(var(--primary))',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              width: isMobile ? '50px' : '60px', 
              height: isMobile ? '50px' : '60px', 
              borderRadius: '14px', 
              background: 'hsla(var(--primary), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--primary))',
              flexShrink: 0
            }}>
              <Star size={isMobile ? 24 : 32} fill="currentColor" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Achievement Unlocked</div>
              <div style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{unlockedAchievement.title}</div>
              <div style={{ fontSize: isMobile ? '0.75rem' : '0.9rem', color: 'hsl(var(--text-muted))' }}>{unlockedAchievement.description}</div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

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

      {/* New Interactive Modals */}
      <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <RankBenefitsModal isOpen={showRankInfo} onClose={() => setShowRankInfo(false)} />
      <PlayerProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />

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
      <div style={{ 
        position: 'fixed', 
        top: isMobile ? '80px' : '88px', 
        right: isMobile ? '50%' : '24px', 
        transform: isMobile ? 'translateX(50%)' : 'none',
        width: isMobile ? 'min(90vw, 350px)' : 'auto',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        zIndex: 10000, 
        pointerEvents: 'none' 
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="glass animate-slide-in-right" style={{ 
            padding: isMobile ? '12px 16px' : '16px 20px', 
            borderRadius: '16px', 
            minWidth: isMobile ? '0' : '300px',
            width: '100%',
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
