import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  isAdminEmail: vi.fn(),
  validateMutationOrigin: vi.fn(),
  trigger: vi.fn(),
  createPublicToken: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => ({ auth: { getUser: mocks.getUser } })),
}));
vi.mock('@/lib/security/admin', () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock('@/lib/security/request-security', () => ({
  validateMutationOrigin: mocks.validateMutationOrigin,
}));
vi.mock('@trigger.dev/sdk', () => ({
  tasks: { trigger: mocks.trigger },
  auth: { createPublicToken: mocks.createPublicToken },
  logger: { log: vi.fn(), error: vi.fn() },
  task: vi.fn((opts) => opts),
  schemaTask: vi.fn((opts) => opts),
  schedules: { task: vi.fn((opts) => opts) },
  idempotencyKeys: { create: vi.fn(async (k) => k) },
  metadata: { set: vi.fn() },
}));

import { POST } from '@/app/api/admin/digest-preview/start/route';

function createPostRequest(): Request {
  return new Request('https://casino.example/api/admin/digest-preview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/admin/digest-preview/start', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMutationOrigin.mockReturnValue(null);
    process.env.TRIGGER_SECRET_KEY = 'test_secret_key';
  });

  it('rejects forbidden mutation origins', async () => {
    mocks.validateMutationOrigin.mockReturnValue(
      new Response(JSON.stringify({ error: 'Forbidden origin' }), { status: 403 }),
    );
    const res = await POST(createPostRequest());
    expect(res.status).toBe(403);
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('No session') });
    const res = await POST(createPostRequest());
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@example.com' } },
      error: null,
    });
    mocks.isAdminEmail.mockReturnValue(false);
    const res = await POST(createPostRequest());
    expect(res.status).toBe(403);
  });

  it('returns 503 if TRIGGER_SECRET_KEY is missing', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin@example.com' } },
      error: null,
    });
    mocks.isAdminEmail.mockReturnValue(true);
    delete process.env.TRIGGER_SECRET_KEY;

    const res = await POST(createPostRequest());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.message).toContain('TRIGGER_SECRET_KEY');
  });

  it('triggers preview run and generates scoped public access token on admin request', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin@example.com' } },
      error: null,
    });
    mocks.isAdminEmail.mockReturnValue(true);
    mocks.trigger.mockResolvedValue({ id: 'run_preview_123' });
    mocks.createPublicToken.mockResolvedValue('pk_test_token_abc');

    const res = await POST(createPostRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.success).toBe(true);
    expect(body.data.runId).toBe('run_preview_123');
    expect(body.data.publicAccessToken).toBe('pk_test_token_abc');

    expect(mocks.trigger).toHaveBeenCalledWith('digest-preview', {});
    expect(mocks.createPublicToken).toHaveBeenCalledWith({
      scopes: {
        read: {
          runs: ['run_preview_123'],
        },
      },
    });
  });
});
