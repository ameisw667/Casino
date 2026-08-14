'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';
import { useCasinoStore } from '@/store/useCasinoStore';
import { NeonArcadeDashboardView } from './NeonArcadeDashboardView';
import {
  DASHBOARD_GAMES,
  deriveDashboardMetrics,
  filterDashboardGames,
  type DashboardCategory,
  type DashboardGame,
} from './neon-arcade-dashboard-model';

export function NeonArcadeDashboard() {
  const { user } = useSupabaseSession();
  const [activeCategory, setActiveCategory] = useState<DashboardCategory>('featured');
  const [activeGameId, setActiveGameId] = useState<DashboardGame['id']>('crash');
  const [menuOpen, setMenuOpen] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const balance = useCasinoStore((state) => state.balance);
  const rank = useCasinoStore((state) => state.rank);
  const level = useCasinoStore((state) => state.level);
  const xp = useCasinoStore((state) => state.xp);
  const allBets = useCasinoStore((state) => state.allBets);
  const communityWagered = useCasinoStore((state) => state.communityWagered);
  const communityGoal = useCasinoStore((state) => state.communityGoal);
  const initialize = useCasinoStore((state) => state.initialize);

  useEffect(() => {
    useCasinoStore.persist.rehydrate();
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const metrics = useMemo(() => deriveDashboardMetrics(allBets), [allBets]);
  const nextLevelXp = Math.max(1, Math.pow(Math.max(1, level), 2) * 100);
  const xpProgress = Math.min(100, Math.max(0, (xp / nextLevelXp) * 100));
  const communityProgress =
    communityGoal > 0 ? Math.min(100, Math.max(0, (communityWagered / communityGoal) * 100)) : 0;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Player';

  const handleCategoryChange = (category: DashboardCategory) => {
    const firstGame = filterDashboardGames(DASHBOARD_GAMES, category)[0];
    setActiveCategory(category);
    if (firstGame) setActiveGameId(firstGame.id);
  };

  return (
    <NeonArcadeDashboardView
      games={DASHBOARD_GAMES}
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
      activeGameId={activeGameId}
      onGameSelect={setActiveGameId}
      menuOpen={menuOpen}
      onMenuToggle={() => setMenuOpen((current) => !current)}
      onMenuClose={() => setMenuOpen(false)}
      hideBalance={hideBalance}
      onToggleBalance={() => setHideBalance((current) => !current)}
      balance={balance}
      rank={rank}
      level={level}
      xpProgress={xpProgress}
      displayName={displayName}
      metrics={metrics}
      communityProgress={communityProgress}
      communityWagered={communityWagered}
      communityGoal={communityGoal}
      isSignedIn={Boolean(user)}
    />
  );
}
