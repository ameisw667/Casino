'use client';

import { motion } from 'framer-motion';
import { staggerVariants } from '@/lib/design/motion-tokens';
import { KineticHeadline } from './KineticHeadline';
import { RollUpNumber } from './RollUpNumber';

// ──── Hero V4 (B — KineticHeadline · kompakter Stats-Strip) ────
// Der Titel lebt: Per-Wort-Magnet-Anziehung auf Pointer-Nähe, rein über
// Motion Values/Springs (kein Re-Render pro Frame). Stats kompakt in einer
// Zeile unter der Subline, damit rechts Platz für das Hero-Spotlight bleibt.
export function MotionHero({ rounds, gamesCount }: { rounds: number; gamesCount: number }) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerVariants.container}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <motion.div variants={staggerVariants.item}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.58rem',
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#D4AF37',
          }}
        >
          <span
            aria-hidden
            style={{
              width: '24px',
              height: '1px',
              background: 'rgba(212, 175, 55, 0.6)',
              display: 'inline-block',
            }}
          />
          Motion.dev Unterkategorien, live
        </span>
      </motion.div>

      <motion.div variants={staggerVariants.item} style={{ minWidth: 0 }}>
        <KineticHeadline
          line1="Der Katalog als"
          line2="Motion-Übungsfeld"
          style={{ fontSize: 'clamp(2rem, 4.2vw, 3.4rem)' }}
        />
      </motion.div>

      <motion.div
        variants={staggerVariants.item}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            maxWidth: '520px',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Sechs Originals, ein Full-Viewport-Bento, eine Shared-Element-Verbindung — alles above the
          fold.
        </p>

        <div style={{ display: 'flex', gap: '22px', alignItems: 'center', flexShrink: 0 }}>
          <HeroStat label="Originals" value={String(gamesCount)} />
          <HeroStat label="Deine Runden" rollupValue={rounds} highlight />
          <HeroStat label="Unterkategorien" value="10" />
          <HeroStat label="Min Stake" value="$0.10" />
        </div>
      </motion.div>
    </motion.section>
  );
}

function HeroStat({
  label,
  value,
  rollupValue,
  highlight = false,
}: {
  label: string;
  value?: string;
  rollupValue?: number;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span
        style={{
          fontSize: '0.54rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.35)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '1.05rem',
          fontWeight: 950,
          color: highlight ? '#D4AF37' : '#ffffff',
          fontFamily: 'var(--font-mono), monospace',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {rollupValue !== undefined ? <RollUpNumber value={rollupValue} /> : value}
      </span>
    </div>
  );
}
