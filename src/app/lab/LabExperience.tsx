'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useScroll, useVelocity, useMotionValueEvent } from 'framer-motion';
import { GAMES, type GameMeta } from '@/app/games/_components/config';
import { resolveCanvasMode, hasWebGLSupportInEnvironment } from './_lib/canvasMode';
import type { CanvasMode } from './_lib/canvasMode';
import { buildCrashCurve, buildGroundLine } from './_lib/shapeTargets';
import { sampleTextTarget } from './_lib/shapeTargetsCanvas';
import { mulberry32 } from './_lib/seededRandom';
import { bricolageGrotesque } from './fonts';
import { useWagerRound } from './_components/useWagerRound';
import { useParticleProfile } from './_components/useParticleProfile';
import type { FieldHandle } from './_components/CrashField';
import type { CatalogRow } from './_components/TypoCatalog';
import TypoHero from './_components/TypoLayer';
import CrashStory from './_components/CrashStory';
import TypoCatalog from './_components/TypoCatalog';
import StillnessSection from './_components/StillnessSection';
import Preloader from './_components/Preloader';
import MagneticLink from './_components/MagneticLink';
import { LAB_BG } from './_lib/labStyles';

const ParticleStage = dynamic(() => import('./_components/ParticleStage'), { ssr: false });

const MASK_SPAWN_SEED = 9001;
const VELOCITY_FULL_SCALE_PXS = 2600;

const MASK_TEXT_BY_ID: Record<string, string> = {
  'crash-multiplayer': '×2',
  dice: 'D6',
  roulette: '00',
  slots: 'BAR',
  blackjack: '21',
};

export default function LabExperience() {
  const [canvasMode, setCanvasMode] = useState<CanvasMode | null>(null);
  const [canvasPrimed, setCanvasPrimed] = useState(false);
  const [textMasksReady, setTextMasksReady] = useState(false);
  const fieldRef = useRef<FieldHandle | null>(null);
  const profile = useParticleProfile();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  useMotionValueEvent(scrollVelocity, 'change', (value) => {
    fieldRef.current?.setPointerStrength(Math.min(1, Math.abs(value) / VELOCITY_FULL_SCALE_PXS));
  });

  const wager = useWagerRound(fieldRef);

  // Canvas-Modus läuft bewusst nach dem Mount (SSR-Safe): WebGL-/Media-Checks
  // existieren nur im Browser, das initiale null hält SSR und Hydration konsistent.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanvasMode(
      resolveCanvasMode(
        hasWebGLSupportInEnvironment(() =>
          typeof document === 'undefined' ? null : document.createElement('canvas'),
        ),
        window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      ),
    );
  }, []);

  useEffect(() => {
    if (canvasMode !== 'live') return;
    document.fonts.ready.then(() => setTextMasksReady(true));
  }, [canvasMode]);

  useEffect(() => {
    document.documentElement.style.overscrollBehaviorY = 'none';
    return () => {
      document.documentElement.style.overscrollBehaviorY = '';
    };
  }, []);

  const rows = useMemo<CatalogRow[]>(
    () =>
      GAMES.map((game: GameMeta) => ({
        game,
        maskKey: game.id === 'crash' ? 'curve' : `mask-${game.id}`,
        maskText: game.id === 'crash' ? '' : (MASK_TEXT_BY_ID[game.id] ?? ''),
      })),
    [],
  );

  useEffect(() => {
    if (!textMasksReady || !profile) return;
    const rand = mulberry32(MASK_SPAWN_SEED);
    fieldRef.current?.setTargetData('curve', buildCrashCurve(profile.count, rand));
    fieldRef.current?.setTargetData('ground', buildGroundLine(profile.count, rand));
    rows.forEach((row) => {
      if (row.maskKey === 'curve') return;
      const positions = sampleTextTarget(
        row.maskText,
        bricolageGrotesque.style.fontFamily,
        profile.count,
        rand,
      );
      if (positions) fieldRef.current?.setTargetData(row.maskKey, positions);
    });
  }, [textMasksReady, profile, rows]);

  const onFocusRow = useCallback((row: CatalogRow) => {
    fieldRef.current?.driftTo(row.maskKey);
  }, []);

  const onLeaveRow = useCallback(() => {
    fieldRef.current?.driftTo('curve');
  }, []);

  const onEnterStillness = useCallback(() => fieldRef.current?.driftTo('ground'), []);
  const onLeaveStillness = useCallback(() => fieldRef.current?.driftTo('curve'), []);

  const isLive = canvasMode === 'live';
  const isPrimed = !isLive ? true : canvasPrimed;

  return (
    <div
      style={{ position: 'relative', minHeight: '100svh', background: LAB_BG, color: '#F4EFE0' }}
    >
      <Preloader primed={isPrimed} onDone={() => undefined} />
      {isLive ? (
        <ParticleStage
          mode={canvasMode ?? 'live'}
          onModeChange={setCanvasMode}
          fieldRef={fieldRef}
          onPrimed={() => setCanvasPrimed(true)}
        />
      ) : null}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <TypoHero />
        <CrashStory
          multiplier={wager.multiplier}
          phase={wager.phase}
          session={wager.session}
          onHold={wager.hold}
          onRelease={wager.release}
        />
        <TypoCatalog rows={rows} onFocusRow={onFocusRow} onLeaveRow={onLeaveRow} />
        <StillnessSection
          session={wager.session}
          onEnter={onEnterStillness}
          onLeave={onLeaveStillness}
        />
        <footer
          style={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            maxWidth: '1240px',
            justifyContent: 'space-between',
            padding: '0 24px 40px',
          }}
        >
          <MagneticLink href="/">← ZURÜCK ZUR LOBBY</MagneticLink>
          <span style={{ fontSize: '11px', letterSpacing: '0.3em', color: '#6D6A58' }}>
            PULS · SANDBOX
          </span>
        </footer>
      </main>
    </div>
  );
}
