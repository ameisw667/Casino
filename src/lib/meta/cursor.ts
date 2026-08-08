import { z } from 'zod';
import { LeaderboardMetricSchema, LeaderboardPeriodSchema, MetricDecimalSchema } from './contracts';

const HistoryCursorPayloadSchema = z.object({
  v: z.literal(1),
  kind: z.literal('history'),
  settledAt: z.string().datetime({ offset: true }),
  id: z.string().uuid(),
});

const LeaderboardCursorPayloadSchema = z.object({
  v: z.literal(2),
  kind: z.literal('leaderboard'),
  period: LeaderboardPeriodSchema,
  metric: LeaderboardMetricSchema,
  asOf: z.string().datetime({ offset: true }),
  periodStart: z.string().datetime({ offset: true }).nullable(),
  value: MetricDecimalSchema,
  playerKey: z.string().regex(/^[a-f0-9]{64}$/),
}).superRefine((value, context) => {
  const allTimeHasStart = value.period === 'all-time' && value.periodStart !== null;
  const boundedHasNoStart = value.period !== 'all-time' && value.periodStart === null;
  const inverted = value.periodStart !== null && Date.parse(value.periodStart) >= Date.parse(value.asOf);
  if (allTimeHasStart || boundedHasNoStart || inverted) {
    context.addIssue({ code: 'custom', message: 'Invalid leaderboard snapshot', path: ['periodStart'] });
  }
});

const AdminUsersCursorPayloadSchema = z.object({
  v: z.literal(1),
  kind: z.literal('admin-users'),
  updatedAt: z.string().datetime({ offset: true }),
  id: z.string().min(1).max(255).regex(/^[A-Za-z0-9_-]+$/),
});

export type HistoryCursor = Omit<z.infer<typeof HistoryCursorPayloadSchema>, 'v' | 'kind'>;
export type LeaderboardCursor = Omit<z.infer<typeof LeaderboardCursorPayloadSchema>, 'v' | 'kind'>;
export type AdminUsersCursor = Omit<z.infer<typeof AdminUsersCursorPayloadSchema>, 'v' | 'kind'>;

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function decode(value: string): unknown {
  if (!value || value.length > 2048 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('Invalid cursor');
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Invalid cursor');
  }
}

export function encodeHistoryCursor(cursor: HistoryCursor): string {
  return encode(HistoryCursorPayloadSchema.parse({ v: 1, kind: 'history', ...cursor }));
}

export function decodeHistoryCursor(value: string): HistoryCursor {
  const parsed = HistoryCursorPayloadSchema.safeParse(decode(value));
  if (!parsed.success) throw new Error('Invalid cursor');
  return { settledAt: parsed.data.settledAt, id: parsed.data.id };
}

export function encodeLeaderboardCursor(cursor: LeaderboardCursor): string {
  return encode(LeaderboardCursorPayloadSchema.parse({ v: 2, kind: 'leaderboard', ...cursor }));
}

export function decodeLeaderboardCursor(
  value: string,
  expected?: { period: z.infer<typeof LeaderboardPeriodSchema>; metric: z.infer<typeof LeaderboardMetricSchema> },
): LeaderboardCursor {
  const parsed = LeaderboardCursorPayloadSchema.safeParse(decode(value));
  if (!parsed.success) throw new Error('Invalid cursor');
  if (expected && (parsed.data.period !== expected.period || parsed.data.metric !== expected.metric)) {
    throw new Error('Invalid cursor');
  }
  const { period, metric, asOf, periodStart, value: metricValue, playerKey } = parsed.data;
  return { period, metric, asOf, periodStart, value: metricValue, playerKey };
}

export function encodeAdminUsersCursor(cursor: AdminUsersCursor): string {
  return encode(AdminUsersCursorPayloadSchema.parse({ v: 1, kind: 'admin-users', ...cursor }));
}

export function decodeAdminUsersCursor(value: string): AdminUsersCursor {
  const parsed = AdminUsersCursorPayloadSchema.safeParse(decode(value));
  if (!parsed.success) throw new Error('Invalid cursor');
  return { updatedAt: parsed.data.updatedAt, id: parsed.data.id };
}