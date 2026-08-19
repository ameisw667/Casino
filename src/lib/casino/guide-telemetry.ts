import 'server-only';

import { createHmac } from 'node:crypto';
import { createAdminClient } from '@/utils/supabase/admin';
import { CasinoLogger } from '@/lib/casino/logger';

const TELEMETRY_WRITE_TIMEOUT_MS = 250;
const MAX_LATENCY_MS = 120_000;
const MAX_MODEL_LENGTH = 128;
const MIN_HMAC_SECRET_BYTES = 32;
const MICRO_USD_PER_USD = 1_000_000;
const ONE_MILLION_TOKENS = 1_000_000;

export type GuideTelemetryOutcome =
  'success' | 'configuration' | 'quota' | 'upstream' | 'invalid_response' | 'rate_limited';

export type GuideUsage = {
  inputTokens: number;
  cachedInputTokens: number | null;
  outputTokens: number;
  reasoningTokens: number | null;
  totalTokens: number;
};

type GuidePricing = {
  version: string;
  inputMicrousdPerMillion: number;
  cachedInputMicrousdPerMillion: number;
  outputMicrousdPerMillion: number;
};

const GUIDE_PRICING: Record<string, GuidePricing> = {
  // Verified against https://developers.openai.com/api/docs/models/gpt-4o-mini on 2026-08-17.
  'gpt-4o-mini': {
    version: 'gpt-4o-mini-2026-08-17',
    inputMicrousdPerMillion: 150_000,
    cachedInputMicrousdPerMillion: 75_000,
    outputMicrousdPerMillion: 600_000,
  },
  // Verified against https://developers.openai.com/api/docs/models/gpt-5-mini on 2026-08-12.
  'gpt-5-mini': {
    version: 'gpt-5-mini-2026-08-12',
    inputMicrousdPerMillion: 250_000,
    cachedInputMicrousdPerMillion: 25_000,
    outputMicrousdPerMillion: 2_000_000,
  },
};

function isSafeNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function optionalToken(value: unknown): number | null | undefined {
  return value === undefined || value === null
    ? null
    : isSafeNonNegativeInteger(value)
      ? value
      : undefined;
}

export function normalizeGuideUsage(value: unknown): GuideUsage | null {
  if (typeof value !== 'object' || value === null) return null;
  const usage = value as Record<string, unknown>;
  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  const totalTokens = usage.total_tokens;
  const inputDetails = usage.input_tokens_details;
  const outputDetails = usage.output_tokens_details;
  const cachedInputTokens = optionalToken(
    typeof inputDetails === 'object' && inputDetails !== null
      ? (inputDetails as Record<string, unknown>).cached_tokens
      : undefined,
  );
  const reasoningTokens = optionalToken(
    typeof outputDetails === 'object' && outputDetails !== null
      ? (outputDetails as Record<string, unknown>).reasoning_tokens
      : undefined,
  );

  if (
    !isSafeNonNegativeInteger(inputTokens) ||
    !isSafeNonNegativeInteger(outputTokens) ||
    !isSafeNonNegativeInteger(totalTokens) ||
    cachedInputTokens === undefined ||
    reasoningTokens === undefined ||
    totalTokens < inputTokens + outputTokens
  ) {
    return null;
  }

  return { inputTokens, cachedInputTokens, outputTokens, reasoningTokens, totalTokens };
}

function readHmacConfiguration(): { secret: string; version: number } | null {
  const secret = process.env.GUIDE_TELEMETRY_HMAC_SECRET?.trim();
  const version = Number(process.env.GUIDE_TELEMETRY_HMAC_VERSION);
  if (
    !secret ||
    Buffer.byteLength(secret, 'utf8') < MIN_HMAC_SECRET_BYTES ||
    !Number.isSafeInteger(version) ||
    version < 1
  )
    return null;
  return { secret, version };
}

