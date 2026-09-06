'use client';

import { useState } from 'react';
import { PERSONA_META, type GuidePersona } from '@/lib/casino/chat-guide/personas';
import { HeaderInfoBar } from './parts/HeaderInfoBar';
import { ChatWindowHeader } from './parts/ChatWindowHeader';
import { GuideSidebar } from './parts/GuideSidebar';
import { ConversationFeed } from './parts/ConversationFeed';
import { ChatInputCapsule } from './parts/ChatInputCapsule';
import { SAMPLE_CONVERSATION } from './parts/sample-conversation';

export default function GuideSandboxClient() {
  const [activePersona, setActivePersona] = useState<GuidePersona>('math_strategist');
  const [draft, setDraft] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 1 | -1>>({});

  const activeMeta = PERSONA_META[activePersona];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B0E14',
        color: '#E2E8F0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px 20px 48px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* ── Ambient Mesh Light Orbs (Nur warme Gold-Töne, kein Blau) ── */}
      <div
        style={{
          position: 'fixed',
          top: '12%',
          left: '22%',
          width: '520px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.14) 0%, transparent 65%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '28%',
          right: '18%',
          width: '460px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180, 140, 30, 0.10) 0%, transparent 65%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '8%',
          left: '32%',
          width: '560px',
          height: '360px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <HeaderInfoBar
        onReset={() => {
          setActivePersona('math_strategist');
          setDraft('');
        }}
      />

      {/* Main Showcase Window (Echtes transparentes Obsidian-Frosted-Glass) */}
      <div
        style={{
          maxWidth: '1080px',
          height: '750px',
          margin: '0 auto',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          background: 'rgba(12, 16, 26, 0.68)',
          backdropFilter: 'blur(36px) saturate(190%)',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 35px rgba(212, 175, 55, 0.08), inset 0 1px 1.5px rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <ChatWindowHeader
          activePersona={activePersona}
          onSelectPersona={setActivePersona}
          isExpanded={isExpanded}
          onToggleExpanded={() => setIsExpanded(!isExpanded)}
        />

        {/* Content Body: Sidebar + Chat Area */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <GuideSidebar onPickTopic={setDraft} />

          {/* Chat Messages Area with Tactical Slate Glassmorphism */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minWidth: 0,
              background: 'rgba(10, 13, 20, 0.6)',
            }}
          >
            <ConversationFeed
              conversation={SAMPLE_CONVERSATION}
              activeMeta={activeMeta}
              copiedId={copiedId}
              feedbackMap={feedbackMap}
              onCopy={(id) => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
              }}
              onFeedback={(id, value) => setFeedbackMap((prev) => ({ ...prev, [id]: value }))}
              onSuggestion={setDraft}
            />

            <ChatInputCapsule
              draft={draft}
              personaLabel={activeMeta.label}
              onDraftChange={setDraft}
              onSubmit={() => setDraft('')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
