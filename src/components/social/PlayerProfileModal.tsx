'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';

interface PlayerProfileModalProps {
  user: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerProfileModal({ user, isOpen, onClose }: PlayerProfileModalProps) {
  const vipTiers = useCasinoStore((s) => s.vipTiers);

  // Simulate player data for the profile
  // In a real app, this would be fetched from an API
  const isSelf = user === 'You';
  const [randomData, setRandomData] = React.useState({
    level: 5,
    xp: 5000,
    totalWagered: 2500,
    biggestWin: 100,
  });

  React.useEffect(() => {
    if (!isSelf) {
      const l = Math.floor(Math.random() * 80) + 5;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRandomData({
        level: l,
        xp: l * 1000 + Math.floor(Math.random() * 1000),
        totalWagered: l * 500 + Math.floor(Math.random() * 5000),
        biggestWin: Math.floor(Math.random() * 500) + 100,
      });
    }
  }, [isSelf]);

  const level = isSelf ? 15 : randomData.level;
  const xp = isSelf ? 7500 : randomData.xp;
  const tier = [...vipTiers].reverse().find((t) => xp >= t.minXp) || vipTiers[0];
  const joined = 'Oct 2025';
  const totalWagered = isSelf ? 2450 : randomData.totalWagered;
  const totalWins = Math.floor(totalWagered * 0.95);
  const biggestWin = isSelf ? 250 : randomData.biggestWin;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              x: '-50%',
              y: '-50%',
              width: '90%',
              maxWidth: '480px',
              background: '#1a2c38',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
              zIndex: 2001,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header / Banner */}
            <div
              style={{
                height: '100px',
                background: `linear-gradient(45deg, ${tier.color}33, transparent)`,
                position: 'relative',
              }}
            >
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info */}
            <div style={{ padding: '0 24px 24px', marginTop: '-40px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: '#243b4a',
                    border: `4px solid #1a2c38`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {user[0].toUpperCase()}
                </div>
                <div style={{ paddingBottom: '8px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '4px' }}>
                    {user}
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: `${tier.color}22`,
                        color: tier.color,
                        border: `1px solid ${tier.color}44`,
                      }}
                    >
                      {tier.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#b1bad3',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Calendar size={12} /> Joined {joined}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div
                  className="glass-card"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    style={{
                      color: '#b1bad3',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Wagered
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                    ${totalWagered.toLocaleString('en-US')}
                  </div>
                </div>
                <div
                  className="glass-card"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    style={{
                      color: '#b1bad3',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Wins
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#00e701' }}>
                    ${totalWins.toLocaleString('en-US')}
                  </div>
                </div>
                <div
                  className="glass-card"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    style={{
                      color: '#b1bad3',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Level
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{level}</div>
                </div>
                <div
                  className="glass-card"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <div
                    style={{
                      color: '#b1bad3',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Best Win
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{biggestWin}x</div>
                </div>
              </div>

              {/* Achievements Snippet */}
              <div style={{ marginBottom: '24px' }}>
                <h3
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#b1bad3',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  Recent Achievements
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['🎯', '🐋', '🔥'].map((icon, i) => (
                    <div
                      key={i}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <button
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  gap: '8px',
                }}
                onClick={() => {}}
              >
                Tip Player
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
