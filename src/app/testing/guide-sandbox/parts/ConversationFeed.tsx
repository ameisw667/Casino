'use client';

import {
  ArrowRight,
  Check,
  Copy,
  Gamepad2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  User,
  Volume2,
} from 'lucide-react';
import { PERSONA_META, type GuidePersona } from '@/lib/casino/chat-guide/personas';
import { MarkdownMessage } from '@/components/social/casino-guide/GuideMarkdown';
import type { SampleConversationTurn } from './sample-conversation';

interface ConversationFeedProps {
  conversation: SampleConversationTurn[];
  activeMeta: (typeof PERSONA_META)[GuidePersona];
  copiedId: string | null;
  feedbackMap: Record<string, 1 | -1>;
  onCopy: (id: string) => void;
  onFeedback: (id: string, value: 1 | -1) => void;
  onSuggestion: (text: string) => void;
}

export function ConversationFeed({
  conversation,
  activeMeta,
  copiedId,
  feedbackMap,
  onCopy,
  onFeedback,
  onSuggestion,
}: ConversationFeedProps) {
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
        padding: '18px',
      }}
    >
      {conversation.map((turn) => {
        const isGuide = turn.role === 'guide';

        return (
          <div
            key={turn.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              flexDirection: isGuide ? 'row' : 'row-reverse',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: isGuide
                  ? '1px solid hsl(var(--primary))'
                  : '1px solid rgba(255, 255, 255, 0.2)',
                background: '#0B0E14',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              {isGuide ? (
                <span
                  style={{ fontSize: '14px', lineHeight: 1 }}
                  role="img"
                  aria-label={activeMeta.label}
                >
                  {activeMeta.emoji}
                </span>
              ) : (
                <User size={13} color="#ffffff" />
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                maxWidth: '85%',
                alignItems: isGuide ? 'flex-start' : 'flex-end',
              }}
            >
              {/* Dedicated Message Bubble */}
              {isGuide ? (
                <div
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px 16px 16px 4px',
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.015) 100%), rgba(14, 18, 28, 0.78)',
                    backdropFilter: 'blur(24px)',
                    padding: '14px 18px',
                    color: '#F8FAFC',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    boxShadow:
                      '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <MarkdownMessage content={turn.text} />
                  {turn.action && (
                    <div style={{ marginTop: '12px' }}>
                      <button
                        type="button"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background:
                            'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))',
                          border: '1px solid rgba(212,175,55,0.5)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          color: '#ffd700',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        }}
                      >
                        <Gamepad2 size={13} />
                        <span>{turn.action.label}</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  {turn.suggestions && (
                    <div
                      style={{
                        marginTop: '12px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      {turn.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => onSuggestion(sug)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(212, 175, 55, 0.35)',
                            borderRadius: '16px',
                            padding: '4px 10px',
                            color: '#E2E8F0',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Sparkles size={11} color="#ffd700" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* User Message Box */
                <div
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '16px 16px 4px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    padding: '12px 18px',
                    color: '#F1F5F9',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    lineHeight: 1.55,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  {turn.text}
                </div>
              )}

              {/* Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 4px',
                }}
              >
                <span style={{ fontSize: '0.62rem', color: 'hsl(var(--text-muted))' }}>
                  {turn.time}
                </span>
                {isGuide && (
                  <>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.62rem',
                      }}
                    >
                      <Volume2 size={11} /> Vorlesen
                    </button>
                    <button
                      type="button"
                      onClick={() => onCopy(turn.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedId === turn.id ? '#10b981' : 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.62rem',
                      }}
                    >
                      {copiedId === turn.id ? <Check size={11} /> : <Copy size={11} />}
                      {copiedId === turn.id ? 'Kopiert' : 'Kopieren'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(turn.id, 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: feedbackMap[turn.id] === 1 ? '#10b981' : 'hsl(var(--text-muted))',
                      }}
                    >
                      <ThumbsUp size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onFeedback(turn.id, -1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: feedbackMap[turn.id] === -1 ? '#ef4444' : 'hsl(var(--text-muted))',
                      }}
                    >
                      <ThumbsDown size={11} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
