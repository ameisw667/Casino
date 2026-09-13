import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  recordLoginAuditEntry: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({
  createClient: mocks.createClient,
}));
vi.mock('@/lib/security/login-audit', async () => ({
  authMethodSchema: (await import('@/lib/security/login-audit-types')).authMethodSchema,
  loginStatusSchema: (await import('@/lib/security/login-audit-types')).loginStatusSchema,
  recordLoginAuditEntry: mocks.recordLoginAuditEntry,
}));

import { POST } from '@/app/api/user/login-history/route';
import { resetLocalRateLimitsForTests } from '@/lib/security/request-security';

function loginHistoryRequest(origin?: string): Request {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (origin) headers.set('origin', origin);
  return new Request('https://casino.test/api/user/login-history', {
    method: 'POST',
    headers,
    body: JSON.stringify({ authMethod: 'google', status: 'success' }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetLocalRateLimitsForTests();
  mocks.createClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: 'player-1' } } }) },
    from: vi.fn(),
  });
  mocks.recordLoginAuditEntry.mockResolvedValue(true);
});

describe('login history route', () => {
  it('records an audit entry for a same-origin POST', async () => {
    const response = await POST(loginHistoryRequest('https://casino.test'));

    expect(response.status).toBe(201);
    expect(mocks.recordLoginAuditEntry).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'player-1', authMethod: 'google', status: 'success' }),
    );
  });

  it('rejects a cross-origin POST before recording anything (T_SECURITY_HARDENING/04 L1)', async () => {
    const response = await POST(loginHistoryRequest('https://attacker.example'));

    expect(response.status).toBe(403);
    expect(mocks.recordLoginAuditEntry).not.toHaveBeenCalled();
  });

  it('rejects a POST without any Origin header (fail-closed)', async () => {
    const response = await POST(loginHistoryRequest());

    expect(response.status).toBe(403);
    expect(mocks.recordLoginAuditEntry).not.toHaveBeenCalled();
  });
});
