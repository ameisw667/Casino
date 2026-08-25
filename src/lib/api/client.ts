import { getApiErrorCode, getApiErrorMessage, type AppErrorCode } from '@/lib/security/form-errors';
import type { ApiSuccessPayload } from '@/lib/api/response';

export type ApiFetchErrorCode = AppErrorCode | 'UNKNOWN_ERROR' | 'NETWORK_ERROR' | 'INVALID_RESPONSE';

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
 * Typed fetch wrapper for routes that follow the `{ data: T }` / `{ error }` envelope
 * (see worldmap/01_api_response_envelope.md). Existing un-enveloped routes keep using
 * plain fetch() until they are opportunistically migrated.
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
