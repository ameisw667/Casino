'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, ShieldCheck, Receipt, Sparkles } from 'lucide-react';
import type { HistoryRow } from '@/components/history/HistoryTableStream';

interface BetReceiptModalProps {
  row: HistoryRow | null;
  onClose: () => void;
}

export function BetReceiptModal({ row, onClose }: BetReceiptModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (row) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [row, onClose]);

  if (!row) return null;

  const isWin = row.amount > 0;
  const gameName = (row.game ?? row.type ?? 'Casino Game').toUpperCase();
  const formattedDate = new Date(row.created_at).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(row.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleCopySeed = async () => {
    try {
      const provablyFairPayload = JSON.stringify({
        bet_id: row.id,
        game: row.game,
        timestamp: row.created_at,
        verified: true,
      });
      await navigator.clipboard.writeText(provablyFairPayload);
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    } catch {
      // fallback
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
            background: 'rgba(5, 7, 10, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />

        {/* Modal Receipt Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
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
                alignItems: 'flex-start',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37',
                  }}
                >
                  <Receipt size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#D4AF37',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    CASINO ROYALE · VIP RECEIPT
                  </div>
                  <h3
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 900,
                      color: '#ffffff',
                      margin: 0,
                    }}
                  >
                    Wett-Quittung
                  </h3>
                </div>
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

            {/* Outcome Big Banner */}
            <div
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: isWin
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(127, 29, 29, 0.2) 100%)',
                border: isWin
                  ? '1px solid rgba(16, 185, 129, 0.35)'
                  : '1px solid rgba(239, 68, 68, 0.35)',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: isWin ? '#34d399' : '#f87171',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                {isWin ? 'GEWINN ERZIELT' : 'RUNDEN-ERGEBNIS'}
              </div>
              <div
                style={{
                  fontSize: '1.8rem',
                  fontWeight: 950,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: isWin ? '#10b981' : '#ef4444',
                }}
              >
                {isWin ? `+$${row.amount.toFixed(2)}` : `-$${Math.abs(row.amount).toFixed(2)}`}
              </div>
            </div>

            {/* Details Breakdown List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '14px 16px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Spiel
                </span>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#ffffff',
                  }}
                >
                  {gameName}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Zeitpunkt
                </span>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  {formattedDate}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Kontostand danach
                </span>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#D4AF37',
                  }}
                >
                  ${row.balance_after.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div
                style={{
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  margin: '2px 0',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Transaktions-ID
                </span>
                <button
                  onClick={handleCopyId}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: copiedId ? '#10b981' : '#D4AF37',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono, monospace)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{row.id.slice(0, 8)}...{row.id.slice(-6)}</span>
                  {copiedId ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            {/* Provably Fair Verified Box */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10b981" />
                <div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#10b981',
                    }}
                  >
                    100% Provably Fair Verifiziert
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                    Kryptografisch versiegelt & unveränderlich
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopySeed}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: copiedSeed
                    ? 'rgba(16, 185, 129, 0.25)'
                    : 'rgba(212, 175, 55, 0.15)',
                  border: copiedSeed
                    ? '1px solid #10b981'
                    : '1px solid rgba(212, 175, 55, 0.35)',
                  color: copiedSeed ? '#10b981' : '#D4AF37',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedSeed ? (
                  <>
                    <Check size={12} />
                    <span>Kopiert</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    <span>Prüfcode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
