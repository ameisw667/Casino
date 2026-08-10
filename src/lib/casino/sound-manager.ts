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
    bet: '/sounds/dice-roll.mp3',
    win: '/sounds/win.mp3',
    loss: '/sounds/loss.mp3',
    click: '/sounds/dice-roll.mp3',
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

  private constructor() {
    if (typeof window !== 'undefined') {
      // Lazy-load sounds on demand (not preload)
      this.sounds = {};
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

  private updateVolumes() {
    Object.values(this.sounds).forEach((s) => {
      s.volume = this.volume;
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

  public playHover() {
    this.play('click');
  }
}

export const soundManager = SoundManager.getInstance();
