'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';
import MobileNav from './MobileNav';
import LoadingOverlay from '@/components/casino/LoadingOverlay';
import { useCasinoStore } from '@/store/useCasinoStore';
import { CasinoLogger } from '@/lib/casino/logger';
import { getOrCreateSessionId } from '@/lib/casino/session';

import {
  Home,
  Gamepad2,
  History,
  Trophy,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Target,
  CheckCircle2,
  AlertCircle,
  Info as InfoIcon,
  X,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';

const BigWinOverlay = dynamic(() => import('../casino/BigWinOverlay'), { ssr: false });
const WalletModal = dynamic(() => import('../casino/WalletModal'), { ssr: false });
const SettingsModal = dynamic(() => import('../casino/SettingsModal'), { ssr: false });
const RankBenefitsModal = dynamic(() => import('../casino/RankBenefitsModal'), { ssr: false });
const PlayerProfileModal = dynamic(() => import('@/components/casino/PlayerProfileModal'), { ssr: false });
const GlobalChat = dynamic(() => import('@/components/social/GlobalChat').then(mod => mod.GlobalChat), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/navigation/CommandPalette').then(mod => mod.CommandPalette), { ssr: false });
export default function MainLayout({ children }: { children: React.ReactNode }) {
  type CasinoWindow = Window & { _stopCasinoBackground?: () => void };
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Navigation Handler with logging
  const navigate = (path: string) => {
    CasinoLogger.info('CasinoNav', `Navigating to: ${path}`);
    if (!path || path === '#') return;
    router.push(path);
    if (isMobile) setMobileSidebarOpen(false);
  };
  
  // 1. All State Hooks (Always called first, same order)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bigWin, setBigWin] = useState<{amount: number, multiplier: number} | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // 2. Auth & Store Hooks
  const { user, isLoaded: authLoaded, signOut } = useSupabaseSession();
  const [serverAuthUser, setServerAuthUser] = useState<boolean>(false);
  const isSignedIn = !!user;
  const effectiveIsSignedIn = isSignedIn || serverAuthUser;
  const displayName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Player';
  const balance = useCasinoStore(s => s.balance);
  const level = useCasinoStore(s => s.level);
  const xp = useCasinoStore(s => s.xp);
  const rank = useCasinoStore(s => s.rank);
  const bets = useCasinoStore(s => s.bets);
  const toasts = useCasinoStore(s => s.toasts);
  const removeToast = useCasinoStore(s => s.removeToast);
  const isMobile = useCasinoStore(s => s.isMobile);
  const setIsMobile = useCasinoStore(s => s.setIsMobile);
  const onboardingStep = useCasinoStore(s => s.onboardingStep);
  const setOnboardingStep = useCasinoStore(s => s.setOnboardingStep);
  const communityWagered = useCasinoStore(s => s.communityWagered);
  const communityGoal = useCasinoStore(s => s.communityGoal);
  const hideBalance = useCasinoStore(s => s.hideBalance);
  const hasHydrated = useCasinoStore(s => s._hasHydrated);
  const updateSettings = useCasinoStore(s => s.updateSettings);
  const loadVipConfig = useCasinoStore(s => s.loadVipConfig);
  const setSessionId = useCasinoStore(s => s.setSessionId);
  const migrateAnonymousSession = useCasinoStore(s => s.migrateAnonymousSession);
  const sessionId = useCasinoStore(s => s.sessionId);

  useEffect(() => {
    try {
      CasinoLogger.info('MainLayout', 'Rehydrating casino store...');
      useCasinoStore.persist.rehydrate();
      CasinoLogger.success('MainLayout', 'Store rehydrated successfully.');

      // Initialize anonymous session id and load dynamic VIP/Rank config
      const sessionId = getOrCreateSessionId();
      if (sessionId) {
        setSessionId(sessionId);
      }
      loadVipConfig();
    } catch (e) {
      CasinoLogger.error('MainLayout', 'Rehydration failed', e);
      useCasinoStore.getState().setHasHydrated(true);
    }
    const mountedTimer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(mountedTimer);
  }, [setSessionId, loadVipConfig]);

  // 3. All Effect Hooks (Always called, never conditional)
  useEffect(() => {
    if (authLoaded && effectiveIsSignedIn && onboardingStep !== 'NONE' && onboardingStep !== 'COMPLETED') {
      setOnboardingStep('COMPLETED');
    }
  }, [effectiveIsSignedIn, authLoaded, onboardingStep, setOnboardingStep]);

  // Migrate anonymous session progress into the authenticated account
  useEffect(() => {
    if (authLoaded && effectiveIsSignedIn && sessionId) {
      migrateAnonymousSession();
    }
  }, [authLoaded, effectiveIsSignedIn, sessionId, migrateAnonymousSession]);

  // Sync live server wallet snapshot whenever user logs in or auth changes
  useEffect(() => {
    let cancelled = false;
    fetch('/api/user/balance', { cache: 'no-store' })
      .then((res) => {
        if (res.ok) {
          if (!cancelled) setServerAuthUser(true);
          return res.json();
        }
        return null;
      })
      .then((snapshot) => {
        if (snapshot && !cancelled) {
          useCasinoStore.getState().applyServerWalletSnapshot(snapshot);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  // Persist anonymous session state to Supabase every 30 seconds
  useEffect(() => {
    if (authLoaded && !isSignedIn && sessionId) {
      const sync = useCasinoStore.getState().syncAnonymousSession;
      sync();
      const interval = setInterval(() => {
        sync();
      }, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [authLoaded, isSignedIn, sessionId]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobile]);
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', '45 100% 50%');
    root.style.setProperty('--accent', '0 0% 100%');
    root.style.setProperty('--bg-color', '0 0% 2%');
  }, []);
  useEffect(() => {
    if (bets && bets.length > 0) {
      const latestBet = bets[0];
      if (latestBet && latestBet.win) {
        const amount = latestBet.payout || 0;
        const multiplier = latestBet.multiplier || (latestBet.amount ? latestBet.payout / latestBet.amount : 0);
        
        if (multiplier >= 20 || amount >= 500) {
          const lastNotified = localStorage.getItem('last_big_win_bet');
          if (lastNotified !== latestBet.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBigWin({ amount, multiplier });
            
            // Add shoutout to chat
            import('@/lib/casino/chat-bot').then(({ ChatBotService }) => {
              if (ChatBotService && ChatBotService.shoutout) {
                const shoutoutName = useCasinoStore.getState().anonymousBetting ? 'Anonymous' : displayName;
                ChatBotService.shoutout(shoutoutName, amount, multiplier);
              }
            });
            if (latestBet.id) localStorage.setItem('last_big_win_bet', latestBet.id);
          }
        }
      }
    }
  }, [bets, displayName]);
  useEffect(() => {
    localStorage.setItem('last_known_level', level.toString());
  }, [level]);
  useEffect(() => {
    // ChunkLoadError Handler
    const handleChunkError = (e: ErrorEvent) => {
      if (e.message.includes('Loading chunk') || e.message.includes('ChunkLoadError')) {
        CasinoLogger.warn('CasinoGuard', 'Chunk load error detected. Refreshing for stability...');
        window.location.reload();
      }
    };
    window.addEventListener('error', handleChunkError);
    return () => window.removeEventListener('error', handleChunkError);
  }, []);


  // 4. Activity Simulator & server-authoritative wallet initialization
  const initialize = useCasinoStore(state => state.initialize);
  const startActivitySimulator = useCasinoStore(state => state.startActivitySimulator);
  
  useEffect(() => {
    initialize();
    
    // Defer non-critical background processes to prioritize initial render
    const timer = setTimeout(() => {
      const stopSimulator = startActivitySimulator();
      const stopSession = useCasinoStore.getState().updateSessionTime();
      
      // Heartbeat: Sync balance every 60s (reduced frequency)
      const heartbeat = setInterval(() => {
        initialize();
      }, 60000);

      const win = window as CasinoWindow;
      win._stopCasinoBackground = () => {
        stopSimulator();
        stopSession();
        if (heartbeat) clearInterval(heartbeat);
      };
    }, 2000);

    return () => {
      const win = window as CasinoWindow;
      if (win._stopCasinoBackground) {
        win._stopCasinoBackground();
      }
      clearTimeout(timer);
    };
  }, [initialize, startActivitySimulator]);

  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);
  const menuItems = [
    { icon: <Home size={20} />, label: 'Lobby', path: '/' },
    { icon: <Gamepad2 size={20} />, label: 'Games', path: '/games' },
    { icon: <History size={20} />, label: 'My Bets', path: '/history' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Target size={20} />, label: 'Vault', path: '/vault' },
    { icon: <Settings size={20} />, label: 'Settings', path: '#', onClick: () => setShowSettings(true) },
  ];

  if (!mounted || !hasHydrated) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffd700', fontWeight: 900, fontFamily: 'var(--font-inter), sans-serif' }}>
        INITIALIZING CASINO...
      </div>
    );
  }

  return (
    <div className="theme-gold" style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--bg-color))', overflow: 'hidden', position: 'relative' }}>
      <LoadingOverlay />

      {/* Global Live Ticker */}
      {!isMobile && (
        <div className="desktop-only" style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, height: '32px', background: 'black', 
          borderBottom: '1px solid hsla(var(--primary), 0.2)', zIndex: 20, display: 'flex', alignItems: 'center', 
          overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
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
              @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              .ticker-track { animation: ticker 30s linear infinite; }
            `}</style>
          </div>
      )}

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div onClick={() => setMobileSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
      )}

      {/* Sidebar */}
      <aside className="glass" style={{ width: isMobile ? (mobileSidebarOpen ? '280px' : '0px') : (sidebarOpen ? '240px' : '80px'), transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--glass-border)', zIndex: 150, height: isMobile ? '100vh' : 'calc(100vh - 32px)', position: isMobile ? 'fixed' : 'sticky', left: 0, top: isMobile ? '0' : '32px', overflow: 'hidden', background: 'hsl(var(--bg-color))' }}>
        <Link href="/" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}>
            <Image src="/images/brand-medallion-3d.png" alt="Casino Royale" fill sizes="100px" style={{ objectFit: 'contain' }} className="animate-pulse" />
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
            const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            const content = (
              <>
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </>
            );
            return (
              <button 
                key={item.label} 
                onClick={item.onClick || (() => navigate(item.path))} 
                className="btn btn-ghost" 
                aria-label={item.label}
                style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', width: '100%', marginBottom: '4px', color: active ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', background: active ? 'hsla(0, 0%, 100%, 0.05)' : 'transparent', padding: sidebarOpen ? '12px 16px' : '12px' }}
              >
                {content}
              </button>
            );
          })}
        </nav>
        
        {sidebarOpen && (
          <div style={{ margin: '20px', padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', position: 'relative', flexShrink: 0 }}>
              <Image src="/images/trust-shield-3d.png" alt="Secure" fill sizes="20px" style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white' }}>SECURE & FAIR</div>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'hsl(var(--success))' }}>CERTIFIED</div>
            </div>
          </div>
        )}
        {!isMobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} style={{ margin: '12px', justifyContent: 'center' }}>
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </aside>

      <CommandPalette />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <header className="glass" style={{ height: isMobile ? '64px' : '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 8px' : '0 24px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0, position: 'sticky', top: isMobile ? '0' : '32px', zIndex: 40, background: 'hsla(var(--bg-color), 0.8)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            {isMobile && (
              <button onClick={() => setMobileSidebarOpen(true)} className="btn btn-ghost" style={{ padding: '8px' }}>
                <div style={{ width: '20px', height: '2px', background: 'currentColor', boxShadow: '0 6px 0 currentColor, 0 -6px 0 currentColor' }} />
              </button>
            )}
            <button onClick={() => setShowRankInfo(true)} className="glass-card" style={{ padding: isMobile ? '4px 8px' : '6px 12px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid hsla(var(--primary), 0.2)', cursor: 'pointer', background: 'hsla(var(--primary), 0.05)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {!isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Star size={10} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>{rank}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isMobile && <Star size={10} fill="hsl(var(--primary))" color="hsl(var(--primary))" />}
                  <span style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', color: 'hsl(var(--text-main))', fontWeight: 700 }}>{isMobile ? `L${level}` : `LVL ${level}`}</span>
                </div>
              </div>
              {!isMobile && (
                <div style={{ width: '80px', height: '4px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
              )}
            </button>
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-muted))' }}>
                  <span>COMMUNITY</span>
                  <span>{Math.round((communityWagered / communityGoal) * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (communityWagered / communityGoal) * 100)}%`, height: '100%', background: '#00e701', boxShadow: '0 0 10px #00e701', borderRadius: '2px', transition: 'width 1s ease' }} />
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', paddingRight: isMobile ? '8px' : '0' }}>
            <div className="glass-card" style={{ padding: isMobile ? '6px 10px' : '8px 16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={isMobile ? 14 : 16} color="hsl(var(--primary))" />
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'hsl(var(--primary))', fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem' }}>
                    {hideBalance ? '••••••' : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                  <button 
                    onClick={() => updateSettings({ hideBalance: !hideBalance })}
                    style={{ background: 'transparent', border: 'none', color: 'hsla(0,0%,100%,0.3)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {!isMobile && (
                <>
                  {!effectiveIsSignedIn ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href="/sign-in" className="btn btn-ghost" style={{ fontSize: '0.85rem', fontWeight: 800 }}>LOGIN</Link>
                      <Link href="/sign-up" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 900, borderRadius: '12px' }}>REGISTER</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 8px', background: 'hsla(0,0%,100%,0.03)', borderRadius: '16px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                      <div style={{ textAlign: 'right', paddingRight: '4px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>{displayName}</div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>{rank}</div>
                      </div>
                      <button onClick={() => signOut()} aria-label="Abmelden" className="btn btn-ghost" style={{ width: '40px', height: '40px', padding: 0, borderRadius: '12px', border: '2px solid hsla(var(--primary), 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LogOut size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
              {isMobile && (effectiveIsSignedIn ? (
                <button onClick={() => signOut()} aria-label="Abmelden" className="btn btn-ghost" style={{ padding: '8px' }}>
                  <LogOut size={16} />
                </button>
              ) : (
                <Link href="/sign-in" className="btn btn-ghost" style={{ padding: '8px', fontSize: '0.75rem', fontWeight: 800 }}>LOGIN</Link>
              ))}
            </div>
          </div>
        </header>
        <div style={{ flex: 1, padding: isMobile ? '16px' : '24px', overflowY: 'scroll', paddingBottom: isMobile ? '100px' : '24px', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </main>

      {/* Persistent Overlay Components */}
      <MobileNav />
      {bigWin && <BigWinOverlay amount={bigWin.amount} multiplier={bigWin.multiplier} isOpen={!!bigWin} onClose={() => setBigWin(null)} />}
      {showWallet && <WalletModal isOpen={showWallet} onClose={() => setShowWallet(false)} />}
      {showSettings && <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      {showRankInfo && <RankBenefitsModal isOpen={showRankInfo} onClose={() => setShowRankInfo(false)} />}
      {showProfile && <PlayerProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />}

      <GlobalChat />
      
      {/* Toast Container */}
      <div style={{ position: 'fixed', top: isMobile ? '80px' : '88px', right: isMobile ? '50%' : '24px', transform: isMobile ? 'translateX(50%)' : 'none', width: isMobile ? 'min(90vw, 350px)' : 'auto', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 100, pointerEvents: 'none' }}>
        {toasts.map((toast) => (
          <div key={toast.id} className="glass animate-slide-in-right" style={{ padding: isMobile ? '12px 16px' : '16px 20px', borderRadius: '16px', minWidth: isMobile ? '0' : '300px', width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: toast.type === 'error' ? 'hsla(var(--error), 0.15)' : toast.type === 'success' ? 'hsla(var(--success), 0.15)' : 'hsla(var(--bg-color), 0.8)', border: `1px solid ${toast.type === 'error' ? 'hsl(var(--error))' : toast.type === 'success' ? 'hsl(var(--success))' : 'var(--glass-border)'}`, backdropFilter: 'blur(10px)', pointerEvents: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            {toast.type === 'success' && <CheckCircle2 size={20} color="hsl(var(--success))" />}
            {toast.type === 'error' && <AlertCircle size={20} color="hsl(var(--error))" />}
            {(toast.type === 'info' || !toast.type) && <InfoIcon size={20} color="hsl(var(--primary))" />}
            {toast.type === 'win' && <Trophy size={20} color="hsl(var(--primary))" />}
            <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} style={{ color: 'hsl(var(--text-muted))', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
