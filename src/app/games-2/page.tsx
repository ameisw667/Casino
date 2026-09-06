'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCasinoStore } from '@/store/useCasinoStore';
import type { GameId } from '@/app/games/_components/config';
import { LiveWinRibbon } from '@/app/games/_components/LiveWinRibbon';
import {
  GAMES,
  CATEGORIES,
  type GameMeta,
  type CategoryType,
} from '@/app/games/_components/config';
import { useIsMobile } from './_components/useIsMobile';
import { MotionLabTopbar } from './_components/MotionLabTopbar';
import { MotionHero } from './_components/MotionHero';
import { HeroSpotlight } from './_components/HeroSpotlight';
import { CategoryMarquee } from './_components/CategoryMarquee';
import { ParallaxOrbs } from './_components/ParallaxOrbs';
import { MotionFilterTabs } from './_components/MotionFilterTabs';
import { BentoTile } from './_components/BentoTile';
import { QuickViewLayer } from './_components/QuickViewPanel';

// V4 — „Living Hero": Crash verlässt das Grid und lebt als pulsierendes
// Spotlight im Hero (F), die Headline zieht Wörter magnetisch zum Cursor (B),
// ein Marquee-Band zeigt die Motion-Unterkategorien im Endloslauf (D).
// Die 100-dvh-Komposition aus V3 bleibt: kein Scroll auf Desktop.
export default function GamesTwoPage() {
  const { bets } = useCasinoStore();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
  const [flashId, setFlashId] = useState<GameId | null>(null);
  const [quickViewId, setQuickViewId] = useState<GameId | null>(null);

  const gamesList = useMemo<GameMeta[]>(() => {
    return GAMES.map((game) => {
      if (game.id === 'crash') {
        return { ...game, preview: '/images/games/hero-crash-quantum-gold.png' };
      }
      if (game.id === 'dice') {
        return { ...game, preview: '/images/games/hero-dice-quantum-gold.png' };
      }
      return game;
    });
  }, []);

  const crashGame = gamesList.find((game): game is GameMeta => game.id === 'crash');

  // Crash lebt im Hero-Spotlight — das Bento zeigt nur die 5 Rest-Titel
  // (2 Zeilen: [0][1] je 3 Spalten, [2][3][4] je 2 Spalten).
  const gridGames = useMemo(() => {
    const withoutSpotlight = gamesList.filter((game) => game.id !== 'crash');
    if (selectedCategory === 'ALL') return withoutSpotlight;
    return withoutSpotlight.filter((game) =>
      game.tags.includes(selectedCategory as GameMeta['tags'][number]),
    );
  }, [selectedCategory, gamesList]);

  // Tasten 1–5: Gold-Flash auf der Kachel, danach öffnet sich der Quick-View —
  // die eigentliche Navigation übernimmt bewusst erst die CTA im Panel.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return;
      if (event.key === 'Escape') {
        setQuickViewId(null);
        return;
      }
      const index = Number(event.key) - 1;
      if (index >= 0 && index < gridGames.length) {
        const game = gridGames[index];
        setFlashId(game.id);
        window.setTimeout(
          () => setFlashId((current) => (current === game.id ? null : current)),
          650,
        );
        if (!quickViewId) setQuickViewId(game.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gridGames, quickViewId]);

  const quickViewGame = useMemo(
    () => gamesList.find((game) => game.id === quickViewId) ?? null,
    [quickViewId, gamesList],
  );

  const gridTemplateColumns = isMobile ? 'repeat(1, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))';
  const gridTemplateRows = isMobile ? 'none' : 'repeat(2, minmax(0, 1fr))';

  const getTileSpans = (position: number): React.CSSProperties => {
    if (isMobile) return {};
    if (position <= 1) return { gridColumn: 'span 3' };
    return { gridColumn: 'span 2' };
  };

  const spotlight = crashGame ? (
    isMobile ? (
      <div style={{ flexShrink: 0, minHeight: '240px' }}>
        <HeroSpotlight game={crashGame} onOpen={() => setQuickViewId('crash')} />
      </div>
    ) : (
      <div style={{ flexShrink: 0, width: '340px', alignSelf: 'stretch' }}>
        <HeroSpotlight game={crashGame} onOpen={() => setQuickViewId('crash')} />
      </div>
    )
  ) : null;

  return (
    <div
      style={{
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        height: isMobile ? undefined : '100dvh',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        // Kein shorthand `overflow`: mixing overflow + overflowX löst eine
        // React-Warnung über konfligierende shorthand/non-shorthand-Styles aus.
        overflowX: 'hidden',
        overflowY: isMobile ? undefined : 'hidden',
        background:
          'radial-gradient(1200px 600px at 80% -10%, rgba(212, 175, 55, 0.06), transparent 60%), #0B0E14',
        position: 'relative',
      }}
    >
      <ParallaxOrbs />

      <MotionLabTopbar category={selectedCategory} titleCount={gridGames.length} />

      <div
        style={{
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          padding: isMobile ? '16px 16px 24px' : '18px 32px 24px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          gap: '14px',
        }}
      >
        {/* Hero-Row: links B-Headline + Stats, rechts F-Spotlight */}
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: isMobile ? '16px' : '32px',
            flexDirection: isMobile ? 'column' : 'row',
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <MotionHero rounds={bets.length} gamesCount={gamesList.length} />
          </div>
          {spotlight}
        </div>

        <div style={{ flexShrink: 0 }}>
          <CategoryMarquee />
        </div>

        <div style={{ flexShrink: 0 }}>
          <LiveWinRibbon />
        </div>

        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <MotionFilterTabs
            categories={CATEGORIES}
            selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category);
              setQuickViewId(null);
            }}
          />
        </div>

        <motion.div
          layout={!prefersReducedMotion}
          style={{
            display: 'grid',
            gridTemplateColumns,
            gridTemplateRows,
            gap: isMobile ? '14px' : '16px',
            alignItems: 'stretch',
            flex: 1,
            minHeight: 0,
          }}
        >
          <AnimatePresence mode="popLayout">
            {gridGames.map((game, index) => (
              <div key={game.id} style={{ display: 'flex', minHeight: 0, ...getTileSpans(index) }}>
                <BentoTile
                  game={game}
                  index={index}
                  isFeatured={index === 0 && selectedCategory === 'ALL'}
                  isMobile={isMobile}
                  isFlashing={flashId === game.id}
                  onOpen={() => setQuickViewId(game.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <QuickViewLayer game={quickViewGame} onClose={() => setQuickViewId(null)} />
    </div>
  );
}
