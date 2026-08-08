'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Crown, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { VibeMotion } from '@/components/ui/VibeMotion';
import { Magnetic } from '@/components/ui/Magnetic';
import { useCasinoStore } from '@/store/useCasinoStore';

interface LeaderRow {
  username: string;
  level: number;
  rank: string;
  total_wagered: number;
  biggest_win: number;
}

interface LeaderboardResponse {
  rows: LeaderRow[];
  generated_at: string;
}

const RANK_COLOR: Record<string, string> = {
  DIAMOND: '#b9f2ff',
  PLATINUM: '#e5e4e2',
  GOLD: '#ffd700',
  SILVER: '#c0c0c0',
  BRONZE: '#cd7f32',
};

const MEDAL_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 26, mass: 0.8 };

function formatCompact(n: number) {
  if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function avatarInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th style={{ padding: '10px 12px', fontSize: '0.58rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.07em', textTransform: 'uppercase', ...style }}>
      {children}
    </th>
  );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '9px 12px', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: MEDAL_COLORS[rank - 1], color: '#000', fontWeight: 950, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {rank}
      </div>
    );
  }
  return <span style={{ fontWeight: 900, fontSize: '0.85rem', color: 'hsl(var(--text-dim))' }}>#{rank}</span>;
}

function Avatar({ username, size }: { username: string; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'hsla(var(--primary), 0.15)', border: '2px solid hsla(var(--primary), 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 950, fontSize: `${size * 0.35}px`, color: 'hsl(var(--primary))', flexShrink: 0 }}>
      {avatarInitials(username)}
    </div>
  );
}

function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.tr key={i} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }} style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }}>
          {[40, 180, 120, 100, 100].map((w, j) => (
            <td key={j} style={{ padding: '12px' }}>
              <div style={{ height: '14px', width: `${w}px`, borderRadius: '6px', background: 'hsla(0,0%,100%,0.06)' }} />
            </td>
          ))}
        </motion.tr>
      ))}
    </>
  );
}

