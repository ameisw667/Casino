import { beforeEach, describe, expect, it, vi } from 'vitest';

const { captureException, captureMessage } = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException,
  captureMessage,
}));

import { CasinoLogger } from '../logger';

describe('CasinoLogger.error Sentry integration', () => {
  beforeEach(() => {
    captureException.mockReset();
    captureMessage.mockReset();
  });

  it('sends a real Error via captureException tagged with the module', () => {
    const error = new Error('boom');
    CasinoLogger.error('API/Casino/Bet', 'Settlement failed', error);

    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { module: 'API/Casino/Bet' },
    });
    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('sends a non-Error value via captureMessage at error level', () => {
    CasinoLogger.error('API/Casino/Bet', 'Settlement failed', { code: 'INSUFFICIENT' });

    expect(captureMessage).toHaveBeenCalledWith('Settlement failed', {
      level: 'error',
      tags: { module: 'API/Casino/Bet' },
    });
    expect(captureException).not.toHaveBeenCalled();
  });

  it('falls back to captureMessage when no error argument is passed at all', () => {
    CasinoLogger.error('API/Casino/Bet', 'Settlement failed');

    expect(captureMessage).toHaveBeenCalledWith('Settlement failed', {
      level: 'error',
      tags: { module: 'API/Casino/Bet' },
    });
  });

  it('attaches requestId as the request_id tag when provided', () => {
    const error = new Error('boom');
    CasinoLogger.error('API/Casino/Bet', 'Settlement failed', error, 'req-123');

    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { module: 'API/Casino/Bet', request_id: 'req-123' },
    });
  });

  it('omits the request_id tag entirely when requestId is not provided', () => {
    CasinoLogger.error('API/Casino/Bet', 'Settlement failed', new Error('boom'));

    const [, context] = captureException.mock.calls[0];
    expect(context.tags).not.toHaveProperty('request_id');
  });

  it('never throws when the Sentry SDK itself throws', () => {
    captureException.mockImplementation(() => {
      throw new Error('SDK exploded');
    });

    expect(() =>
      CasinoLogger.error('API/Casino/Bet', 'Settlement failed', new Error('boom')),
    ).not.toThrow();
  });

  it('still logs to console regardless of the Sentry outcome', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    CasinoLogger.error('API/Casino/Bet', 'Settlement failed', new Error('boom'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('CasinoLogger.warn Sentry integration', () => {
  beforeEach(() => {
    captureException.mockReset();
    captureMessage.mockReset();
  });

  it('always forwards to Sentry as a warning-level message, even outside development (test env is non-dev)', () => {
    CasinoLogger.warn('GAME_CONFIG', 'Redis L2 read failed, falling back to Supabase');

    expect(captureMessage).toHaveBeenCalledWith('Redis L2 read failed, falling back to Supabase', {
      level: 'warning',
      tags: { module: 'GAME_CONFIG' },
    });
  });

  it('never throws when the Sentry SDK itself throws during a warning', () => {
    captureMessage.mockImplementation(() => {
      throw new Error('SDK exploded');
    });

    expect(() => CasinoLogger.warn('GAME_CONFIG', 'Redis L2 read failed')).not.toThrow();
  });

  it('never calls captureException for a warning, regardless of a data payload', () => {
    CasinoLogger.warn('GAME_CONFIG', 'Redis L2 read failed', new Error('underlying cause'));
    expect(captureException).not.toHaveBeenCalled();
  });

  it('does not log to console outside development (test env is non-dev)', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    CasinoLogger.warn('GAME_CONFIG', 'Redis L2 read failed');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
