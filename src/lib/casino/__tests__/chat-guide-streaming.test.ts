import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mocks = vi.hoisted(() => ({
  recordGuideTelemetry: vi.fn(async () => 'recorded' as const),
}));

vi.mock('@/lib/casino/guide-telemetry', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, recordGuideTelemetry: mocks.recordGuideTelemetry };
});

import { requestCasinoGuideAnswerStream, CASINO_GUIDE_MODEL } from '../chat-guide';

describe('Casino Guide Token-Streaming Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  it('streams response chunks via SSE format from OpenAI chat completions', async () => {
    const sseChunks = [
      'data: {"choices":[{"delta":{"content":"Der "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"Hausvorteil "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"beträgt 1%."}}]}\n\n',
      'data: [DONE]\n\n',
    ];

    const encoder = new TextEncoder();
    const mockOpenAiStream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of sseChunks) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v1/responses')) {
        // Turn 1 tool check mock: no tools called
        return new Response(JSON.stringify({ output: [] }), { status: 200 });
      }
      if (urlStr.includes('/v1/chat/completions')) {
        return new Response(mockOpenAiStream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }
      return new Response('{}', { status: 200 });
    });

    const result = await requestCasinoGuideAnswerStream('Wie ist der Hausvorteil?', 'user-123');

    expect(result.model).toBe(CASINO_GUIDE_MODEL);
    expect(result.stream).toBeDefined();

    const reader = result.stream.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';
    let hasDoneMarker = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value);
      const lines = raw.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'data: [DONE]') {
          hasDoneMarker = true;
        } else if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            if (parsed.text) accumulatedText += parsed.text;
          } catch {
            // ignore
          }
        }
      }
    }

    expect(accumulatedText).toBe('Der Hausvorteil beträgt 1%.');
    expect(hasDoneMarker).toBe(true);
    expect(result.telemetryHandledInStream).toBe(true);
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: 'user-123', outcome: 'success', model: CASINO_GUIDE_MODEL }),
    );
  });

  it('gracefully falls back when OpenAI stream fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v1/responses')) {
        return new Response(
          JSON.stringify({
            output: [
              {
                type: 'message',
                content: [
                  {
                    type: 'output_text',
                    text: JSON.stringify({
                      type: 'guide_answer',
                      topic: 'dice',
                      answer: 'Fallback Antwort bei Dice.',
                    }),
                  },
                ],
              },
            ],
          }),
          { status: 200 },
        );
      }
      if (urlStr.includes('/v1/chat/completions')) {
        return new Response('Internal Server Error', { status: 500 });
      }
      return new Response('{}', { status: 200 });
    });

    const result = await requestCasinoGuideAnswerStream('Erkläre Dice');
    expect(result.stream).toBeDefined();

    const reader = result.stream.getReader();
    const decoder = new TextDecoder();
    let text = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const raw = decoder.decode(value);
      for (const line of raw.split('\n')) {
        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.text) text += parsed.text;
          } catch {
            // ignore
          }
        }
      }
    }

    expect(text).toContain('Fallback Antwort bei Dice.');
    expect(result.telemetryHandledInStream).toBe(false);
    expect(mocks.recordGuideTelemetry).not.toHaveBeenCalled();
  });

  it('never leaks the raw internal error message into the SSE error event once streaming has started', async () => {
    const encoder = new TextEncoder();
    let pullCount = 0;
    const throwingStream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pullCount += 1;
        if (pullCount === 1) {
          controller.enqueue(
            encoder.encode('data: {"choices":[{"delta":{"content":"Partial "}}]}\n\n'),
          );
          return;
        }
        throw new Error('ECONNRESET talking to internal-postgres-host:5432');
      },
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/v1/responses')) {
        return new Response(JSON.stringify({ output: [] }), { status: 200 });
      }
      if (urlStr.includes('/v1/chat/completions')) {
        return new Response(throwingStream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        });
      }
      return new Response('{}', { status: 200 });
    });

    const result = await requestCasinoGuideAnswerStream('Erkläre Dice', 'user-456');
    const reader = result.stream.getReader();
    const decoder = new TextDecoder();
    let raw = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      raw += decoder.decode(value);
    }

    expect(raw).not.toContain('ECONNRESET');
    expect(raw).not.toContain('internal-postgres-host');
    expect(raw).toContain('Casino guide is temporarily unavailable');

    // 04_v2 L2: a mid-stream failure must not leave telemetry showing 'success' — the
    // stream never got the chance to record success, so it must record the true outcome.
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledTimes(1);
    expect(mocks.recordGuideTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: 'user-456', outcome: 'upstream' }),
    );
    expect(mocks.recordGuideTelemetry).not.toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'success' }),
    );
  });
});
