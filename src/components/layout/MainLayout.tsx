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
import { isBigWin } from '@/lib/casino/big-win';
import { useMounted } from '@/hooks/useMounted';
import { KeyboardShortcutProvider, useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { motion, AnimatePresence } from 'framer-motion';

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
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Info as InfoIcon,
  X,
  Eye,
  EyeOff,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  Users,
} from 'lucide-react';

const BigWinOverlay = dynamic(() => import('../casino/BigWinOverlay'), { ssr: false });
const ProvablyFairModal = dynamic(
  () => import('../casino/ProvablyFairModal').then((mod) => mod.ProvablyFairModal),
  { ssr: false },
);
import SettingsPopover from '../casino/SettingsPopover';
const RankBenefitsModal = dynamic(() => import('../casino/RankBenefitsModal'), { ssr: false });
const PlayerProfileModal = dynamic(() => import('@/components/casino/PlayerProfileModal'), {
  ssr: false,
});
const GlobalChat = dynamic(
  () => import('@/components/social/GlobalChat').then((mod) => mod.GlobalChat),
  { ssr: false },
);
const CommandPalette = dynamic(
  () => import('@/components/navigation/CommandPalette').then((mod) => mod.CommandPalette),
  { ssr: false },
);
import { ConsentBanner } from '@/components/analytics/ConsentBanner';

