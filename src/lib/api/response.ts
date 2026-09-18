export type ApiSuccessPayload<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    fieldErrors?: Record<string, string>;
    requestId?: string;
  };
};

export function apiSuccessResponse<T>(
  data: T,
  init: ResponseInit = {},
  meta?: Record<string, unknown>,
): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  // Fail-closed default: API responses carry account/session-scoped data and must never be
  // cached by shared proxies or the browser disk cache. Routes that deliberately serve
  // cacheable public data (e.g. leaderboard, docs) already pass their own Cache-Control in
  // init.headers, so headers.has() sees it here and this default is skipped for them.
  if (!headers.has('cache-control')) headers.set('Cache-Control', 'private, no-store');

  const payload: ApiSuccessPayload<T> = meta ? { data, meta } : { data };

  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}

export function apiErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');
  // Same fail-closed default as apiSuccessResponse() — error bodies can still carry
  // request-scoped details (requestId, fieldErrors) that must not be cached either.
  if (!headers.has('cache-control')) headers.set('Cache-Control', 'private, no-store');

  const errorObj: ApiErrorPayload['error'] = {
    code,
    message,
  };

  if (details !== undefined) {
    if (typeof details === 'object' && details !== null && !Array.isArray(details)) {
      const d = details as Record<string, unknown>;
      if ('fieldErrors' in d && d.fieldErrors) {
        errorObj.fieldErrors = d.fieldErrors as Record<string, string>;
      }
      if ('requestId' in d && typeof d.requestId === 'string') {
        errorObj.requestId = d.requestId;
      }
    }
    errorObj.details = details;
  }

  const payload: ApiErrorPayload = { error: errorObj };

  return new Response(JSON.stringify(payload), {
    ...init,
    status,
    headers,
  });
}
