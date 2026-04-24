'use client';

import React from 'react';
import { User, Trophy, Zap, Calendar, TrendingUp, Star, UserPlus, Check } from 'lucide-react';
import { useCasinoStore, RANKS } from '@/store/useCasinoStore';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  level: number;
  rank: string;
}

export default function PlayerProfileModal({ isOpen, onClose, username, level, rank }: PlayerProfileModalProps) {
  const { friends, addFriend } = useCasinoStore();
  const isFriend = friends.includes(username);

  if (!isOpen) return null;

  const mockStats = {
    joinDate: 'Jan 2024',
    totalWagered: '$124,500',
    highestWin: '142.5x',
    favoriteGame: 'Crash',
    totalWins: 1420
  };

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      zIndex: 3000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(15px)'
    }}>
      <div className="glass-card animate-slide-up" style={{ 
        width: '500px', 
        padding: '0', 
        borderRadius: '32px', 
        overflow: 'hidden',
        border: '1px solid hsla(var(--primary), 0.3)',
        boxShadow: '0 0 100px hsla(var(--primary), 0.1)'
      }}>
        {/* Header / Banner */}
        <div style={{ 
          height: '120px', 
          background: 'linear-gradient(135deg, hsla(var(--primary), 0.2), hsla(var(--secondary), 0.2))',
          position: 'relative'
        }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.6 }}
          >
            ✕
          </button>
        </div>

        {/* Profile Info */}
        <div style={{ padding: '0 40px 40px', marginTop: '-40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '32px' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '24px', 
              background: 'hsl(var(--surface-raised))',
              border: '4px solid hsl(var(--bg-color))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'hsl(var(--primary))'
            }}>
              <User size={48} />
            </div>
            <div style={{ paddingBottom: '8px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>{username}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, background: 'hsl(var(--primary))', color: 'black', padding: '2px 6px', borderRadius: '4px' }}>LVL {level}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-muted))' }}>{rank} Rank</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <TrendingUp size={12} /> Total Wagered
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{mockStats.totalWagered}</div>
            </div>
            <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Zap size={12} /> Highest Win
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'hsl(var(--success))' }}>{mockStats.highestWin}</div>
            </div>
          </div>

          {/* Perks Section */}
          <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '40px', background: 'hsla(var(--primary), 0.05)', border: '1px solid hsla(var(--primary), 0.1)' }}>
            <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--primary))', letterSpacing: '0.1em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={14} fill="currentColor" /> {rank.toUpperCase()} PERKS
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {RANKS.find(r => r.name === rank)?.perks.map((perk) => (
                <span key={perk} style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '8px', color: 'hsl(var(--text-main))' }}>
                  ✓ {perk}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1, height: '52px', borderRadius: '16px' }}>SEND TIP</button>
            <button 
              onClick={() => addFriend(username)}
              className={isFriend ? "btn btn-ghost" : "btn btn-primary"} 
              style={{ 
                flex: 1, 
                height: '52px', 
                borderRadius: '16px',
                color: isFriend ? 'hsl(var(--success))' : 'black'
              }}
            >
              {isFriend ? <><Check size={16} /> FOLLOWING</> : <><UserPlus size={16} /> FOLLOW</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
