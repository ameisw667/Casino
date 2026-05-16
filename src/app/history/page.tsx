'use client';
import React, { useState, useEffect } from 'react';
import { 
  History, 
  TrendingUp, 
  Zap, 
  Target, 
  Download, 
  Filter, 
  ShieldCheck, 
  Wallet,
  Clock
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

function HistorySkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div style={{ height: '60px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '20px' }} className="animate-pulse" />
      <div style={{ display: 'flex', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: '100px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '24px' }} className="animate-pulse" />
        ))}
      </div>
      <div style={{ height: '300px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '32px' }} className="animate-pulse" />
    </div>
  );
}

export default function HistoryPage() {
  const isMobile = useCasinoStore(s => s.isMobile);
  const bets = useCasinoStore(s => s.bets);
  const gameStats = useCasinoStore(s => s.gameStats);
  const analytics = useCasinoStore(s => s.analytics);
  const responsibleGaming = useCasinoStore(s => s.responsibleGaming);
  const isLoading = useCasinoStore(s => s.isLoading);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  
  const totalWagered = bets.reduce((acc, bet) => acc + bet.amount, 0);
  const totalPayout = bets.reduce((acc, bet) => acc + bet.payout, 0);
  const netProfit = totalPayout - totalWagered;
  const winCount = bets.filter(b => b.win).length;
  const winRate = bets.length > 0 ? (winCount / bets.length * 100).toFixed(1) : '0.0';
  
  const statsArray = Object.entries(gameStats) as [string, { totalBets: number, profit: number }][];
  const topGameEntry = statsArray.length > 0 
    ? statsArray.reduce((prev, curr) => (prev[1].totalBets > curr[1].totalBets) ? prev : curr) 
    : ['NONE', { totalBets: 0 }] as [string, { totalBets: number, profit: number }];
  const topGame = String(topGameEntry[0]);

  const highRoller = totalWagered / (bets.length || 1) > 100;
  const precisionStriker = parseFloat(winRate) > 60 && bets.length > 10;

  const heatmap = analytics?.activityHeatmap || {};
  const earlyMorningBets = Object.entries(heatmap)
    .filter(([hour]) => parseInt(hour) < 9)
    .reduce((acc, [_hour, count]) => acc + count, 0);
  const totalHeatmapBets = Object.values(heatmap).reduce((acc, count) => acc + count, 0);
  const earlyBird = totalHeatmapBets > 0 && (earlyMorningBets / totalHeatmapBets) > 0.5;

  const badges = [
    { id: 'early_bird', label: 'EARLY BIRD', icon: Clock, active: earlyBird, description: 'Active before 9 AM' },
    { id: 'high_roller', label: 'HIGH ROLLER', icon: Wallet, active: highRoller, description: 'Avg. bet > $100' },
    { id: 'precision_striker', label: 'PRECISION STRIKER', icon: Target, active: precisionStriker, description: 'Win rate > 60%' },
  ];

  const filters = ['ALL', 'WINS', 'BONUSES', 'CASHOUTS'];

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px 100px' }}>
        <HistorySkeleton />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 4vw, 40px)', padding: isMobile ? '0 16px 100px' : '0 24px 100px' }}>
      
      {/* Compact Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', background: 'hsla(var(--primary), 0.05)', borderRadius: '20px', border: '1px solid hsla(var(--primary), 0.1)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '16px' : '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'TOTAL EARNED', value: `$${totalPayout.toLocaleString()}`, color: 'hsl(var(--primary))' },
            { label: 'NET PROFIT', value: `${netProfit >= 0 ? '+' : '-'}$${Math.abs(netProfit).toLocaleString()}`, color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' },
            { label: 'SUCCESS RATE', value: `${winRate}%`, color: 'hsl(var(--secondary))' },
            { label: 'TOTAL ACTIONS', value: bets.length.toString(), color: 'hsl(var(--primary))' },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>{stat.label}</span>
              <span style={{ fontSize: isMobile ? '0.9rem' : '1.1rem', fontWeight: 950, color: stat.color }}>{stat.value}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-secondary" style={{ borderRadius: '12px', gap: '8px', height: '44px', padding: '0 20px', fontSize: '0.85rem' }}>
          <Download size={16} /> EXPORT
        </button>
      </motion.div>

      {/* Behavioral Badges Section */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {badges.map((badge, idx) => (
          <motion.div 
            key={badge.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ 
              padding: '20px',
              borderRadius: '24px',
              background: badge.active ? 'linear-gradient(135deg, hsla(var(--primary), 0.15), transparent)' : 'hsla(0,0%,100%,0.02)',
              border: `1px solid ${badge.active ? 'hsla(var(--primary), 0.4)' : 'hsla(0,0%,100%,0.05)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              opacity: badge.active ? 1 : 0.4,
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: badge.active ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.05)', color: badge.active ? 'black' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <badge.icon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 950, color: badge.active ? 'white' : 'hsl(var(--text-dim))' }}>{badge.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{badge.description}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance breakdown */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card" 
        style={{ padding: isMobile ? '20px' : '32px', borderRadius: '32px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 950 }}>GAME PERFORMANCE</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Module-specific engagement metrics.</p>
          </div>
          <div style={{ padding: '8px 16px', background: 'hsla(var(--primary), 0.1)', borderRadius: '10px', color: 'hsl(var(--primary))', fontSize: '0.75rem', fontWeight: 900 }}>TOP GAME: {topGame}</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                <th style={{ padding: '16px 8px', fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>MODULE</th>
                <th style={{ padding: '16px 8px', fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>SPINS</th>
                <th style={{ padding: '16px 8px', fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>WIN RATE</th>
                <th style={{ padding: '16px 8px', fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>PROFIT</th>
                <th style={{ padding: '16px 8px', fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>PEAK</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gameStats).map(([name, stats]) => (
                <tr key={name} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.02)' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 900, fontSize: '0.9rem' }}>{name}</td>
                  <td style={{ padding: '16px 8px', fontWeight: 700 }}>{stats.totalBets}</td>
                  <td style={{ padding: '16px 8px', fontWeight: 700 }}>{stats.totalBets > 0 ? ((stats.wins / stats.totalBets) * 100).toFixed(1) : '0.0'}%</td>
                  <td style={{ padding: '16px 8px', fontWeight: 900, color: stats.profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                    {stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: 700 }}>{(stats.peakWinMultiplier || 0).toFixed(2)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Safety Hub */}
      <div className="glass-card" style={{ padding: isMobile ? '24px' : '32px', borderRadius: '32px', border: '1px solid hsla(var(--error), 0.1)', background: 'linear-gradient(to right, hsla(var(--error), 0.05), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ShieldCheck size={24} color="hsl(var(--error))" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 950, letterSpacing: '0.05em' }}>RESPONSIBLE GAMING</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ padding: '20px', borderRadius: '20px', background: 'hsla(0,0%,0%,0.3)', border: '1px solid hsla(0,0%,100%,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px' }}>LOSS LIMIT</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 950 }}>${(responsibleGaming?.sessionLoss || 0).toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>/ ${responsibleGaming?.lossLimit}</span></div>
            <div style={{ width: '100%', height: '6px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: 'hsl(var(--error))' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((responsibleGaming?.sessionLoss || 0) / (responsibleGaming?.lossLimit || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div style={{ padding: '20px', borderRadius: '20px', background: 'hsla(0,0%,0%,0.3)', border: '1px solid hsla(0,0%,100%,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px' }}>PATTERN ANALYSIS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: responsibleGaming?.martingaleDetected ? 'hsl(var(--error))' : 'hsl(var(--success))' }}>
              <Zap size={18} />
              <div style={{ fontSize: '1.1rem', fontWeight: '950' }}>{responsibleGaming?.martingaleDetected ? 'AGGRESSIVE DETECTED' : 'SAFE BEHAVIOR'}</div>
            </div>
          </div>
          <div style={{ padding: '20px', borderRadius: '20px', background: 'hsla(0,0%,0%,0.3)', border: '1px solid hsla(0,0%,100%,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-dim))', marginBottom: '8px' }}>SESSION TIME</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 950 }}>{Math.floor((analytics?.totalSessionTime ?? 0) / 60000)} <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>MINUTES</span></div>
          </div>
        </div>
      </div>

      {/* Filtering */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{ 
                padding: '14px 28px', 
                borderRadius: '16px', 
                background: activeFilter === f ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.03)',
                color: activeFilter === f ? 'black' : 'white',
                border: 'none',
                fontWeight: 950,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                whiteSpace: 'nowrap'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>
          <Filter size={16} /> VIEWING: {activeFilter}
        </div>
      </div>

      {bets.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card flex-col-center" 
          style={{ minHeight: '400px', gap: '24px', borderRadius: '40px' }}
        >
          <div style={{ width: '120px', height: '120px', borderRadius: '40px', background: 'hsla(var(--primary), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-dim))' }}>
            <History size={64} />
          </div>
          <div style={{ textAlign: 'center', padding: '0 20px' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '12px' }}>NO ACTIVITY YET</h3>
            <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '400px', lineHeight: 1.6, fontSize: '1rem' }}>Complete your first betting quest to unlock detailed behavioral analytics and performance tracking.</p>
          </div>
          <Link href="/games" className="btn btn-primary" style={{ height: '64px', padding: '0 40px', borderRadius: '20px', fontWeight: 950, fontSize: '1.1rem' }}>
            EXPLORE GAMES
          </Link>
        </motion.div>
      ) : (
        <div className="glass-card" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid hsla(0,0%,100%,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: 'hsla(0,0%,100%,0.02)', borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>ACTIVITY</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>TIME</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>AMOUNT</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>PAYOUT</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>VERIFICATION</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {bets
                    .filter(bet => {
                      if (activeFilter === 'ALL') return true;
                      if (activeFilter === 'WINS') return bet.win;
                      if (activeFilter === 'BONUSES') return bet.game === 'BONUS';
                      if (activeFilter === 'CASHOUTS') return bet.game === 'WITHDRAWAL';
                      return true;
                    })
                    .map((bet) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={bet.id} 
                      style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }} 
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {bet.game === 'Crash' ? <TrendingUp size={20} /> : 
                             bet.game === 'Dice' ? <Zap size={20} /> :
                             bet.game === 'BONUS' ? <Zap size={20} color="hsl(var(--primary))" /> :
                             bet.game === 'WITHDRAWAL' ? <Wallet size={20} color="hsl(var(--error))" /> :
                             <Target size={20} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 950, fontSize: '1.05rem' }}>{bet.game.toUpperCase()}</div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))', fontWeight: 800 }}>REF: {bet.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '24px', color: 'hsl(var(--text-muted))', fontWeight: 800, fontSize: '0.9rem' }}>{bet.time}</td>
                      <td style={{ padding: '24px', fontWeight: 900, fontSize: '1.05rem' }}>${bet.amount.toFixed(2)}</td>
                      <td style={{ padding: '24px' }}>
                        <div style={{ fontWeight: 950, fontSize: '1.1rem', color: bet.win ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                          {bet.win ? `+$${bet.payout.toFixed(2)}` : `-$${bet.amount.toFixed(2)}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-dim))', fontWeight: 900 }}>{bet.multiplier.toFixed(2)}x MULT</div>
                      </td>
                      <td style={{ padding: '24px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 950 }}>
                          <ShieldCheck size={14} /> FAIR
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Payout Verification */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ 
          padding: '40px', 
          borderRadius: '32px', 
          background: 'linear-gradient(135deg, hsla(var(--success), 0.1), transparent)', 
          border: '1px solid hsla(var(--success), 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'hsl(var(--success))', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={36} />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={{ fontSize: '1.4rem', fontWeight: 950, marginBottom: '6px' }}>AUTOMATED SETTLEMENT ACTIVE</h4>
          <p style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>Our provably fair settlement engine ensures all winnings are credited instantly to your wallet via isolated atomic transactions.</p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '16px 24px', background: 'hsla(0,0%,0%,0.4)', borderRadius: '20px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'hsl(var(--text-dim))', marginBottom: '4px' }}>NODE STATUS</div>
            <div style={{ fontSize: '1rem', fontWeight: 950, color: 'hsl(var(--success))' }}>STABLE / 100%</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}