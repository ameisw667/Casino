'use client';

import { History, TrendingUp, TrendingDown, User, Zap, CircleDollarSign, Target } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

import Image from 'next/image';

export default function HistoryPage() {
  const { bets } = useCasinoStore();

  const totalWagered = bets.reduce((acc, bet) => acc + bet.amount, 0);
  const totalPayout = bets.reduce((acc, bet) => acc + bet.payout, 0);
  const netProfit = totalPayout - totalWagered;
  const winCount = bets.filter(b => b.win).length;
  const winRate = bets.length > 0 ? (winCount / bets.length * 100).toFixed(1) : '0.0';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <header style={{ 
        position: 'relative', 
        height: '300px', 
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '60px',
        border: '1px solid hsla(0,0%,100%,0.05)',
        marginTop: '20px'
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <Image 
            src="/images/history-hero.png" 
            alt="History Hero" 
            fill 
            style={{ objectFit: 'cover', opacity: 0.4 }}
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to right, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>Betting <br /> History</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '1.2rem', maxWidth: '500px', marginTop: '12px' }}>Track your performance and analytics over time.</p>
      </header>

      {/* Stats Dashboard */}
      <div className="grid-cols-auto" style={{ marginBottom: '40px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>TOTAL WAGERED</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800 }}>${totalWagered.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: netProfit >= 0 ? 'hsla(var(--success), 0.1)' : 'hsla(var(--error), 0.1)', color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
            <CircleDollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>NET PROFIT</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
              {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))' }}>
            <Target size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 700 }}>WIN RATE</div>
            <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800 }}>{winRate}%</div>
          </div>
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="glass-card flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
          <History size={48} color="hsl(var(--text-dim))" />
          <p style={{ color: 'hsl(var(--text-muted))' }}>No bets placed yet. Start playing to see your history!</p>
        </div>
      ) : (
        <div className="table-container animate-fade-in">
          <table>
            <thead>
              <tr>
                <th>TIME</th>
                <th>GAME</th>
                <th>BET</th>
                <th>MULT.</th>
                <th>PAYOUT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id}>
                  <td style={{ color: 'hsl(var(--text-dim))' }} className="mono">{bet.time}</td>
                  <td style={{ fontWeight: 600 }}>{bet.game}</td>
                  <td className="mono">${bet.amount.toFixed(2)}</td>
                  <td className="mono" style={{ color: bet.win ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
                    {bet.multiplier.toFixed(2)}x
                  </td>
                  <td style={{ fontWeight: 700, color: bet.win ? 'hsl(var(--success))' : 'inherit' }}>
                    {bet.win ? `+$${bet.payout.toFixed(2)}` : '-'}
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      color: bet.win ? 'hsl(var(--success))' : 'hsl(var(--error))',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {bet.win ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {bet.win ? 'WIN' : 'LOSS'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
