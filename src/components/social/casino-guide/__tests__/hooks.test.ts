// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { useGuideAttachment } from '../hooks/useGuideAttachment';
import { useGuideVoiceRecorder } from '../hooks/useGuideVoiceRecorder';
import { buildGuideHistoryPayload, useGuideChatStream } from '../hooks/useGuideChatStream';
import type { GuideTurn } from '../guide-config';

describe('Guide Custom Hooks', () => {
  it('exports valid custom hook functions', () => {
    expect(typeof useGuideAttachment).toBe('function');
    expect(typeof useGuideVoiceRecorder).toBe('function');
    expect(typeof useGuideChatStream).toBe('function');
  });
});

describe('buildGuideHistoryPayload', () => {
  function turn(overrides: Partial<GuideTurn> & Pick<GuideTurn, 'id' | 'role' | 'text'>): GuideTurn {
    return { time: '12:00', ...overrides };
  }

  it('drops the static intro turn and maps player/guide roles to user/assistant', () => {
    const turns: GuideTurn[] = [
      turn({ id: 'royale-guide-intro', role: 'guide', text: 'Willkommen!' }),
      turn({ id: 'player-1', role: 'player', text: 'Wie geht Blackjack?' }),
      turn({ id: 'guide-1', role: 'guide', text: 'So funktioniert Blackjack...' }),
    ];

    const history = buildGuideHistoryPayload(turns);

    expect(history).toEqual([
      { role: 'user', content: 'Wie geht Blackjack?' },
      { role: 'assistant', content: 'So funktioniert Blackjack...' },
    ]);
  });

  it('keeps only the last 6 turns, matching the server-side sliding-window limit', () => {
    const turns: GuideTurn[] = Array.from({ length: 10 }, (_, i) =>
      turn({ id: `turn-${i}`, role: i % 2 === 0 ? 'player' : 'guide', text: `Turn ${i}` }),
    );

    const history = buildGuideHistoryPayload(turns);

    expect(history).toHaveLength(6);
    expect(history[0]?.content).toBe('Turn 4');
    expect(history[5]?.content).toBe('Turn 9');
  });

  it('truncates a turn longer than 1000 characters instead of letting the server reject the whole history array (regression: a single long turn silently broke every follow-up message)', () => {
    const longAnswer = 'a'.repeat(1500);
    const turns: GuideTurn[] = [
      turn({ id: 'player-1', role: 'player', text: 'Erkläre mir alle Regeln im Detail.' }),
      turn({ id: 'guide-1', role: 'guide', text: longAnswer }),
    ];

    const history = buildGuideHistoryPayload(turns);

    expect(history[1]?.content.length).toBe(1000);
    expect(history[1]?.content).toBe(longAnswer.slice(0, 1000));
  });

  it('drops client-generated fallback/error notices instead of replaying them to the model as its own past answers (regression: an offline/429/empty-stream notice shares role "guide" with real answers and was fed back verbatim)', () => {
    const turns: GuideTurn[] = [
      turn({ id: 'player-1', role: 'player', text: 'Wie hoch ist der Hausvorteil bei Dice?' }),
      turn({
        id: 'guide-1',
        role: 'guide',
        text: 'Royale Guide ist vorübergehend nicht erreichbar. Bitte versuche es gleich erneut.',
        isSystemNotice: true,
      }),
      turn({ id: 'player-2', role: 'player', text: 'Und bei Roulette?' }),
      turn({ id: 'guide-2', role: 'guide', text: 'Bei Roulette liegt er bei 2,7%.' }),
    ];

    const history = buildGuideHistoryPayload(turns);

    expect(history).toEqual([
      { role: 'user', content: 'Wie hoch ist der Hausvorteil bei Dice?' },
      { role: 'user', content: 'Und bei Roulette?' },
      { role: 'assistant', content: 'Bei Roulette liegt er bei 2,7%.' },
    ]);
  });
});
