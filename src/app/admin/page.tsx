'use client';
import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  ShieldCheck,
  ArrowUpRight,
  Activity
} from 'lucide-react';

export default function AdminOverview() {
  const stats = [
    { label: 'Total Wagered', value: '$1,284,592', change: '+12.5%', icon: <Wallet size={20} />, color: '#ffd700' },
    { label: 'Total Profit', value: '$42,391', change: '+5.2%', icon: <TrendingUp size={20} />, color: '#00e701' },
    { label: 'Active Players', value: '1,492', change: '+18.1%', icon: <Users size={20} />, color: '#00c2ff' },
    { label: 'Audit Health', value: '99.98%', change: 'Stable', icon: <ShieldCheck size={20} />, color: '#a855f7' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 5vw, 48px)' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '8px' }}>
          Welcome back, <span style={{ color: '#ffd700' }}>Operator</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          The casino is running at peak performance. All mathematical engines are verified.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass-card" style={{ 
            padding: '24px', 
            borderRadius: '24px', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-20px', 
              right: '-20px', 
              width: '80px', 
              height: '80px', 
              background: stat.color, 
              opacity: 0.05, 
              filter: 'blur(40px)',
              borderRadius: '50%'
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: stat.color }}>
                {stat.icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800, color: stat.change.includes('+') ? '#00e701' : '#ff4b4b' }}>
                {stat.change.includes('+') ? <ArrowUpRight size={14} /> : <Activity size={14} />}
                {stat.change}
              </div>
            </div>
            
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Alerts */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={20} color="#ffd700" />
            System Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { type: 'SUCCESS', msg: 'Provably Fair Seed Rotation completed successfully.', time: '2 mins ago' },
              { type: 'WARNING', msg: 'High volume detected on Crash Game. Scaling compute resources.', time: '14 mins ago' },
              { type: 'INFO', msg: 'New admin login detected from localized IP.', time: '1 hour ago' },
              { type: 'SUCCESS', msg: 'Daily RTP Audit for Slots: 96.4% (Within bounds).', time: '3 hours ago' },
            ].map((alert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: alert.type === 'SUCCESS' ? '#00e701' : alert.type === 'WARNING' ? '#ffd700' : '#00c2ff' 
                }} />
                <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{alert.msg}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{alert.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              background: 'hsla(var(--primary), 0.1)', 
              color: 'hsl(var(--primary))', 
              border: '1px solid hsla(var(--primary), 0.2)',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              Run Global Audit
            </button>
            <button style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              background: 'rgba(255,255,255,0.03)', 
              color: '#fff', 
              border: '1px solid rgba(255,255,255,0.05)',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              Rotate Server Seeds
            </button>
            <button style={{ 
              padding: '16px', 
              borderRadius: '16px', 
              background: 'rgba(255,255,255,0.03)', 
              color: '#fff', 
              border: '1px solid rgba(255,255,255,0.05)',
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'left'
            }}>
              View Support Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
