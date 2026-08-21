'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Crown, Sparkles, Zap, Flame, ShieldCheck } from 'lucide-react';

export interface HighrollerWinItem {
  id: string;
  user: string;
  amount: number;
  game: string;
  mult: string;
  type: 'jackpot' | 'whale' | 'hot' | 'vip';
  time: string;
}

interface HighrollerWinDetailModalProps {
  win: HighrollerWinItem | null;
  onClose: () => void;
}

function getGameRoute(gameName: string): string {
  const g = gameName.toLowerCase();
  if (g.includes('crash')) return '/games/crash';
  if (g.includes('blackjack')) return '/games/blackjack';
  if (g.includes('dice')) return '/games/dice';
  if (g.includes('roulette')) return '/games/roulette';
  if (g.includes('slot')) return '/games/slots';
  return '/games';
}

export function HighrollerWinDetailModal({ win, onClose }: HighrollerWinDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (win) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [win, onClose]);

  if (!win) return null;

  const gameRoute = getGameRoute(win.game);

  const getBadgeIcon = () => {
    switch (win.type) {
      case 'jackpot':
        return <Sparkles size={18} color="#D4AF37" />;
      case 'whale':
        return <Crown size={18} color="#FFD700" />;
      case 'vip':
        return <Zap size={18} color="#00E701" />;
      default:
        return <Flame size={18} color="#FF5722" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(6, 8, 12, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '420px',
            background:
              'linear-gradient(165deg, rgba(22, 26, 36, 0.95) 0%, rgba(10, 12, 18, 0.98) 100%)',
            border: '1.5px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '20px',
            boxShadow:
              '0 24px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Top Gold Horizon Accent */}
          <div
            style={{
              height: '3px',
              width: '100%',
              background:
                'linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)',
            }}
          />

          <div style={{ padding: '24px' }}>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getBadgeIcon()}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    color: '#D4AF37',
                    textTransform: 'uppercase',
                  }}
                >
                  HIGHROLLER LIVE GEWINN
                </span>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Winner Big Card */}
            <div
              style={{
                padding: '18px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '6px',
                }}
              >
                Spieler: <span style={{ color: '#fff' }}>{win.user}</span>
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 1000,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#00E701',
                  textShadow: '0 0 20px rgba(0, 231, 1, 0.4)',
                  lineHeight: 1.1,
                  marginBottom: '8px',
                }}
              >
                +${win.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.2)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#D4AF37',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}
              >
                <span>Faktor:</span>
                <span>{win.mult}</span>
              </div>
            </div>

            {/* Game Info Details */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase' }}>
                  Gespieltes Spiel
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                  {win.game}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.45)', textTransform: 'uppercase' }}>
                  Zeitpunkt
                </div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono, monospace)', color: 'rgba(255, 255, 255, 0.75)' }}>
                  {win.time}
                </div>
              </div>
            </div>

            {/* Direct CTA Action */}
            <Link
              href={gameRoute}
              onClick={onClose}
              style={{ textDecoration: 'none', display: 'block', width: '100%', outline: 'none' }}
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA8010 100%)',
                  border: 'none',
                  color: '#000000',
                  fontWeight: 950,
                  fontSize: '0.85rem',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.35)',
                }}
              >
                <Play size={16} fill="#000" />
                <span>JETZT {win.game.toUpperCase()} SPIELEN</span>
              </motion.button>
            </Link>

            {/* Provably Fair footer text */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '14px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '0.68rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={13} color="#10b981" />
              <span>Verifizierte Live-Auszahlung über Casino-Rails</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
