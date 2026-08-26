'use client';
import React, { useState, useEffect } from 'react';
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
import { KeyboardShortcutProvider } from '@/hooks/useKeyboardShortcuts';
import { Home, Gamepad2, History, Trophy, Users, Target, BarChart3, Settings } from 'lucide-react';
import { NavigationShortcuts } from './NavigationShortcuts';
import { MainSidebar, type MenuItem } from './MainSidebar';
import { MainHeader } from './MainHeader';
import { ToastContainer } from './ToastContainer';

const BigWinOverlay = dynamic(() => import('../casino/BigWinOverlay'), { ssr: false });
const ProvablyFairModal = dynamic(
  () => import('../casino/ProvablyFairModal').then((mod) => mod.ProvablyFairModal),
  { ssr: false },
);
const SettingsModal = dynamic(() => import('../casino/SettingsModal'), { ssr: false });
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
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

  // Close mobile sidebar on route change (deps intentionally only [pathname]:
  // including mobileSidebarOpen would re-fire on open and instantly close the drawer)
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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
  const menuItems: MenuItem[] = [
    { icon: <Home size={20} />, label: 'Lobby', path: '/' },
    { icon: <Gamepad2 size={20} />, label: 'Games', path: '/games' },
    { icon: <History size={20} />, label: 'My Bets', path: '/history' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Users size={20} />, label: 'Guild', path: '/guild' },
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

        <MainSidebar
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          mobileSidebarOpen={mobileSidebarOpen}
          showExpandedSidebar={showExpandedSidebar}
          menuItems={menuItems}
          pathname={pathname}
          showSettings={showSettings}
          navigate={navigate}
          setMobileSidebarOpen={setMobileSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setShowSettings={setShowSettings}
          setShowProvablyFair={setShowProvablyFair}
          setShowSettingsModal={setShowSettingsModal}
        />

        <CommandPalette />

        <main
          ref={mainRef}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <MainHeader
            isMobile={isMobile}
            rank={rank}
            level={level}
            progress={progress}
            communityWagered={communityWagered}
            communityGoal={communityGoal}
            balance={balance}
            hideBalance={hideBalance}
            displayName={displayName}
            effectiveIsSignedIn={effectiveIsSignedIn}
            notificationUserId={user?.id ?? null}
            onShowRankInfo={() => setShowRankInfo(true)}
            onToggleHideBalance={() => updateSettings({ hideBalance: !hideBalance })}
            onSignOut={handleSignOut}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          />
          <div
            style={{
              flex: 1,
              minHeight: 0,
              padding: isMobile ? '16px' : '24px',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingBottom: isMobile ? 'calc(88px + env(safe-area-inset-bottom))' : '24px',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain',
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
        {showSettingsModal && (
          <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        )}

        <GlobalChat />

        <ToastContainer isMobile={isMobile} toasts={toasts} onRemove={removeToast} />
      </div>
    </KeyboardShortcutProvider>
  );
}