function PodiumCard({ leader, rank, height, delay }: { leader: LeaderRow; rank: number; height: number; delay: number }) {
  const isFirst = rank === 1;
  const size = isFirst ? 64 : 52;
  return (
    <VibeMotion variant="card" delay={delay} style={{ height }}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        style={{ padding: isFirst ? '18px' : '14px', borderRadius: '20px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'var(--glass-bg)', backdropFilter: isFirst ? 'var(--glass-blur-lg)' : 'var(--glass-blur-md)', border: isFirst ? '2px solid hsl(var(--primary))' : '1px solid var(--glass-border)', boxShadow: isFirst ? 'var(--neon-glow-primary)' : 'var(--shadow-sm)', position: 'relative' }}
      >
        {isFirst && (
          <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', color: 'hsl(var(--primary))', filter: 'drop-shadow(var(--neon-glow-primary))' }}>
            <Crown size={28} />
          </div>
        )}
        <div style={{ margin: '0 auto 10px', position: 'relative', flexShrink: 0 }}>
          <Avatar username={leader.username} size={size} />
          <div style={{ position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)', background: MEDAL_COLORS[rank - 1], color: '#000', width: isFirst ? '24px' : '20px', height: isFirst ? '24px' : '20px', borderRadius: '50%', fontWeight: 950, fontSize: isFirst ? '0.8rem' : '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {rank}
          </div>
        </div>
        <h4 style={{ fontWeight: 950, fontSize: isFirst ? '0.95rem' : '0.85rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={leader.username}>
          {leader.username}
        </h4>
        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', marginTop: '2px' }}>
          Lvl {leader.level} · {leader.rank}
        </div>
        <div style={{ fontSize: isFirst ? '1.1rem' : '0.95rem', fontWeight: 950, color: 'hsl(var(--primary))', marginTop: '6px' }}>
          {formatCompact(leader.total_wagered)}
        </div>
        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-dim))' }}>
          wagered
        </div>
      </motion.div>
    </VibeMotion>
  );
}

export default function LeaderboardPage() {
  const { isMobile } = useCasinoStore();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as LeaderboardResponse;
        if (!cancelled) {
          setRows(json.rows ?? []);
          setGeneratedAt(json.generated_at ?? null);
        }
      } catch {
        if (!cancelled) setError('Leaderboard konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const top3 = rows.slice(0, 3);

  return (
    <div
      className="vibe-mesh"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '14px', padding: isMobile ? '0 12px 88px' : '0 20px 88px' }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '14px' }}>

        {/* Header */}
        <VibeMotion variant="reveal" delay={0.05}>
          <header style={{ marginTop: isMobile ? '10px' : '12px', padding: isMobile ? '12px 14px' : '14px 22px', borderRadius: 'var(--radius-xl)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-md)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ width: isMobile ? '36px' : '40px', height: isMobile ? '36px' : '40px', borderRadius: '10px', background: 'hsla(var(--primary), 0.12)', border: '1px solid hsla(var(--primary), 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))', flexShrink: 0 }}>
                <Trophy size={isMobile ? 18 : 20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.08em', color: 'hsl(var(--text-dim))', textTransform: 'uppercase' }}>
                  Top Spieler
                </div>
                <h1 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.6rem)', fontWeight: 950, lineHeight: 1.05, fontFamily: "'Outfit', sans-serif", margin: 0 }}>
                  Global <span className="text-gradient">Leaderboard</span>
                </h1>
              </div>
            </div>
            {generatedAt && (
              <div style={{ textAlign: 'right' }}>
                <div className="mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)' }}>
                  Stand: {formatTime(generatedAt)} Uhr
                </div>
                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.07em' }}>
                  AKTUALISIERT
                </div>
              </div>
            )}
          </header>
        </VibeMotion>

        {/* Podium — only when data loaded */}
        {!loading && !error && top3.length >= 3 && !isMobile && (
          <div data-testid="podium" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: '12px', alignItems: 'flex-end', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
            <PodiumCard leader={top3[1]} rank={2} height={190} delay={0.15} />
            <PodiumCard leader={top3[0]} rank={1} height={230} delay={0.1} />
            <PodiumCard leader={top3[2]} rank={3} height={170} delay={0.2} />
          </div>
        )}

        {!loading && !error && top3.length >= 3 && isMobile && (
          <div data-testid="podium" style={{ display: 'flex', gap: '8px' }}>
            {top3.map((leader, idx) => (
              <motion.div
                key={leader.username}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING}
                style={{ flex: 1, padding: '10px 6px', borderRadius: '14px', textAlign: 'center', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-md)', border: `2px solid ${MEDAL_COLORS[idx]}` }}
              >
                <div style={{ margin: '0 auto 6px', position: 'relative', width: 'fit-content' }}>
                  <Avatar username={leader.username} size={48} />
                  <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', background: MEDAL_COLORS[idx], color: '#000', width: '18px', height: '18px', borderRadius: '50%', fontWeight: 950, fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </div>
                </div>
                <div style={{ fontWeight: 950, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '8px' }}>{leader.username}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 950, color: 'hsl(var(--primary))', marginTop: '2px' }}>{formatCompact(leader.total_wagered)}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Live badge */}
        <VibeMotion variant="reveal" delay={0.2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'hsla(var(--success), 0.1)', borderRadius: '10px', border: '1px solid hsla(var(--success), 0.2)', flexShrink: 0 }}>
            <div className="dot dot-success animate-pulse" />
            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'hsl(var(--success))', letterSpacing: '0.05em' }}>
              AKTUELLE RANKINGS
            </span>
          </div>
        </VibeMotion>

        {/* Rankings Table */}
        <VibeMotion variant="reveal" delay={0.25}>
          <div className="glass-card" style={{ padding: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-md)' }}>

            {/* Error State */}
            {error && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', gap: '16px', padding: '32px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'hsla(var(--error), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--error))' }}>
                  <AlertCircle size={30} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '6px' }}>Leaderboard nicht verfügbar</h3>
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>{error}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && rows.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', gap: '16px', padding: '32px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'hsla(var(--primary), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-dim))' }}>
                  <Trophy size={36} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 950, marginBottom: '8px' }}>NOCH KEINE SPIELER</h3>
                  <p style={{ color: 'hsl(var(--text-muted))', maxWidth: '320px', lineHeight: 1.5, fontSize: '0.85rem' }}>Sei der Erste auf dem Leaderboard — spiel jetzt deine erste Runde!</p>
                </div>
                <Link href="/games" className="btn btn-primary" style={{ height: '44px', padding: '0 24px', borderRadius: '12px', fontWeight: 950, fontSize: '0.9rem' }}>
                  SPIELEN
                </Link>
              </div>
            )}

            {/* Table */}
            {!isMobile && (loading || rows.length > 0) && !error && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <Th style={{ width: '52px' }}>RANK</Th>
                      <Th>SPIELER</Th>
                      <Th style={{ width: '120px' }}>WAGERED</Th>
                      <Th style={{ width: '120px' }}>BIGGEST WIN</Th>
                      <Th style={{ width: '80px' }}>LEVEL</Th>
                      <Th style={{ width: '90px' }}>RANG</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <LoadingSkeleton rows={8} />
                    ) : (
                      rows.map((leader, idx) => (
                        <tr key={leader.username + idx} className="vibe-spring" style={{ borderBottom: '1px solid hsla(0,0%,100%,0.03)' }}>
                          <Td><RankBadge rank={idx + 1} /></Td>
                          <Td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <Avatar username={leader.username} size={34} />
                              <div>
                                <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{leader.username}</div>
                              </div>
                            </div>
                          </Td>
                          <Td>
                            <span className="mono" style={{ fontWeight: 950, fontSize: '0.9rem', color: '#fff' }}>
                              {formatCompact(leader.total_wagered)}
                            </span>
                          </Td>
                          <Td>
                            <span className="mono" style={{ fontWeight: 950, fontSize: '0.9rem', color: leader.biggest_win > 0 ? 'hsl(var(--success))' : 'hsl(var(--text-dim))' }}>
                              {leader.biggest_win > 0 ? `+${formatCompact(leader.biggest_win)}` : '—'}
                            </span>
                          </Td>
                          <Td>
                            <span style={{ fontWeight: 900, color: 'hsl(var(--text-muted))' }}>{leader.level}</span>
                          </Td>
                          <Td>
                            <span style={{ fontWeight: 900, fontSize: '0.8rem', color: RANK_COLOR[leader.rank] ?? '#fff' }}>
                              {leader.rank}
                            </span>
                          </Td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mobile Cards */}
            {isMobile && (loading || rows.length > 0) && !error && (
              <div data-testid="leader-cards" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px' }}>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <motion.div key={i} animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                      style={{ height: '64px', borderRadius: '16px', background: 'hsla(0,0%,100%,0.03)' }} />
                  ))
                ) : (
                  rows.map((leader, idx) => (
                    <motion.div key={leader.username + idx} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: idx * 0.03 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '16px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-sm)', border: '1px solid var(--glass-border)' }}>
                      <RankBadge rank={idx + 1} />
                      <Avatar username={leader.username} size={38} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leader.username}</div>
                        <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-dim))', fontWeight: 700 }}>Lvl {leader.level} · {leader.rank}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{ fontWeight: 950, fontSize: '0.9rem', color: 'hsl(var(--primary))' }}>{formatCompact(leader.total_wagered)}</div>
                        <div style={{ fontSize: '0.6rem', color: 'hsl(var(--text-dim))', fontWeight: 700 }}>WAGERED</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </VibeMotion>

        {/* Sticky My Rank Bar */}
        <VibeMotion variant="reveal" style={{ position: 'fixed', bottom: isMobile ? '62px' : '16px', left: 0, width: '100%', zIndex: 500, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: isMobile ? '100%' : 'calc(100% - 40px)', maxWidth: '1400px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-lg)', border: '1px solid var(--glass-border)', borderRadius: isMobile ? '0' : '18px', boxShadow: 'var(--shadow-lg), var(--neon-glow-primary)', display: 'flex', alignItems: 'center', padding: isMobile ? '8px 12px' : '10px 20px', justifyContent: 'space-between', pointerEvents: 'auto', margin: isMobile ? '0' : '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.06em' }}>DEIN RANG</div>
                <div style={{ fontSize: isMobile ? '1.1rem' : '1.3rem', fontWeight: 950, color: '#fff' }}>—</div>
              </div>
              {!isMobile && <div style={{ width: '1px', height: '26px', background: 'var(--glass-border)' }} />}
              <div>
                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.06em' }}>GESPIELT</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#fff' }}>—</div>
              </div>
              {!isMobile && <div style={{ width: '1px', height: '26px', background: 'var(--glass-border)' }} />}
              {!isMobile && (
                <div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.06em' }}>WAGERED</div>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 950, color: 'hsl(var(--primary))' }}>—</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {!isMobile && <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-muted))' }}>PLAY TO CLIMB</span>}
              <Magnetic>
                <Link href="/games" className="btn btn-primary" style={{ padding: '0 16px', height: '36px', borderRadius: '10px', fontWeight: 950, fontSize: '0.7rem', boxShadow: 'var(--neon-glow-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  SPIELEN <ChevronRight size={14} />
                </Link>
              </Magnetic>
            </div>
          </div>
        </VibeMotion>

        {/* Stats footer */}
        {!loading && rows.length > 0 && (
          <VibeMotion variant="reveal" delay={0.3}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: isMobile ? '8px' : '12px' }}>
              {[
                { label: 'SPIELER GESAMT', value: rows.length.toString(), icon: Trophy },
                { label: 'TOP WAGERED', value: rows[0] ? formatCompact(rows[0].total_wagered) : '—', icon: TrendingUp },
                { label: 'BIGGEST WIN', value: rows.reduce((m, r) => Math.max(m, r.biggest_win), 0) > 0 ? formatCompact(rows.reduce((m, r) => Math.max(m, r.biggest_win), 0)) : '—', icon: Crown },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ padding: isMobile ? '14px' : '18px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'hsla(var(--primary), 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))', flexShrink: 0 }}>
                    <s.icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'hsl(var(--text-dim))', letterSpacing: '0.06em', marginBottom: '2px' }}>{s.label}</div>
                    <div className="mono" style={{ fontSize: '1rem', fontWeight: 950 }}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </VibeMotion>
        )}
      </div>
    </div>
  );
}
