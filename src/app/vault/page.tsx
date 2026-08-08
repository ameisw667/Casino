'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useCasinoStore } from '@/store/useCasinoStore';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VaultPage() {
  const {
    balance,
    xp,
    level,
    vipTiers,
    achievements,
    isMobile,
    redeemCode,
    gameStats,
    analytics,
  } = useCasinoStore();

  const [mounted, setMounted] = React.useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const currentTier = useMemo(() =>
    [...vipTiers].reverse().find(t => xp >= t.minXp) || vipTiers[0],
    [xp, vipTiers]
  );
  const currentTierIndex = vipTiers.findIndex(t => t.name === currentTier.name);
  const nextTier = currentTierIndex < vipTiers.length - 1 ? vipTiers[currentTierIndex + 1] : null;
  const tierProgress = nextTier
    ? ((xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100
    : 100;
  const nextLevelXp = Math.pow(level, 2) * 100;
  const levelProgress = Math.min(100, (xp / nextLevelXp) * 100);

  const totalStats = useMemo(() => {
    let totalBets = 0, totalWins = 0, totalProfit = 0;
    for (const game of Object.values(gameStats)) {
      totalBets += game.totalBets;
      totalWins += game.wins;
      totalProfit += game.profit;
    }
    return { totalBets, totalWins, totalProfit, winRate: totalBets > 0 ? (totalWins / totalBets) * 100 : 0 };
  }, [gameStats]);

  if (!mounted) return null;

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    borderRadius: '16px',
    background: 'rgba(12,12,14,0.7)',
    border: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    ...extra,
  });

  return (
    <div style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: isMobile ? '16px 12px 120px' : '20px 32px 80px' }}>

      {/* ──── ROW 1: Profile ──── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 420px)',
        gap: '16px',
        marginBottom: '16px',
      }}>
        {/* Profile Card */}
        <div style={{
          ...card({ padding: '28px 24px' }),
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px', width: '140px', height: '140px',
            background: `radial-gradient(circle, ${currentTier.color}10 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ width: '52px', height: '52px', position: 'relative', flexShrink: 0 }}>
              <svg width="52" height="52" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={currentTier.color} strokeWidth="6"
                  strokeDasharray={`${levelProgress * 2.76} 276`} strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 4px ${currentTier.color}50)` }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: '5px', borderRadius: '50%', overflow: 'hidden',
                border: `2px solid ${currentTier.color}40`,
              }}>
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=Vibe" alt="avatar" fill style={{ objectFit: 'cover' }} />
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>VibeCoder_Royale</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span style={{
                  fontSize: '0.55rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px',
                  background: `${currentTier.color}15`, color: currentTier.color,
                  border: `1px solid ${currentTier.color}30`, letterSpacing: '0.08em',
                }}>{currentTier.name}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>LVL {level}</span>
              </div>
            </div>
          </div>

          {/* Key Figures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '4px' }}>BALANCE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#D4AF37', fontFamily: 'var(--font-mono, monospace)' }}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', marginBottom: '4px' }}>XP</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono, monospace)' }}>
                {xp.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Verified */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '8px',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
              fontSize: '0.6rem', fontWeight: 800, color: '#10b981',
            }}>
              <ShieldCheck size={11} /> VERIFIED
            </div>
          </div>
        </div>
      </div>

      {/* ──── ROW 2: VIP Progression (left 60%) + Stats (right 40%) ──── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
        gap: '16px',
        marginBottom: '16px',
      }}>
        {/* VIP Progression */}
        <div style={{ ...card({ padding: isMobile ? '24px 16px' : '28px' }) }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Crown size={16} color="#D4AF37" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>VIP PROGRESSION</span>
            </div>
            {nextTier && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                {(nextTier.minXp - xp).toLocaleString()} XP to {nextTier.name}
              </span>
            )}
          </div>

          {/* Tier Nodes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 8px', marginBottom: '12px' }}>
            {vipTiers.map((tier, i) => {
              const isActive = tier.name === currentTier.name;
              const isPast = xp >= tier.minXp;
              return (
                <React.Fragment key={tier.name}>
                  {i > 0 && (
                    <div style={{
                      flex: 1, height: '2px',
                      background: isPast ? `linear-gradient(90deg, ${vipTiers[i - 1].color}80, ${tier.color}80)` : 'rgba(255,255,255,0.04)',
                    }} />
                  )}
                  <div style={{
                    width: isActive ? 40 : 28, height: isActive ? 40 : 28,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isPast ? `${tier.color}18` : 'rgba(255,255,255,0.02)',
                    border: `2px solid ${isPast ? `${tier.color}80` : 'rgba(255,255,255,0.06)'}`,
                    position: 'relative', transition: 'all 0.3s',
                    boxShadow: isActive ? `0 0 20px ${tier.color}25` : 'none',
                  }}>
                    {isPast ? <Star size={isActive ? 16 : 11} color={tier.color} fill={tier.color} /> : <Lock size={10} color="rgba(255,255,255,0.15)" />}
                    <span style={{
                      position: 'absolute', top: '100%', marginTop: '5px',
                      fontSize: '0.5rem', fontWeight: 800, color: isPast ? `${tier.color}cc` : 'rgba(255,255,255,0.15)',
                      whiteSpace: 'nowrap', letterSpacing: '0.04em',
                    }}>{tier.name}</span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {nextTier && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: '3px',
                    background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                    boxShadow: `0 0 8px ${currentTier.color}30`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: `${currentTier.color}aa` }}>
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
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>LIFETIME STATS</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'BETS', value: totalStats.totalBets.toLocaleString(), color: '#6366f1' },
              { label: 'WIN RATE', value: `${totalStats.winRate.toFixed(1)}%`, color: '#10b981' },
              { label: 'PROFIT', value: `${totalStats.totalProfit >= 0 ? '+' : ''}$${totalStats.totalProfit.toFixed(2)}`, color: totalStats.totalProfit >= 0 ? '#10b981' : '#ef4444' },
              { label: 'WAGERED', value: `$${(analytics?.totalWagered ?? 0).toFixed(0)}`, color: '#D4AF37' },
            ].map((s) => (
              <div key={s.label} style={{
                padding: '14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: '0.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: s.color, fontFamily: 'var(--font-mono, monospace)' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── ROW 3: Achievements (left 65%) + Redeem & CTA (right 35%) ──── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
        gap: '16px',
      }}>
        {/* Achievements */}
        <div style={{ ...card({ padding: isMobile ? '24px 16px' : '28px' }) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy size={16} color="#D4AF37" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>ACHIEVEMENTS</span>
            </div>
            <Link href="/history" style={{
              fontSize: '0.65rem', fontWeight: 700, color: 'rgba(212,175,55,0.7)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '3px',
            }}>
              ALL <ChevronRight size={11} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px' }}>
            {achievements.slice(0, 6).map((ach) => (
              <div key={ach.id} style={{
                padding: '16px 12px',
                background: ach.unlocked ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.01)',
                borderRadius: '12px',
                border: `1px solid ${ach.unlocked ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)'}`,
                textAlign: 'center', position: 'relative',
                opacity: ach.unlocked ? 1 : 0.4,
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px', filter: ach.unlocked ? 'none' : 'grayscale(1) brightness(0.4)' }}>
                  {ach.icon.startsWith('/') ? (
                    <Image src={ach.icon} alt={ach.title} width={40} height={40} style={{ objectFit: 'contain' }} />
                  ) : ach.icon}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: ach.unlocked ? '#fff' : 'rgba(255,255,255,0.25)' }}>{ach.title}</div>
                {!ach.unlocked && (
                  <div style={{ marginTop: '6px', height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '1px',
                      width: `${Math.min(100, (ach.progress / ach.total) * 100)}%`,
                      background: '#D4AF37', transition: 'width 0.5s',
                    }} />
                  </div>
                )}
                {!ach.unlocked && <Lock size={9} style={{ position: 'absolute', top: 8, right: 8, opacity: 0.2, color: 'white' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Redeem + Quick Play */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Redeem Code */}
          <div style={{ ...card({ padding: '24px 20px' }) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Gift size={14} color="#D4AF37" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>REDEEM CODE</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="e.g. JAN100"
                style={{
                  flex: 1, height: 42,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '0 14px',
                  color: 'white', fontSize: '0.8rem', fontWeight: 600, outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!voucherCode.trim()) return;
                  setIsRedeeming(true);
                  await new Promise(r => setTimeout(r, 1000));
                  redeemCode(voucherCode);
                  setVoucherCode('');
                  setIsRedeeming(false);
                }}
                disabled={isRedeeming || !voucherCode.trim()}
                style={{
                  padding: '0 18px', height: 42, borderRadius: '10px',
                  fontSize: '0.75rem', fontWeight: 900, border: 'none', cursor: 'pointer',
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
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/games/crash')}
            style={{
              ...card({ padding: '22px 20px', cursor: 'pointer' }),
              borderColor: 'rgba(212,175,55,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(212,175,55,0.1)',
              }}>
                <Rocket size={16} color="#D4AF37" />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Play Now</div>
                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>Crash, Dice, Roulette & more</div>
              </div>
            </div>
            <ArrowUpRight size={16} color="rgba(212,175,55,0.6)" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
