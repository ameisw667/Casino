import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(() => 'user:player-1'),
  rateLimitHeaders: vi.fn(() => ({ 'X-RateLimit-Limit': '30' })),
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
  rateLimitHeaders: mocks.rateLimitHeaders,
}));
vi.mock('@/lib/casino/notifications', () => ({
  listNotifications: mocks.listNotifications,
  markNotificationRead: mocks.markNotificationRead,
  markAllNotificationsRead: mocks.markAllNotificationsRead,
}));
vi.mock('@/lib/casino/logger', () => ({ CasinoLogger: { error: mocks.error } }));

type RouteModule = { GET?: (request: Request) => Promise<Response>; POST?: (request: Request) => Promise<Response>; PATCH?: (request: Request, context: { params: Promise<{ id: string }> }) => Promise<Response> };

function authClient(user: { id: string } | null) {
  return { auth: { getUser: async () => ({ data: { user } }) } };
}

function request(method: string, path: string) {
  return new Request(`https://casino.test${path}`, {
    method,
    headers: { origin: 'https://casino.test' },
  });
}

async function loadRoutes() {
  return {
    list: (await import('@/app/api/notifications/route').catch(() => null)) as RouteModule | null,
    item: (await import('@/app/api/notifications/[id]/route').catch(() => null)) as RouteModule | null,
    all: (await import('@/app/api/notifications/read-all/route').catch(() => null)) as RouteModule | null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createClient.mockResolvedValue(authClient({ id: 'player-1' }));
  mocks.validateMutationOrigin.mockReturnValue(null);
  mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 30, remaining: 29, reset: Date.now() + 60_000 });
});

describe('notification routes', () => {
  it('rejects an unauthenticated inbox read', async () => {
    const { list } = await loadRoutes();
    expect(list?.GET).toBeTypeOf('function');
    if (!list?.GET) return;
    mocks.createClient.mockResolvedValue(authClient(null));

    const response = await list.GET(request('GET', '/api/notifications'));

    expect(response.status).toBe(401);
    expect(mocks.listNotifications).not.toHaveBeenCalled();
  });

  it('returns only the authenticated user inbox with private no-store headers', async () => {
    const { list } = await loadRoutes();
    expect(list?.GET).toBeTypeOf('function');
    if (!list?.GET) return;
    mocks.listNotifications.mockResolvedValue({ notifications: [], unreadCount: 2 });

    const response = await list.GET(request('GET', '/api/notifications'));

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ notifications: [], unreadCount: 2 });
    expect(mocks.listNotifications).toHaveBeenCalledWith('player-1');
  });

  it('rejects cross-site single-read mutations before authentication or service access', async () => {
    const { item } = await loadRoutes();
    expect(item?.PATCH).toBeTypeOf('function');
    if (!item?.PATCH) return;
    mocks.validateMutationOrigin.mockReturnValue(new Response('Cross-site mutation rejected', { status: 403 }));

    const response = await item.PATCH(request('PATCH', '/api/notifications/11111111-1111-4111-8111-111111111111'), {
      params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }),
    });

    expect(response.status).toBe(403);
    expect(mocks.markNotificationRead).not.toHaveBeenCalled();
  });

  it('returns not found when an authenticated user attempts to read another users notification', async () => {
    const { item } = await loadRoutes();
    expect(item?.PATCH).toBeTypeOf('function');
    if (!item?.PATCH) return;
    mocks.markNotificationRead.mockResolvedValue(null);

    const response = await item.PATCH(request('PATCH', '/api/notifications/11111111-1111-4111-8111-111111111111'), {
      params: Promise.resolve({ id: '11111111-1111-4111-8111-111111111111' }),
    });

    expect(response.status).toBe(404);
    expect(mocks.markNotificationRead).toHaveBeenCalledWith('player-1', '11111111-1111-4111-8111-111111111111');
  });

  it('marks all unread notifications for the authenticated user only', async () => {
    const { all } = await loadRoutes();
    expect(all?.POST).toBeTypeOf('function');
    if (!all?.POST) return;
    mocks.markAllNotificationsRead.mockResolvedValue(3);

    const response = await all.POST(request('POST', '/api/notifications/read-all'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ markedRead: 3 });
    expect(mocks.markAllNotificationsRead).toHaveBeenCalledWith('player-1');
  });
});