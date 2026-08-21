'use client';

import { useState } from 'react';
import {
  Bot,
  Check,
  CircleDot,
  Compass,
  Copy,
  Crown,
  Dices,
  Layers,
  Maximize2,
  Minimize2,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type GuideTurn = {
  id: string;
  role: 'guide' | 'player';
  text: string;
  time: string;
};

type CasinoGuidePanelProps = {
  isMobile: boolean;
  onOpen: () => void;
};

const getCurrentTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const INITIAL_TURN: GuideTurn = {
  id: 'royale-guide-intro',
  role: 'guide',
  text: 'Willkommen bei Royale Guide, deinem persönlichen KI-Casino-Assistenten. Wähle ein Schnellthema oder frage mich zu Spielregeln, VIP-Rängen, Limits oder Navigation.',
  time: getCurrentTime(),
};

const QUICK_CHIPS = [
  {
    label: 'Blackjack',
    query: 'Wie funktioniert Split und Double Down bei Blackjack?',
    icon: Layers,
  },
  {
    label: 'Crash',
    query: 'Wie berechnet sich der Crash Multiplikator und Cashout?',
    icon: TrendingUp,
  },
  { label: 'VIP Ränge', query: 'Welche VIP-Stufen und Rakeback-Vorteile gibt es?', icon: Crown },
  {
    label: 'Provably Fair',
    query: 'Wie funktioniert das Provably Fair Seed-System?',
    icon: ShieldCheck,
  },
  { label: 'Navigation', query: 'Wo finde ich meine Wetthistorie und den Tresor?', icon: Compass },
] as const;

const SIDEBAR_TOPICS = [
  {
    category: 'Spiele & Regeln',
    items: [
      {
        label: 'Blackjack Regeln',
        query: 'Wie funktioniert Split und Double Down bei Blackjack?',
        icon: Layers,
      },
      {
        label: 'Crash Multiplikator',
        query: 'Wie berechnet sich der Crash Multiplikator und Cashout?',
        icon: TrendingUp,
      },
      {
        label: 'Roulette Quoten',
        query: 'Welche Auszahlungsquoten haben Straight und Farben bei Roulette?',
        icon: CircleDot,
      },
      {
        label: 'Dice Wahrscheinlichkeit',
        query: 'Wie funktioniert Roll Under und der Multiplikator bei Dice?',
        icon: Dices,
      },
      {
        label: 'Slots Walzen & 7s',
        query: 'Welche Symbol-Hierarchie und Auszahlungslinien gibt es bei Slots?',
        icon: Sparkles,
      },
    ],
  },
  {
    category: 'VIP & Fairness',
    items: [
      {
        label: 'VIP Ränge & Level',
        query: 'Welche VIP-Stufen und Rakeback-Vorteile gibt es?',
        icon: Crown,
      },
      {
        label: 'Provably Fair Seed',
        query: 'Wie funktioniert das Provably Fair Seed-System?',
        icon: ShieldCheck,
      },
      {
        label: 'Einsatz-Limits',
        query: 'Wie hoch sind die Mindest- und Maximaleinsätze?',
        icon: Sliders,
      },
    ],
  },
  {
    category: 'Plattform',
    items: [
      {
        label: 'Navigation & Menü',
        query: 'Wo finde ich meine Wetthistorie und den Tresor?',
        icon: Compass,
      },
      {
        label: 'Chat-Befehle',
        query: 'Welche Chat-Befehle wie /help oder /stats gibt es?',
        icon: Terminal,
      },
    ],
  },
] as const;

function cleanLatexMath(text: string): string {
  return text
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 / $2')
    .replace(/\\[\[\]()]/g, '')
    .trim();
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const cleaned = text.replace(/\\text\{([^}]+)\}/g, '$1');
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const tokens = cleaned.split(regex);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(
        <strong key={i} style={{ color: 'hsl(var(--primary))', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(
        <em key={i} style={{ fontStyle: 'italic', color: 'hsl(var(--text-main))' }}>
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      parts.push(
        <code
          key={i}
          style={{
            padding: '1.5px 6px',
            borderRadius: '4px',
            background: 'hsla(var(--primary), 0.15)',
            border: '1px solid hsla(var(--primary), 0.28)',
            color: 'hsl(var(--primary))',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(token);
    }
  }
  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushTable = (keyIndex: number) => {
    if (tableBuffer.length === 0) return;
    const headerRow = tableBuffer[0]
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    const bodyRows = tableBuffer
      .slice(2)
      .map((row) =>
        row
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean),
      );

    elements.push(
      <div
        key={`tbl-${keyIndex}`}
        style={{
          margin: '8px 0',
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid hsla(var(--primary), 0.25)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ background: 'hsla(var(--primary), 0.14)' }}>
              {headerRow.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    color: 'hsl(var(--primary))',
                    fontWeight: 700,
                    borderBottom: '1px solid hsla(var(--primary), 0.25)',
                  }}
                >
                  {parseInlineMarkdown(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom:
                    rIdx < bodyRows.length - 1 ? '1px solid hsla(var(--primary), 0.1)' : 'none',
                  background: rIdx % 2 === 1 ? 'hsla(var(--primary), 0.03)' : 'transparent',
                }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: '6px 10px',
                      color: 'hsl(var(--text-main))',
                    }}
                  >
                    {parseInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableBuffer = [];
  };

  const flushList = (keyIndex: number) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul
        key={`list-${keyIndex}`}
        style={{
          margin: '6px 0',
          paddingLeft: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          fontSize: '0.80rem',
          lineHeight: 1.55,
        }}
      >
        {listBuffer.map((item, lIdx) => (
          <li key={lIdx} style={{ listStyleType: 'disc' }}>
            {parseInlineMarkdown(item)}
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(i);
      tableBuffer.push(trimmed);
      continue;
    } else {
      flushTable(i);
    }

    // List item detection (- item, * item, or 1. item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
      continue;
    } else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
      continue;
    } else {
      flushList(i);
    }

    // Empty line / separator
    if (!trimmed || trimmed === '-') {
      continue;
    }

    // Heading detection (#, ##, ###, ####)
    if (/^#{1,4}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{1,4}\s+/, '');
      elements.push(
        <h4
          key={`h-${i}`}
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'hsl(var(--primary))',
            margin: '10px 0 4px 0',
            letterSpacing: '0.02em',
          }}
        >
          {parseInlineMarkdown(headingText)}
        </h4>,
      );
      continue;
    }

    // Formula / Math block (\[ ... \] or $$ ... $$)
    if (
      (trimmed.startsWith('\\[') && trimmed.endsWith('\\]')) ||
      (trimmed.startsWith('$$') && trimmed.endsWith('$$'))
    ) {
      const formulaText = cleanLatexMath(trimmed);
      elements.push(
        <div
          key={`math-${i}`}
          style={{
            margin: '6px 0',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'hsla(var(--primary), 0.08)',
            border: '1px solid hsla(var(--primary), 0.22)',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: 'hsl(var(--primary))',
            textAlign: 'center',
          }}
        >
          {formulaText}
        </div>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} style={{ margin: '4px 0', fontSize: '0.80rem', lineHeight: 1.55 }}>
        {parseInlineMarkdown(trimmed)}
      </p>,
    );
  }

  flushTable(lines.length);
  flushList(lines.length);

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
}

function nextTurnId(role: GuideTurn['role']): string {
  return `${role}-${crypto.randomUUID()}`;
}

export function CasinoGuidePanel({ isMobile, onOpen }: CasinoGuidePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<GuideTurn[]>([INITIAL_TURN]);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 1 | -1>>({});

  const handleFeedback = async (messageId: string, rating: 1 | -1) => {
    if (feedbackMap[messageId] === rating) return;
    setFeedbackMap((prev) => ({ ...prev, [messageId]: rating }));
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, messageId }),
      });
    } catch {
      // Ignore network error silently
    }
  };

  const openPanel = () => {
    onOpen();
    setIsOpen(true);
  };

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  const sendQuestion = async (customMessage?: string) => {
    const message = (customMessage ?? draft).trim();
    if (!message || isSending) return;

    const time = getCurrentTime();
    setTurns((current) => [
      ...current,
      { id: nextTurnId('player'), role: 'player', text: message, time },
    ]);
    if (!customMessage) setDraft('');
    setIsSending(true);

    const history = turns
      .filter((t) => t.id !== 'royale-guide-intro')
      .slice(-6)
      .map((t) => ({
        role: t.role === 'player' ? ('user' as const) : ('assistant' as const),
        content: t.text,
      }));

    const guideTurnId = nextTurnId('guide');
    const replyTime = getCurrentTime();

    try {
      const response = await fetch('/api/chat/bot-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json',
        },
        body: JSON.stringify({ message, history, stream: true }),
      });

      if (!response.ok) {
        let text =
          'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.';
        if (response.status === 401) {
          text = 'Bitte melde dich an, um Royale Guide zu nutzen.';
        } else if (response.status === 429) {
          text = 'Zu viele Anfragen. Bitte warte einen kurzen Moment.';
        }
        setTurns((current) => [
          ...current,
          { id: guideTurnId, role: 'guide', text, time: replyTime },
        ]);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        // Mount guide turn for streaming
        setTurns((current) => [
          ...current,
          { id: guideTurnId, role: 'guide', text: '', time: replyTime },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === 'data: [DONE]') continue;
            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.text) {
                  const chunkText: string = parsed.text;
                  accumulated += chunkText;
                  setTurns((current) =>
                    current.map((t) =>
                      t.id === guideTurnId ? { ...t, text: t.text + chunkText } : t,
                    ),
                  );
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }

        if (!accumulated.trim()) {
          setTurns((current) =>
            current.map((t) =>
              t.id === guideTurnId
                ? {
                    ...t,
                    text: 'Royale Guide konnte keine Antwort generieren. Bitte versuche es erneut.',
                  }
                : t,
            ),
          );
        }
      } else {
        // Classic JSON fallback
        const payload: unknown = await response.json().catch(() => null);
        const answer =
          typeof payload === 'object' && payload !== null && 'answer' in payload
            ? payload.answer
            : undefined;

        if (typeof answer !== 'string' || !answer.trim()) {
          setTurns((current) => [
            ...current,
            {
              id: guideTurnId,
              role: 'guide',
              text: 'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.',
              time: replyTime,
            },
          ]);
          return;
        }

        setTurns((current) => [
          ...current,
          { id: guideTurnId, role: 'guide', text: answer.trim(), time: replyTime },
        ]);
      }
    } catch {
      setTurns((current) => [
        ...current,
        {
          id: guideTurnId,
          role: 'guide',
          text: 'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.',
          time: getCurrentTime(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const panelBottom = isMobile ? 'calc(84px + env(safe-area-inset-bottom))' : '24px';

  return (
    <>
      {/* Floating Trigger Button (Option 1A — Subtiler Obsidian & Gold Glow) */}
      <motion.button
        type="button"
        aria-label="Open Royale Guide"
        animate={{
          scale: [1, 1.022, 1],
          boxShadow: [
            '0 8px 24px rgba(0, 0, 0, 0.55), 0 0 10px hsla(45, 85%, 55%, 0.12), inset 0 1px 0 hsla(45, 100%, 75%, 0.25)',
            '0 10px 28px rgba(0, 0, 0, 0.65), 0 0 16px hsla(45, 85%, 55%, 0.2), inset 0 1px 0 hsla(45, 100%, 75%, 0.35)',
            '0 8px 24px rgba(0, 0, 0, 0.55), 0 0 10px hsla(45, 85%, 55%, 0.12), inset 0 1px 0 hsla(45, 100%, 75%, 0.25)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
        whileHover={{ scale: 1.04, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 18px hsla(45, 85%, 55%, 0.28)' }}
        whileTap={{ scale: 0.95 }}
        onClick={openPanel}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: panelBottom,
          zIndex: 46,
          display: isOpen ? 'none' : 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          border: '1px solid hsla(var(--primary), 0.38)',
          borderRadius: '999px',
          padding: '12px 18px',
          background: 'hsla(var(--bg-color), 0.92)',
          backdropFilter: 'blur(16px)',
          color: 'hsl(var(--text-main))',
          cursor: 'pointer',
          fontSize: '0.74rem',
          fontWeight: 800,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        <Sparkles size={16} color="hsl(var(--primary))" aria-hidden />
        <span>Royale Guide</span>
        <span
          style={{
            fontSize: '0.62rem',
            lineHeight: 1,
            padding: '3px 6px',
            borderRadius: '6px',
            background: 'hsla(var(--primary), 0.18)',
            border: '1px solid hsla(var(--primary), 0.35)',
            color: 'hsl(var(--primary))',
            fontWeight: 900,
            letterSpacing: '0.04em',
          }}
        >
          AI
        </span>
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }}
          aria-hidden
        />
      </motion.button>

      {/* Backdrop for Expanded Center-Modal */}
      <AnimatePresence>
        {isOpen && isExpanded && !isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 45,
              background: 'hsla(0, 0%, 0%, 0.65)',
              backdropFilter: 'blur(8px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Chat Panel / Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            aria-label="Royale Guide"
            initial={{ opacity: 0, scale: 0.96, y: isExpanded ? 0 : 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              ...(isExpanded && !isMobile
                ? {
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(880px, calc(100vw - 32px))',
                    height: 'min(680px, calc(100dvh - 48px))',
                  }
                : {
                    right: isMobile ? '12px' : '24px',
                    bottom: panelBottom,
                    width: isMobile ? 'calc(100% - 24px)' : '380px',
                    height: isMobile ? 'calc(100dvh - 112px)' : 'min(640px, calc(100dvh - 48px))',
                  }),
            }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
            style={{
              position: 'fixed',
              zIndex: 46,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid hsla(var(--primary), 0.32)',
              borderRadius: '20px',
              background: 'hsla(var(--bg-color), 0.94)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 60px hsla(0, 0%, 0%, 0.65), 0 0 1px hsla(var(--primary), 0.45)',
              color: 'hsl(var(--text-main))',
            }}
          >
            {/* Header */}
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '11px',
                padding: '14px 16px',
                borderBottom: '1px solid hsla(var(--primary), 0.16)',
                background: 'hsla(var(--primary), 0.04)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'hsla(var(--primary), 0.16)',
                  border: '1px solid hsla(var(--primary), 0.4)',
                  color: 'hsl(var(--primary))',
                  flexShrink: 0,
                }}
              >
                <Bot size={17} aria-hidden />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.84rem', letterSpacing: '0.04em' }}>
                    Royale Guide
                  </strong>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      lineHeight: 1,
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: 'hsla(var(--primary), 0.18)',
                      border: '1px solid hsla(var(--primary), 0.35)',
                      color: 'hsl(var(--primary))',
                      fontWeight: 800,
                    }}
                  >
                    AI
                  </span>
                </div>
                <span style={{ fontSize: '0.66rem', color: 'hsl(var(--text-muted))' }}>
                  {isExpanded ? 'Casino AI Assistant & Knowledge Hub' : 'Casino AI Assistant'}
                </span>
              </div>

              <div
                style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {/* Maximize / Minimize Button (Option 3A) */}
                {!isMobile && (
                  <motion.button
                    type="button"
                    aria-label={isExpanded ? 'Verkleinern' : 'Vergrößern'}
                    title={
                      isExpanded ? 'Auf Standardgröße verkleinern' : '2-Spalten Großansicht öffnen'
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: '30px',
                      height: '30px',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      background: isExpanded
                        ? 'hsla(var(--primary), 0.18)'
                        : 'hsla(var(--bg-color), 0.46)',
                      color: isExpanded ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
                      cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </motion.button>
                )}

                {/* Close Button */}
                <motion.button
                  type="button"
                  aria-label="Close Royale Guide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsOpen(false);
                    setIsExpanded(false);
                  }}
                  style={{
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
              </div>
            </header>

            {/* Main Content Area (2-Columns in Expanded Mode) */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Left Sidebar (Only in Expanded Mode) */}
              {isExpanded && !isMobile && (
                <aside
                  style={{
                    width: '240px',
                    borderRight: '1px solid hsla(var(--primary), 0.14)',
                    background: 'hsla(var(--primary), 0.02)',
                    padding: '14px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'hsl(var(--primary))',
                    }}
                  >
                    Themen & Schnellzugriff
                  </div>

                  {SIDEBAR_TOPICS.map((group) => (
                    <div
                      key={group.category}
                      style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
                    >
                      <span
                        style={{
                          fontSize: '0.64rem',
                          fontWeight: 700,
                          color: 'hsl(var(--text-muted))',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {group.category}
                      </span>
                      {group.items.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.button
                            key={item.label}
                            type="button"
                            whileHover={{ x: 3, backgroundColor: 'hsla(var(--primary), 0.1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => void sendQuestion(item.query)}
                            disabled={isSending}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              textAlign: 'left',
                              padding: '6px 8px',
                              borderRadius: '8px',
                              border: '1px solid transparent',
                              background: 'transparent',
                              color: 'hsl(var(--text-main))',
                              fontSize: '0.74rem',
                              fontWeight: 500,
                              cursor: isSending ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <IconComponent
                              size={13}
                              color="hsl(var(--primary))"
                              style={{ flexShrink: 0 }}
                            />
                            <span
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: 'auto',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'hsla(var(--primary), 0.05)',
                      border: '1px solid hsla(var(--primary), 0.15)',
                      fontSize: '0.64rem',
                      color: 'hsl(var(--text-muted))',
                      lineHeight: 1.4,
                    }}
                  >
                    <strong
                      style={{
                        color: 'hsl(var(--primary))',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      Hybrid RAG v2026.08
                    </strong>
                    Antwortet aus 10 verifizierten Casino-Dokumenten mit Provably-Fair-Garantie.
                  </div>
                </aside>
              )}

              {/* Right Chat Column */}
              <div
                style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}
              >
                {/* Messages Container */}
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
                            turn.role === 'guide'
                              ? 'hsla(var(--primary), 0.16)'
                              : 'hsla(0, 0%, 100%, 0.1)',
                          border: `1px solid ${
                            turn.role === 'guide'
                              ? 'hsla(var(--primary), 0.45)'
                              : 'var(--glass-border)'
                          }`,
                          color:
                            turn.role === 'guide' ? 'hsl(var(--primary))' : 'hsl(var(--text-main))',
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
                              turn.role === 'player'
                                ? 'hsla(var(--primary), 0.35)'
                                : 'hsla(0, 0%, 100%, 0.1)'
                            }`,
                            borderRadius: '14px',
                            background:
                              turn.role === 'player'
                                ? 'hsla(var(--primary), 0.15)'
                                : 'hsla(var(--bg-color), 0.65)',
                            padding: '10px 14px',
                            color:
                              turn.role === 'player'
                                ? 'hsl(var(--text-main))'
                                : 'hsl(var(--text-muted))',
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
                            </>
                          ) : (
                            turn.text
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
                                  aria-label="Copy answer to clipboard"
                                  onClick={() => copyToClipboard(turn.id, turn.text)}
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
                                  onClick={() => handleFeedback(turn.id, 1)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color:
                                      feedbackMap[turn.id] === 1
                                        ? '#10b981'
                                        : 'hsl(var(--text-muted))',
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
                                  onClick={() => handleFeedback(turn.id, -1)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color:
                                      feedbackMap[turn.id] === -1
                                        ? '#ef4444'
                                        : 'hsl(var(--text-muted))',
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

                  {isSending && (!turns.length || turns[turns.length - 1]?.role === 'player' || !turns[turns.length - 1]?.text) && (
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

                {/* Quick-Chips bar (in standard mode) */}
                {!isExpanded && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      padding: '8px 12px',
                      overflowX: 'auto',
                      borderTop: '1px solid hsla(var(--primary), 0.1)',
                      background: 'hsla(var(--primary), 0.02)',
                    }}
                  >
                    {QUICK_CHIPS.map((chip) => {
                      const IconComponent = chip.icon;
                      return (
                        <motion.button
                          key={chip.label}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => void sendQuestion(chip.query)}
                          disabled={isSending}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            padding: '5px 9px',
                            borderRadius: '8px',
                            background: 'hsla(var(--bg-color), 0.7)',
                            border: '1px solid hsla(var(--primary), 0.22)',
                            color: 'hsl(var(--text-main))',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: isSending ? 'not-allowed' : 'pointer',
                            opacity: isSending ? 0.6 : 1,
                          }}
                        >
                          <IconComponent size={12} color="hsl(var(--primary))" />
                          <span>{chip.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Input Form */}
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
                    placeholder="Frage zu Regeln, VIP, Limits oder Navigation…"
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
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
