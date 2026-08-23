'use client';

import React, { type Dispatch, type SetStateAction } from 'react';
import { Edit, Plus, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { TOPICS, inputStyle, Field, type KnowledgeFormState, type SubmitMsg } from './shared';

interface KnowledgeFormProps {
  editingId: string | null;
  form: KnowledgeFormState;
  setForm: Dispatch<SetStateAction<KnowledgeFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  submitting: boolean;
  submitMsg: SubmitMsg | null;
}

export function KnowledgeForm({
  editingId,
  form,
  setForm,
  onSubmit,
  onClose,
  submitting,
  submitMsg,
}: KnowledgeFormProps) {
  return (
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
          onClick={onClose}
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

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              onClick={onClose}
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
            background: submitMsg.kind === 'ok' ? 'rgba(0,231,1,0.1)' : 'rgba(239,68,68,0.1)',
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
  );
}
