// @vitest-environment jsdom
//
// New in the audio-engine plan (T_FRONTEND/Planungsdateien/02_audio_engine_plan.md, L2) — verifies
// SlotReel calls soundManager.playPositional('chip', pan) with the pan prop it was given once the
// reel-stop animation completes, instead of the old unpanned soundManager.play('chip').
//
// framer-motion is mocked so the animation-completion promise chain resolves on the next
// microtask instead of depending on real animation timing in jsdom.
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CSSProperties, ReactNode } from 'react';
import { SlotReel } from '../SlotReel';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: {
    playPositional: vi.fn(),
    play: vi.fn(),
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      style,
      className,
    }: {
      children?: ReactNode;
      style?: CSSProperties;
      className?: string;
    }) => (
      <div style={style} className={className}>
        {children}
      </div>
    ),
  },
  useAnimationControls: () => ({
    set: vi.fn(),
    start: vi.fn(() => Promise.resolve()),
  }),
}));

import { soundManager } from '@/lib/casino/sound-manager';

async function flushAnimationChain() {
  // SlotReel's stop sequence is 3 chained controls.start().then() calls — flush enough
  // microtask turns for all of them to resolve.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('SlotReel — spatial reel-stop audio (L2)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('plays the chip sound positionally at the given pan when the reel stops', async () => {
    render(
      <SlotReel
        finalSymbols={['zeus', 'crown', 'chalice']}
        isSpinning={true}
        stopDelay={0}
        winningRows={[false, false, false]}
        symbolPool={['zeus', 'crown', 'chalice']}
        pan={-0.7}
      />,
    );

    await flushAnimationChain();

    expect(soundManager.playPositional).toHaveBeenCalledWith('chip', -0.7);
    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it('defaults pan to 0 (center) when no pan prop is given', async () => {
    render(
      <SlotReel
        finalSymbols={['zeus', 'crown', 'chalice']}
        isSpinning={true}
        stopDelay={0}
        winningRows={[false, false, false]}
        symbolPool={['zeus', 'crown', 'chalice']}
      />,
    );

    await flushAnimationChain();

    expect(soundManager.playPositional).toHaveBeenCalledWith('chip', 0);
  });
});
