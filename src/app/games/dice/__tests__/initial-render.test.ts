import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dicePage = readFileSync(resolve(process.cwd(), 'src/app/games/dice/page.tsx'), 'utf8');
const initialStage = readFileSync(
  resolve(process.cwd(), 'src/components/casino/games/dice/v2/DiceCenterStageInitial.tsx'),
  'utf8',
);

describe('Dice initial render', () => {
  it('does not withhold the game panel behind a post-hydration mounted gate', () => {
    expect(dicePage).not.toContain('if (!mounted) return null;');
    expect(dicePage).not.toContain('const [mounted, setMounted] = useState(false);');
  });
});

it('loads the dice backdrop as an optimized CSS asset', () => {
  expect(dicePage).toContain('DiceCenterStageV2');
  const stage = readFileSync(
    resolve(process.cwd(), 'src/components/casino/games/dice/v2/DiceCenterStageV2.tsx'),
    'utf8',
  );
  expect(stage).toContain('dice-v2-main');
  const globalStyles = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');
  expect(globalStyles).toContain('2026-09-04_backdrop-dice-quantum-felt-mobile_v001.webp');
  expect(globalStyles).toContain('@media (max-width: 1023px)');
});

it('defers the interactive 3D bundle until a real stage interaction', () => {
  expect(dicePage).toContain("import dynamic from 'next/dynamic';");
  expect(dicePage).toContain('DiceCenterStageInitial');
  expect(dicePage).toContain('shouldLoadInteractiveStage');
  expect(dicePage).not.toContain('requestIdleCallback');
  expect(dicePage).not.toContain(
    "import { DiceCenterStageV2 } from '@/components/casino/games/dice/v2/DiceCenterStageV2';",
  );
  expect(initialStage).toContain('dice-v2-main game-area dice-v2-initial');
  expect(initialStage).toContain('onPointerDown={onRequestInteractive}');
  expect(initialStage).toContain(
    "const MOBILE_DICE_FELT_SRC = '/images/2026-09-04_backdrop-dice-quantum-felt-mobile_v001.webp';",
  );
  expect(initialStage).toContain('preload(MOBILE_DICE_FELT_SRC, {');
  expect(initialStage).toContain("media: '(max-width: 1023px)'");
  expect(initialStage).not.toContain('Dice3DPolyhedron');
  expect(initialStage).not.toContain('DiceSpotlightCanvas');
  expect(initialStage).not.toContain('diceV2Audio');
});
