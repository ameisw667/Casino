'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Settings, 
  User, 
  ShieldCheck, 
  Wallet, 
  History, 
  Trophy, 
  MessageSquare, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Bell,
  Star
} from 'lucide-react';
import ProvablyFairTool from '@/components/casino/ProvablyFairTool';
import { useCasinoStore } from '@/store/useCasinoStore';

export default function DesignSystemPage() {
  const { isMobile } = useCasinoStore();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const triggerLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '40px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {showToast && (
        <div className="glass animate-slide-up" style={{ 
          position: 'fixed', 
          bottom: isMobile ? '80px' : '24px', 
          right: isMobile ? '16px' : '24px', 
          left: isMobile ? '16px' : 'auto',
          padding: '16px 24px', 
          borderRadius: '12px', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderLeft: '4px solid hsl(var(--success))',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          <CheckCircle2 size={20} color="hsl(var(--success))" />
          <div>
            <div style={{ fontWeight: 600 }}>Bet Placed Successfully</div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Good luck with your multiplier!</div>
          </div>
        </div>
      )}

      <header style={{ marginBottom: isMobile ? '40px' : '60px', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: isMobile ? '2.5rem' : '4rem', marginBottom: '12px', lineHeight: 1 }}>Casino Design System</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: isMobile ? '1rem' : '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          A premium UI framework built for high-stakes digital experiences.
        </p>
      </header>

      <section style={{ marginBottom: isMobile ? '40px' : '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: isMobile ? '1.25rem' : '1.5rem' }}>1. Brand & Live States</h2>
          <span className="dot dot-success animate-pulse"></span>
        </div>
        <div className="grid-cols-auto">
          {[
            { label: 'Primary', color: 'hsl(var(--primary))', desc: 'Active states' },
            { label: 'Secondary', color: 'hsl(var(--secondary))', desc: 'Brand identity' },
            { label: 'Background', color: 'hsl(var(--bg-color))', desc: 'App background' },
            { label: 'Surface', color: 'hsl(var(--surface-color))', desc: 'Modal surfaces' },
          ].map(c => (
            <div key={c.label} className="glass-card" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ width: '100%', height: '60px', borderRadius: '8px', background: c.color, marginBottom: '12px' }}></div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: isMobile ? '40px' : '80px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>2. Interactive Controls</h2>
        <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '12px' : '20px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={triggerLoading} disabled={loading} style={{ flex: isMobile ? '1 1 100%' : 'none' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            {loading ? 'Processing...' : 'Place Bet'}
          </button>
          
          <button className="btn btn-secondary" onClick={triggerToast} style={{ flex: isMobile ? '1 1 100%' : 'none' }}>
            <Bell size={18} />
            Show Notification
          </button>

          <button className="btn btn-ghost" style={{ flex: isMobile ? '1 1 100%' : 'none' }}>
            <Settings size={18} />
            Settings
          </button>
        </div>
      </section>

      <section style={{ marginBottom: isMobile ? '40px' : '80px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>3. Data Display & History</h2>
        <div className="responsive-table-container">
          <table className="responsive-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>GAME</th>
                <th>PLAYER</th>
                <th>BET</th>
                <th>MULT.</th>
                <th style={{ textAlign: 'right' }}>PAYOUT</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '19:42:01', game: 'CRASH', user: 'JanP', bet: '$100.00', mult: '2.45x', win: true },
                { time: '19:41:55', game: 'DICE', user: 'VibeCoder', bet: '$50.00', mult: '1.98x', win: true },
                { time: '19:41:30', game: 'CRASH', user: 'Anonym', bet: '$500.00', mult: '0.00x', win: false },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ color: 'hsl(var(--text-dim))' }} className="mono">{row.time}</td>
                  <td style={{ fontWeight: 600 }}>{row.game}</td>
                  <td>{row.user}</td>
                  <td className="mono">{row.bet}</td>
                  <td className="mono" style={{ color: row.win ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>{row.mult}</td>
                  <td style={{ fontWeight: 700, textAlign: 'right', color: row.win ? 'hsl(var(--success))' : 'inherit' }}>
                    {row.win ? `+$${(parseFloat(row.bet.slice(1)) * parseFloat(row.mult)).toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: isMobile ? '40px' : '80px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>4. Casino Core Modules</h2>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <ProvablyFairTool />
        </div>
      </section>

      <section style={{ marginBottom: isMobile ? '40px' : '80px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>5. Navigation Primitives</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { icon: <TrendingUp size={18}/>, label: 'Games', active: true },
              { icon: <History size={18}/>, label: 'My Bets' },
              { icon: <Trophy size={18}/>, label: 'Leaderboard' },
            ].map(item => (
              <div key={item.label} className="btn btn-ghost" style={{ 
                justifyContent: 'flex-start', 
                background: item.active ? 'hsla(0, 0%, 100%, 0.05)' : 'transparent',
                color: item.active ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
              }}>
                {item.icon}
                {item.label}
              </div>
            ))}
          </div>
          <div className="glass-card flex-center" style={{ minHeight: '150px', borderStyle: 'dashed' }}>
            <div style={{ textAlign: 'center', color: 'hsl(var(--text-dim))', padding: '20px' }}>
              <ShieldCheck size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.9rem' }}>Main Application Content Area</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: isMobile ? '60px' : '80px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>6. Gamification</h2>
        <div className="grid-cols-auto">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 800, color: 'hsl(var(--primary))', fontSize: '0.75rem' }}>XP & RANK</div>
            <div className="glass-card" style={{ padding: '12px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid hsla(var(--primary), 0.2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={12} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>Gold</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-main))', fontWeight: 700 }}>Lvl 24</span>
              </div>
              <div style={{ flex: 1, minWidth: isMobile ? '60px' : '120px', height: '6px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' }} />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 800, color: 'hsl(var(--accent))', fontSize: '0.75rem' }}>ACHIEVEMENT</div>
            <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid hsla(var(--accent), 0.2)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'hsla(var(--accent), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--accent))' }}>
                <Trophy size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>High Roller</div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Wager $1,000+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: isMobile ? '40px' : '80px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '40px', paddingBottom: isMobile ? '80px' : '40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '16px' : '24px', color: 'hsl(var(--text-dim))', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16}/> Certified Fair</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wallet size={16}/> Fast Payouts</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16}/> 24/7 Support</div>
        </div>
      </footer>
    </div>
  );
}
