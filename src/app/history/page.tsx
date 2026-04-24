'use client';

import React, { useState } from 'react';
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  CircleDollarSign, 
  Target, 
  Download, 
  Filter, 
  ArrowUpRight, 
  ShieldCheck, 
  Wallet,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import Link from 'next/link';

export default function HistoryPage() {
  const { isMobile, bets } = useCasinoStore();
  const [activeFilter, setActiveFilter] = useState('ALL');

  const totalWagered = bets.reduce((acc, bet) => acc + bet.amount, 0);
  const totalPayout = bets.reduce((acc, bet) => acc + bet.payout, 0);
  const netProfit = totalPayout - totalWagered;
  const winCount = bets.filter(b => b.win).length;
  const winRate = bets.length > 0 ? (winCount / bets.length * 100).toFixed(1) : '0.0';

  const filters = ['ALL', 'WINS', 'BONUSES', 'CASHOUTS'];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', padding: '0 24px 100px' }}>
      
      {/* Dashboard Earning Overview */}
      <header style={{ 
        marginTop: '20px',
        padding: isMobile ? '32px 20px' : '48px',
        borderRadius: '32px',
        background: 'linear-gradient(135deg, hsla(var(--bg-color), 0.9), hsla(var(--primary), 0.03))',
        border: '1px solid hsla(var(--primary), 0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'hsla(var(--primary), 0.1)', borderRadius: '8px', color: 'hsl(var(--primary))', fontSize: '0.7rem', fontWeight: 900, marginBottom: '16px', letterSpacing: '0.1em' }}>PERSONAL DASHBOARD</div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 950, fontFamily: "'Outfit', sans-serif" }}>EARNING HISTORY</h1>
            <p style={{ color: 'hsl(var(--text-muted))', marginTop: '8px', fontSize: '1rem' }}>Track your earnings, tasks and instant withdrawals.</p>
          </div>
          <button className="btn btn-secondary" style={{ borderRadius: '14px', gap: '8px', height: '52px', padding: '0 24px' }}>
            <Download size={18} /> EXPORT REPORT
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
          {[
            { label: 'TOTAL EARNED', value: `$${totalPayout.toLocaleString()}`, icon: CircleDollarSign, color: 'hsl(var(--primary))' },
            { label: 'NET PROFIT', value: `${netProfit >= 0 ? '+' : '-'}$${Math.abs(netProfit).toLocaleString()}`, icon: TrendingUp, color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' },
            { label: 'SUCCESS RATE', value: `${winRate}%`, icon: Target, color: 'hsl(var(--secondary))' },
            { label: 'TASKS DONE', value: bets.length.toString(), icon: Zap, color: 'hsl(var(--primary))' },
          ].map((stat, i) => (
            <div key={i} className="glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stat.color}11`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={18} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#fff' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {filters.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '14px', 
                background: activeFilter === f ? 'white' : 'hsla(0,0%,100%,0.03)',
                color: activeFilter === f ? 'black' : 'white',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>
          <Filter size={14} /> FILTERING BY: {activeFilter}
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="glass-card flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '24px', borderRadius: '40px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '32px', background: 'hsla(var(--primary), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-dim))' }}>
            <History size={48} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '8px' }}>No Activity Recorded</h3>
            <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '350px', lineHeight: 1.6 }}>Start your first quest in the Earning Center to see your detailed performance analytics here.</p>
          </div>
          <Link href="/games" className="btn btn-primary" style={{ height: '56px', padding: '0 32px', borderRadius: '16px', fontWeight: 900 }}>
            GO TO EARNING CENTER
          </Link>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0', borderRadius: '32px', overflow: 'hidden', border: '1px solid hsla(0,0%,100%,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'hsla(0,0%,100%,0.02)', borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>ACTIVITY / GAME</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>TIME</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>AMOUNT</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>RESULT</th>
                  <th style={{ padding: '24px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }} className="hover:bg-white/5 transition-colors">
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {bet.game === 'Crash' ? <TrendingUp size={18} /> : <Zap size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '1rem' }}>{bet.game.toUpperCase()} QUEST</div>
                          <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', fontWeight: 700 }}>ID: {bet.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px', color: 'hsl(var(--text-muted))', fontWeight: 700, fontSize: '0.9rem' }}>{bet.time}</td>
                    <td style={{ padding: '24px', fontWeight: 800, fontSize: '1rem' }}>${bet.amount.toFixed(2)}</td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: 950, fontSize: '1.1rem', color: bet.win ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                        {bet.win ? `+$${bet.payout.toFixed(2)}` : `-$${bet.amount.toFixed(2)}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-dim))', fontWeight: 800 }}>{bet.multiplier.toFixed(2)}x MULTIPLIER</div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                        <ShieldCheck size={12} /> VERIFIED
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Payout Verification Section */}
      <div style={{ 
        padding: '32px', 
        borderRadius: '32px', 
        background: 'hsla(var(--success), 0.05)', 
        border: '1px solid hsla(var(--success), 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'hsl(var(--success))', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={32} />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px' }}>INSTANT PAYOUT SYSTEM ACTIVE</h4>
          <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>All transactions are processed via our automated and provably fair system. Average time to bank: 2m.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '12px 20px', background: 'hsla(0,0%,0%,0.2)', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>PAYOUT STATUS</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'hsl(var(--success))' }}>OPERATIONAL</div>
          </div>
        </div>
      </div>
    </div>
  );
}
