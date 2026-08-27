import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdminEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
  enforceRateLimit: vi.fn(),
  listAdminGuideDocuments: vi.fn(),
  upsertAdminGuideDocument: vi.fn(),
  deleteAdminGuideDocument: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  getClientIdentifier: vi.fn((_req: Request, userId?: string) => `user:${userId}`),
  rateLimitHeaders: vi.fn(() => ({})),
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@/lib/casino/logger', () => ({
  CasinoLogger: { error: vi.fn(), warn: vi.fn() },
}));
vi.mock('@/lib/casino/guide-knowledge/pgvector-store', () => ({
  listAdminGuideDocuments: mocks.listAdminGuideDocuments,
  upsertAdminGuideDocument: mocks.upsertAdminGuideDocument,
  deleteAdminGuideDocument: mocks.deleteAdminGuideDocument,
}));

import { GET, POST, DELETE } from '../route';

function adminUser() {
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@example.com' } } });
  mocks.isAdminEmail.mockReturnValue(true);
}

function jsonRequest(body: unknown, method: string, url = 'https://casino.example/api/admin/knowledge') {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json', origin: 'https://casino.example' },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(body),
  });
}

describe('/api/admin/knowledge auth & rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue({ success: true, limit: 30, remaining: 29, reset: 0 });
    mocks.listAdminGuideDocuments.mockResolvedValue([]);
    mocks.upsertAdminGuideDocument.mockResolvedValue({ success: true, id: 'guide-test' });
    mocks.deleteAdminGuideDocument.mockResolvedValue({ success: true });
  });

  it('GET returns 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await GET(jsonRequest(null, 'GET'));
    expect(res.status).toBe(401);
  });

  it('GET returns 403 for a non-admin user', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'nobody@example.com' } } });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await GET(jsonRequest(null, 'GET'));
    expect(res.status).toBe(403);
  });

  it('POST returns 429 when the write rate limit is exceeded', async () => {
    adminUser();
    mocks.enforceRateLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: 0 });
    const res = await POST(
      jsonRequest(
        { slug: 'x', topic: 'other', title: 'T', content: 'C', tags: [] },
        'POST',
      ),
    );
    expect(res.status).toBe(429);
    expect(mocks.upsertAdminGuideDocument).not.toHaveBeenCalled();
  });

  it('POST surfaces a 500 when the durable write actually fails', async () => {
    adminUser();
    mocks.upsertAdminGuideDocument.mockResolvedValue({ success: false, error: 'db unreachable' });
    const res = await POST(
      jsonRequest(
        { slug: 'x', topic: 'other', title: 'T', content: 'C', tags: [] },
        'POST',
      ),
    );
    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('db unreachable');
  });

  it('DELETE is rate-limited like POST (regression: DELETE previously had no rate limit at all)', async () => {
    adminUser();
    mocks.enforceRateLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: 0 });
    const res = await DELETE(
      jsonRequest(null, 'DELETE', 'https://casino.example/api/admin/knowledge?id=guide-test'),
    );
    expect(res.status).toBe(429);
    expect(mocks.deleteAdminGuideDocument).not.toHaveBeenCalled();
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(
      'user:admin-1',
      'admin-knowledge-write',
      10,
      60,
    );
  });

  it('DELETE returns 401 when unauthenticated', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    const res = await DELETE(
      jsonRequest(null, 'DELETE', 'https://casino.example/api/admin/knowledge?id=guide-test'),
    );
    expect(res.status).toBe(401);
  });

  it('DELETE surfaces a 500 when the durable delete actually fails', async () => {
    adminUser();
    mocks.deleteAdminGuideDocument.mockResolvedValue({ success: false, error: 'db unreachable' });
    const res = await DELETE(
      jsonRequest(null, 'DELETE', 'https://casino.example/api/admin/knowledge?id=guide-test'),
    );
    expect(res.status).toBe(500);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('db unreachable');
  });

  it('DELETE succeeds for an admin within the rate limit', async () => {
    adminUser();
    const res = await DELETE(
      jsonRequest(null, 'DELETE', 'https://casino.example/api/admin/knowledge?id=guide-test'),
    );
    expect(res.status).toBe(200);
    expect(mocks.deleteAdminGuideDocument).toHaveBeenCalledWith('guide-test');
  });
});
