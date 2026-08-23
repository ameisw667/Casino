'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Check,
  Copy,
  Crown,
  Gamepad2,
  History,
  Sliders,
  Sparkles,
  Square,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  User,
  Volume2,
  Wallet,
} from 'lucide-react';

import type { GuideTurn } from '@/components/social/casino-guide/guide-config';
import { MarkdownMessage } from '@/components/social/casino-guide/GuideMarkdown';

interface GuideMessageListProps {
  turns: GuideTurn[];
  isSending: boolean;
  isExpanded: boolean;
  copiedId: string | null;
  feedbackMap: Record<string, 1 | -1>;
  playingMessageId: string | null;
  onActionClick: (action: { type: string; target?: string; label: string }) => void;
  onSuggestionClick: (query: string) => void;
  onPlayVoice: (messageId: string, text: string) => void;
  onCopy: (id: string, text: string) => void;
  onFeedback: (messageId: string, rating: 1 | -1) => void;
}

export function GuideMessageList({
  turns,
  isSending,
  isExpanded,
  copiedId,
  feedbackMap,
  playingMessageId,
  onActionClick,
  onSuggestionClick,
  onPlayVoice,
  onCopy,
  onFeedback,
}: GuideMessageListProps) {
  return (
    <div
      aria-live="polite"
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
        padding: '16px',
      }}
    >
      {turns.map((turn, index) => (
        <div
          key={turn.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '9px',
            flexDirection: turn.role === 'player' ? 'row-reverse' : 'row',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background:
                turn.role === 'guide' ? 'hsla(var(--primary), 0.16)' : 'hsla(0, 0%, 100%, 0.1)',
              border: `1px solid ${
                turn.role === 'guide' ? 'hsla(var(--primary), 0.45)' : 'var(--glass-border)'
              }`,
              color: turn.role === 'guide' ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              marginTop: '2px',
            }}
          >
            {turn.role === 'guide' ? <Bot size={14} /> : <User size={13} />}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxWidth: isExpanded ? '75%' : '84%',
              alignItems: turn.role === 'player' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                border: `1px solid ${
                  turn.role === 'player' ? 'hsla(var(--primary), 0.35)' : 'hsla(0, 0%, 100%, 0.1)'
                }`,
                borderRadius: '14px',
                background:
                  turn.role === 'player'
                    ? 'hsla(var(--primary), 0.15)'
                    : 'hsla(var(--bg-color), 0.65)',
                padding: '10px 14px',
                color: turn.role === 'player' ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))',
                fontSize: '0.80rem',
                lineHeight: 1.55,
                boxShadow: '0 4px 12px hsla(0, 0%, 0%, 0.18)',
                whiteSpace: turn.role === 'guide' ? 'normal' : 'pre-wrap',
              }}
            >
              {turn.role === 'guide' ? (
                <>
                  <MarkdownMessage content={turn.text} />
                  {isSending && index === turns.length - 1 && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '13px',
                        background: '#ffd700',
                        marginLeft: '4px',
                        verticalAlign: '-1px',
                        borderRadius: '1px',
                        opacity: 0.85,
                      }}
                    />
                  )}
                  {turn.action && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => onActionClick(turn.action!)}
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
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                          transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, rgba(212,175,55,0.4), rgba(212,175,55,0.2))';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.1))';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {turn.action.type === 'open_vault' && <Wallet size={14} />}
                        {turn.action.type === 'navigate_game' && <Gamepad2 size={14} />}
                        {turn.action.type === 'open_settings' && <Sliders size={14} />}
                        {turn.action.type === 'open_rank_benefits' && <Crown size={14} />}
                        {turn.action.type === 'open_history' && <History size={14} />}
                        {turn.action.type === 'open_leaderboard' && <TrendingUp size={14} />}
                        <span>{turn.action.label}</span>
                        <ArrowRight size={12} style={{ opacity: 0.8 }} />
                      </button>
                    </div>
                  )}
                  {turn.suggestions &&
                    turn.suggestions.length > 0 &&
                    (!isSending || index !== turns.length - 1) && (
                      <div
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          alignItems: 'center',
                        }}
                      >
                        {turn.suggestions.map((suggestion, sIdx) => (
                          <button
                            key={`sug-${turn.id}-${sIdx}`}
                            type="button"
                            onClick={() => onSuggestionClick(suggestion)}
                            disabled={isSending}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(212, 175, 55, 0.3)',
                              borderRadius: '16px',
                              padding: '4px 10px',
                              color: 'hsl(var(--text-main))',
                              fontSize: '0.74rem',
                              cursor: isSending ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSending) {
                                e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
                                e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.6)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                              e.currentTarget.style.transform = 'none';
                            }}
                          >
                            <Sparkles size={11} style={{ color: '#ffd700', flexShrink: 0 }} />
                            <span>{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    )}
                </>
              ) : (
                <div>
                  {turn.image && (
                    <div
                      style={{
                        marginBottom: '6px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        maxWidth: '220px',
                        maxHeight: '160px',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={turn.image}
                        alt="Spielrunden-Screenshot"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  )}
                  <div>{turn.text}</div>
                </div>
              )}
            </div>

            {turn.text.length > 0 && (!isSending || index !== turns.length - 1) && (
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
                {turn.role === 'guide' && (
                  <>
                    <button
                      type="button"
                      aria-label={
                        playingMessageId === turn.id ? 'Sprachausgabe stoppen' : 'Antwort vorlesen'
                      }
                      title={
                        playingMessageId === turn.id ? 'Sprachausgabe stoppen' : 'Antwort vorlesen'
                      }
                      onClick={() => onPlayVoice(turn.id, turn.text)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: playingMessageId === turn.id ? '#ffd700' : 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.62rem',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {playingMessageId === turn.id ? (
                        <>
                          <Square size={11} style={{ color: '#ffd700' }} /> Stopp
                        </>
                      ) : (
                        <>
                          <Volume2 size={11} /> Vorlesen
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label="Copy answer to clipboard"
                      onClick={() => onCopy(turn.id, turn.text)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedId === turn.id ? '#10b981' : 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.62rem',
                        padding: '2px 4px',
                        borderRadius: '4px',
                      }}
                    >
                      {copiedId === turn.id ? (
                        <>
                          <Check size={11} /> Kopiert
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Kopieren
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label="Hilfreiche Antwort"
                      title="Hilfreich"
                      onClick={() => onFeedback(turn.id, 1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: feedbackMap[turn.id] === 1 ? '#10b981' : 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.62rem',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      <ThumbsUp size={11} />
                    </button>

                    <button
                      type="button"
                      aria-label="Nicht hilfreiche Antwort"
                      title="Nicht hilfreich"
                      onClick={() => onFeedback(turn.id, -1)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: feedbackMap[turn.id] === -1 ? '#ef4444' : 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.62rem',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      <ThumbsDown size={11} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {isSending &&
        (!turns.length ||
          turns[turns.length - 1]?.role === 'player' ||
          !turns[turns.length - 1]?.text) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              alignSelf: 'flex-start',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'hsla(var(--bg-color), 0.65)',
              border: '1px solid hsla(var(--primary), 0.2)',
            }}
          >
            <Bot size={14} color="hsl(var(--primary))" />
            <span style={{ fontSize: '0.74rem', color: 'hsl(var(--text-muted))' }}>
              Royale Guide analysiert Spielregeln
            </span>
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.18 }}
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'hsl(var(--primary))',
                  }}
                />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
