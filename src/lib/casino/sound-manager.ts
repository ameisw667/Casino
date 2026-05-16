'use client';

class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private sounds: Record<string, HTMLAudioElement> = {};

  private constructor() {
    if (typeof window !== 'undefined') {
      // Preload sounds
      this.sounds = {
        bet: new Audio('/sounds/dice-roll.mp3'),
        win: new Audio('/sounds/win.mp3'),
        loss: new Audio('/sounds/loss.mp3'),
        click: new Audio('/sounds/dice-roll.mp3'),
        notification: new Audio('/sounds/win.mp3'),
        chip: new Audio('/sounds/dice-roll.mp3'),
        spin: new Audio('/sounds/dice-roll.mp3')
      };

      this.updateVolumes();
    }
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
    
    const audio = this.sounds[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay blocks
      });
    }
  }
}

export const soundManager = SoundManager.getInstance();

