'use client';

class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private sounds: Record<string, HTMLAudioElement> = {};

  private constructor() {
    if (typeof window !== 'undefined') {
      // Preload sounds (using placeholders or base64 if available, 
      // but here we define the structure for the user to add assets)
      this.sounds = {
        bet: new Audio('/sounds/bet.mp3'),
        win: new Audio('/sounds/win.mp3'),
        loss: new Audio('/sounds/loss.mp3'),
        click: new Audio('/sounds/click.mp3'),
        notification: new Audio('/sounds/notification.mp3')
      };

      // Set volume for all
      Object.values(this.sounds).forEach(s => {
        s.volume = 0.5;
      });
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

  public play(sound: 'bet' | 'win' | 'loss' | 'click' | 'notification') {
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
