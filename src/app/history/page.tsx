'use client';

import { History, TrendingUp, TrendingDown, User, Zap, CircleDollarSign, Target } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import Link from 'next/link';
import Image from 'next/image';

export default function HistoryPage() {
  const { isMobile, bets } = useCasinoStore();

  const totalWagered = bets.reduce((acc, bet) => acc + bet.amount, 0);
  const totalPayout = bets.reduce((acc, bet) => acc + bet.payout, 0);
  const netProfit = totalPayout - totalWagered;
  const winCount = bets.filter(b => b.win).length;
  const winRate = bets.length > 0 ? (winCount / bets.length * 100).toFixed(1) : '0.0';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '24px' : '40px', padding: '0 var(--container-padding)' }}>
      <header style={{ 
        position: 'relative', 
        height: isMobile ? 'auto' : '300px', 
        minHeight: isMobile ? '220px' : '300px',
        borderRadius: '24px', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: isMobile ? '40px 24px' : '60px',
        border: '1px solid hsla(0,0%,100%,0.05)',
        marginTop: isMobile ? '10px' : '20px'
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
            background: isMobile 
              ? 'radial-gradient(circle at center, transparent 0%, hsl(var(--bg-color)) 100%), linear-gradient(to top, hsl(var(--bg-color)) 0%, transparent 100%)'
              : 'linear-gradient(to right, hsl(var(--bg-color)) 0%, transparent 100%)' 
          }} />
        </div>
        <h1 className="text-gradient" style={{ 
          fontSize: isMobile ? '2.5rem' : '4.5rem', 
          fontWeight: 900, 
          lineHeight: 1,
          textAlign: isMobile ? 'center' : 'left'
        }}>Betting <br /> History</h1>
        <p style={{ 
          color: 'hsl(var(--text-muted))', 
          fontSize: isMobile ? '1rem' : '1.2rem', 
          maxWidth: isMobile ? '100%' : '500px', 
          marginTop: '12px',
          textAlign: isMobile ? 'center' : 'left'
        }}>Track your performance and analytics over time.</p>
      </header>

      {/* Stats Dashboard */}
      <div className="grid-cols-auto" style={{ marginBottom: isMobile ? '0' : '40px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: isMobile ? '20px' : '24px' }}>
          <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '12px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={isMobile ? 18 : 20} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 800, letterSpacing: '0.05em' }}>TOTAL WAGERED</div>
            <div className="mono" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800 }}>${totalWagered.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: isMobile ? '20px' : '24px' }}>
          <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '12px', background: netProfit >= 0 ? 'hsla(var(--success), 0.1)' : 'hsla(var(--error), 0.1)', color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CircleDollarSign size={isMobile ? 18 : 20} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 800, letterSpacing: '0.05em' }}>NET PROFIT</div>
            <div className="mono" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800, color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))' }}>
              {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: isMobile ? '20px' : '24px' }}>
          <div style={{ width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '12px', background: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={isMobile ? 18 : 20} />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', fontWeight: 800, letterSpacing: '0.05em' }}>WIN RATE</div>
            <div className="mono" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 800 }}>{winRate}%</div>
          </div>
        </div>
      </div>

      {bets.length === 0 ? (
        <div className="glass flex-center" style={{ 
          minHeight: '400px', 
          flexDirection: 'column', 
          gap: '24px', 
          borderRadius: '32px',
          border: '1px dashed hsla(0,0%,100%,0.1)',
          background: 'hsla(0,0%,100%,0.01)'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            background: 'hsla(var(--primary), 0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'hsl(var(--text-dim))'
          }}>
            <History size={40} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>No activity found</h3>
            <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '300px', lineHeight: 1.5 }}>
              Your betting history is currently empty. Start playing our games to see your performance metrics.
            </p>
          </div>
          <Link href="/games" className="btn btn-primary" style={{ marginTop: '12px' }}>
            EXPLORE GAMES
          </Link>
        </div>
      ) : (
        <div className="responsive-table-container animate-fade-in">
          <table className="responsive-table">
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