export function createGuideActorHash(actorId: string): { hash: string; version: number } | null {
  const config = readHmacConfiguration();
  if (!config || !actorId) return null;
  return {
    hash: createHmac('sha256', config.secret).update(actorId, 'utf8').digest('hex'),
    version: config.version,
  };
}

function estimatePartMicrousd(tokens: number, rateMicrousdPerMillion: number): number {
  return Math.floor(
    (tokens * rateMicrousdPerMillion + ONE_MILLION_TOKENS / 2) / ONE_MILLION_TOKENS,
  );
}

export function estimateGuideCostMicrousd(
  model: string | null,
  usage: GuideUsage | null,
): { cost: number; pricingVersion: string } | null {
  if (!model || !usage) return null;
  const pricing = GUIDE_PRICING[model];
  if (!pricing) return null;
  const cachedInputTokens = usage.cachedInputTokens ?? 0;
  if (cachedInputTokens > usage.inputTokens) return null;
  const uncachedInputTokens = usage.inputTokens - cachedInputTokens;
  const cost =
    estimatePartMicrousd(uncachedInputTokens, pricing.inputMicrousdPerMillion) +
    estimatePartMicrousd(cachedInputTokens, pricing.cachedInputMicrousdPerMillion) +
    estimatePartMicrousd(usage.outputTokens, pricing.outputMicrousdPerMillion);
  return Number.isSafeInteger(cost) ? { cost, pricingVersion: pricing.version } : null;
}

async function withTelemetryTimeout<T extends { error: unknown }>(
  write: PromiseLike<T>,
): Promise<T | { error: Error }> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      write,
      new Promise<{ error: Error }>((resolve) => {
        timeoutId = setTimeout(
          () => resolve({ error: new Error('Guide telemetry write timed out') }),
          TELEMETRY_WRITE_TIMEOUT_MS,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export async function recordGuideTelemetry(input: {
  actorId: string;
  outcome: GuideTelemetryOutcome;
  latencyMs: number;
  model: string | null;
  usage: GuideUsage | null;
  rateLimitWindowStartedAt?: Date;
}): Promise<'recorded' | 'skipped'> {
  const actor = createGuideActorHash(input.actorId);
  if (!actor || !isSafeNonNegativeInteger(input.latencyMs) || input.latencyMs > MAX_LATENCY_MS) {
    return 'skipped';
  }
  if (input.model !== null && (input.model.length === 0 || input.model.length > MAX_MODEL_LENGTH))
    return 'skipped';
  if (input.outcome === 'rate_limited' && !input.rateLimitWindowStartedAt) return 'skipped';
  if (input.outcome !== 'rate_limited' && input.rateLimitWindowStartedAt) return 'skipped';

  const usage = input.outcome === 'success' ? input.usage : null;
  const cost = estimateGuideCostMicrousd(input.model, usage);
  const payload = {
    actor_hash: actor.hash,
    actor_hash_version: actor.version,
    outcome: input.outcome,
    latency_ms: input.latencyMs,
    model: input.model,
    input_tokens: usage?.inputTokens ?? null,
    cached_input_tokens: usage?.cachedInputTokens ?? null,
    output_tokens: usage?.outputTokens ?? null,
    reasoning_tokens: usage?.reasoningTokens ?? null,
    total_tokens: usage?.totalTokens ?? null,
    estimated_cost_microusd: cost?.cost ?? null,
    pricing_version: cost?.pricingVersion ?? null,
    rate_limit_window_started_at: input.rateLimitWindowStartedAt?.toISOString() ?? null,
  };

  try {
    const write = createAdminClient().from('guide_telemetry_events').upsert(payload, {
      onConflict: 'actor_hash,actor_hash_version,outcome,rate_limit_window_started_at',
      ignoreDuplicates: true,
    });
    const result = await withTelemetryTimeout(write);
    if (result.error) throw result.error;
    return 'recorded';
  } catch {
    CasinoLogger.error('GuideTelemetry', 'Guide telemetry write failed');
    return 'skipped';
  }
}

export const GUIDE_TELEMETRY_COST_UNIT = MICRO_USD_PER_USD;
