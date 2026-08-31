/**
 * Stufe R / R13 — Royale Guide Nutzungsmessung (2.7-Telemetrie neu ziehen)
 * Rein lesend: ruft die service-role-only RPC get_guide_observability() ab und
 * druckt die 24h-/7d-Aggregate. Keine Rohzeilen, keine Gesprächsinhalte, keine
 * User-IDs — die RPC selbst liefert ausschließlich Aggregate (siehe
 * docs/architecture/05_2.7_ROYALE_GUIDE_OBSERVABILITY.md).
 * Run: npx tsx scripts/guide-telemetry-report.ts [--json]
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

type GuideWindowStats = {
  requests: number;
  uniqueActors: number;
  successRate: number | null;
  errorRate: number | null;
  outcomes: Record<string, number>;
  averageLatencyMs: number | null;
  p95LatencyMs: number | null;
  tokens: { input: number; cachedInput: number; output: number; reasoning: number; total: number };
  estimatedCostMicrousd: number | null;
};

type GuideObservability = {
  status: string;
  asOf: string;
  last24h: GuideWindowStats;
  last7d: GuideWindowStats;
  pricingVersions: string[];
};

function formatWindow(label: string, w: GuideWindowStats): string {
  const successRate = w.successRate === null ? 'n/a' : `${w.successRate.toFixed(1)}%`;
  const avgLatency = w.averageLatencyMs === null ? 'n/a' : `${Math.round(w.averageLatencyMs)}ms`;
  const p95Latency = w.p95LatencyMs === null ? 'n/a' : `${Math.round(w.p95LatencyMs)}ms`;
  const cost =
    w.estimatedCostMicrousd === null
      ? 'n/a'
      : `$${(w.estimatedCostMicrousd / 1_000_000).toFixed(4)}`;
  const outcomeSummary =
    Object.entries(w.outcomes)
      .filter(([, count]) => count > 0)
      .map(([outcome, count]) => `${outcome}=${count}`)
      .join(', ') || 'keine';

  return (
    `${label}: requests=${w.requests} uniqueActors=${w.uniqueActors} successRate=${successRate} ` +
    `avgLatency=${avgLatency} p95Latency=${p95Latency} totalTokens=${w.tokens.total} ` +
    `estimatedCost=${cost} outcomes=[${outcomeSummary}]`
  );
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const asOf = new Date().toISOString();
  const { data, error } = await supabase.rpc('get_guide_observability', { p_as_of: asOf });

  if (error) {
    throw new Error(`get_guide_observability failed: ${error.message}`);
  }
  if (!data) {
    console.log('Keine Daten — RPC/Migration nicht verfügbar oder guide_telemetry_events leer.');
    return;
  }

  const observability = data as GuideObservability;

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(observability, null, 2));
    return;
  }

  console.log('=== Stufe R / R13 — Royale Guide Telemetrie (2.7) ===');
  console.log(`asOf: ${observability.asOf}`);
  console.log(`pricingVersions: ${observability.pricingVersions.join(', ') || 'keine'}`);
  console.log(formatWindow('last24h', observability.last24h));
  console.log(formatWindow('last7d ', observability.last7d));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
