'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Plus, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/security/form-errors';
import {
  type GuideDoc,
  TOPICS,
  inputStyle,
  type KnowledgeFormState,
  type SubmitMsg,
  KnowledgeForm,
  KnowledgeTable,
} from './_components';

export default function AdminKnowledgeClient() {
  const [docs, setDocs] = useState<GuideDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<KnowledgeFormState>({
    id: '',
    slug: '',
    topic: 'blackjack',
    title: '',
    content: '',
    tags: '',
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<SubmitMsg | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/admin/knowledge', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { documents: GuideDoc[] };
        if (!ignore) {
          setDocs(json.documents ?? []);
          setError(null);
        }
      } catch {
        if (!ignore) setError('Wissensdokumente konnten nicht geladen werden.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void init();
    return () => {
      ignore = true;
    };
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
            onClick={() => {
              void loadDocs();
            }}
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
        <KnowledgeForm
          editingId={editingId}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={closeForm}
          submitting={submitting}
          submitMsg={submitMsg}
        />
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
      <KnowledgeTable
        loading={loading}
        docs={filteredDocs}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />
    </div>
  );
}
