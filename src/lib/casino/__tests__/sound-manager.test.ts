// @vitest-environment jsdom
//
// New in the audio-engine plan (T_FRONTEND/Planungsdateien/02_audio_engine_plan.md, L1d) — this
// file did not exist before, even though docs/frontend/06_audio_sound_design.md §6/§9 referenced
// it (documentation drift, finding C in the plan). Covers the three L1 additions: playbackRate
// variance in play(), the playPositional() Web Audio panning chain, and the playWinTier()
// medium/big escalation layer.
//
// soundManager is a module-level singleton (`export const soundManager = SoundManager.getInstance()`),
// so each test resets modules and re-imports it fresh — otherwise the lazily-created AudioContext
// and per-key <audio> elements would leak state across tests (only the first test to touch a given
// key would ever see a "new" instance).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { soundManager as SoundManagerModule } from '../sound-manager';

class FakeAudioParam {
  value = 0;
  setValueAtTime = vi.fn();
  exponentialRampToValueAtTime = vi.fn();
}

class FakeOscillatorNode {
  type: OscillatorType = 'sine';
  frequency = new FakeAudioParam();
  connect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class FakeGainNode {
  gain = new FakeAudioParam();
  connect = vi.fn();
}

class FakeStereoPannerNode {
  pan = new FakeAudioParam();
  connect = vi.fn(() => this);
}

class FakeMediaElementSourceNode {
  connect = vi.fn(() => new FakeStereoPannerNode());
}

const audioContextInstances: FakeAudioContext[] = [];

class FakeAudioContext {
  state: 'running' | 'suspended' = 'running';
  currentTime = 0;
  destination = {};
  resume = vi.fn(() => Promise.resolve());
  createOscillator = vi.fn(() => new FakeOscillatorNode());
  createGain = vi.fn(() => new FakeGainNode());
  createStereoPanner = vi.fn(() => new FakeStereoPannerNode());
  createMediaElementSource = vi.fn(() => new FakeMediaElementSourceNode());

  constructor() {
    audioContextInstances.push(this);
  }
}

const audioInstances: FakeAudioElement[] = [];

class FakeAudioElement {
  currentTime = 0;
  playbackRate = 1;
  volume = 1;
  preload = 'none';
  src: string;
  play = vi.fn(() => Promise.resolve());

  constructor(src: string) {
    this.src = src;
    audioInstances.push(this);
  }
}

function latestAudioContext(): FakeAudioContext {
  const ctx = audioContextInstances[audioContextInstances.length - 1];
  if (!ctx) throw new Error('Expected an AudioContext to have been constructed');
  return ctx;
}

function audioFor(keyFragment: string): FakeAudioElement | undefined {
  return audioInstances.find((a) => a.src.includes(keyFragment));
}

let soundManager: typeof SoundManagerModule;

beforeEach(async () => {
  vi.resetModules();
  audioContextInstances.length = 0;
  audioInstances.length = 0;
  vi.stubGlobal('Audio', FakeAudioElement);
  vi.stubGlobal('AudioContext', FakeAudioContext);

  ({ soundManager } = await import('../sound-manager'));
  soundManager.toggle(true);
  soundManager.setVolume(0.5);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('play() — playback-rate variance (finding B1)', () => {
  it('applies a playbackRate within +/-3% of 1 on every call', () => {
    for (let i = 0; i < 20; i++) {
      soundManager.play('chip');
    }
    const audio = audioFor('chip');
    expect(audio).toBeDefined();
    expect(audio!.playbackRate).toBeGreaterThanOrEqual(0.97);
    expect(audio!.playbackRate).toBeLessThanOrEqual(1.03);
    expect(audio!.play).toHaveBeenCalledTimes(20);
  });

  it('never constructs the audio element when sound is disabled', () => {
    soundManager.toggle(false);
    soundManager.play('notification');
    expect(audioFor('win')).toBeUndefined();
  });
});

describe('playPositional() — StereoPannerNode routing (L1a)', () => {
  it('creates a media element source + panner chain and clamps pan to [-1, 1]', () => {
    soundManager.playPositional('slots-win', 5);

    const ctx = latestAudioContext();
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1);
    expect(ctx.createStereoPanner).toHaveBeenCalledTimes(1);
    const panner = ctx.createStereoPanner.mock.results[0]?.value as FakeStereoPannerNode;
    expect(panner.pan.value).toBe(1);
  });

  it('reuses the same panner chain on a second call for the same key (no InvalidStateError)', () => {
    soundManager.playPositional('roulette-win', -0.5);
    soundManager.playPositional('roulette-win', 0.5);

    const ctx = latestAudioContext();
    // createMediaElementSource must only ever be called once per key — a second call on the
    // same <audio> element throws InvalidStateError per the MDN spec (plan Abschnitt 0.D).
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(1);
    const audio = audioFor('roulette-win');
    expect(audio!.play).toHaveBeenCalledTimes(2);
  });

  it('builds separate panner chains for different keys', () => {
    soundManager.playPositional('chip', -0.7);
    soundManager.playPositional('crash-launch', 0.7);

    const ctx = latestAudioContext();
    expect(ctx.createMediaElementSource).toHaveBeenCalledTimes(2);
  });

  it('does not construct the audio element when sound is disabled', () => {
    soundManager.toggle(false);
    soundManager.playPositional('crash-launch', 0);
    expect(audioFor('crash-launch')).toBeUndefined();
  });
});

describe('playWinTier() — multiplier-scaled escalation (L1c)', () => {
  it('plays only the base sample below the medium threshold', () => {
    soundManager.playWinTier('dice-win', 2);

    const audio = audioFor('dice-win');
    expect(audio!.play).toHaveBeenCalledTimes(1);
    expect(audioContextInstances.length).toBe(0);
  });

  it('layers one synthesized sweep voice at the medium tier (5x-19.99x)', () => {
    soundManager.playWinTier('slots-win', 7);

    const ctx = latestAudioContext();
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('layers two synthesized sweep voices at the big tier (>=20x)', () => {
    soundManager.playWinTier('crash-win', 25);

    const ctx = latestAudioContext();
    expect(ctx.createOscillator).toHaveBeenCalledTimes(2);
  });

  it('never plays the escalation layer when sound is disabled', () => {
    soundManager.toggle(false);
    soundManager.playWinTier('crash-win', 25);

    expect(audioContextInstances.length).toBe(0);
    expect(audioFor('crash-win')).toBeUndefined();
  });
});
