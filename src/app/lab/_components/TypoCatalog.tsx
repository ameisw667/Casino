'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MIN_STAKE, type GameId, type GameMeta } from '@/app/games/_components/config';
import { springs } from '@/lib/design/motion-tokens';
import { instrumentSerif, geistMono } from '../fonts';
import { TEXT_FAINT, TEXT_MAIN, TEXT_DIM } from '../_lib/labStyles';

export interface CatalogRow {
  game: GameMeta;
  maskKey: string;
  maskText: string;
}

interface TypoCatalogProps {
  rows: CatalogRow[];
  onFocusRow: (row: CatalogRow) => void;
  onLeaveRow: (row: CatalogRow) => void;
}

const ROW_SIZES: Record<GameId, string> = {
  crash: 'clamp(3.4rem, 9vw, 8.5rem)',
  'crash-multiplayer': 'clamp(1.6rem, 3vw, 2.8rem)',
  dice: 'clamp(2.4rem, 5.5vw, 5rem)',
  roulette: 'clamp(2.2rem, 5vw, 4.6rem)',
  slots: 'clamp(2.8rem, 6.5vw, 6rem)',
  blackjack: 'clamp(1.9rem, 4vw, 3.4rem)',
};

const ROW_OFFSETS: Record<GameId, string> = {
  crash: '0',
  'crash-multiplayer': '18%',
  dice: '6%',
  roulette: '24%',
  slots: '2%',
  blackjack: '12%',
};

const linkStyle: React.CSSProperties = {
  display: 'block',
  color: TEXT_MAIN,
  textTransform: 'uppercase',
  lineHeight: 0.95,
  letterSpacing: '-0.01em',
  transition: 'color 200ms ease',
};

const metaStyle: React.CSSProperties = {
  marginTop: '10px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '24px',
  fontFamily: geistMono.style.fontFamily,
  fontSize: '10px',
  letterSpacing: '0.28em',
  color: TEXT_FAINT,
};

export function TypoCatalog({ rows, onFocusRow, onLeaveRow }: TypoCatalogProps) {
  const reduced = useReducedMotion() ?? false;
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '160svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 24px',
        maxWidth: '1240px',
      }}
    >
      <p
        style={{
          fontFamily: geistMono.style.fontFamily,
          fontSize: '11px',
          letterSpacing: '0.42em',
          color: TEXT_DIM,
        }}
      >
        PULS · 03 — KATALOG
      </p>
      <ul
        style={{
          marginTop: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          listStyle: 'none',
          padding: 0,
        }}
      >
        {rows.map((row, i) => (
          <motion.li
            key={row.game.id}
            initial={reduced ? undefined : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: '-12% 0px' }}
            transition={{ ...springs.gentle, delay: 0.04 * i }}
          >
            <a
              href={row.game.path}
              onFocus={() => onFocusRow(row)}
              onBlur={() => onLeaveRow(row)}
              onMouseEnter={() => onFocusRow(row)}
              onMouseLeave={() => onLeaveRow(row)}
              style={{
                ...linkStyle,
                fontFamily: instrumentSerif.style.fontFamily,
                fontSize: ROW_SIZES[row.game.id],
                paddingLeft: ROW_OFFSETS[row.game.id],
              }}
              className="lab-catalog-link"
            >
              <span style={{ display: 'block' }}>{row.game.name}</span>
              <span style={metaStyle}>
                <span>{row.game.category}</span>
                <span>{row.game.rating} ★</span>
                <span>AB {MIN_STAKE}</span>
                <span className="lab-catalog-cta">SPIELEN →</span>
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
      <p
        style={{
          paddingTop: '10svh',
          fontFamily: geistMono.style.fontFamily,
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: '#585645',
        }}
      >
        SANDBOX · PARTIKEL-MASKEN · KEINE ECHTEN EINSÄTZE
      </p>
    </section>
  );
}

export default TypoCatalog;
