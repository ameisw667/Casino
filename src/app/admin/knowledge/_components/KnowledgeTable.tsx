'use client';

import { RefreshCw, Edit, Trash2, Tag } from 'lucide-react';
import type { GuideDoc } from './shared';

interface KnowledgeTableProps {
  loading: boolean;
  docs: GuideDoc[];
  onEdit: (doc: GuideDoc) => void;
  onDelete: (id: string, title: string) => void;
}

export function KnowledgeTable({ loading, docs, onEdit, onDelete }: KnowledgeTableProps) {
  return (
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
                  <RefreshCw
                    size={20}
                    className="animate-spin"
                    style={{ margin: '0 auto 8px', color: '#ffd700' }}
                  />
                  Lade Wissensdokumente...
                </td>
              </tr>
            ) : docs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}
                >
                  Keine Dokumente gefunden.
                </td>
              </tr>
            ) : (
              docs.map((doc) => (
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
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '4px',
                        fontSize: '0.85rem',
                      }}
                    >
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

                  <td
                    style={{
                      padding: '1rem',
                      verticalAlign: 'top',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onEdit(doc)}
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
                      onClick={() => onDelete(doc.id, doc.title)}
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
  );
}