// ─── Auth Header Button ───────────────────────────────────────────────────────
function AuthHeaderBtn({
  href,
  variant,
  compact,
  children,
}: {
  href: string;
  variant: 'glass' | 'gold';
  compact?: boolean;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: 800,
    textDecoration: 'none',
    letterSpacing: '0.04em',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
    padding: compact ? '7px 10px' : '7px 14px',
    whiteSpace: 'nowrap' as const,
  };
  const glassStyle: React.CSSProperties = {
    ...base,
    background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
    boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : 'none',
  };
  const goldStyle: React.CSSProperties = {
    ...base,
    background: hovered
      ? 'linear-gradient(135deg, hsl(45,100%,58%), hsl(38,100%,48%))'
      : 'linear-gradient(135deg, hsl(45,100%,50%), hsl(38,100%,42%))',
    color: '#000',
    border: 'none',
    boxShadow: hovered
      ? '0 0 20px hsla(45,100%,50%,0.55), 0 4px 12px rgba(0,0,0,0.3)'
      : '0 0 10px hsla(45,100%,50%,0.3)',
  };
  return (
    <Link
      href={href}
      className={variant === 'gold' && !hovered ? 'animate-gold-pulse' : ''}
      style={variant === 'gold' ? goldStyle : glassStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

// ─── Header Chip Icon Badge ────────────────────────────────────────────────
function IconBadge({
  children,
  tone,
  size = 26,
}: {
  children: React.ReactNode;
  tone: 'gold' | 'green';
  size?: number;
}) {
  const background =
    tone === 'gold'
      ? 'linear-gradient(135deg, hsl(45,100%,58%), hsl(38,100%,46%))'
      : 'linear-gradient(135deg, hsl(150,70%,48%), hsl(155,70%,36%))';
  const glow = tone === 'gold' ? 'hsla(45,100%,50%,0.35)' : 'hsla(150,70%,45%,0.35)';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background,
        boxShadow: `0 0 10px ${glow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

// ─── Global Navigation Shortcuts (Easter egg — no visible UI change) ──────────
function NavigationShortcuts({
  navigate,
  toggleSettings,
}: {
  navigate: (path: string) => void;
  toggleSettings: () => void;
}) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const shortcuts: Array<[string, string, () => void]> = [
      ['nav-lobby', '1', () => navigate('/')],
      ['nav-games', '2', () => navigate('/games')],
      ['nav-history', '3', () => navigate('/history')],
      ['nav-leaderboard', '4', () => navigate('/leaderboard')],
      ['nav-vault', '5', () => navigate('/vault')],
      ['nav-stats', '6', () => navigate('/stats')],
      ['nav-settings', ',', toggleSettings],
    ];
    shortcuts.forEach(([id, combo, handler]) => registerShortcut(id, { combo, handler }));
    return () => shortcuts.forEach(([id]) => unregisterShortcut(id));
  }, [navigate, toggleSettings, registerShortcut, unregisterShortcut]);

  return null;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  type CasinoWindow = Window & { _stopCasinoBackground?: () => void };
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();

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
  const [bigWin, setBigWin] = useState<{ amount: number; multiplier: number } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showProvablyFair, setShowProvablyFair] = useState(false);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // 2. Auth & Store Hooks
  const { user, isLoaded: authLoaded, signOut } = useSupabaseSession();
  const [serverAuthUser, setServerAuthUser] = useState<boolean>(false);
  const isSignedIn = !!user;
  const effectiveIsSignedIn = isSignedIn || serverAuthUser;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Player';
  const balance = useCasinoStore((s) => s.balance);
  const level = useCasinoStore((s) => s.level);
  const xp = useCasinoStore((s) => s.xp);
  const rank = useCasinoStore((s) => s.rank);
  const bets = useCasinoStore((s) => s.bets);
  const toasts = useCasinoStore((s) => s.toasts);
  const removeToast = useCasinoStore((s) => s.removeToast);
  const isMobile = useCasinoStore((s) => s.isMobile);
  const setIsMobile = useCasinoStore((s) => s.setIsMobile);
  const onboardingStep = useCasinoStore((s) => s.onboardingStep);
  const setOnboardingStep = useCasinoStore((s) => s.setOnboardingStep);
  const communityWagered = useCasinoStore((s) => s.communityWagered);
  const communityGoal = useCasinoStore((s) => s.communityGoal);
  const hideBalance = useCasinoStore((s) => s.hideBalance);
  const updateSettings = useCasinoStore((s) => s.updateSettings);
  const loadVipConfig = useCasinoStore((s) => s.loadVipConfig);
  const setSessionId = useCasinoStore((s) => s.setSessionId);
  const migrateAnonymousSession = useCasinoStore((s) => s.migrateAnonymousSession);
  const sessionId = useCasinoStore((s) => s.sessionId);

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
  }, [setSessionId, loadVipConfig]);

  const handleSignOut = async () => {
    setServerAuthUser(false);
    await signOut();
    useCasinoStore.getState().applyServerWalletSnapshot({
      balance: 0,
      xp: 0,
      level: 1,
      rank: 'BRONZE',
      transactionId: '00000000-0000-0000-0000-000000000000',
    });
    router.push('/sign-in');
    router.refresh();
  };

  // 3. All Effect Hooks (Always called, never conditional)
  useEffect(() => {
    if (
      authLoaded &&
      effectiveIsSignedIn &&
      onboardingStep !== 'NONE' &&
      onboardingStep !== 'COMPLETED'
    ) {
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
        if (!cancelled) setServerAuthUser(false);
        return null;
      })
      .then((snapshot) => {
        if (snapshot && !cancelled) {
          useCasinoStore.getState().applyServerWalletSnapshot(snapshot);
        }
      })
      .catch(() => {
        if (!cancelled) setServerAuthUser(false);
      });
    return () => {
      cancelled = true;
    };
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

  // Body scroll lock on mobile when drawer is open
  useEffect(() => {
    if (isMobile && mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileSidebarOpen]);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  }, [pathname, mobileSidebarOpen]);

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileSidebarOpen]);

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
        const multiplier =
          latestBet.multiplier || (latestBet.amount ? latestBet.payout / latestBet.amount : 0);

        if (isBigWin({ payout: amount, multiplier })) {
          const lastNotified = localStorage.getItem('last_big_win_bet');
          if (lastNotified !== latestBet.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBigWin({ amount, multiplier });

            // Add shoutout to chat
            import('@/lib/casino/chat-bot').then(({ ChatBotService }) => {
              if (ChatBotService && ChatBotService.shoutout) {
                const shoutoutName = useCasinoStore.getState().anonymousBetting
                  ? 'Anonymous'
                  : displayName;
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
  const initialize = useCasinoStore((state) => state.initialize);
  const startActivitySimulator = useCasinoStore((state) => state.startActivitySimulator);
  const mainRef = React.useRef<HTMLElement | null>(null);

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

  const showExpandedSidebar = isMobile ? true : sidebarOpen;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);
  const menuItems = [
    { icon: <Home size={20} />, label: 'Lobby', path: '/' },
    { icon: <Gamepad2 size={20} />, label: 'Games', path: '/games' },
    { icon: <History size={20} />, label: 'My Bets', path: '/history' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Target size={20} />, label: 'Vault', path: '/vault' },
    { icon: <BarChart3 size={20} />, label: 'Stats', path: '/stats' },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      path: '#',
      onClick: () => {
        if (!sidebarOpen && !isMobile) setSidebarOpen(true);
        setShowSettings((prev) => !prev);
      },
    },
  ];

  if (!mounted) {
    return (
      <div
        style={{
          background: '#000',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffd700',
          fontWeight: 900,
          fontFamily: 'var(--font-inter), sans-serif',
        }}
      >
        INITIALIZING CASINO...
      </div>
    );
  }

  return (
    <KeyboardShortcutProvider>
      <div
        className="theme-gold"
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'hsl(var(--bg-color))',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <NavigationShortcuts
          navigate={navigate}
          toggleSettings={() => setShowSettings((prev) => !prev)}
        />
        <LoadingOverlay />

        {/* Mobile Drawer Overlay with Adaptive Blur */}
        <AnimatePresence>
          {isMobile && mobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                zIndex: 145,
              }}
            />
          )}
        </AnimatePresence>

        {/* Sidebar / Mobile Slide Drawer */}
        <motion.aside
          className="glass-sidebar"
          initial={false}
          animate={
            isMobile
              ? { x: mobileSidebarOpen ? 0 : '-100%' }
              : { x: 0, width: sidebarOpen ? 240 : 80 }
          }
          transition={{
            type: 'spring',
            damping: isMobile ? 24 : 28,
            stiffness: isMobile ? 300 : 320,
          }}
          onWheel={(e) => {
            if (!isMobile && mainRef.current) {
              mainRef.current.scrollTop += e.deltaY;
            }
          }}
          style={{
            width: isMobile ? '280px' : undefined,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 150,
            height: '100vh',
            maxHeight: '100vh',
            position: isMobile ? 'fixed' : 'sticky',
            left: 0,
            top: 0,
            overflow: 'hidden',
            overscrollBehavior: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: isMobile ? '12px' : '0',
              flexShrink: 0,
            }}
          >
            <Link
              href="/"
              onClick={() => {
                if (isMobile) setMobileSidebarOpen(false);
              }}
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ width: '40px', height: '40px', position: 'relative', flexShrink: 0 }}>
                <Image
                  src="/images/brand-medallion-3d.png"
                  alt="Casino Royale"
                  fill
                  sizes="100px"
                  style={{ objectFit: 'contain' }}
                  className="animate-pulse"
                />
              </div>
              {showExpandedSidebar && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        letterSpacing: '-1px',
                        lineHeight: 1,
                      }}
                    >
                      CASINO
                    </span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        background: 'hsl(var(--primary))',
                        color: 'black',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        transform: 'translateY(-2px)',
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: '0.65rem',
                      color: 'hsl(var(--primary))',
                      letterSpacing: '0.2em',
                      marginTop: '2px',
                    }}
                  >
                    ROYALE
                  </span>
                </div>
              )}
            </Link>
            {isMobile && (
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="btn btn-ghost"
                aria-label="Close navigation menu"
                style={{
                  width: '36px',
                  height: '36px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          <nav
            style={{
              flex: '1 1 0%',
              minHeight: 0,
              padding: '12px',
              overflowY: isMobile ? 'auto' : 'hidden',
              overscrollBehavior: 'contain',
            }}
          >
            {menuItems.map((item) => {
              const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
              const isSettings = item.label === 'Settings';
              const content = (
                <>
                  {item.icon}
                  {showExpandedSidebar && <span>{item.label}</span>}
                </>
              );
              return (
                <React.Fragment key={item.label}>
                  <button
                    onClick={item.onClick || (() => navigate(item.path))}
                    className="btn btn-ghost"
                    aria-label={item.label}
                    style={{
                      justifyContent: showExpandedSidebar ? 'flex-start' : 'center',
                      width: '100%',
                      marginBottom: '4px',
                      color:
                        active || (isSettings && showSettings)
                          ? '#D4AF37'
                          : 'rgba(255, 255, 255, 0.72)',
                      background:
                        active || (isSettings && showSettings)
                          ? 'linear-gradient(90deg, rgba(212, 175, 55, 0.16) 0%, rgba(212, 175, 55, 0.03) 100%)'
                          : 'transparent',
                      borderLeft:
                        active || (isSettings && showSettings)
                          ? '3px solid #D4AF37'
                          : '3px solid transparent',
                      boxShadow:
                        active || (isSettings && showSettings)
                          ? '0 0 16px rgba(212, 175, 55, 0.12)'
                          : 'none',
                      padding: showExpandedSidebar ? '10px 14px' : '10px',
                      borderRadius: '8px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {content}
                  </button>
                  {isSettings && (
                    <SettingsPopover
                      isOpen={showSettings}
                      onClose={() => setShowSettings(false)}
                      onOpenProvablyFair={() => setShowProvablyFair(true)}
                      inline
                    />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {showExpandedSidebar && (
            <div
              style={{
                flexShrink: 0,
                margin: '20px',
                padding: '16px',
                background: 'hsla(0,0%,100%,0.02)',
                borderRadius: '16px',
                border: '1px solid hsla(0,0%,100%,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ width: '32px', height: '32px', position: 'relative', flexShrink: 0 }}>
                <Image
                  src="/images/trust-shield-3d.png"
                  alt="Secure"
                  fill
                  sizes="20px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white' }}>
                  SECURE & FAIR
                </div>
                <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
                  CERTIFIED
                </div>
              </div>
            </div>
          )}
          {showExpandedSidebar && <ConsentBanner />}
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-ghost"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              style={{
                flexShrink: 0,
                margin: '12px',
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
        </motion.aside>

        <CommandPalette />

        {/* Main Content */}
        <main
          ref={mainRef}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          <header
            className="glass-header"
            style={{
              height: isMobile ? '64px' : '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '0 8px' : '0 24px',
              flexShrink: 0,
              position: 'sticky',
              top: 0,
              zIndex: 40,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
              {isMobile && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="btn btn-ghost"
                  aria-label="Open navigation menu"
                  style={{ padding: '8px' }}
                >
                  <Menu size={20} />
                </button>
              )}
              <button
                onClick={() => setShowRankInfo(true)}
                className="header-chip header-chip-gold"
                style={{
                  padding: isMobile ? '4px 8px' : '6px 12px 6px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '8px' : '10px',
                  cursor: 'pointer',
                }}
              >
                {!isMobile && (
                  <IconBadge tone="gold">
                    <Star size={12} color="#000" fill="#000" />
                  </IconBadge>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  {!isMobile && (
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        color: 'hsl(var(--primary))',
                        textTransform: 'uppercase',
                      }}
                    >
                      {rank}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isMobile && (
                      <Star size={10} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                    )}
                    <span
                      style={{
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                        color: 'hsl(var(--text-main))',
                        fontWeight: 700,
                      }}
                    >
                      {isMobile ? `L${level}` : `LVL ${level}`}
                    </span>
                  </div>
                </div>
                {!isMobile && (
                  <div
                    style={{
                      width: '80px',
                      height: '4px',
                      background: 'hsla(0, 0%, 100%, 0.05)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: '100%',
                        background:
                          'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                )}
              </button>
              {!isMobile && (
                <div
                  className="header-chip"
                  style={{
                    padding: '6px 12px 6px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '150px',
                  }}
                >
                  <IconBadge tone="green">
                    <Users size={12} color="#000" />
                  </IconBadge>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        color: 'hsl(var(--text-muted))',
                      }}
                    >
                      <span>COMMUNITY</span>
                      <span>{Math.round((communityWagered / communityGoal) * 100)}%</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '4px',
                        background: 'hsla(0, 0%, 100%, 0.05)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (communityWagered / communityGoal) * 100)}%`,
                          height: '100%',
                          background: '#00e701',
                          boxShadow: '0 0 10px #00e701',
                          borderRadius: '2px',
                          transition: 'width 1s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '8px' : '16px',
                paddingRight: isMobile ? '8px' : '0',
              }}
            >
              <div
                className="header-chip"
                style={{
                  padding: isMobile ? '6px 10px 6px 6px' : '6px 16px 6px 6px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '8px' : '10px',
                }}
              >
                <IconBadge tone="gold" size={isMobile ? 22 : 26}>
                  <Wallet size={isMobile ? 11 : 13} color="#000" />
                </IconBadge>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'hsl(var(--text-main))',
                    fontWeight: 800,
                    fontSize: isMobile ? '0.9rem' : '1.15rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {hideBalance
                    ? '••••••'
                    : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </span>
                <button
                  onClick={() => updateSettings({ hideBalance: !hideBalance })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'hsla(0,0%,100%,0.3)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!isMobile && (
                  <>
                    {!effectiveIsSignedIn ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <AuthHeaderBtn href="/sign-in" variant="glass">
                          <LogIn size={13} strokeWidth={2.5} />
                          LOGIN
                        </AuthHeaderBtn>
                        <AuthHeaderBtn href="/sign-up" variant="gold">
                          <UserPlus size={13} strokeWidth={2.5} />
                          REGISTER
                        </AuthHeaderBtn>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '4px 8px',
                          background: 'hsla(0,0%,100%,0.03)',
                          borderRadius: '16px',
                          border: '1px solid hsla(0,0%,100%,0.05)',
                        }}
                      >
                        <div style={{ textAlign: 'right', paddingRight: '4px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff' }}>
                            {displayName}
                          </div>
                          <div
                            style={{
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              color: 'hsl(var(--primary))',
                              textTransform: 'uppercase',
                            }}
                          >
                            {rank}
                          </div>
                        </div>
                        <button
                          onClick={handleSignOut}
                          aria-label="Abmelden"
                          className="btn btn-ghost"
                          style={{
                            width: '40px',
                            height: '40px',
                            padding: 0,
                            borderRadius: '12px',
                            border: '2px solid hsla(var(--primary), 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LogOut size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}
                {isMobile &&
                  (effectiveIsSignedIn ? (
                    <button
                      onClick={handleSignOut}
                      aria-label="Abmelden"
                      className="btn btn-ghost"
                      style={{ padding: '8px' }}
                    >
                      <LogOut size={16} />
                    </button>
                  ) : (
                    <AuthHeaderBtn href="/sign-in" variant="glass" compact>
                      <LogIn size={13} strokeWidth={2.5} />
                      LOGIN
                    </AuthHeaderBtn>
                  ))}
              </div>
            </div>
          </header>
          <div
            style={{
              flex: 1,
              padding: isMobile ? '16px' : '24px',
              overflowY: 'scroll',
              paddingBottom: isMobile ? '100px' : '24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>
        </main>

        {/* Persistent Overlay Components */}
        <MobileNav />
        {bigWin && (
          <BigWinOverlay
            amount={bigWin.amount}
            multiplier={bigWin.multiplier}
            isOpen={!!bigWin}
            onClose={() => setBigWin(null)}
          />
        )}
        {showRankInfo && (
          <RankBenefitsModal isOpen={showRankInfo} onClose={() => setShowRankInfo(false)} />
        )}
        {showProfile && (
          <PlayerProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
        )}
        {showProvablyFair && (
          <ProvablyFairModal isOpen onClose={() => setShowProvablyFair(false)} />
        )}

        <GlobalChat />

        {/* Toast Container */}
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '80px' : '88px',
            right: isMobile ? '50%' : '24px',
            transform: isMobile ? 'translateX(50%)' : 'none',
            width: isMobile ? 'min(90vw, 350px)' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="glass animate-slide-in-right"
              style={{
                padding: isMobile ? '12px 16px' : '16px 20px',
                borderRadius: '16px',
                minWidth: isMobile ? '0' : '300px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background:
                  toast.type === 'error'
                    ? 'hsla(var(--error), 0.15)'
                    : toast.type === 'success'
                      ? 'hsla(var(--success), 0.15)'
                      : 'hsla(var(--bg-color), 0.8)',
                border: `1px solid ${toast.type === 'error' ? 'hsl(var(--error))' : toast.type === 'success' ? 'hsl(var(--success))' : 'var(--glass-border)'}`,
                backdropFilter: 'blur(10px)',
                pointerEvents: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              {toast.type === 'success' && <CheckCircle2 size={20} color="hsl(var(--success))" />}
              {toast.type === 'error' && <AlertCircle size={20} color="hsl(var(--error))" />}
              {(toast.type === 'info' || !toast.type) && (
                <InfoIcon size={20} color="hsl(var(--primary))" />
              )}
              {toast.type === 'win' && <Trophy size={20} color="hsl(var(--primary))" />}
              <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  color: 'hsl(var(--text-muted))',
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </KeyboardShortcutProvider>
  );
}
