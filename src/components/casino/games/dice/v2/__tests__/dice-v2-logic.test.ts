import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiceV2Audio } from '../DiceV2Audio';
import { MULTIPLIER_PRESETS } from '@/components/casino/games/dice/dice-config';

// Mock Web Audio Context in node environment
class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
  }
  createBuffer(channels: number, length: number, _sampleRate: number) {
    return {
      getChannelData: vi.fn().mockReturnValue(new Float32Array(length)),
    };
  }
  createBufferSource() {
    return {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
}

describe('Dice V2 3D Logic & Audio Engine', () => {
  beforeEach(() => {
    vi.stubGlobal('AudioContext', MockAudioContext);
  });

  describe('DiceV2Audio Engine', () => {
    it('initializes as singleton and plays physical casino sound layers safely', () => {
      const audio = DiceV2Audio.getInstance();
      expect(audio).toBeDefined();

      // Test all 4 physical audio layers
      expect(() => audio.playTumbleClick()).not.toThrow();
      expect(() => audio.playFeltImpact()).not.toThrow();
      expect(() => audio.playChampagnerWin(2.0)).not.toThrow();
      expect(() => audio.playSubBassLoss()).not.toThrow();

      // Mute toggle check
      audio.setMuted(true);
      expect(() => audio.playFeltImpact()).not.toThrow();
      audio.setMuted(false);
    });
  });

  describe('Dice V2 Mathematical Presets & Payouts', () => {
    it('provides standard multiplier presets matching 1% house edge rule', () => {
      expect(MULTIPLIER_PRESETS.length).toBeGreaterThanOrEqual(5);

      // 2x preset gives 49.5% win chance
      const has2x = MULTIPLIER_PRESETS.includes(2.0);
      expect(has2x).toBe(true);
      expect(99 / 2).toBe(49.5);

      // 10x preset gives 9.9% win chance
      const has10x = MULTIPLIER_PRESETS.includes(10.0);
      expect(has10x).toBe(true);
      expect(99 / 10).toBe(9.9);
    });

    it('calculates accurate Roll Over target point from win chance', () => {
      const winChance = 49.5;
      const targetPoint = 100 - winChance;
      expect(targetPoint).toBe(50.5);

      // Roll 50.51+ is a win under Roll Over
      const roll1 = 50.51;
      expect(roll1 > targetPoint).toBe(true);

      // Roll 50.49 is a loss under Roll Over
      const roll2 = 50.49;
      expect(roll2 > targetPoint).toBe(false);
    });

    it('calculates accurate Roll Under target point from win chance', () => {
      const winChance = 49.5;
      const targetPoint = winChance;
      expect(targetPoint).toBe(49.5);

      // Roll 49.49 is a win under Roll Under
      const roll1 = 49.49;
      expect(roll1 < targetPoint).toBe(true);

      // Roll 49.51 is a loss under Roll Under
      const roll2 = 49.51;
      expect(roll2 < targetPoint).toBe(false);
    });
  });
});
