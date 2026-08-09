import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminEmail } from '@/lib/security/admin';
import { CasinoLogger } from '@/lib/casino/logger';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  validateMutationOrigin,
} from '@/lib/security/request-security';

const USER_LIST_LIMIT = 200;

interface AdminUserRow {
  id: string;
  username: string;
  email: string | null;
  balance: number;
  xp: number;
  level: number;
  rank: string;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-users-read',
      30,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('users')
      .select('id, username, email, balance, xp, level, rank, created_at')
      .order('balance', { ascending: false })
      .limit(USER_LIST_LIMIT);

    if (error) {
      CasinoLogger.error('API/Admin/Users', 'User list load failed closed', error);
      return NextResponse.json({ error: 'User list unavailable' }, { status: 503 });
    }

    const users = (data ?? []) as AdminUserRow[];
    const totals = users.reduce(
      (acc, u) => ({ balance: acc.balance + Number(u.balance), xp: acc.xp + Number(u.xp) }),
      { balance: 0, xp: 0 },
    );

    return NextResponse.json(
      {
        users,
        meta: {
          count: users.length,
          truncated: users.length === USER_LIST_LIMIT,
          totalBalance: totals.balance,
          totalXp: totals.xp,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Admin/Users', 'Admin user list failed closed', error);
    return NextResponse.json({ error: 'User list unavailable' }, { status: 503 });
  }
}

const adminUpdateUserSchema = z.object({
  targetUserId: z.string().min(1),
  balance: z.number().finite().nonnegative().optional(),
  xp: z.number().finite().nonnegative().optional(),
  level: z.number().int().positive().optional(),
  rank: z.string().min(1).optional(),
});

export async function PATCH(request: Request) {
  const originFailure = validateMutationOrigin(request);
  if (originFailure) return originFailure;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    if (!isAdminEmail(user.email)) return new NextResponse('Forbidden', { status: 403 });

    const rate = await enforceRateLimit(
      getClientIdentifier(request, user.id),
      'admin-users-write',
      10,
      60,
    );
    if (!rate.success) {
      return NextResponse.json(
        { error: rate.unavailable ? 'Rate limit service unavailable' : 'Too Many Requests' },
        { status: rate.unavailable ? 503 : 429, headers: rateLimitHeaders(rate) },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = adminUpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    const { targetUserId, ...updates } = parsed.data;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('users')
      .update(updates)
      .eq('id', targetUserId)
      .select('id, username, email, balance, xp, level, rank, created_at')
      .single();

    if (error || !data) {
      CasinoLogger.error('API/Admin/Users', `Admin user update failed for ${targetUserId}`, error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    if (updates.balance !== undefined) {
      try {
        await admin.from('wallet_transactions').insert({
          user_id: targetUserId,
          game: 'admin',
          type: 'admin_adjust',
          amount: Number(updates.balance),
          balance_after: Number(data.balance),
          metadata: { admin_email: user.email, updated_fields: Object.keys(updates) },
        });
      } catch (err) {
        CasinoLogger.error('API/Admin/Users', 'Failed to insert admin adjustment audit log', err);
      }
    }

    CasinoLogger.info(
      'API/Admin/Users',
      `Admin ${user.email} updated user ${targetUserId}`,
      updates,
    );

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    CasinoLogger.error('API/Admin/Users', 'Admin user update unexpected failure', error);
    return NextResponse.json({ error: 'User update unavailable' }, { status: 503 });
  }
}
