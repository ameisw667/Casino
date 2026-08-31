import { describe, expect, it } from 'vitest';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api/response';

describe('apiSuccessResponse', () => {
  it('wraps the payload under a stable data key', async () => {
    const response = apiSuccessResponse({ balance: 100 });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { balance: 100 } });
  });

  it('includes optional meta when provided', async () => {
    const response = apiSuccessResponse({ ok: true }, {}, { page: 1, total: 10 });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: { ok: true },
      meta: { page: 1, total: 10 },
    });
  });

  it('sets a JSON content-type by default', () => {
    const response = apiSuccessResponse({ ok: true });

    expect(response.headers.get('content-type')).toBe('application/json');
  });

  it('allows overriding status and headers without losing the envelope', async () => {
    const response = apiSuccessResponse(
      { created: true },
      { status: 201, headers: { 'Cache-Control': 'private, no-store' } },
    );

    expect(response.status).toBe(201);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual({ data: { created: true } });
  });

  it('preserves an explicit content-type instead of overwriting it', () => {
    const response = apiSuccessResponse(
      { data: 'raw' },
      { headers: { 'content-type': 'application/vnd.custom+json' } },
    );

    expect(response.headers.get('content-type')).toBe('application/vnd.custom+json');
  });
});

describe('apiErrorResponse', () => {
  it('formats error responses with error code and message', async () => {
    const response = apiErrorResponse('UNAUTHORIZED', 'Missing auth cookie', 401);

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toBe('application/json');
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing auth cookie',
      },
    });
  });

  it('includes validation details if provided', async () => {
    const response = apiErrorResponse('VALIDATION_ERROR', 'Invalid payload', 422, {
      field: 'betAmount',
      reason: 'Too small',
    });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid payload',
        details: {
          field: 'betAmount',
          reason: 'Too small',
        },
      },
    });
  });
});
