import React from 'react';
import { CheckCircle2, Code2, Copy, Check } from 'lucide-react';
import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';
import { ComponentSectionHeader } from './ComponentSectionHeader';

interface BetModeTabsShowcaseSectionProps {
  betMode: 'manual' | 'auto';
  onBetModeChange: (mode: 'manual' | 'auto') => void;
  isSoundMuted: boolean;
  copiedSection: string | null;
  onCopyCode: (code: string, sectionId: string) => void;
}

export function BetModeTabsShowcaseSection({
  betMode,
  onBetModeChange,
  isSoundMuted,
  copiedSection,
  onCopyCode,
}: BetModeTabsShowcaseSectionProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <ComponentSectionHeader
        kicker="Initiative 7.1 · Bestätigter Standard"
        title="<BetModeTabs /> — Standard Mode Switcher"
        kickerColor="#34d399"
        badge="✅ Gewinner: Variante A2 (Muted Champagne Gold)"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        <div
          style={{
            background: '#0b0f18',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#e5c158',
                fontFamily: 'var(--font-mono)',
              }}
            >
              LIVE INTERAKTIVES ELEMENT
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Sound: Enabled
            </span>
          </div>

          <div
            style={{
              padding: '20px',
              background: '#06080e',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <BetModeTabs
              mode={betMode}
              onModeChange={(m) => onBetModeChange(m)}
              soundEnabled={!isSoundMuted}
            />
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: '#94a3b8',
            }}
          >
            Aktiver Modus State:{' '}
            <strong style={{ color: '#e5c158', textTransform: 'uppercase' }}>{betMode}</strong>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              color: '#cbd5e1',
              lineHeight: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ fontWeight: 800, color: '#34d399' }}>Spezifikation & Eigenschaften:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
              <span>Messerscharfe 1px Randfassung (`rgba(212, 175, 55, 0.2)`)</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
              <span>Framer Motion 12 Spring-Physics (`stiffness: 500, damping: 32`)</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#34d399', flexShrink: 0 }} />
              <span>
                Acoustic Klick Feedback via &apos;soundManager.play(&apos;click&apos;)&apos;
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#0b0f18',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#94a3b8',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Code2 size={16} /> Import & Code Usage
            </span>
            <button
              onClick={() =>
                onCopyCode(
                  `import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';\n\n<BetModeTabs mode={mode} onModeChange={(m) => setMode(m)} />`,
                  '7.1',
                )
              }
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: '#121826',
                color: '#e5c158',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {copiedSection === '7.1' ? <Check size={12} /> : <Copy size={12} />}
              {copiedSection === '7.1' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div
            style={{
              background: '#07090e',
              padding: '16px',
              borderRadius: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#e2e8f0',
              overflowX: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              <code>{`import { BetModeTabs } from '@/components/casino/controls/BetModeTabs';

// Usage inside game control panel:
const [mode, setMode] = useState<'manual' | 'auto'>('manual');

<BetModeTabs 
  mode={mode} 
  onModeChange={(nextMode) => setMode(nextMode)} 
/>`}</code>
            </pre>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
            Dateipfad:{' '}
            <span style={{ color: '#e5c158' }}>src/components/casino/controls/BetModeTabs.tsx</span>
          </div>
        </div>
      </div>
    </section>
  );
}
