import { vi } from 'vitest';

vi.mock('@/lib/casino/sound-manager', () => ({
  soundManager: {
    play: vi.fn(),
    playWinTier: vi.fn(),
    toggle: vi.fn(),
    setVolume: vi.fn(),
  },
}));
vi.mock('@/lib/analytics/events', () => ({
  trackAllowedEvent: vi.fn(),
}));

import { soundManager } from '@/lib/casino/sound-manager';
import { trackAllowedEvent } from '@/lib/analytics/events';

export { soundManager, trackAllowedEvent };
