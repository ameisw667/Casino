import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  CASINO_GUIDE_CONTEXT_VERSION,
  CasinoGuideError,
  buildCasinoGuideInstructions,
  buildGuideInputPayload,
  extractSuggestionsFromText,
  SuggestionStreamFilter,
  type GuideKnowledgeContext,
} from '../chat-guide';

// L12.5 — Pure-contract regression net for chat-guide.ts, written BEFORE the
// L13 module split. These tests pin the deterministic, side-effect-free
// exports directly (the existing chat-guide.test.ts covers most of them only
// indirectly via the networked requestCasinoGuideRequest path). Every
// assertion here must stay GREEN after L13 reorganizes the module — if a
// split changes any of these outputs, that is a behavior regression.

describe('chat-guide pure contracts (L12.5 regression net)', () => {
  describe('CasinoGuideError', () => {
    it('carries kind, requestId, stable name and message', () => {
      const err = new CasinoGuideError('quota', 'req-123');
      expect(err).toBeInstanceOf(Error);
      expect(err.kind).toBe('quota');
      expect(err.requestId).toBe('req-123');
      expect(err.name).toBe('CasinoGuideError');
      expect(err.message).toBe('Casino guide is temporarily unavailable');
    });

    it('allows omitting the correlation id', () => {
      const err = new CasinoGuideError('configuration');
      expect(err.kind).toBe('configuration');
      expect(err.requestId).toBeUndefined();
    });

    it('covers all declared error kinds', () => {
      const kinds = ['configuration', 'quota', 'upstream', 'invalid-response'] as const;
      for (const kind of kinds) {
        expect(new CasinoGuideError(kind).kind).toBe(kind);
      }
    });
  });

  describe('buildCasinoGuideInstructions', () => {
    const context: GuideKnowledgeContext = {
      sourceIds: ['guide-test'],
      sourceVersion: '2026-08-19',
      content:
        'SOURCE: guide-test\nVERSION: 2026-08-19\nTOPIC: test\nTITLE: Test\nTest content body',
    };

    it('embeds the context content and both version markers verbatim', () => {
      const instructions = buildCasinoGuideInstructions(context, null);

      expect(instructions).toContain(
        'You are Royale Guide, the clearly labelled AI casino guide for Casino Royale.',
      );
      expect(instructions).toContain(`Guide context version: ${CASINO_GUIDE_CONTEXT_VERSION}.`);
      expect(instructions).toContain('Guide knowledge source version: 2026-08-19.');
      expect(instructions).toContain('SOURCE: guide-test');
      expect(instructions).toContain('Test content body');
    });

    it('declines live leaderboard data when the snippet is null', () => {
      const instructions = buildCasinoGuideInstructions(context, null);

      expect(instructions).toContain('LIVE DATA (leaderboard): not available right now');
      expect(instructions).toContain('live leaderboard data is temporarily unavailable');
    });

    it('injects the minimized leaderboard snapshot with an "as of" marker and untrusted-input note', () => {
      const snippet = {
        asOf: '2026-08-18T12:00:00.000Z',
        rows: [
          { username: 'PlayerOne', level: 12, rank: 'GOLD', totalWagered: 1234.5 },
          { username: 'PlayerTwo', level: 8, rank: 'SILVER', totalWagered: 500 },
        ],
      };

      const instructions = buildCasinoGuideInstructions(context, snippet);

      expect(instructions).toContain(
        'LIVE DATA (public leaderboard snapshot, as of 2026-08-18T12:00:00.000Z)',
      );
      expect(instructions).toContain(
        '1. username "PlayerOne" — Level 12, GOLD rank, $1234.50 wagered',
      );
      expect(instructions).toContain('untrusted, player-chosen display text');
    });

    it('documents the follow-up suggestions delimiter format', () => {
      const instructions = buildCasinoGuideInstructions(context, null);

      expect(instructions).toContain('<<<SUGGESTIONS: ["Frage 1", "Frage 2", "Frage 3"]>>>');
      expect(instructions).toContain('Keep each suggestion concise and under 45 characters.');
    });
  });

  describe('buildGuideInputPayload (image branch)', () => {
    it('pairs input_text with input_image when an image url is supplied', () => {
      const payload = buildGuideInputPayload(
        'Describe this hand',
        undefined,
        'data:image/png;base64,abc',
      );

      expect(payload).toHaveLength(1);
      expect(payload[0]).toEqual({
        role: 'user',
        content: [
          { type: 'input_text', text: 'Describe this hand' },
          { type: 'input_image', image_url: 'data:image/png;base64,abc' },
        ],
      });
    });

    it('appends a multimodal user turn after the windowed history', () => {
      const history = [
        { role: 'user' as const, content: 'Earlier question' },
        { role: 'assistant' as const, content: 'Earlier answer' },
      ];

      const payload = buildGuideInputPayload(
        'Now look at this',
        history,
        'data:image/png;base64,xyz',
      );

      expect(payload).toHaveLength(3);
      expect(payload[0]).toEqual({
        role: 'user',
        content: [{ type: 'input_text', text: 'Earlier question' }],
      });
      expect(payload[1]).toEqual({
        role: 'assistant',
        content: [{ type: 'output_text', text: 'Earlier answer' }],
      });
      expect(payload[2]).toEqual({
        role: 'user',
        content: [
          { type: 'input_text', text: 'Now look at this' },
          { type: 'input_image', image_url: 'data:image/png;base64,xyz' },
        ],
      });
    });

    it('falls back to a text-only user turn when no image is supplied', () => {
      const payload = buildGuideInputPayload('Just text', undefined, undefined);

      expect(payload).toEqual([
        { role: 'user', content: [{ type: 'input_text', text: 'Just text' }] },
      ]);
    });
  });

  describe('extractSuggestionsFromText (edge contracts)', () => {
    it('returns empty cleanText and no suggestions for an empty string', () => {
      expect(extractSuggestionsFromText('')).toEqual({ cleanText: '', suggestions: [] });
    });

    it('trims whitespace-only input to an empty cleanText', () => {
      expect(extractSuggestionsFromText('   ')).toEqual({ cleanText: '', suggestions: [] });
    });

    it('filters non-string and blank entries out of the suggestion array', () => {
      const raw = 'Antwort.\n<<<SUGGESTIONS: [1, "gültig", null, "  ", "x"]>>>';

      expect(extractSuggestionsFromText(raw)).toEqual({
        cleanText: 'Antwort.',
        suggestions: ['gültig', 'x'],
      });
    });

    it('trims surrounding whitespace from each suggestion', () => {
      const raw = 'Antwort.\n<<<SUGGESTIONS: ["  eingerückt  "]>>>';

      expect(extractSuggestionsFromText(raw).suggestions).toEqual(['eingerückt']);
    });

    it('preserves the trailing answer text when the delimiter opens with a newline', () => {
      const raw = 'Zeile 1\nZeile 2\n<<<SUGGESTIONS: ["Frage"]>>>';

      expect(extractSuggestionsFromText(raw).cleanText).toBe('Zeile 1\nZeile 2');
    });
  });

  describe('SuggestionStreamFilter (single-chunk delimiter)', () => {
    it('emits the leading text and captures suggestions when the whole block arrives in one chunk', () => {
      const filter = new SuggestionStreamFilter();
      const res = filter.processChunk('Antworttext.<<<SUGGESTIONS: ["Frage A", "Frage B"]>>>');

      expect(res.textToEmit).toBe('Antworttext.');
      expect(res.suggestionsFound).toEqual(['Frage A', 'Frage B']);

      const flush = filter.flush();
      expect(flush.textToEmit).toBe('');
      expect(flush.suggestionsFound).toEqual(['Frage A', 'Frage B']);
    });

    it('keeps already-captured suggestions available on flush without re-emitting text', () => {
      const filter = new SuggestionStreamFilter();
      filter.processChunk('Text.<<<SUGGESTIONS: ["Einzel"]>>>');
      const flush = filter.flush();

      expect(flush.textToEmit).toBe('');
      expect(flush.suggestionsFound).toEqual(['Einzel']);
    });
  });
});
