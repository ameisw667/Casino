// worldmap/04_08_secret_rotation.md L4 — informational only, never a CI blocker (rotation itself
// is always K5, see xx_sop/14_secret_rotation.md). Mirrors the turnus classes from that SOP
// (Abschnitt 1) as a plain map rather than parsing its markdown table, so this stays testable and
// doesn't silently drift if the SOP prose changes — the SOP is still the source of truth for the
// *rule*, this map is only the machine-readable mirror of the days-per-class numbers.
export const TURNUS_DAYS: Record<string, number> = {
  SUPABASE_SERVICE_ROLE_KEY: 90,
  UPSTASH_REDIS_REST_TOKEN: 180,
  SENTRY_AUTH_TOKEN: 180,
  TRIGGER_SECRET_KEY: 180,
  OPENAI_API_KEY: 180,
  POSTHOG_PERSONAL_API_KEY: 180,
  CRON_ALERT_SECRET: 365,
  WALLET_EVENT_SECRET: 365,
  BIG_WIN_EVENT_SECRET: 365,
  FRAUD_FINGERPRINT_SECRET: 365,
  GUIDE_TELEMETRY_HMAC_SECRET: 365,
  TELEGRAM_WEBHOOK_SECRET: 365,
  POSTHOG_DISTINCT_ID_HMAC_SECRET: 365,
};

export interface RotationLogEntry {
  secret: string;
  lastRotated: string | null;
  reason: string;
}

export function parseRotationLog(content: string): RotationLogEntry[] {
  const entries: RotationLogEntry[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    const cells = trimmed
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 2) continue;
    const [secret, date] = cells;
    if (secret === 'Secret' || /^:?-+:?$/.test(secret)) continue; // header/separator row
    if (secret.startsWith('_(') || secret === '—') continue; // placeholder "no entries yet" row
    entries.push({
      secret,
      lastRotated: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
      reason: cells[2] ?? '',
    });
  }
  return entries;
}

export interface OverdueResult {
  secret: string;
  status: 'ok' | 'overdue' | 'never-rotated';
  daysSinceRotation: number | null;
  turnusDays: number;
}

export function computeOverdue(
  entries: RotationLogEntry[],
  turnusDays: Record<string, number>,
  today: Date,
): OverdueResult[] {
  const results: OverdueResult[] = [];
  const byName = new Map(entries.map((e) => [e.secret, e]));

  for (const [secret, turnus] of Object.entries(turnusDays)) {
    const entry = byName.get(secret);
    if (!entry || !entry.lastRotated) {
      results.push({ secret, status: 'never-rotated', daysSinceRotation: null, turnusDays: turnus });
      continue;
    }
    const last = new Date(entry.lastRotated);
    const daysSince = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    results.push({
      secret,
      status: daysSince > turnus ? 'overdue' : 'ok',
      daysSinceRotation: daysSince,
      turnusDays: turnus,
    });
  }
  return results;
}
