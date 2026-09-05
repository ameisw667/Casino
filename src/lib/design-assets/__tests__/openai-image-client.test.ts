import { describe, expect, it, vi } from 'vitest';
import { OpenAiImageError, generateImage, generateImageWithMeta } from '../openai-image-client';
import type { GenerationRequest } from '../types';

const baseRequest: GenerationRequest = {
  name: 'hero-bg-crash',
  prompt: 'a golden rocket trail',
  size: '1024x1024',
  quality: 'medium',
  model: 'gpt-image-2',
};

function jsonResponse(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('openai-image-client', () => {
  it('decodes the base64 image payload into a Buffer on success', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { data: [{ b64_json: Buffer.from('img').toString('base64') }] }),
      );

    const result = await generateImage(baseRequest, {
      apiKey: 'sk-test',
      fetchImpl,
      sleepImpl: vi.fn(),
    });

    expect(result.toString()).toBe('img');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('generateImageWithMeta returns full telemetry, revisedPrompt and requestId', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse(
        200,
        {
          data: [
            {
              b64_json: Buffer.from('telemetry-img').toString('base64'),
              revised_prompt: 'a detailed golden rocket soaring into dark obsidian night',
            },
          ],
        },
        { 'x-request-id': 'req-xyz-123', 'x-ratelimit-remaining-requests': '49' },
      ),
    );

    const result = await generateImageWithMeta(
      { ...baseRequest, size: '1792x1024' },
      { apiKey: 'sk-test', fetchImpl, sleepImpl: vi.fn() },
    );

    expect(result.imageBuffer.toString()).toBe('telemetry-img');
    expect(result.meta.requestId).toBe('req-xyz-123');
    expect(result.meta.revisedPrompt).toBe(
      'a detailed golden rocket soaring into dark obsidian night',
    );
    expect(result.meta.size).toBe('1792x1024');
    expect(result.meta.attemptsMade).toBe(1);
    expect(result.meta.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('throws immediately without retrying on a non-retryable 401 with isFatal() === true', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(401, {
          error: {
            message: 'Incorrect API key provided',
            type: 'invalid_request_error',
            code: 'invalid_api_key',
          },
        }),
      );
    const sleepImpl = vi.fn();

    let caughtError: OpenAiImageError | undefined;
    try {
      await generateImage(baseRequest, { apiKey: 'sk-bad', fetchImpl, sleepImpl });
    } catch (err) {
      if (err instanceof OpenAiImageError) caughtError = err;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError?.status).toBe(401);
    expect(caughtError?.errorCode).toBe('invalid_api_key');
    expect(caughtError?.isAuthError()).toBe(true);
    expect(caughtError?.isFatal()).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleepImpl).not.toHaveBeenCalled();
  });

  it('identifies insufficient_quota on 429 as fatal and not retryable', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(429, {
          error: {
            message: 'You exceeded your current quota',
            type: 'insufficient_quota',
            code: 'insufficient_quota',
          },
        }),
      );
    const sleepImpl = vi.fn();

    let caughtError: OpenAiImageError | undefined;
    try {
      await generateImage(baseRequest, { apiKey: 'sk-test', fetchImpl, sleepImpl });
    } catch (err) {
      if (err instanceof OpenAiImageError) caughtError = err;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError?.isQuotaExceeded()).toBe(true);
    expect(caughtError?.isFatal()).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries on a 429 rate limit and succeeds once rate limit clears', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(429, { error: { message: 'Rate limit reached', type: 'requests' } }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { data: [{ b64_json: Buffer.from('img').toString('base64') }] }),
      );
    const sleepImpl = vi.fn().mockResolvedValue(undefined);

    const result = await generateImage(baseRequest, { apiKey: 'sk-test', fetchImpl, sleepImpl });

    expect(result.toString()).toBe('img');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleepImpl).toHaveBeenCalledTimes(1);
  });

  it('retries on transient network errors / AbortError', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValueOnce(
        jsonResponse(200, { data: [{ b64_json: Buffer.from('recovered').toString('base64') }] }),
      );
    const sleepImpl = vi.fn().mockResolvedValue(undefined);

    const result = await generateImage(baseRequest, { apiKey: 'sk-test', fetchImpl, sleepImpl });

    expect(result.toString()).toBe('recovered');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('gives up after exhausting all retries on persistent 503 errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(503, { error: 'unavailable' }));
    const sleepImpl = vi.fn().mockResolvedValue(undefined);

    await expect(
      generateImage(baseRequest, { apiKey: 'sk-test', fetchImpl, sleepImpl }),
    ).rejects.toBeInstanceOf(OpenAiImageError);
    expect(fetchImpl.mock.calls.length).toBeGreaterThan(1);
  });

  it('fails fast when called inside Next.js server runtime (NEXT_RUNTIME guard)', async () => {
    const original = process.env.NEXT_RUNTIME;
    try {
      process.env.NEXT_RUNTIME = 'nodejs';
      await expect(generateImage(baseRequest, { apiKey: 'sk-test' })).rejects.toThrow(
        'Sicherheitsbarriere',
      );
    } finally {
      process.env.NEXT_RUNTIME = original;
    }
  });
});
