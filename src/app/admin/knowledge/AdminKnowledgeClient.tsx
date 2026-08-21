'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  X,
  FileText,
  Tag,
  Sliders,
} from 'lucide-react';

type GuideDoc = {
  id: string;
  slug: string;
  topic: string;
  title: string;
  content: string;
  tags: string[];
  version?: string;
  is_active: boolean;
  updated_at: string;
};

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

export default function AdminKnowledgeClient() {
  const [docs, setDocs] = useState<GuideDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<GuideDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    slug: '',
    topic: 'blackjack',
    title: '',
    content: '',
    tags: '',
    isActive: true,
  });

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge');
      if (res.ok) {
        const data = await res.json();
        setDocs(data.documents || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Fehler beim Laden der Wissensbasis' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const openCreateModal = () => {
    setEditingDoc(null);
    setFormData({
      id: '',
      slug: '',
      topic: 'blackjack',
      title: '',
      content: '',
      tags: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (doc: GuideDoc) => {
    setEditingDoc(doc);
    setFormData({
      id: doc.id,
      slug: doc.slug,
      topic: doc.topic,
      title: doc.title,
      content: doc.content,
      tags: (doc.tags || []).join(', '),
      isActive: doc.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      id: formData.id || undefined,
      slug: formData.slug.trim(),
      topic: formData.topic,
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: tagsArray,
      isActive: formData.isActive,
    };

    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setFeedback({
          type: 'success',
          message: 'Dokument erfolgreich gespeichert & vektorisiert',
        });
        setModalOpen(false);
        await loadDocs();
      } else {
        setFeedback({
          type: 'error',
          message: data?.error || 'Fehler beim Speichern des Dokuments',
        });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Netzwerkfehler beim Speichern' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Möchtest du das Dokument "${id}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin/knowledge?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Dokument gelöscht' });
        await loadDocs();
      } else {
        setFeedback({ type: 'error', message: 'Fehler beim Löschen' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Netzwerkfehler beim Löschen' });
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Royale Knowledge CMS
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  pgvector
                </span>
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                Verwalte KI-Hilfeartikel, Vektor-Embeddings und SQL-Wissensquellen live in PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 bg-black/40 text-neutral-300 hover:bg-white/5 text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Neues Dokument
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Nach Titel, Slug oder Tags suchen..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={selectedTopic}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTopic(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Alle Themen ({docs.length})</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-neutral-400 uppercase tracking-wider border-b border-white/10 font-mono">
              <tr>
                <th className="py-3.5 px-4 font-medium">Thema & ID</th>
                <th className="py-3.5 px-4 font-medium">Titel & Zusammenfassung</th>
                <th className="py-3.5 px-4 font-medium">Tags</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    Lade Dokumente aus Supabase...
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-mono">
                    Keine Dokumente gefunden.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <motion.tr
                    key={doc.id}
                    className="hover:bg-white/[0.02] transition-colors"
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <td className="py-4 px-4 align-top">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-300">
                          {doc.topic}
                        </span>
                        <p className="font-mono text-[11px] text-neutral-400">{doc.id}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top max-w-md">
                      <div className="space-y-1">
                        <p className="font-semibold text-white text-xs">{doc.title}</p>
                        <p className="text-[11px] text-neutral-400 line-clamp-2">{doc.content}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(doc.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-neutral-300"
                          >
                            <Tag className="w-2.5 h-2.5 text-neutral-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          doc.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doc.is_active ? 'bg-emerald-400' : 'bg-neutral-500'
                          }`}
                        />
                        {doc.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-top text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(doc)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-2xl bg-neutral-950/90 border border-amber-500/30 rounded-2xl shadow-2xl p-6 space-y-4 backdrop-blur-xl z-10"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-white">
                    {editingDoc ? 'Wissensdokument bearbeiten' : 'Neues Wissensdokument anlegen'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-medium">Slug (Eindeutiger Bezeichner)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="z.B. games-blackjack"
                      required
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-neutral-300 font-medium">Thema (Topic)</label>
                    <select
                      value={formData.topic}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">Titel</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Prägnanter Titel des Artikels"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">
                    Inhalt (Markdown / Text für RAG-Index)
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={7}
                    placeholder="Regeln, Auszahlungsquoten, Limits oder Navigationslinks..."
                    required
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-neutral-300 font-medium">
                    Tags (Kommagetrennt für Schnellpfad-Matcher)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="blackjack, regeln, hit, stand, double"
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="rounded border-neutral-700 bg-black/40 text-amber-500 focus:ring-0"
                    />
                    <span className="text-neutral-300">Dokument aktiv schalten</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white text-xs transition-colors"
                    >
                      Abbrechen
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                      {saving ? 'Vektorisiere...' : 'Speichern & Vektorisieren'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
