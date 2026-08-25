export type ApiSuccessPayload<T> = { data: T };

export function apiSuccessResponse<T>(data: T, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) headers.set('content-type', 'application/json');

  return new Response(JSON.stringify({ data } satisfies ApiSuccessPayload<T>), {
    ...init,
    headers,
  });
}
