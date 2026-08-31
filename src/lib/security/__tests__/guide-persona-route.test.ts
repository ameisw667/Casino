import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock('@/utils/supabase/server', () => ({ createClient: mocks.createClient }));

import { GET, PATCH } from '@/app/api/casino/guide-persona/route';

type QueryFixture = {
  from: ReturnType<typeof vi.fn>;
  selectEq: ReturnType<typeof vi.fn>;
  updateEq: ReturnType<typeof vi.fn>;
};

function authenticatedClient(persona = 'math_strategist'): QueryFixture {
  const selectEq = vi.fn(() => ({
    single: vi.fn().mockResolvedValue({ data: { guide_persona: persona }, error: null }),
  }));
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn(() => ({
    select: vi.fn(() => ({ eq: selectEq })),
    update: vi.fn(() => ({ eq: updateEq })),
  }));

  mocks.createClient.mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: 'player-1' } } }) },
    from,
  });

  return { from, selectEq, updateEq };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('guide persona route', () => {
  it('reads the persona from the authenticated users row', async () => {
    const query = authenticatedClient('high_roller');

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ persona: 'high_roller' });
    expect(query.from).toHaveBeenCalledWith('users');
    expect(query.selectEq).toHaveBeenCalledWith('id', 'player-1');
  });

  it('updates only the authenticated users row', async () => {
    const query = authenticatedClient();

    const response = await PATCH(
      new Request('https://casino.test/api/casino/guide-persona', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ persona: 'casual_buddy' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ persona: 'casual_buddy' });
    expect(query.from).toHaveBeenCalledWith('users');
    expect(query.updateEq).toHaveBeenCalledWith('id', 'player-1');
  });
});
