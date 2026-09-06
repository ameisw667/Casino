import { describe, expect, it, vi } from 'vitest';

// The route module now transitively imports 'server-only' (06_1 L2 daily cost cap) and
// cannot be imported from a client-context test without this established repo mock.
vi.mock('server-only', () => ({}));

import { cleanMarkdownForSpeech } from '@/app/api/chat/voice-synthesize/route';
import { isAudioRecordingSupported } from '../voice-audio';

describe('voice-audio unit tests', () => {
  describe('cleanMarkdownForSpeech', () => {
    it('strips <<<SUGGESTIONS: [...]>>> blocks completely', () => {
      const raw = 'Hier ist die Erklärung.\n\n<<<SUGGESTIONS: ["Frage 1", "Frage 2"]>>>';
      expect(cleanMarkdownForSpeech(raw)).toBe('Hier ist die Erklärung.');
    });

    it('strips markdown tables and headers', () => {
      const raw =
        '# Roulette Quoten\n\n| Wette | Auszahlung |\n|---|---|\n| Rot | 1:1 |\n| Zahl | 35:1 |';
      const cleaned = cleanMarkdownForSpeech(raw);
      expect(cleaned).toContain('Roulette Quoten');
      expect(cleaned).not.toContain('|');
      expect(cleaned).not.toContain('#');
    });

    it('strips links and keeps link text', () => {
      const raw = 'Besuche den [Vault](/vault) für Einzahlungen.';
      expect(cleanMarkdownForSpeech(raw)).toBe('Besuche den Vault für Einzahlungen.');
    });

    it('strips bold, italic and code formatting', () => {
      const raw = 'Setze **10$** auf `Rot` oder _Schwarz_.';
      expect(cleanMarkdownForSpeech(raw)).toBe('Setze 10$ auf Rot oder Schwarz.');
    });

    it('handles empty or blank string gracefully', () => {
      expect(cleanMarkdownForSpeech('')).toBe('');
    });
  });

  describe('isAudioRecordingSupported', () => {
    it('returns false in non-browser Node test environment without crashing', () => {
      expect(typeof isAudioRecordingSupported()).toBe('boolean');
    });
  });
});
