import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  extractSuggestionsFromText,
  SuggestionStreamFilter,
} from '../chat-guide';

describe('Follow-up Suggestions Extraction & Stream Filtering (Stufe I)', () => {
  describe('extractSuggestionsFromText', () => {
    it('extracts valid suggestions and strips the delimiter block from text', () => {
      const raw =
        'Blackjack zahlt 3:2 bei natürlichem 21.\n\n<<<SUGGESTIONS: ["Wann verdoppeln?", "Wie funktioniert Split?", "Zu Blackjack"]>>>';
      const result = extractSuggestionsFromText(raw);

      expect(result.cleanText).toBe('Blackjack zahlt 3:2 bei natürlichem 21.');
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions).toEqual([
        'Wann verdoppeln?',
        'Wie funktioniert Split?',
        'Zu Blackjack',
      ]);
    });

    it('returns empty suggestions when no delimiter is present', () => {
      const raw = 'Hier ist eine Erklärung ohne Folgefragen.';
      const result = extractSuggestionsFromText(raw);

      expect(result.cleanText).toBe('Hier ist eine Erklärung ohne Folgefragen.');
      expect(result.suggestions).toEqual([]);
    });

    it('handles malformed suggestion JSON safely without throwing', () => {
      const raw = 'Antworttext.\n<<<SUGGESTIONS: [invalid, json, here]>>>';
      const result = extractSuggestionsFromText(raw);

      expect(result.cleanText).toBe('Antworttext.');
      expect(result.suggestions).toEqual([]);
    });

    it('caps suggestions at 3 items maximum', () => {
      const raw =
        'Text.\n<<<SUGGESTIONS: ["Eins", "Zwei", "Drei", "Vier", "Fünf"]>>>';
      const result = extractSuggestionsFromText(raw);

      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions).toEqual(['Eins', 'Zwei', 'Drei']);
    });
  });

  describe('SuggestionStreamFilter', () => {
    it('passes standard text through cleanly', () => {
      const filter = new SuggestionStreamFilter();
      const res1 = filter.processChunk('Hallo ');
      const res2 = filter.processChunk('Spieler!');
      const flush = filter.flush();

      expect(res1.textToEmit).toBe('Hallo ');
      expect(res1.suggestionsFound).toBeNull();
      expect(res2.textToEmit).toBe('Spieler!');
      expect(res2.suggestionsFound).toBeNull();
      expect(flush.textToEmit).toBe('');
      expect(flush.suggestionsFound).toBeNull();
    });

    it('intercepts delimiter block arriving across chunk boundaries', () => {
      const filter = new SuggestionStreamFilter();
      const chunk1 = 'Hier ist die Erklärung. ';
      const chunk2 = '<<<SUGG';
      const chunk3 = 'ESTIONS: ["Frage A", "Frage B"]>>>';

      const r1 = filter.processChunk(chunk1);
      expect(r1.textToEmit).toBe('Hier ist die Erklärung. ');
      expect(r1.suggestionsFound).toBeNull();

      const r2 = filter.processChunk(chunk2);
      expect(r2.textToEmit).toBe('');
      expect(r2.suggestionsFound).toBeNull();

      const r3 = filter.processChunk(chunk3);
      expect(r3.textToEmit).toBe('');
      expect(r3.suggestionsFound).toEqual(['Frage A', 'Frage B']);

      const flush = filter.flush();
      expect(flush.textToEmit).toBe('');
      expect(flush.suggestionsFound).toEqual(['Frage A', 'Frage B']);
    });

    it('flushes incomplete delimiter at stream end safely', () => {
      const filter = new SuggestionStreamFilter();
      filter.processChunk('Text ');
      filter.processChunk('<<<SUGGESTIONS: ["Einzelfrage"]');
      const flush = filter.flush();

      expect(flush.textToEmit).toBe('');
    });
  });
});
