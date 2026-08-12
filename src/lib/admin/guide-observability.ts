import { z } from 'zod';

const nonnegativeInteger = z.number().int().nonnegative();
const nullableInteger = nonnegativeInteger.nullable();
const nullableRate = z.number().min(0).max(100).nullable();

const guideOutcomesSchema = z
  .object({
    success: nonnegativeInteger,
    configuration: nonnegativeInteger,
    quota: nonnegativeInteger,
    upstream: nonnegativeInteger,
    invalid_response: nonnegativeInteger,
    rate_limited: nonnegativeInteger,
  })
  .strict();

const guideWindowSchema = z
  .object({
    requests: nonnegativeInteger,
    uniqueActors: nonnegativeInteger,
    successRate: nullableRate,
    errorRate: nullableRate,
    outcomes: guideOutcomesSchema,
    averageLatencyMs: nullableInteger,
    p95LatencyMs: nullableInteger,
    tokens: z
      .object({
        input: nullableInteger,
        cachedInput: nullableInteger,
        output: nullableInteger,
        reasoning: nullableInteger,
        total: nullableInteger,
      })
      .strict(),
    estimatedCostMicrousd: nullableInteger,
  })
  .strict();

const guideObservabilitySchema = z.discriminatedUnion('status', [
  z
    .object({
      status: z.literal('ready'),
      asOf: z.string().datetime({ offset: true }),
      last24h: guideWindowSchema,
      last7d: guideWindowSchema,
      pricingVersions: z.array(z.string().min(1).max(64)),
    })
    .strict(),
  z.object({ status: z.literal('unavailable') }).strict(),
]);

export type GuideObservability = z.infer<typeof guideObservabilitySchema>;

export function parseGuideObservability(value: unknown): GuideObservability {
  return guideObservabilitySchema.parse(value);
}

export function unavailableGuideObservability(): GuideObservability {
  return { status: 'unavailable' };
}
