'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Gamepad2,
  History,
  Trophy,
  Target,
  BarChart3,
  Settings,
  Sparkles,
  ShieldCheck,
  X,
  Send,
} from 'lucide-react';
import { modalVariants } from '@/lib/design/motion-tokens';

const NAV_ITEMS: { icon: ReactNode; label: string; active?: boolean }[] = [
  { icon: <Home size={16} />, label: 'Lobby', active: true },
  { icon: <Gamepad2 size={16} />, label: 'Games' },
  { icon: <History size={16} />, label: 'My Bets' },
  { icon: <Trophy size={16} />, label: 'Leaderboard' },
  { icon: <Target size={16} />, label: 'Vault' },
  { icon: <BarChart3 size={16} />, label: 'Stats' },
  { icon: <Settings size={16} />, label: 'Settings' },
];

const stageStyle: CSSProperties = {
  position: 'relative',
  display: 'flex',
  gap: '14px',
  width: '560px',
  height: '580px',
};

const sidebarChromeStyle: CSSProperties = {
  width: '240px',
  height: '100%',
  flexShrink: 0,
  borderRadius: '16px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

const contentPlaceholderStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: '100%',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.06)',
  background:
    'radial-gradient(ellipse 260px 180px at 30% 20%, hsla(45,70%,50%,0.06), transparent 65%), hsl(var(--surface-color))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
};

const panelStyle: CSSProperties = {
  position: 'absolute',
  right: '16px',
  bottom: '16px',
  width: '270px',
  height: '330px',
  borderRadius: '18px',
  background: 'rgba(11, 14, 20, 0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid hsla(45,100%,50%,0.25)',
  boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px hsla(45,85%,55%,0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  zIndex: 5,
};

function BrandHeader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #f2d571, #a9791c 70%)',
          flexShrink: 0,
          boxShadow: 'inset 0 0 0 1px hsla(45,100%,80%,0.5)',
        }}
      />
      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontWeight: 800, fontSize: '0.82rem', letterSpacing: '-0.02em' }}>
          CASINO
          <span
            style={{
              fontSize: '0.5rem',
              fontWeight: 800,
              background: '#D4AF37',
              color: '#000',
              padding: '1px 4px',
              borderRadius: '3px',
              marginLeft: '4px',
              verticalAlign: '2px',
            }}
          >
            PRO
          </span>
        </div>
        <div
          style={{
            fontSize: '0.55rem',
            fontWeight: 800,
            color: '#D4AF37',
            letterSpacing: '0.18em',
          }}
        >
          ROYALE
        </div>
      </div>
    </div>
  );
}

function NavList() {
  return (
    <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {NAV_ITEMS.map((item) => (
        <div
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: item.active ? '#D4AF37' : 'rgba(255,255,255,0.72)',
            background: item.active
              ? 'linear-gradient(90deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.03) 100%)'
              : 'transparent',
            borderLeft: item.active ? '3px solid #D4AF37' : '3px solid transparent',
          }}
        >
          {item.icon}
          {item.label}
        </div>
      ))}
    </div>
  );
}

