import {
  NodeTracerProvider,
  BatchSpanProcessor,
  AlwaysOnSampler,
} from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import type { Tracer } from '@opentelemetry/api';

// worldmap/05_Observability_und_Lasttest.md (P28/1.16, Option 2): @sentry/nextjs already
// registers its own global OpenTelemetry TracerProvider — a second global registration
// (e.g. via `provider.register()` or `registerOTel()`) would be silently dropped by the
// OTel API, and spans created through `trace.getTracer()` would then flow through
// Sentry's provider instead of this one. This provider is therefore never registered
// globally; callers must import `betPathTracer` directly instead of using the global API.
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces';

// Opt-in via OTEL_ENABLED so a normal `npm run dev` without the local Jaeger stack
// (docker/observability/docker-compose.yml) running never attempts an export or logs
// connection errors — spans are still created (cheap), just not exported anywhere.
const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'casino-bet-path' }),
  spanProcessors:
    process.env.OTEL_ENABLED === 'true'
      ? [new BatchSpanProcessor(new OTLPTraceExporter({ url: otlpEndpoint }))]
      : [],
  // @sentry/nextjs runs its own OTel TracerProvider (tracesSampleRate: 0) and leaves a
  // non-recording parent SpanContext active in the ambient OTel Context for every
  // request. The default ParentBasedSampler would inherit that "don't record" decision
  // from Sentry's ambient parent even though this is a completely separate, unregistered
  // provider — confirmed while wiring this up ("Recording is off, propagating context in
  // a non-recording span" from Sentry's own spans upstream). AlwaysOnSampler makes this
  // tracer's recording decision fully independent of Sentry's.
  sampler: new AlwaysOnSampler(),
});

export const betPathTracer: Tracer = provider.getTracer('casino-bet-path');

/** Wraps one bet-path step in a span; always ends the span, even on throw. */
export async function withBetPathSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return betPathTracer.startActiveSpan(name, async (span) => {
    try {
      return await fn();
    } finally {
      span.end();
    }
  });
}

// BatchSpanProcessor's default timer-based flush (every 5s) is not reliable in Next.js's
// request-scoped execution model — the process/module context can move on before the
// timer fires, so spans get silently dropped (confirmed while wiring this up: manual
// requests never appeared in Jaeger until an explicit flush was added). Callers should
// invoke this once per request via `after()` (next/server), the same non-blocking,
// guaranteed-after-response pattern already used elsewhere in the bet path.
export async function flushBetPathTracer(): Promise<void> {
  if (process.env.OTEL_ENABLED === 'true') {
    await provider.forceFlush();
  }
}
