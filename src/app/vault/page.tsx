'use client';
import React, { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Rocket,
  Gift,
  ShieldCheck,
  Crown,
  ChevronRight,
  ArrowUpRight,
  Star,
  Trophy,
  BarChart3,
  X,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupabaseSession } from '@/components/auth/SupabaseSessionProvider';

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
  const [showAllAchievementsModal, setShowAllAchievementsModal] = useState(false);
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

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    borderRadius: '16px',
    background:
      'linear-gradient(145deg, rgba(24, 24, 32, 0.7) 0%, rgba(12, 12, 18, 0.88) 100%)',
    border: '1px solid rgba(212, 175, 55, 0.12)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
    ...extra,
  });

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
      <div
        style={{
          ...card({ padding: isMobile ? '24px 20px' : '22px 32px' }),
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '20px' : '28px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '10%',
            width: '220px',
            height: '220px',
            background: `radial-gradient(circle, ${currentTier.color}18 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Avatar + Name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div style={{ width: '52px', height: '52px', position: 'relative', flexShrink: 0 }}>
            <svg
              width="52"
              height="52"
              viewBox="0 0 100 100"
              style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={currentTier.color}
                strokeWidth="6"
                strokeDasharray={`${levelProgress * 2.76} 276`}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dasharray 0.8s ease',
                  filter: `drop-shadow(0 0 4px ${currentTier.color}50)`,
                }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: '5px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `2px solid ${currentTier.color}40`,
              }}
            >
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                unoptimized
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <span
                style={{
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: `${currentTier.color}15`,
                  color: currentTier.color,
                  border: `1px solid ${currentTier.color}30`,
                  letterSpacing: '0.08em',
                }}
              >
                {currentTier.name}
              </span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                LVL {level}
              </span>
            </div>
          </div>
        </div>

        {/* Key Figures */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            flex: isMobile ? undefined : 1,
            justifyContent: isMobile ? undefined : 'center',
            maxWidth: isMobile ? undefined : '420px',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.04)',
              flex: 1,
              minWidth: '140px',
            }}
          >
            <div
              style={{
                fontSize: '0.55rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              BALANCE
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                color: '#D4AF37',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.04)',
              flex: 1,
              minWidth: '140px',
            }}
          >
            <div
              style={{
                fontSize: '0.55rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.06em',
                marginBottom: '4px',
              }}
            >
              XP
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {xp.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Verified */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '8px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.15)',
              fontSize: '0.6rem',
              fontWeight: 800,
              color: '#10b981',
            }}
          >
            <ShieldCheck size={11} /> VERIFIED
          </div>
        </div>
      </div>

      {/* ──── ROW 2: VIP Progression (left 60%) + Stats (right 40%) ──── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* VIP Progression */}
        <div style={{ ...card({ padding: isMobile ? '24px 16px' : '28px' }) }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={16} color="#D4AF37" />
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '0.02em',
                }}
              >
                VIP PROGRESSION
              </span>
            </div>
            {nextTier && (
              <span
                style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}
              >
                {(nextTier.minXp - xp).toLocaleString()} XP to {nextTier.name}
              </span>
            )}
          </div>

          {/* Tier Nodes */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              padding: '0 8px',
              marginBottom: '12px',
            }}
          >
            {vipTiers.map((tier, i) => {
              const isActive = tier.name === currentTier.name;
              const isPast = xp >= tier.minXp;
              return (
                <React.Fragment key={tier.name}>
                  {i > 0 && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        background: isPast
                          ? `linear-gradient(90deg, ${vipTiers[i - 1].color}80, ${tier.color}80)`
                          : 'rgba(255,255,255,0.04)',
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: isActive ? 40 : 28,
                      height: isActive ? 40 : 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isPast ? `${tier.color}18` : 'rgba(255,255,255,0.02)',
                      border: `2px solid ${isPast ? `${tier.color}80` : 'rgba(255,255,255,0.06)'}`,
                      position: 'relative',
                      transition: 'all 0.3s',
                      boxShadow: isActive ? `0 0 20px ${tier.color}25` : 'none',
                    }}
                  >
                    {isPast ? (
                      <Star size={isActive ? 16 : 11} color={tier.color} fill={tier.color} />
                    ) : (
                      <Lock size={10} color="rgba(255,255,255,0.15)" />
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        top: '100%',
                        marginTop: '5px',
                        fontSize: '0.5rem',
                        fontWeight: 800,
                        color: isPast ? `${tier.color}cc` : 'rgba(255,255,255,0.15)',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {tier.name}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {nextTier && (
            <div style={{ marginTop: '28px' }}>
              <div
                style={{
                  height: '6px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.04)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                  transition={{ type: 'spring', damping: 18, stiffness: 120 }}
                  style={{
                    height: '100%',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                    boxShadow: `0 0 12px ${currentTier.color}60`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span
                  style={{ fontSize: '0.6rem', fontWeight: 700, color: `${currentTier.color}aa` }}
                >
                  {currentTier.name} &middot; {(currentTier.rakeback * 100).toFixed(0)}% rakeback
                </span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: `${nextTier.color}aa` }}>
                  {nextTier.name} &middot; {(nextTier.rakeback * 100).toFixed(0)}% rakeback
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Panel */}
        <div style={{ ...card({ padding: isMobile ? '20px 16px' : '28px' }) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 size={16} color="rgba(255,255,255,0.4)" />
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '0.02em',
              }}
            >
              LIFETIME STATS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'BETS', value: totalStats.totalBets.toLocaleString(), color: '#fff' },
              { label: 'WIN RATE', value: `${totalStats.winRate.toFixed(1)}%`, color: '#fff' },
              {
                label: 'PROFIT',
                value: `${totalStats.totalProfit >= 0 ? '+' : ''}$${totalStats.totalProfit.toFixed(2)}`,
                color: totalStats.totalProfit >= 0 ? '#10b981' : '#ef4444',
              },
              { label: 'WAGERED', value: `$${totalStats.wagered.toFixed(0)}`, color: '#D4AF37' },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.5rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.06em',
                    marginBottom: '6px',
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: s.color,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── ROW 2.5: Neumorphic Metallic Tier Showcase ──── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Star size={16} color="#D4AF37" fill="#D4AF37" />
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            VIP TIERS & BENEFITS
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)',
            gap: isMobile ? '10px' : '12px',
          }}
        >
          {vipTiers.map((tier) => {
            const isCurrent = tier.name === currentTier.name;
            const isUnlocked = xp >= tier.minXp;

            let metallicBg =
              'linear-gradient(145deg, rgba(24, 24, 32, 0.7) 0%, rgba(12, 12, 18, 0.88) 100%)';
            let metallicBorder = '1px solid rgba(255, 255, 255, 0.06)';
            let glowShadow = 'none';

            if (tier.name === 'BRONZE') {
              metallicBg =
                'radial-gradient(circle at 100% 0%, rgba(205, 127, 50, 0.22) 0%, transparent 60%), linear-gradient(145deg, rgba(38, 26, 18, 0.8) 0%, rgba(18, 14, 12, 0.9) 100%)';
              metallicBorder = `1px solid ${isCurrent ? '#cd7f32' : 'rgba(205, 127, 50, 0.35)'}`;
              glowShadow = isCurrent ? '0 0 20px rgba(205, 127, 50, 0.25)' : 'none';
            } else if (tier.name === 'SILVER') {
              metallicBg =
                'radial-gradient(circle at 100% 0%, rgba(226, 232, 240, 0.22) 0%, transparent 60%), linear-gradient(145deg, rgba(35, 38, 45, 0.8) 0%, rgba(16, 18, 22, 0.9) 100%)';
              metallicBorder = `1px solid ${isCurrent ? '#e2e8f0' : 'rgba(226, 232, 240, 0.35)'}`;
              glowShadow = isCurrent ? '0 0 20px rgba(226, 232, 240, 0.25)' : 'none';
            } else if (tier.name === 'GOLD') {
              metallicBg =
                'radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.28) 0%, transparent 60%), linear-gradient(145deg, rgba(45, 36, 14, 0.85) 0%, rgba(20, 16, 8, 0.92) 100%)';
              metallicBorder = `1px solid ${isCurrent ? '#D4AF37' : 'rgba(212, 175, 55, 0.45)'}`;
              glowShadow = isCurrent ? '0 0 24px rgba(212, 175, 55, 0.35)' : 'none';
            } else if (tier.name === 'PLATINUM') {
              metallicBg =
                'radial-gradient(circle at 100% 0%, rgba(56, 189, 248, 0.22) 0%, transparent 60%), linear-gradient(145deg, rgba(20, 36, 48, 0.8) 0%, rgba(12, 18, 26, 0.9) 100%)';
              metallicBorder = `1px solid ${isCurrent ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)'}`;
              glowShadow = isCurrent ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none';
            } else if (tier.name === 'DIAMOND') {
              metallicBg =
                'radial-gradient(circle at 100% 0%, rgba(185, 242, 255, 0.28) 0%, transparent 60%), linear-gradient(145deg, rgba(25, 42, 58, 0.85) 0%, rgba(12, 20, 32, 0.92) 100%)';
              metallicBorder = `1px solid ${isCurrent ? '#b9f2ff' : 'rgba(185, 242, 255, 0.45)'}`;
              glowShadow = isCurrent ? '0 0 24px rgba(185, 242, 255, 0.35)' : 'none';
            }

            const isSelected = (selectedTierName ?? currentTier.name) === tier.name;

            return (
              <motion.div
                key={tier.name}
                onClick={() => setSelectedTierName(tier.name)}
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                style={{
                  padding: isMobile ? '16px 14px' : '18px 16px',
                  borderRadius: '16px',
                  background: metallicBg,
                  border: isSelected ? `2px solid ${tier.color}` : metallicBorder,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow:
                    isSelected
                      ? `0 0 24px ${tier.color}40, 0 8px 24px rgba(0, 0, 0, 0.4)`
                      : glowShadow !== 'none'
                        ? glowShadow
                        : '0 8px 24px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '135px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: tier.color,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {tier.name}
                    </span>
                    {isCurrent ? (
                      <span
                        style={{
                          fontSize: '0.52rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: `${tier.color}25`,
                          color: tier.color,
                          border: `1px solid ${tier.color}50`,
                          textTransform: 'uppercase',
                        }}
                      >
                        AKTIV
                      </span>
                    ) : isUnlocked ? (
                      <CheckCircle2 size={13} color={tier.color} />
                    ) : (
                      <Lock size={12} color="rgba(255, 255, 255, 0.3)" />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.62rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      fontWeight: 600,
                    }}
                  >
                    ab {tier.minXp.toLocaleString()} XP
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.35)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Rakeback
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        color: '#D4AF37',
                      }}
                    >
                      {(tier.rakeback * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Tier Benefits Detail HUD */}
        {(() => {
          const inspectedTier = vipTiers.find((t) => t.name === (selectedTierName ?? currentTier.name)) ?? currentTier;
          const isUnlocked = xp >= inspectedTier.minXp;
          return (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '12px',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(145deg, rgba(20, 22, 30, 0.85) 0%, rgba(12, 14, 20, 0.95) 100%)',
                border: `1px solid ${inspectedTier.color}35`,
                backdropFilter: 'blur(16px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px ${inspectedTier.color}15`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${inspectedTier.color}15`,
                    border: `1px solid ${inspectedTier.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: inspectedTier.color,
                  }}
                >
                  <Crown size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff' }}>
                    {inspectedTier.name} VIP VORTEILE
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 600 }}>
                    {isUnlocked ? 'Bereits für dein Konto freigeschaltet' : `Benötigt noch ${(inspectedTier.minXp - xp).toLocaleString()} XP`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase' }}>
                    RAKEBACK
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.95rem', fontWeight: 900, color: '#D4AF37' }}>
                    {(inspectedTier.rakeback * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase' }}>
                    SUPPORT
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>
                    {inspectedTier.name === 'DIAMOND' || inspectedTier.name === 'PLATINUM' ? 'VIP Manager' : 'Priorität'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase' }}>
                    STATUS
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isUnlocked ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>
                    {isUnlocked ? 'FREIGESCHALTET' : 'GESPERRT'}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* ──── ROW 3: Achievements (left 65%) + Redeem & CTA (right 35%) ──── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '16px',
        }}
      >
        {/* Achievements */}
        <div style={{ ...card({ padding: isMobile ? '24px 16px' : '28px' }) }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={16} color="#D4AF37" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>
                ACHIEVEMENTS
              </span>
            </div>
            <button
              onClick={() => setShowAllAchievementsModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'rgba(212,175,55,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              ALL <ChevronRight size={11} />
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            {achievements.slice(0, 6).map((ach) => (
              <div
                key={ach.id}
                style={{
                  padding: '16px 12px',
                  background: ach.unlocked ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.01)',
                  borderRadius: '12px',
                  border: `1px solid ${ach.unlocked ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)'}`,
                  textAlign: 'center',
                  position: 'relative',
                  opacity: ach.unlocked ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    fontSize: '1.5rem',
                    marginBottom: '6px',
                    filter: ach.unlocked ? 'none' : 'grayscale(1) brightness(0.4)',
                  }}
                >
                  {ach.icon.startsWith('/') ? (
                    <Image
                      src={ach.icon}
                      alt={ach.title}
                      width={40}
                      height={40}
                      style={{ objectFit: 'contain', margin: '0 auto' }}
                    />
                  ) : (
                    ach.icon
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: ach.unlocked ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {ach.title}
                </div>
                <div
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 500,
                    color: ach.unlocked ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                    marginTop: '3px',
                    lineHeight: '1.2',
                  }}
                >
                  {ach.description}
                </div>
                {!ach.unlocked && (
                  <div
                    style={{
                      marginTop: '8px',
                      height: '3px',
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.04)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '2px',
                        width: `${Math.min(100, (ach.progress / ach.total) * 100)}%`,
                        background: '#D4AF37',
                        transition: 'width 0.5s',
                      }}
                    />
                  </div>
                )}
                {!ach.unlocked && (
                  <Lock
                    size={9}
                    style={{ position: 'absolute', top: 8, right: 8, opacity: 0.3, color: 'white' }}
                  />
                )}
                {ach.unlocked && (
                  <CheckCircle2
                    size={11}
                    style={{ position: 'absolute', top: 8, right: 8, color: '#D4AF37' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Redeem + Quick Play */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Redeem Code */}
          <div style={{ ...card({ padding: '24px 20px' }) }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}
            >
              <Gift size={14} color="#D4AF37" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                REDEEM CODE
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                ref={redeemInputRef}
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="e.g. JAN100"
                style={{
                  flex: 1,
                  height: 42,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  padding: '0 14px',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!voucherCode.trim()) return;
                  setIsRedeeming(true);
                  const res = await redeemCode(voucherCode);
                  if (res.success) {
                    setVoucherCode('');
                  }
                  setIsRedeeming(false);
                }}
                disabled={isRedeeming || !voucherCode.trim()}
                style={{
                  padding: '0 18px',
                  height: 42,
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #D4AF37, #b8962e)',
                  color: '#000',
                }}
              >
                {isRedeeming ? '...' : 'GO'}
              </motion.button>
            </div>
          </div>

          {/* Quick Play */}
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/games/crash')}
            style={{
              borderRadius: '16px',
              backgroundImage:
                'linear-gradient(100deg, rgba(6,5,3,0.75) 0%, rgba(6,5,3,0.45) 40%, rgba(6,5,3,0.1) 75%), url(/images/vault-playnow-bg.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '1px solid rgba(212,175,55,0.35)',
              boxShadow: '0 10px 28px rgba(212,175,55,0.15)',
              padding: '22px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.35)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
              >
                <Rocket size={18} color="#D4AF37" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    color: '#fff',
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  Play Now
                </div>
                <div
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.75)',
                    textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                  }}
                >
                  Crash, Dice, Roulette & more
                </div>
              </div>
            </div>
            <ArrowUpRight
              size={18}
              color="rgba(255,255,255,0.85)"
              style={{ position: 'relative', filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.5))' }}
            />
          </motion.div>
        </div>
      </div>

      {/* ──── All Achievements Modal ──── */}
      {showAllAchievementsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAllAchievementsModal(false)}
        >
          <div
            style={{
              ...card({
                padding: isMobile ? '24px 16px' : '32px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '85vh',
              }),
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={20} color="#D4AF37" />
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: '#fff',
                    letterSpacing: '0.02em',
                  }}
                >
                  ALL ACHIEVEMENTS
                </span>
              </div>
              <button
                onClick={() => setShowAllAchievementsModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  style={{
                    padding: '18px 14px',
                    background: ach.unlocked ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                    borderRadius: '14px',
                    border: `1px solid ${ach.unlocked ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)'}`,
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.8rem',
                      marginBottom: '8px',
                      filter: ach.unlocked ? 'none' : 'grayscale(1) brightness(0.4)',
                    }}
                  >
                    {ach.icon.startsWith('/') ? (
                      <Image
                        src={ach.icon}
                        alt={ach.title}
                        width={44}
                        height={44}
                        style={{ objectFit: 'contain', margin: '0 auto' }}
                      />
                    ) : (
                      ach.icon
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: ach.unlocked ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {ach.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      color: ach.unlocked ? '#D4AF37' : 'rgba(255,255,255,0.35)',
                      marginTop: '4px',
                      lineHeight: '1.3',
                    }}
                  >
                    {ach.description}
                  </div>
                  {!ach.unlocked && (
                    <div
                      style={{
                        marginTop: '10px',
                        height: '4px',
                        borderRadius: '2px',
                        background: 'rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '2px',
                          width: `${Math.min(100, (ach.progress / ach.total) * 100)}%`,
                          background: '#D4AF37',
                          transition: 'width 0.5s',
                        }}
                      />
                    </div>
                  )}
                  {!ach.unlocked && (
                    <Lock
                      size={10}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        opacity: 0.3,
                        color: 'white',
                      }}
                    />
                  )}
                  {ach.unlocked && (
                    <CheckCircle2
                      size={12}
                      style={{ position: 'absolute', top: 10, right: 10, color: '#D4AF37' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
