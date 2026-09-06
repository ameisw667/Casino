'use client';
import React, { useEffect, useState } from 'react';
import {
  Search,
  Coins,
  Users,
  TrendingUp,
  Crown,
  AlertCircle,
  CheckCircle2,
  Edit2,
  X,
} from 'lucide-react';
import { getApiErrorMessage } from '@/lib/security/form-errors';

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  balance: number;
  xp: number;
  level: number;
  rank: string;
  created_at: string;
}

interface AdminUsersResponse {
  users: AdminUser[];
  meta: { count: number; truncated: boolean; totalBalance: number; totalXp: number };
}

const RANK_COLOR: Record<string, string> = {
  DIAMOND: '#60a5fa',
  PLATINUM: '#a78bfa',
  GOLD: '#D4AF37',
  SILVER: '#94a3b8',
  BRONZE: '#92400e',
};

export default function UsersPageClient() {
  const [search, setSearch] = useState('');
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editXp, setEditXp] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      const json = (raw?.data ?? raw) as AdminUsersResponse;
      setData(json);
    } catch {
      setError('Nutzerliste konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const json = (raw?.data ?? raw) as AdminUsersResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Nutzerliste konnte nicht geladen werden.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEditClick = (u: AdminUser) => {
    setEditingUser(u);
    setEditBalance(String(u.balance));
    setEditXp(String(u.xp));
    setEditLevel(String(u.level));
    setEditReason('');
    setSaveSuccess(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          targetUserId: editingUser.id,
          reason: editReason,
          balance: parseFloat(editBalance),
          xp: parseFloat(editXp),
          level: parseInt(editLevel, 10),
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(getApiErrorMessage(json, `HTTP ${res.status}`));
      }

      setSaveSuccess(
        `Spieler ${editingUser.username || editingUser.id.slice(0, 8)} erfolgreich aktualisiert.`,
      );
      setEditingUser(null);
      await refreshUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern des Nutzers.');
    } finally {
      setSaving(false);
    }
  };

  const users = data?.users ?? [];
  const filtered = users.filter(
    (u) =>
      (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Live Status Banner */}
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
          Live DB-Anbindung — Echte Nutzerdaten & Schreibzugriff (Guthaben, Level & XP bearbeiten)
          aktiv.
        </span>
      </div>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Users size={18} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#D4AF37',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            User Management
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
          Players
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '6px' }}>
          {data
            ? `${data.meta.count} Spieler geladen${data.meta.truncated ? ` (auf ${data.meta.count} begrenzt)` : ''} — Echte Live-Daten`
            : 'Lädt…'}
        </p>
      </div>

      {saveSuccess && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            borderRadius: '12px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#10b981',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={16} /> {saveSuccess}
        </div>
      )}

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

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {[
          {
            label: 'Total Players',
            value: data ? data.meta.count : '—',
            icon: Users,
            color: '#3b82f6',
          },
          {
            label: 'Total XP',
            value: data ? data.meta.totalXp.toLocaleString('en-US') : '—',
            icon: TrendingUp,
            color: '#D4AF37',
          },
          {
            label: 'Balances Held',
            value: data ? `$${data.meta.totalBalance.toLocaleString('en-US')}` : '—',
            icon: Coins,
            color: '#10b981',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              padding: '20px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ color, marginBottom: '8px' }}>
              <Icon size={18} />
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '4px' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div
        style={{
          padding: '24px',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            padding: '10px 16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Search size={16} color="rgba(255,255,255,0.35)" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email or ID…"
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
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
                {['ID', 'Player', 'Balance', 'XP', 'Level', 'Rank', 'Joined', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800 }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} style={{ padding: '24px 12px', color: 'rgba(255,255,255,0.35)' }}>
                    Lädt Spieler…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && !error && (
                <tr>
                  <td colSpan={8} style={{ padding: '24px 12px', color: 'rgba(255,255,255,0.35)' }}>
                    Keine Spieler gefunden.
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td
                    style={{
                      padding: '14px 12px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {u.id.slice(0, 12)}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ fontWeight: 800 }}>{u.username || 'Unbekannt'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                      {u.email ?? '—'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: 700, fontFamily: 'monospace' }}>
                    ${Number(u.balance).toLocaleString('en-US')}
                  </td>
                  <td
                    style={{
                      padding: '14px 12px',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.6)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {Number(u.xp).toLocaleString('en-US')}
                  </td>
                  <td style={{ padding: '14px 12px', fontWeight: 700 }}>{u.level}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: RANK_COLOR[u.rank?.toUpperCase()] || '#fff',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      <Crown size={12} /> {u.rank}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 12px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {new Date(u.created_at).toLocaleDateString('en-US')}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <button
                      onClick={() => handleEditClick(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: 'rgba(212,175,55,0.15)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        color: '#D4AF37',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      <Edit2 size={12} /> Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0a0a0c',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '24px',
              padding: '28px',
              color: '#fff',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setEditingUser(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: 900 }}>
              Spieler bearbeiten
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
              {editingUser.email || editingUser.id}
            </p>

            <form
              onSubmit={handleSaveEdit}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#D4AF37',
                    marginBottom: '6px',
                  }}
                >
                  Guthaben ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#D4AF37',
                    marginBottom: '6px',
                  }}
                >
                  Erfahrungspunkte (XP)
                </label>
                <input
                  type="number"
                  min="0"
                  value={editXp}
                  onChange={(e) => setEditXp(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#D4AF37',
                    marginBottom: '6px',
                  }}
                >
                  Stufe (Level)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#D4AF37',
                    marginBottom: '6px',
                  }}
                >
                  Grund (Audit-Log)
                </label>
                <input
                  type="text"
                  required
                  minLength={1}
                  maxLength={500}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="z. B. Support-Ticket #1234, Kompensation…"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#D4AF37',
                    border: 'none',
                    color: '#000',
                    fontWeight: 900,
                    cursor: 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? 'Speichert…' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
