import { getApiErrorCode, getApiErrorMessage, type AppErrorCode } from '@/lib/security/form-errors';
import type { ApiSuccessPayload } from '@/lib/api/response';

export type ApiFetchErrorCode =
  AppErrorCode | 'UNKNOWN_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';

export class ApiFetchError extends Error {
  readonly code: ApiFetchErrorCode;
  readonly status: number;

  constructor(code: ApiFetchErrorCode, message: string, status: number) {
    super(message);
    this.name = 'ApiFetchError';
    this.code = code;
    this.status = status;
  }
}

function isSuccessPayload<T>(payload: unknown): payload is ApiSuccessPayload<T> {
  return payload !== null && typeof payload === 'object' && 'data' in payload;
}

/**
 * Universal typed fetch wrapper for API routes following the standard `{ data: T }` envelope.
 */
export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new ApiFetchError(
      'NETWORK_ERROR',
      'Verbindung zum Server konnte nicht hergestellt werden.',
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiFetchError(
      'INVALID_RESPONSE',
      'Die Antwort konnte nicht verarbeitet werden.',
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiFetchError(
      getApiErrorCode(payload) ?? 'UNKNOWN_ERROR',
      getApiErrorMessage(payload),
      response.status,
    );
  }

  if (!isSuccessPayload<T>(payload)) {
    throw new ApiFetchError(
      'INVALID_RESPONSE',
      'Die Antwort entspricht nicht dem erwarteten Format.',
      response.status,
    );
  }

  return payload.data;
}

/**
 * Helper to build standard JSON POST request options with optional Idempotency-Key.
 */
function postOptions<B>(body: B, idempotencyKey?: string): RequestInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  };
}

/**
 * End-to-End Typed API Client Suite
 */
export const apiClient = {
  health: () => apiFetch<{ status: string; timestamp: string; version?: string }>('/api/health'),

  casino: {
    config: () => apiFetch<Record<string, unknown>>('/api/casino/config'),
    jackpot: () => apiFetch<{ currentAmount: number }>('/api/casino/jackpot'),
    activeRound: () => apiFetch<Record<string, unknown>>('/api/casino/active-round'),
    seeds: () => apiFetch<Record<string, unknown>>('/api/casino/seeds'),
    seedsHistory: () => apiFetch<Array<Record<string, unknown>>>('/api/casino/seeds/history'),
    bet: <T = Record<string, unknown>>(body: Record<string, unknown>, idempotencyKey?: string) =>
      apiFetch<T>('/api/casino/bet', postOptions(body, idempotencyKey)),
    blackjack: <T = Record<string, unknown>>(
      body: Record<string, unknown>,
      idempotencyKey?: string,
    ) => apiFetch<T>('/api/casino/blackjack', postOptions(body, idempotencyKey)),
    crashMultiplayer: <T = Record<string, unknown>>(
      body: Record<string, unknown>,
      idempotencyKey?: string,
    ) => apiFetch<T>('/api/casino/bet-crash-multiplayer', postOptions(body, idempotencyKey)),
    redeemCode: <T = Record<string, unknown>>(
      body: { code: string; requestId?: string },
      idempotencyKey?: string,
    ) => apiFetch<T>('/api/casino/redeem-code', postOptions(body, idempotencyKey)),
  },

  user: {
    balance: <T = Record<string, unknown>>() => apiFetch<T>('/api/user/balance'),
    history: <
      T = { rows: Array<Record<string, unknown>>; nextCursor: string | null; hasMore: boolean },
    >(
      cursor?: string,
      limit?: number,
    ) => {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      return apiFetch<T>(`/api/user/history${qs ? `?${qs}` : ''}`);
    },
    stats: <T = Record<string, unknown>>() => apiFetch<T>('/api/user/stats'),
    loginHistory: <T = { history: Array<Record<string, unknown>> }>() =>
      apiFetch<T>('/api/user/login-history'),
  },

  community: {
    activity: <T = Record<string, unknown>>() => apiFetch<T>('/api/community'),
    leaderboard: <T = { rows: Array<Record<string, unknown>> }>(period = 'all') =>
      apiFetch<T>(`/api/leaderboard?period=${period}`),
    dailyRace: <T = Record<string, unknown>>() => apiFetch<T>('/api/tournaments/daily-race'),
  },

  notifications: {
    list: <T = { notifications: Array<Record<string, unknown>>; unreadCount: number }>() =>
      apiFetch<T>('/api/notifications'),
    markRead: (id: string) =>
      apiFetch<{ id: string; read: boolean }>(`/api/notifications/${id}`, { method: 'PATCH' }),
    readAll: () =>
      apiFetch<{ updatedCount: number }>('/api/notifications/read-all', { method: 'POST' }),
  },

  admin: {
    overview: <T = Record<string, unknown>>() => apiFetch<T>('/api/admin/overview'),
    users: <T = Array<Record<string, unknown>>>() => apiFetch<T>('/api/admin/users'),
    games: <T = Record<string, unknown>>() => apiFetch<T>('/api/admin/games'),
    analytics: <T = Record<string, unknown>>() => apiFetch<T>('/api/admin/analytics'),
    fraud: <T = Array<Record<string, unknown>>>() => apiFetch<T>('/api/admin/fraud'),
    jobHealth: <T = Record<string, unknown>>() => apiFetch<T>('/api/admin/job-health'),
    promoCodes: <T = Array<Record<string, unknown>>>() => apiFetch<T>('/api/admin/promo-codes'),
  },
};
