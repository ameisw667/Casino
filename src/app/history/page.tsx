'use client';
import React, { useEffect, useState } from 'react';
import {
  History,
  TrendingUp,
  Zap,
  Target,
  Filter,
  ShieldCheck,
  Wallet,
  Trophy,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryRow {
  id: string;
  game: string | null;
  type: string;
  amount: number;
  balance_after: number;
  created_at: string;
}

interface HistoryResponse {
  rows: HistoryRow[];
  count: number;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function GameIcon({ game }: { game: string | null }) {
  const g = (game ?? '').toLowerCase();
  if (g === 'crash') return <TrendingUp size={16} />;
  if (g === 'dice') return <Zap size={16} />;
  if (g === 'slots') return <Trophy size={16} />;
  if (g === 'roulette') return <Target size={16} />;
  return <Target size={16} />;
}

const SKELETON_ROWS = 6;

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <motion.tr
          key={i}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
          style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }}
        >
          {[140, 80, 80, 90, 60].map((w, j) => (
            <td key={j} style={{ padding: '14px 18px' }}>
              <div style={{ height: '14px', width: `${w}px`, borderRadius: '6px', background: 'hsla(0,0%,100%,0.06)' }} />
            </td>
          ))}
        </motion.tr>
      ))}
    </>
  );
}

export default function HistoryPage() {
  const isMobile = useCasinoStore(s => s.isMobile);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/user/history', { cache: 'no-store' });
        if (res.status === 401) {
          if (!cancelled) setError('Bitte einloggen um deine History zu sehen.');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as HistoryResponse;
        if (!cancelled) setRows(json.rows ?? []);
      } catch {
        if (!cancelled) setError('History konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Derived stats from DB rows
  const totalWagered = rows.reduce((acc, r) => acc + (r.amount < 0 ? Math.abs(r.amount) : 0), 0);
  const totalGain = rows.reduce((acc, r) => acc + (r.amount > 0 ? r.amount : 0), 0);
  const netProfit = totalGain - totalWagered;
  const wins = rows.filter(r => r.amount > 0);
  const winRate = rows.length > 0 ? ((wins.length / rows.length) * 100).toFixed(1) : '0.0';

  const filters = ['ALL', 'WINS'];
  const filteredRows = activeFilter === 'WINS' ? rows.filter(r => r.amount > 0) : rows;

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '16px' : '20px',
      padding: isMobile ? '0 16px 40px' : '0 24px 40px',
      minHeight: 'calc(100vh - 80px)'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 950, letterSpacing: '-0.02em' }}>BET HISTORY</h1>
        </div>
      </motion.div>

      {/* Compact Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px'
        }}
      >
        {[
          { label: 'TOTAL WAGERED', value: loading ? '…' : `$${totalWagered.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, color: 'hsl(var(--primary))', icon: Wallet },
          { label: 'NET PROFIT', value: loading ? '…' : `${netProfit >= 0 ? '+' : '-'}$${Math.abs(netProfit).toLocaleString('en-US', { maximumFractionDigits: 2 })}`, color: netProfit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--error))', icon: TrendingUp },
          { label: 'WIN RATE', value: loading ? '…' : `${winRate}%`, color: 'hsl(var(--secondary))', icon: Target },
          { label: 'TOTAL BETS', value: loading ? '…' : rows.length.toString(), color: 'hsl(var(--primary))', icon: Zap },
        ].map((stat, i) => (
          <div
            key={i}
            className="glass-card"
            style={{ padding: isMobile ? '14px 16px' : '18px 20px', borderRadius: '18px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid hsla(0,0%,100%,0.06)' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
              <stat.icon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.06em', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 950, color: stat.color, fontFamily: 'var(--font-mono, monospace)' }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid hsla(0,0%,100%,0.06)', display: 'flex', flexDirection: 'column', minHeight: '420px' }}
      >
        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isMobile ? '14px 16px' : '18px 24px', borderBottom: '1px solid hsla(0,0%,100%,0.05)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{ padding: isMobile ? '8px 14px' : '10px 18px', borderRadius: '12px', background: activeFilter === f ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.03)', color: activeFilter === f ? 'black' : 'white', border: 'none', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-dim))' }}>
            <Filter size={14} /> {activeFilter}
          </div>
        </div>

        {/* Error State */}
        {error && !loading && (
          <div className="flex-col-center" style={{ flex: 1, minHeight: '320px', gap: '16px', padding: '24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'hsla(var(--error), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--error))' }}>
              <AlertCircle size={30} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '6px' }}>Verbindungsfehler</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRows.length === 0 && (
          <div className="flex-col-center" style={{ flex: 1, minHeight: '320px', gap: '20px', padding: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '28px', background: 'hsla(var(--primary), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-dim))' }}>
              <History size={40} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 950, marginBottom: '8px' }}>NO ACTIVITY YET</h3>
              <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '360px', lineHeight: 1.5, fontSize: '0.9rem' }}>
                {activeFilter === 'WINS' ? 'Noch keine Gewinne — viel Glück beim nächsten Spiel!' : 'Absolviere deine erste Runde um hier deine History zu sehen.'}
              </p>
            </div>
            {activeFilter === 'ALL' && (
              <Link href="/games" className="btn btn-primary" style={{ height: '48px', padding: '0 28px', borderRadius: '14px', fontWeight: 950, fontSize: '0.95rem' }}>
                EXPLORE GAMES
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {(loading || filteredRows.length > 0) && (
          <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '680px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ background: 'hsla(0,0%,0%,0.25)', borderBottom: '1px solid hsla(0,0%,100%,0.06)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>SPIEL</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>ZEITPUNKT</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>ERGEBNIS</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>GUTHABEN</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.65rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.05em' }}>VERIFIKATION</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : (
                    filteredRows.map((row) => {
                      const isWin = row.amount > 0;
                      return (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={row.id}
                          style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <GameIcon game={row.game} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{(row.game ?? 'UNKNOWN').toUpperCase()}</div>
                                <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-muted))', fontWeight: 700, opacity: 0.55, marginTop: '2px' }}>
                                  {row.type}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', color: 'hsl(var(--text-muted))', fontWeight: 800, fontSize: '0.8rem' }}>{formatTime(row.created_at)}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 950, fontSize: '0.95rem', color: isWin ? 'hsl(var(--success))' : 'hsl(var(--error))', fontFamily: 'var(--font-mono, monospace)' }}>
                              {isWin ? '+' : ''}{row.amount.toFixed(2)}$
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 900, fontSize: '0.9rem', fontFamily: 'var(--font-mono, monospace)' }}>
                            ${row.balance_after.toFixed(2)}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950 }}>
                              <ShieldCheck size={12} /> FAIR
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Footer Trust Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ padding: isMobile ? '16px' : '18px 24px', borderRadius: '16px', background: 'hsla(var(--success), 0.08)', border: '1px solid hsla(var(--success), 0.15)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'hsl(var(--success))', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShieldCheck size={18} />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 950 }}>AUTOMATED SETTLEMENT ACTIVE</div>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Provably fair settlement via isolated atomic transactions.</div>
        </div>
        <div style={{ padding: '6px 12px', background: 'hsla(0,0%,0%,0.35)', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--success))' }}>
          STABLE / 100%
        </div>
      </motion.div>
    </div>
  );
}
