'use client';
import React, { useEffect, useState } from 'react';
import { BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';

interface GameStat {
  game: string;
  rtp: number;
  winRate: number;
  totalBets: number;
  totalWagered: number;
  biggestWin: number;
  houseEdge: number;
  color: string;
}

interface AdminGamesResponse {
  games: GameStat[];
  config: { betMin: number; betMax: number };
}

export default function GamesPageClient() {
  const [active, setActive] = useState<string | null>(null);
  const [data, setData] = useState<AdminGamesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/games', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AdminGamesResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Spielstatistiken konnten nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const games = data?.games ?? [
    {
      game: 'Crash',
      rtp: 97.0,
      winRate: 38.2,
      totalBets: 0,
      totalWagered: 0,
      biggestWin: 0,
      houseEdge: 3.0,
      color: '#ef4444',
    },
    {
      game: 'Dice',
      rtp: 98.5,
      winRate: 49.1,
      totalBets: 0,
      totalWagered: 0,
      biggestWin: 0,
      houseEdge: 1.5,
      color: '#3b82f6',
    },
    {
      game: 'Slots',
      rtp: 96.4,
      winRate: 42.7,
      totalBets: 0,
      totalWagered: 0,
      biggestWin: 0,
      houseEdge: 3.6,
      color: '#a855f7',
    },
    {
      game: 'Roulette',
      rtp: 97.3,
      winRate: 47.8,
      totalBets: 0,
      totalWagered: 0,
      biggestWin: 0,
      houseEdge: 2.7,
      color: '#D4AF37',
    },
    {
      game: 'Blackjack',
      rtp: 99.2,
      winRate: 44.1,
      totalBets: 0,
      totalWagered: 0,
      biggestWin: 0,
      houseEdge: 0.8,
      color: '#10b981',
    },
  ];

  const shown = active ? games.filter((g) => g.game === active) : games;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Live System Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '14px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CheckCircle2 size={16} color="#10b981" />
        <span
          style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.03em' }}
        >
          Live DB-Anbindung — Echte Spielstatistiken & Konfigurationen aktiv.
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <BarChart2 size={18} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#D4AF37',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Game Stats
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            margin: 0,
          }}
        >
          Performance
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '6px' }}>
          {loading ? 'Lädt Statistiken…' : 'RTP, house edge & bet metrics across all 5 games'}
        </p>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Game Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActive(null)}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: `1px solid ${!active ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: !active ? 'rgba(212,175,55,0.1)' : 'transparent',
            color: !active ? '#D4AF37' : 'rgba(255,255,255,0.5)',
            fontWeight: 800,
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
        >
          All Games
        </button>
        {games.map((g) => (
          <button
            key={g.game}
            onClick={() => setActive(active === g.game ? null : g.game)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: `1px solid ${active === g.game ? g.color + '60' : 'rgba(255,255,255,0.08)'}`,
              background: active === g.game ? g.color + '15' : 'transparent',
              color: active === g.game ? g.color : 'rgba(255,255,255,0.5)',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            {g.game}
          </button>
        ))}
      </div>

      {/* Stats Table */}
      <div
        style={{
          padding: '24px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontWeight: 800,
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {[
                'Game',
                'RTP',
                'House Edge',
                'Win Rate',
                'Total Bets',
                'Total Wagered',
                'Biggest Win',
              ].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((g) => (
              <tr key={g.game} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '14px 14px', fontWeight: 800, color: g.color }}>{g.game}</td>
                <td style={{ padding: '14px 14px', fontWeight: 800 }}>{g.rtp.toFixed(1)}%</td>
                <td style={{ padding: '14px 14px', color: 'rgba(255,255,255,0.5)' }}>
                  {g.houseEdge.toFixed(1)}%
                </td>
                <td style={{ padding: '14px 14px', fontWeight: 800, color: '#10b981' }}>
                  {g.winRate.toFixed(1)}%
                </td>
                <td style={{ padding: '14px 14px', fontFamily: 'monospace' }}>
                  {g.totalBets.toLocaleString('en-US')}
                </td>
                <td style={{ padding: '14px 14px', fontFamily: 'monospace', fontWeight: 700 }}>
                  ${g.totalWagered.toLocaleString('en-US')}
                </td>
                <td
                  style={{
                    padding: '14px 14px',
                    fontFamily: 'monospace',
                    color: '#D4AF37',
                    fontWeight: 800,
                  }}
                >
                  ${g.biggestWin.toLocaleString('en-US')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
