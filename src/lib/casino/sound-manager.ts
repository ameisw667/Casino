'use client';

class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private sounds: Record<string, HTMLAudioElement> = {};
  private soundUrls: Record<string, string> = {
    bet: '/sounds/dice-roll.mp3',
    win: '/sounds/win.mp3',
    loss: '/sounds/loss.mp3',
    click: '/sounds/dice-roll.mp3',
    notification: '/sounds/win.mp3',
    chip: '/sounds/dice-roll.mp3',
    spin: '/sounds/dice-roll.mp3'
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      // Lazy-load sounds on demand (not preload)
      this.sounds = {};
    }
  }

  private ensureAudioLoaded(soundKey: string): HTMLAudioElement {
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

  private updateVolumes() {
    Object.values(this.sounds).forEach(s => {
      s.volume = this.volume;
    });
  }

  public play(sound: 'bet' | 'win' | 'loss' | 'click' | 'notification' | 'chip' | 'spin') {
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
}

export const soundManager = SoundManager.getInstance();

