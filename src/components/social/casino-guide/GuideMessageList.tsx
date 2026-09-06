'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDown,
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
import { GuideThinkingSkeleton } from '@/components/social/casino-guide/GuideThinkingSkeleton';

interface GuideMessageListProps {
  turns: GuideTurn[];
  isSending: boolean;
  isExpanded: boolean;
  copiedId: string | null;
  feedbackMap: Record<string, 1 | -1>;
  playingMessageId: string | null;
  activeToolName?: string | null;
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
  activeToolName,
  onActionClick,
  onSuggestionClick,
  onPlayVoice,
  onCopy,
  onFeedback,
}: GuideMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  // Check whether the user is near the bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom < 100;
    isNearBottomRef.current = nearBottom;
    setShowScrollBottom(distanceFromBottom > 150);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  };

  // Scroll to bottom on every turn change, streamed chunk, or thinking skeleton appearance
  const lastTurn = turns[turns.length - 1];
  const lastTurnText = lastTurn?.text ?? '';
  const lastTurnRole = lastTurn?.role;

  useEffect(() => {
    // When a player sends a message or while LLM is generating/streaming, always follow down
    if (lastTurnRole === 'player' || isSending) {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      isNearBottomRef.current = true;
      return;
    }

    // When new message arrives or finished, follow if user was near bottom
    if (isNearBottomRef.current && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns.length, lastTurnText, isSending, lastTurnRole, activeToolName]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      aria-live="polite"
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: '14px',
        overflowY: 'auto',
        padding: '16px',
        position: 'relative',
      }}
    >
      <AnimatePresence initial={false}>
        {turns.length === 1 && turns[0]?.role === 'guide' && !isSending && (
          <motion.div
            key="guide-welcome-hero"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, bounce: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 0 0',
            }}
          >
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/royale-guide-mascot-white.png"
                alt="Royale Guide begruesst dich"
                width={64}
                height={64}
                sizes="64px"
                style={{ filter: 'drop-shadow(0 0 14px rgba(212, 175, 55, 0.45))' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
                playingMessageId === turn.id
                  ? 'hsl(var(--primary))'
                  : turn.role === 'guide'
                    ? 'hsla(var(--primary), 0.45)'
                    : 'var(--glass-border)'
              }`,
              color: turn.role === 'guide' ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              marginTop: '2px',
              boxShadow:
                playingMessageId === turn.id
                  ? '0 0 14px hsla(var(--primary), 0.75), 0 0 24px hsla(var(--primary), 0.35)'
                  : 'none',
              transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
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
                  turn.role === 'player' ? 'hsla(var(--primary), 0.5)' : 'rgba(255, 255, 255, 0.12)'
                }`,
                borderRadius: '12px',
                background:
                  turn.role === 'player'
                    ? 'linear-gradient(135deg, hsla(var(--primary), 0.25), hsla(var(--primary), 0.12))'
                    : 'rgba(14, 18, 26, 0.75)',
                padding: '12px 16px',
                color: turn.role === 'player' ? '#ffffff' : '#f8fafc',
                fontSize: '0.80rem',
                lineHeight: 1.6,
                boxShadow:
                  turn.role === 'player'
                    ? '0 4px 16px rgba(0, 0, 0, 0.35)'
                    : '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
                whiteSpace: turn.role === 'guide' ? 'normal' : 'pre-wrap',
              }}
            >
              {turn.role === 'guide' ? (
                <>
                  <MarkdownMessage content={turn.text} />
                  {isSending && index === turns.length - 1 && (
                    <motion.span
                      aria-hidden="true"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: 'easeInOut' }}
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '14px',
                        background: 'hsl(var(--primary))',
                        boxShadow: '0 0 8px hsla(var(--primary), 0.65)',
                        marginLeft: '5px',
                        verticalAlign: '-2px',
                        borderRadius: '2px',
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
                          color: '#D4AF37',
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
                            <Sparkles size={11} style={{ color: '#D4AF37', flexShrink: 0 }} />
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
                <span
                  style={{
                    fontSize: '0.62rem',
                    color: 'hsl(var(--text-muted))',
                    fontFamily: 'var(--font-mono), monospace',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {turn.time}
                </span>
                {turn.role === 'guide' && (
                  <>
                    <button
                      type="button"
                      className="relative before:absolute before:inset-[-6px] before:content-[''] focus-visible:ring-1 focus-visible:ring-[#D4AF37] focus-visible:outline-none"
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
                        color: playingMessageId === turn.id ? '#D4AF37' : 'hsl(var(--text-muted))',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.62rem',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {playingMessageId === turn.id ? (
                        <>
                          <Square size={11} style={{ color: '#D4AF37' }} /> Stopp
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              marginLeft: '2px',
                              height: '11px',
                            }}
                            aria-hidden
                          >
                            {[0.2, 0.6, 0.3, 0.8].map((delay, idx) => (
                              <motion.span
                                key={idx}
                                animate={{ height: ['3px', '11px', '3px'] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.65,
                                  delay: delay * 0.35,
                                  ease: 'easeInOut',
                                }}
                                style={{
                                  width: '2px',
                                  background: '#D4AF37',
                                  borderRadius: '1px',
                                  boxShadow: '0 0 4px rgba(212, 175, 55, 0.65)',
                                }}
                              />
                            ))}
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={11} /> Vorlesen
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="relative before:absolute before:inset-[-6px] before:content-[''] focus-visible:ring-1 focus-visible:ring-[#D4AF37] focus-visible:outline-none"
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
                      className="relative before:absolute before:inset-[-6px] before:content-[''] focus-visible:ring-1 focus-visible:ring-[#D4AF37] focus-visible:outline-none"
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
                      className="relative before:absolute before:inset-[-6px] before:content-[''] focus-visible:ring-1 focus-visible:ring-[#D4AF37] focus-visible:outline-none"
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

      <AnimatePresence>
        {isSending &&
          (!turns.length ||
            turns[turns.length - 1]?.role === 'player' ||
            !turns[turns.length - 1]?.text) && (
            <GuideThinkingSkeleton activeToolName={activeToolName} />
          )}
      </AnimatePresence>

      {/* Anchor for auto-scrolling */}
      <div ref={messagesEndRef} style={{ height: '1px', flexShrink: 0 }} />

      {/* Floating Scroll-To-Bottom Button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => scrollToBottom('smooth')}
            style={{
              position: 'sticky',
              bottom: '8px',
              alignSelf: 'center',
              zIndex: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(11, 14, 20, 0.92)',
              border: '1px solid hsla(var(--primary), 0.6)',
              color: 'hsl(var(--primary))',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px hsla(var(--primary), 0.25)',
            }}
          >
            <ArrowDown size={12} />
            <span>Neueste Nachrichten</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
