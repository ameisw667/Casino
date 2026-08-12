'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GuideTurn = {
  id: string;
  role: 'guide' | 'player';
  text: string;
};

type CasinoGuidePanelProps = {
  isMobile: boolean;
  onOpen: () => void;
};

const INITIAL_TURN: GuideTurn = {
  id: 'royale-guide-intro',
  role: 'guide',
  text: 'I’m Royale Guide, an AI casino guide. Ask me about game rules, navigation, or chat commands.',
};

function nextTurnId(role: GuideTurn['role']): string {
  return `${role}-${crypto.randomUUID()}`;
}

export function CasinoGuidePanel({ isMobile, onOpen }: CasinoGuidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<GuideTurn[]>([INITIAL_TURN]);
  const [isSending, setIsSending] = useState(false);

  const openPanel = () => {
    onOpen();
    setIsOpen(true);
  };

  const sendQuestion = async () => {
    const message = draft.trim();
    if (!message || isSending) return;

    setTurns((current) => [
      ...current,
      { id: nextTurnId('player'), role: 'player', text: message },
    ]);
    setDraft('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat/bot-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const answer =
        typeof payload === 'object' && payload !== null && 'answer' in payload
          ? payload.answer
          : undefined;

      if (!response.ok || typeof answer !== 'string' || !answer.trim()) {
        throw new Error('Guide response unavailable');
      }

      setTurns((current) => [
        ...current,
        { id: nextTurnId('guide'), role: 'guide', text: answer.trim() },
      ]);
    } catch {
      setTurns((current) => [
        ...current,
        {
          id: nextTurnId('guide'),
          role: 'guide',
          text: 'Royale Guide is temporarily unavailable. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const panelBottom = isMobile ? 'calc(84px + env(safe-area-inset-bottom))' : '24px';

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open Royale Guide"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={openPanel}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: panelBottom,
          zIndex: 46,
          display: isOpen ? 'none' : 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid hsla(var(--primary), 0.32)',
          borderRadius: '999px',
          padding: '10px 14px',
          background: 'hsla(var(--bg-color), 0.84)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 12px 30px hsla(0, 0%, 0%, 0.28)',
          color: 'hsl(var(--text-main))',
          cursor: 'pointer',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <Sparkles size={15} color="hsl(var(--primary))" aria-hidden />
        Royale Guide
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            aria-label="Royale Guide"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.25, duration: 0.36 }}
            style={{
              position: 'fixed',
              right: isMobile ? '12px' : '24px',
              bottom: panelBottom,
              zIndex: 46,
              width: isMobile ? 'calc(100% - 24px)' : '360px',
              maxHeight: isMobile ? 'calc(100dvh - 112px)' : 'min(620px, calc(100dvh - 48px))',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid hsla(var(--primary), 0.24)',
              borderRadius: '18px',
              background: 'hsla(var(--bg-color), 0.92)',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 18px 48px hsla(0, 0%, 0%, 0.42)',
              color: 'hsl(var(--text-main))',
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                borderBottom: '1px solid hsla(var(--primary), 0.14)',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'hsla(var(--primary), 0.14)',
                  color: 'hsl(var(--primary))',
                }}
              >
                <Bot size={16} aria-hidden />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <strong style={{ fontSize: '0.82rem', letterSpacing: '0.04em' }}>
                  Royale Guide
                </strong>
                <span style={{ fontSize: '0.64rem', color: 'hsl(var(--text-muted))' }}>
                  AI casino guide
                </span>
              </span>
              <motion.button
                type="button"
                aria-label="Close Royale Guide"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                style={{
                  marginLeft: 'auto',
                  display: 'grid',
                  placeItems: 'center',
                  width: '30px',
                  height: '30px',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  background: 'hsla(var(--bg-color), 0.46)',
                  backdropFilter: 'blur(10px)',
                  color: 'hsl(var(--text-main))',
                  cursor: 'pointer',
                }}
              >
                <X size={15} aria-hidden />
              </motion.button>
            </header>

            <div
              aria-live="polite"
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                gap: '10px',
                overflowY: 'auto',
                padding: '16px',
              }}
            >
              {turns.map((turn) => (
                <div
                  key={turn.id}
                  style={{
                    alignSelf: turn.role === 'player' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    border: `1px solid ${
                      turn.role === 'player'
                        ? 'hsla(var(--primary), 0.3)'
                        : 'hsla(0, 0%, 100%, 0.08)'
                    }`,
                    borderRadius: '12px',
                    background:
                      turn.role === 'player'
                        ? 'hsla(var(--primary), 0.13)'
                        : 'hsla(var(--bg-color), 0.56)',
                    padding: '9px 11px',
                    color:
                      turn.role === 'player' ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                  }}
                >
                  {turn.text}
                </div>
              ))}
              {isSending && (
                <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
                  Royale Guide is thinking…
                </span>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendQuestion();
              }}
              style={{
                display: 'flex',
                gap: '8px',
                padding: '12px',
                borderTop: '1px solid var(--glass-border)',
                background: 'hsla(var(--bg-color), 0.5)',
              }}
            >
              <textarea
                aria-label="Ask Royale Guide"
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 500))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendQuestion();
                  }
                }}
                disabled={isSending}
                maxLength={500}
                placeholder="Ask about rules, navigation, or commands…"
                rows={2}
                style={{
                  flex: 1,
                  resize: 'none',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  background: 'hsla(var(--bg-color), 0.42)',
                  backdropFilter: 'blur(10px)',
                  color: 'hsl(var(--text-main))',
                  outline: 'none',
                  padding: '9px 10px',
                  fontFamily: 'inherit',
                  fontSize: '0.8rem',
                }}
              />
              <motion.button
                type="submit"
                aria-label="Send question to Royale Guide"
                disabled={isSending || !draft.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  alignSelf: 'flex-end',
                  display: 'grid',
                  placeItems: 'center',
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'hsl(var(--primary))',
                  color: 'hsl(var(--bg-color))',
                  cursor: isSending || !draft.trim() ? 'not-allowed' : 'pointer',
                  opacity: isSending || !draft.trim() ? 0.5 : 1,
                }}
              >
                <Send size={16} aria-hidden />
              </motion.button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
