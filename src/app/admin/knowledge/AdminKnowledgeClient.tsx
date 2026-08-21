'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit,
  Tag,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { getApiErrorMessage } from '@/lib/security/form-errors';

interface GuideDoc {
  id: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  version?: string;
  is_active: boolean;
  updated_at: string;
}

const TOPICS = [
  'blackjack',
  'crash',
  'dice',
  'roulette',
  'slots',
  'navigation',
  'commands',
  'economy',
  'vip_stats',
  'other',
] as const;

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(0,0,0,0.6)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  padding: '0.65rem 0.85rem',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box',
};

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...style }}>
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AdminKnowledgeClient() {
  const [docs, setDocs] = useState<GuideDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: '',
    slug: '',
    topic: 'blackjack',
    title: '',
    content: '',
    tags: '',
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const loadDocs = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { documents: GuideDoc[] };
      setDocs(json.documents ?? []);
      setError(null);
    } catch {
      setError('Wissensdokumente konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDocs();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      id: '',
      slug: '',
      topic: 'blackjack',
      title: '',
      content: '',
      tags: '',
      isActive: true,
    });
    setSubmitMsg(null);
    setIsFormOpen(true);
  };

  const openEditForm = (doc: GuideDoc) => {
    setEditingId(doc.id);
    setForm({
      id: doc.id,
      slug: doc.slug,
      topic: doc.topic,
      title: doc.title,
      content: doc.content,
      tags: (doc.tags || []).join(', '),
      isActive: doc.is_active,
    });
    setSubmitMsg(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setSubmitMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMsg(null);

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      id: form.id || undefined,
      slug: form.slug.trim(),
      topic: form.topic,
      title: form.title.trim(),
      content: form.content.trim(),
      tags: tagsArray,
      isActive: form.isActive,
    };

    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setSubmitMsg({
          kind: 'err',
          text: getApiErrorMessage(json, 'Speichern fehlgeschlagen'),
        });
        return;
      }

      setSubmitMsg({
        kind: 'ok',
        text: `Dokument "${form.title}" erfolgreich gespeichert & vektorisiert!`,
      });
      await loadDocs();
      setTimeout(() => {
        setIsFormOpen(false);
      }, 1200);
    } catch {
      setSubmitMsg({ kind: 'err', text: 'Netzwerkfehler beim Speichern' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Möchtest du das Dokument "${title}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin/knowledge?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadDocs();
      } else {
        alert('Fehler beim Löschen des Dokuments');
      }
    } catch {
      alert('Netzwerkfehler beim Löschen');
    }
  };

  const filteredDocs = docs.filter((doc) => {
    const matchesTopic = selectedTopic === 'all' || doc.topic === selectedTopic;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', fontFamily: 'inherit' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          paddingBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              padding: '0.65rem',
              borderRadius: 12,
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)',
              color: '#ffd700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Royale Knowledge CMS
              </h1>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  color: '#ffd700',
                  fontFamily: 'monospace',
                }}
              >
                pgvector (1536d)
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              Verwalte KI-Hilfeartikel, Vektor-Embeddings und SQL-Wissensquellen live in PostgreSQL.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadDocs}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.8)',
              borderRadius: 8,
              padding: '0.55rem 0.95rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Aktualisieren
          </button>

          <button
            type="button"
            onClick={() => {
              if (isFormOpen && !editingId) {
                closeForm();
              } else {
                openCreateForm();
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, #ffd700, #b8932f)',
              color: '#050505',
              border: 'none',
              borderRadius: 8,
              padding: '0.55rem 1.1rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
            }}
          >
            <Plus size={16} />
            {isFormOpen && !editingId ? 'Schließen' : 'Neues Dokument'}
          </button>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 10,
            padding: '0.85rem 1rem',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Create / Edit Form Section (Inline Panel) */}
      {isFormOpen && (
        <section
          style={{
            background: 'rgba(12, 12, 14, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: 14,
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: '0.75rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.1rem',
                color: '#ffd700',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
              }}
            >
              {editingId ? <Edit size={18} /> : <Plus size={18} />}
              {editingId ? 'Wissensdokument bearbeiten' : 'Neues Wissensdokument anlegen'}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Slug (Eindeutiger Bezeichner)">
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="games-blackjack"
                  style={inputStyle}
                />
              </Field>

              <Field label="Thema (Topic)">
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                  }}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t} style={{ background: '#111', color: '#fff' }}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Titel">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Blackjack Regeln, Payouts und Spielzüge"
                style={inputStyle}
              />
            </Field>

            <Field label="Inhalt (Markdown / Wissens-Text für RAG)">
              <textarea
                required
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Regeln, Auszahlungsquoten, Limits oder Navigationslinks..."
                style={{
                  ...inputStyle,
                  fontFamily: 'var(--font-mono, monospace)',
                  lineHeight: '1.5',
                  resize: 'vertical',
                }}
              />
            </Field>

            <Field label="Tags (Kommagetrennt für Keyword-Schnellpfad)">
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="blackjack, regeln, hit, stand, double, split"
                style={inputStyle}
              />
            </Field>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  style={{ accentColor: '#ffd700', width: 16, height: 16 }}
                />
                <span>Dokument aktiv schalten</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ccc',
                    borderRadius: 8,
                    padding: '0.55rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Abbrechen
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #ffd700, #b8932f)',
                    color: '#050505',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
                  }}
                >
                  <Sparkles size={14} className={submitting ? 'animate-spin' : ''} />
                  {submitting ? 'Vektorisiere...' : 'Speichern & Vektorisieren'}
                </button>
              </div>
            </div>
          </form>

          {submitMsg && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background:
                  submitMsg.kind === 'ok' ? 'rgba(0,231,1,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${
                  submitMsg.kind === 'ok' ? 'rgba(0,231,1,0.3)' : 'rgba(239,68,68,0.3)'
                }`,
                color: submitMsg.kind === 'ok' ? '#00e701' : '#f87171',
              }}
            >
              {submitMsg.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{submitMsg.text}</span>
            </div>
          )}
        </section>
      )}

      {/* Filter & Search Bar */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
          background: 'rgba(10,10,12,0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '0.85rem 1rem',
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.75rem', color: 'rgba(255,255,255,0.4)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Titel, Slug oder Tags suchen..."
            style={{
              ...inputStyle,
              paddingLeft: '2.3rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        <div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              ...inputStyle,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >
            <option value="all" style={{ background: '#111', color: '#fff' }}>
              Alle Themen ({docs.length})
            </option>
            {TOPICS.map((t) => (
              <option key={t} value={t} style={{ background: '#111', color: '#fff' }}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Table Section */}
      <section
        style={{
          background: 'rgba(10,10,12,0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'rgba(255,255,255,0.5)',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.5px',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '0.9rem 1rem' }}>Thema & ID</th>
                <th style={{ padding: '0.9rem 1rem' }}>Titel & Inhalt</th>
                <th style={{ padding: '0.9rem 1rem' }}>Tags</th>
                <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', color: '#ffd700' }} />
                    Lade Wissensdokumente...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}
                  >
                    Keine Dokumente gefunden.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '1rem', verticalAlign: 'top', minWidth: 140 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(212,175,55,0.1)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          color: '#ffd700',
                          fontSize: '0.7rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          marginBottom: '4px',
                        }}
                      >
                        {doc.topic}
                      </span>
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: 'rgba(255,255,255,0.4)',
                        }}
                      >
                        {doc.id}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top', maxWidth: 420 }}>
                      <div style={{ fontWeight: 700, color: '#fff', marginBottom: '4px', fontSize: '0.85rem' }}>
                        {doc.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255,255,255,0.5)',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {doc.content}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top', maxWidth: 220 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(doc.tags || []).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              fontSize: '0.7rem',
                              color: 'rgba(255,255,255,0.7)',
                            }}
                          >
                            <Tag size={10} color="rgba(255,255,255,0.4)" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: 20,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: doc.is_active ? 'rgba(0,231,1,0.1)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${
                            doc.is_active ? 'rgba(0,231,1,0.3)' : 'rgba(255,255,255,0.1)'
                          }`,
                          color: doc.is_active ? '#00e701' : 'rgba(255,255,255,0.4)',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: doc.is_active ? '#00e701' : 'rgba(255,255,255,0.4)',
                            boxShadow: doc.is_active ? '0 0 6px #00e701' : 'none',
                          }}
                        />
                        {doc.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => openEditForm(doc)}
                        title="Bearbeiten"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.6)',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: 6,
                          marginRight: '4px',
                        }}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        title="Löschen"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          borderRadius: 6,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
