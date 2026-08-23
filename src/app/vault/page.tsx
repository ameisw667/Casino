'use client';
import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';
import { VaultProfileBanner } from '@/components/casino/vault/VaultProfileBanner';
import { VaultVipProgression } from '@/components/casino/vault/VaultVipProgression';
import { VaultLifetimeStats } from '@/components/casino/vault/VaultLifetimeStats';
import { VaultTierShowcase } from '@/components/casino/vault/VaultTierShowcase';
import { VaultRedeemCard } from '@/components/casino/vault/VaultRedeemCard';
import { VaultQuickPlayCta } from '@/components/casino/vault/VaultQuickPlayCta';
import { VaultAchievements } from '@/components/casino/vault/VaultAchievements';

function VaultContent() {
  const { balance, xp, level, vipTiers, achievements, isMobile, redeemCode, gameStats, analytics } =
    useCasinoStore();

  const sessionContext = useSupabaseSession();
  const user = sessionContext?.user ?? null;

  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');
  const redeemInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = React.useState(false);
  const [selectedTierName, setSelectedTierName] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState(() => (codeParam ? codeParam.toUpperCase() : ''));
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [serverStats, setServerStats] = useState<{
    totalBets: number;
    totalWins: number;
    totalWagered: number;
    totalPayout: number;
    totalProfit: number;
    winRate: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (codeParam) {
      redeemInputRef.current?.focus();
    }
  }, [codeParam]);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/user/stats', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !cancelled) {
          setServerStats(data);
          if (data.achievements) {
            useCasinoStore.getState().mergeServerAchievements(data.achievements);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const displayName = useMemo(() => {
    if (!user) return 'VibeCoder_Royale';
    const meta = user.user_metadata || {};
    return meta.username || meta.full_name || user.email?.split('@')[0] || 'VibeCoder_Royale';
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    const seed = encodeURIComponent(user?.email || displayName || 'Vibe');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  }, [user, displayName]);

  const currentTier = useMemo(
    () => [...vipTiers].reverse().find((t) => xp >= t.minXp) || vipTiers[0],
    [xp, vipTiers],
  );
  const currentTierIndex = vipTiers.findIndex((t) => t.name === currentTier.name);
  const nextTier = currentTierIndex < vipTiers.length - 1 ? vipTiers[currentTierIndex + 1] : null;
  const tierProgress = nextTier
    ? ((xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100
    : 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const levelProgress = Math.min(100, (xp / nextLevelXp) * 100);

  const totalStats = useMemo(() => {
    if (serverStats && serverStats.totalBets > 0) {
      return {
        totalBets: serverStats.totalBets,
        totalWins: serverStats.totalWins,
        totalProfit: serverStats.totalProfit,
        winRate: serverStats.winRate,
        wagered: serverStats.totalWagered,
      };
    }
    let totalBets = 0,
      totalWins = 0,
      totalProfit = 0;
    for (const game of Object.values(gameStats)) {
      totalBets += game.totalBets;
      totalWins += game.wins;
      totalProfit += game.profit;
    }
    return {
      totalBets,
      totalWins,
      totalProfit,
      winRate: totalBets > 0 ? (totalWins / totalBets) * 100 : 0,
      wagered: analytics?.totalWagered ?? 0,
    };
  }, [gameStats, analytics, serverStats]);

  if (!mounted) return null;

  const handleRedeem = async () => {
    if (!voucherCode.trim()) return;
    setIsRedeeming(true);
    const res = await redeemCode(voucherCode);
    if (res.success) setVoucherCode('');
    setIsRedeeming(false);
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: isMobile ? '16px 12px 120px' : '20px 32px 80px',
      }}
    >
      {/* ──── ROW 1: Profile Banner (full width) ──── */}
      <VaultProfileBanner
        isMobile={isMobile}
        displayName={displayName}
        avatarUrl={avatarUrl}
        currentTier={currentTier}
        level={level}
        balance={balance}
        xp={xp}
        levelProgress={levelProgress}
      />

      {/* ──── ROW 2: VIP Progression (left 60%) + Stats (right 40%) ──── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <VaultVipProgression
          isMobile={isMobile}
          vipTiers={vipTiers}
          currentTier={currentTier}
          nextTier={nextTier}
          tierProgress={tierProgress}
          xp={xp}
        />
        <VaultLifetimeStats isMobile={isMobile} totalStats={totalStats} />
      </div>

      {/* ──── ROW 2.5: Neumorphic Metallic Tier Showcase ──── */}
      <VaultTierShowcase
        isMobile={isMobile}
        vipTiers={vipTiers}
        currentTier={currentTier}
        xp={xp}
        selectedTierName={selectedTierName}
        onSelectTier={setSelectedTierName}
      />

      {/* ──── ROW 3: Achievements (left 65%) + Redeem & CTA (right 35%) ──── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '16px',
        }}
      >
        <VaultAchievements achievements={achievements} isMobile={isMobile} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <VaultRedeemCard
            redeemInputRef={redeemInputRef}
            voucherCode={voucherCode}
            onVoucherCodeChange={setVoucherCode}
            isRedeeming={isRedeeming}
            onRedeem={handleRedeem}
          />
          <VaultQuickPlayCta onPlayNow={() => router.push('/games/crash')} />
        </div>
      </div>
    </div>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={null}>
      <VaultContent />
    </Suspense>
  );
}
