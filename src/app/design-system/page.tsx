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

export default function DesignSystemPage() {
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
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {showToast && (
        <div className="glass animate-slide-up" style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          padding: '16px 24px', 
          borderRadius: '12px', 
          zIndex: 100, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderLeft: '4px solid hsl(var(--success))'
        }}>
          <CheckCircle2 size={20} color="hsl(var(--success))" />
          <div>
            <div style={{ fontWeight: 600 }}>Bet Placed Successfully</div>
            <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Good luck with your 2.5x multiplier!</div>
          </div>
        </div>
      )}

      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', marginBottom: '8px' }}>Casino Design System v2.0</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.25rem' }}>
          A premium, high-fidelity UI framework built for high-stakes digital experiences.
        </p>
      </header>

      <section style={{ marginBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>1. Brand & Live States</h2>
          <span className="dot dot-success animate-pulse"></span>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--success))', fontWeight: 600 }}>LIVE SYSTEM</span>
        </div>
        <div className="grid-cols-auto">
          {[
            { label: 'Primary', color: 'hsl(var(--primary))', desc: 'Active states & primary actions' },
            { label: 'Secondary', color: 'hsl(var(--secondary))', desc: 'Secondary brand identity' },
            { label: 'Background', color: 'hsl(var(--bg-color))', desc: 'Main app background' },
            { label: 'Surface', color: 'hsl(var(--surface-color))', desc: 'Card & modal surfaces' },
          ].map(c => (
            <div key={c.label} className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ width: '100%', height: '80px', borderRadius: '8px', background: c.color, marginBottom: '12px' }}></div>
              <div style={{ fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '24px' }}>2. Interactive Controls</h2>
        <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={triggerLoading} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
            {loading ? 'Processing...' : 'Place Bet'}
          </button>
          
          <button className="btn btn-secondary" onClick={triggerToast}>
            <Bell size={18} />
            Show Notification
          </button>

          <button className="btn btn-ghost">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '24px' }}>3. Data Display & History</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TIME</th>
                <th>GAME</th>
                <th>PLAYER</th>
                <th>BET</th>
                <th>MULT.</th>
                <th>PAYOUT</th>
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
                  <td style={{ fontWeight: 700, color: row.win ? 'hsl(var(--success))' : 'inherit' }}>
                    {row.win ? `+$${(parseFloat(row.bet.slice(1)) * parseFloat(row.mult)).toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '24px' }}>4. Casino Core Modules</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ProvablyFairTool />
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '24px' }}>5. Feedback Systems</h2>
        <div className="grid-cols-auto">
          <div className="glass-card" style={{ borderLeft: '4px solid hsl(var(--success))' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <CheckCircle2 color="hsl(var(--success))" />
              <div>
                <div style={{ fontWeight: 600 }}>Withdrawal Confirmed</div>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>$1,240.00 sent to your bank account.</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card" style={{ borderLeft: '4px solid hsl(var(--error))' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <AlertCircle color="hsl(var(--error))" />
              <div>
                <div style={{ fontWeight: 600 }}>Insufficient Balance</div>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Please top up your wallet to continue playing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '24px' }}>6. Navigation Primitives</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { icon: <TrendingUp size={18}/>, label: 'Games', active: true },
              { icon: <History size={18}/>, label: 'My Bets' },
              { icon: <Trophy size={18}/>, label: 'Leaderboard' },
              { icon: <Wallet size={18}/>, label: 'Cashier' },
              { icon: <MessageSquare size={18}/>, label: 'Live Chat' },
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
          <div className="glass-card flex-center" style={{ minHeight: '200px', borderStyle: 'dashed' }}>
            <div style={{ textAlign: 'center', color: 'hsl(var(--text-dim))' }}>
              <ShieldCheck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Main Application Content Area</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ marginBottom: '24px' }}>7. Gamification & Progression</h2>
        <div className="grid-cols-auto">
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>XP & RANK INDICATOR</div>
            <div className="glass-card" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid hsla(var(--primary), 0.2)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={12} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--primary))', textTransform: 'uppercase' }}>Gold</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-main))', fontWeight: 700 }}>Level 24</span>
              </div>
              <div style={{ width: '120px', height: '6px', background: 'hsla(0, 0%, 100%, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' }} />
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 800, color: 'hsl(var(--accent))' }}>ACHIEVEMENT CARD</div>
            <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid hsla(var(--accent), 0.2)' }}>
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

      <footer style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: 'hsl(var(--text-dim))', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={16}/> Certified Fair</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Wallet size={16}/> Fast Payouts</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><History size={16}/> 24/7 Support</div>
        </div>
      </footer>
    </div>
  );
}
