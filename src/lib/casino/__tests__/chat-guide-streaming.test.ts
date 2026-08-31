import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('server-only', () => ({}));

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
  });
});
