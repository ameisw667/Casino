'use client';

export type SoundKey =
  | 'bet'
  | 'win'
  | 'loss'
  | 'click'
  | 'notification'
  | 'chip'
  | 'spin'
  | 'dice-roll'
  | 'dice-win'
  | 'dice-loss'
  | 'slots-spin'
  | 'slots-win'
  | 'slots-loss'
  | 'roulette-spin'
  | 'roulette-win'
  | 'roulette-loss'
  | 'crash-launch'
  | 'crash-win'
  | 'crash-explode'
  | 'blackjack-card'
  | 'blackjack-win'
  | 'blackjack-loss';

class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private sounds: Record<string, HTMLAudioElement> = {};
  private soundUrls: Record<SoundKey, string> = {
    bet: '/sounds/chip.mp3',
    win: '/sounds/win.mp3',
    loss: '/sounds/loss.mp3',
    click: '/sounds/chip.mp3',
    notification: '/sounds/win.mp3',
    chip: '/sounds/chip.mp3',
    spin: '/sounds/dice-roll.mp3',
    'dice-roll': '/sounds/dice-roll.mp3',
    'dice-win': '/sounds/dice-win.mp3',
    'dice-loss': '/sounds/dice-loss.mp3',
    'slots-spin': '/sounds/slots-spin.mp3',
    'slots-win': '/sounds/slots-win.mp3',
    'slots-loss': '/sounds/slots-loss.mp3',
    'roulette-spin': '/sounds/roulette-spin.mp3',
    'roulette-win': '/sounds/roulette-win.mp3',
    'roulette-loss': '/sounds/roulette-loss.mp3',
    'crash-launch': '/sounds/crash-launch.mp3',
    'crash-win': '/sounds/crash-win.mp3',
    'crash-explode': '/sounds/crash-explode.mp3',
    'blackjack-card': '/sounds/blackjack-card.mp3',
    'blackjack-win': '/sounds/blackjack-win.mp3',
    'blackjack-loss': '/sounds/blackjack-loss.mp3',
  };

  private audioCtx: AudioContext | null = null;
  private lastHoverTimestamp: number = 0;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Lazy-load sounds on demand (not preload)
      this.sounds = {};
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private ensureAudioLoaded(soundKey: SoundKey): HTMLAudioElement {
    if (!this.sounds[soundKey]) {
      const url = this.soundUrls[soundKey];
      if (url) {
        this.sounds[soundKey] = new Audio(url);
        this.sounds[soundKey].preload = 'none';
        this.sounds[soundKey].volume = this.volume;
      }
    }
    return this.sounds[soundKey];
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public toggle(enabled?: boolean) {
    this.enabled = enabled !== undefined ? enabled : !this.enabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Logarithmic perception curve: human ear perceives volume logarithmically.
   * Squaring provides a smooth and natural acoustic decay curve.
   */
  public getLogarithmicGain(): number {
    return Math.pow(this.volume, 2);
  }

  private updateVolumes() {
    const effectiveVol = this.getLogarithmicGain();
    Object.values(this.sounds).forEach((s) => {
      s.volume = effectiveVol;
    });
  }

  public play(sound: SoundKey) {
    if (!this.enabled || typeof window === 'undefined') return;
    const audio = this.ensureAudioLoaded(sound);
    if (!audio) return;

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay blocks
      });
    }
  }

  public playClick() {
    this.play('click');
  }

  /**
   * Ultra-subtle, velvety micro-tick for UI hover interactions.
   * Synthesized via Web Audio API to prevent lag, asset loading, and audio spam.
   */
  public playHover() {
    if (!this.enabled || typeof window === 'undefined') return;

    const now = Date.now();
    // Throttle hover sounds to max 1 per 75ms to prevent sensory overload when moving mouse across cards
    if (now - this.lastHoverTimestamp < 75) return;
    this.lastHoverTimestamp = now;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startTime = ctx.currentTime;
      const duration = 0.012; // 12ms soft micro-chirp

      // Gentle pitch variation (+/- 4%) for acoustic naturalness without fatigue
      const pitchVariance = 1 + (Math.random() * 0.08 - 0.04);
      osc.frequency.setValueAtTime(1200 * pitchVariance, startTime);
      osc.frequency.exponentialRampToValueAtTime(500 * pitchVariance, startTime + duration);

      // Very soft peak volume (logarithmically proportional to sound settings)
      const peakVol = Math.max(0.001, Math.min(0.04, 0.04 * this.getLogarithmicGain()));
      gain.gain.setValueAtTime(peakVol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.002);
    } catch {
      // Ignore any Web Audio synthesis failure gracefully
    }
  }
}

export const soundManager = SoundManager.getInstance();
