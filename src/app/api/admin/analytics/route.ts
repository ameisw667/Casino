import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildAdminAnalytics } from '@/lib/admin/analytics';
import {
  parseGuideObservability,
  unavailableGuideObservability,
} from '@/lib/admin/guide-observability';
import { CasinoLogger } from '@/lib/casino/logger';
import { isAdminEmail } from '@/lib/security/admin';
import {
  enforceRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/security/request-security';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';

const timestampSchema = z.string().datetime({ offset: true });

const usersSchema = z.array(
  z.object({ id: z.string().min(1), created_at: timestampSchema, xp: z.coerce.number().finite() }),
);
const walletTransactionsSchema = z.array(
  z.object({
    user_id: z.string().min(1),
    type: z.string(),
    created_at: timestampSchema,
    metadata: z.unknown(),
  }),
);
const gameRoundsSchema = z.array(
  z.object({
    user_id: z.string().min(1),
    status: z.string(),
    bet_amount: z.coerce.number().positive(),
    updated_at: timestampSchema,
    state: z.unknown(),
  }),
);
const settledWalletResultSchema = z.object({
  response: z.object({
    result: z.object({
      amount: z.coerce.number().positive(),
      payout: z.coerce.number().nonnegative(),
    }),
  }),
});
const settledRoundResultSchema = z.object({
  result: z.object({ payout: z.coerce.number().nonnegative() }),
});
const vipTiersSchema = z.array(
  z.object({
    name: z.string().min(1),
    min_xp: z.coerce.number().finite(),
    is_active: z.boolean().nullable().optional(),
  }),
);

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
      'admin-analytics-read',
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
    const asOf = new Date().toISOString();
    const [usersResult, walletResult, roundsResult, vipResult, guideResult] = await Promise.all([
      admin.from('users').select('id, created_at, xp'),
      admin.from('wallet_transactions').select('user_id, type, created_at, metadata'),
      admin.from('game_rounds').select('user_id, status, bet_amount, updated_at, state'),
      admin.from('vip_tiers').select('name, min_xp, is_active'),
      Promise.resolve(admin.rpc('get_guide_observability', { p_as_of: asOf })).catch(() => ({
        data: null,
        error: true,
      })),
    ]);
    if (usersResult.error || walletResult.error || roundsResult.error || vipResult.error) {
      CasinoLogger.error('API/Admin/Analytics', 'Analytics data load failed closed', {
        users: usersResult.error,
        wallet: walletResult.error,
        rounds: roundsResult.error,
        vip: vipResult.error,
      });
      return NextResponse.json({ error: 'Analytics data unavailable' }, { status: 503 });
    }

    const users = usersSchema.parse(usersResult.data ?? []);
    const walletTransactions = walletTransactionsSchema.parse(walletResult.data ?? []);
    const gameRounds = gameRoundsSchema.parse(roundsResult.data ?? []);
    const vipTiers = vipTiersSchema
      .parse(vipResult.data ?? [])
      .filter((tier) => tier.is_active !== false);
    let guide = unavailableGuideObservability();
    if (!guideResult.error) {
      try {
        guide = parseGuideObservability(guideResult.data);
      } catch {
        CasinoLogger.error('API/Admin/Analytics', 'Guide observability data unavailable');
      }
    } else {
      CasinoLogger.error('API/Admin/Analytics', 'Guide observability data unavailable');
    }

    const walletBets = walletTransactions.flatMap((transaction) => {
      if (transaction.type !== 'bet_settled') return [];
      const parsedMetadata = settledWalletResultSchema.safeParse(transaction.metadata);
      if (!parsedMetadata.success) return [];
      const result = parsedMetadata.data.response.result;
      return [
        {
          userId: transaction.user_id,
          occurredAt: transaction.created_at,
          wager: result.amount,
          payout: result.payout,
        },
      ];
    });
    const roundBets = gameRounds.flatMap((round) => {
      if (round.status !== 'SETTLED') return [];
      const parsedState = settledRoundResultSchema.safeParse(round.state);
      if (!parsedState.success) return [];
      return [
        {
          userId: round.user_id,
          occurredAt: round.updated_at,
          wager: round.bet_amount,
          payout: parsedState.data.result.payout,
        },
      ];
    });

    return NextResponse.json(
      buildAdminAnalytics({
        users: users.map((entry) => ({ id: entry.id, createdAt: entry.created_at, xp: entry.xp })),
        bets: [...walletBets, ...roundBets],
        vipTiers: vipTiers.map((entry) => ({ name: entry.name, minXp: entry.min_xp })),
        guide,
      }),
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    CasinoLogger.error('API/Admin/Analytics', 'Admin analytics unexpected failure', error);
    return NextResponse.json({ error: 'Analytics data unavailable' }, { status: 503 });
  }
}