function FooterBadge() {
  return (
    <div
      style={{
        marginTop: 'auto',
        margin: '14px 10px 16px',
        padding: '12px',
        background: 'hsla(0,0%,100%,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <ShieldCheck size={20} color="hsl(var(--success))" />
      <div>
        <div style={{ fontSize: '0.6rem', fontWeight: 800 }}>SECURE &amp; FAIR</div>
        <div style={{ fontSize: '0.52rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
          CERTIFIED
        </div>
      </div>
    </div>
  );
}

function GuideIcon({ refined }: { refined: boolean }) {
  if (!refined) {
    return <Sparkles size={15} color="#D4AF37" />;
  }
  return (
    <span
      style={{
        width: '18px',
        height: '18px',
        position: 'relative',
        flexShrink: 0,
        display: 'inline-block',
      }}
    >
      <Image
        src="/images/royale-guide-emblem.png"
        alt=""
        fill
        sizes="18px"
        style={{ objectFit: 'contain' }}
      />
    </span>
  );
}

function PanelChrome({
  onClose,
  refined,
  children,
}: {
  onClose: () => void;
  refined: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '14px 14px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <GuideIcon refined={refined} />
        <span style={{ fontSize: '0.8rem', fontWeight: 800, flex: 1 }}>Royale Guide</span>
        <button
          onClick={onClose}
          aria-label="Guide schließen"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
          }}
        >
          <X size={16} />
        </button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {children}
      </div>
      <div style={{ padding: '10px 14px 14px', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 10px',
            borderRadius: '10px',
            background: 'hsla(0,0%,100%,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-dim))', flex: 1 }}>
            Frag mich etwas…
          </span>
          <Send size={13} color="#D4AF37" />
        </div>
      </div>
    </>
  );
}

function ChatBubble({ from, text }: { from: 'guide' | 'user'; text: string }) {
  const isGuide = from === 'guide';
  return (
    <div
      style={{
        alignSelf: isGuide ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
        padding: '8px 10px',
        borderRadius: '10px',
        fontSize: '0.68rem',
        lineHeight: 1.4,
        background: isGuide ? 'hsla(0,0%,100%,0.05)' : 'hsla(45,100%,50%,0.14)',
        color: isGuide ? 'hsl(var(--text-muted))' : '#fff',
        border: isGuide ? '1px solid rgba(255,255,255,0.06)' : '1px solid hsla(45,100%,50%,0.3)',
      }}
    >
      {text}
    </div>
  );
}

// ─────────────────────────── Option B — Event-Trigger ───────────────────────────
// Zwei Instanzen derselben Architektur nebeneinander: die Baseline bleibt unangetastet,
// alle optischen Anpassungen (kein „AI"-Badge, echtes Emblem statt Sparkles-Icon)
// laufen ausschließlich in der zweiten, duplizierten Instanz.

function ColumnB({ refined }: { refined: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={stageStyle}>
      <div className="glass-sidebar" style={sidebarChromeStyle}>
        <BrandHeader />
        <div style={{ padding: '10px 10px 0' }}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              marginBottom: '2px',
              width: '100%',
              borderRadius: '8px',
              borderLeft: '3px solid #D4AF37',
              background: 'linear-gradient(90deg, hsla(45,65%,58%,0.1), transparent)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <GuideIcon refined={refined} />
            Royale Guide
            {!refined && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.52rem',
                  fontWeight: 800,
                  color: '#D4AF37',
                  border: '1px solid hsla(45,100%,50%,0.4)',
                  borderRadius: '3px',
                  padding: '1px 4px',
                  marginLeft: 'auto',
                }}
              >
                AI
              </span>
            )}
          </button>
        </div>
        <NavList />
        <FooterBadge />
      </div>

      <div style={contentPlaceholderStyle}>
        <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-dim))', fontWeight: 600 }}>
          Lobby-Inhalt
        </span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop-b"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'hsla(0,0%,0%,0.35)',
              zIndex: 4,
              borderRadius: '16px',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel-b"
            variants={modalVariants.panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={panelStyle}
          >
            <PanelChrome onClose={() => setOpen(false)} refined={refined}>
              <ChatBubble
                from="guide"
                text="Willkommen zurück! Wie kann ich dir bei deinem nächsten Spin helfen?"
              />
              <ChatBubble from="user" text="Wie funktioniert Provably Fair bei Crash?" />
            </PanelChrome>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────── Page ───────────────────────────

export default function SidebarOptionsClient() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'hsl(var(--bg-color))',
        backgroundImage:
          'radial-gradient(ellipse 900px 500px at 18% -10%, hsla(45, 70%, 50%, 0.08), transparent 60%)',
        color: '#fff',
        fontFamily: 'var(--font-inter), sans-serif',
        padding: '48px 32px 80px',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#D4AF37',
            margin: '0 0 10px',
          }}
        >
          Option B — Event-Trigger · Feinschliff
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 1.3rem + 1.2vw, 2.1rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}
        >
          Royale Guide in der Sidebar — Original vs. verfeinert
        </h1>
        <p
          style={{
            maxWidth: '62ch',
            color: 'hsl(var(--text-muted))',
            fontSize: '0.98rem',
            lineHeight: 1.6,
          }}
        >
          Optionen A und C sind raus — Option B ist entschieden. Links die unveränderte Baseline,
          rechts dieselbe Architektur mit den zwei Anpassungen: kein &bdquo;AI&ldquo;-Badge mehr,
          und ein echtes generiertes Emblem statt des Sparkles-Platzhalter-Icons.
        </p>

        <div style={{ overflowX: 'auto', paddingTop: '40px', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '22px', width: 'max-content' }}>
            <div>
              <ColumnLabel option="B" name="Original (unverändert)" />
              <ColumnB refined={false} />
              <Caption>
                Baseline — bleibt exakt so bestehen, damit der Vergleich jederzeit nachvollziehbar
                ist.
              </Caption>
            </div>
            <div>
              <ColumnLabel option="B′" name="Verfeinert" />
              <ColumnB refined />
              <Caption>
                Duplikat von B: &bdquo;AI&ldquo;-Badge entfernt, Sparkles-Icon ersetzt durch{' '}
                <code>/images/royale-guide-emblem.png</code> (Higgsfield-generiert, freigestellt).
              </Caption>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnLabel({ option, name }: { option: string; name: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: '#0a0d13',
          background: '#D4AF37',
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
        }}
      >
        {option}
      </span>
      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{name}</span>
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: '14px',
        maxWidth: '560px',
        fontSize: '0.78rem',
        lineHeight: 1.55,
        color: 'hsl(var(--text-muted))',
      }}
    >
      {children}
    </div>
  );
}
