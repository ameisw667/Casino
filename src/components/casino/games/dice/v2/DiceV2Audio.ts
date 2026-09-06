'use client';

/**
 * DiceV2Audio: Physische Casino-Audio-Synthese (Option A)
 * 1. Kaschmir-Filz-Aufprall: Tiefpass-gefilterter Impuls mit 60Hz Sub-Körper
 * 2. Acryl-Klackern: Hochfrequente Schläge während des 900ms-Taumelns
 * 3. Champagner-Klingeln (Win): Glasklarer pentatonischer Glanz-Chime
 * 4. Sub-Bass (Loss): Abfallender, dumpfer 40Hz Bass-Puls
 */
export class DiceV2Audio {
  private static instance: DiceV2Audio | null = null;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private constructor() {}

  public static getInstance(): DiceV2Audio {
    if (!DiceV2Audio.instance) {
      DiceV2Audio.instance = new DiceV2Audio();
    }
    return DiceV2Audio.instance;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  /**
   * Trockenes Acryl-Klackern während des Rotierens
   */
  public playTumbleClick(frequency: number = 1800, gainLevel: number = 0.12) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bandpass für perkussives Holz-/Acryl-Klicken
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, now);
      filter.Q.setValueAtTime(4.0, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, now + 0.04);

      gain.gain.setValueAtTime(gainLevel, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // AudioContext policy fallback
    }
  }

  /**
   * Dumpfer, samtiger Aufprall auf Kaschmir-Filz (bei Landung)
   */
  public playFeltImpact(gainLevel: number = 0.35) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Sub-Bass Thud (Kaschmir-Körper)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(75, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.16);

      subGain.gain.setValueAtTime(gainLevel * 0.9, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.18);

      // 2. Weicher Filz-Rausch-Schlag (Perkussion)
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(150, now + 0.08);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(gainLevel * 0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.09);
    } catch {
      // AudioContext policy fallback
    }
  }

  /**
   * Heller Glas- & Champagner-Klingelton (bei Gewinn)
   */
  public playChampagnerWin(multiplier: number = 2.0) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Kaskadierende Pentatonik (C6, E6, G6, C7)
      const baseNotes = [1046.5, 1318.5, 1567.98, 2093.0];
      const noteDelay = 0.045;

      baseNotes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * noteDelay);

        const volume = Math.min(0.28, 0.15 + (multiplier > 5 ? 0.08 : 0));
        gain.gain.setValueAtTime(0, now + index * noteDelay);
        gain.gain.linearRampToValueAtTime(volume, now + index * noteDelay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * noteDelay + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * noteDelay);
        osc.stop(now + index * noteDelay + 0.48);
      });
    } catch {
      // AudioContext policy fallback
    }
  }

  /**
   * Dumpfer Sub-Bass Puls (bei Verlust)
   */
  public playSubBassLoss() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // AudioContext policy fallback
    }
  }
}

export const diceV2Audio = DiceV2Audio.getInstance();
