// CSP violation report rate watch (T_SECURITY_HARDENING/06_csp_violation_reporting.md L5).
// Non-blocking observability job: queries the Sentry API for the last 48h of events tagged
// source:"csp-report" in daily buckets, compares the last 24h against the preceding 24h
// (rolling baseline, no persisted state needed) and writes a >3x escalation marker into the
// GitHub Actions job summary. Never fails the job — a missing secret or a Sentry outage must
// not turn an informational check into a build break.
//
// Thresholds: escalation requires current > 3 x previous AND previous >= MIN_BASELINE. A tiny
// baseline (e.g. 2 reports yesterday) must not trip on ordinary noise; instead, traffic that
// crosses MIN_BASELINE coming from below is reported as "new activity".

import { appendFileSync } from 'node:fs';

export const DEFAULT_API_BASE = 'https://de.sentry.io';
export const CSP_REPORT_TAG_QUERY = 'source:"csp-report"';
export const ESCALATION_MULTIPLIER = 3;
// Below this, a 24h bucket count is noise for a low-traffic diagnostics channel.
export const MIN_BASELINE_EVENTS = 10;

/**
 * Sums the per-bucket event counts out of Sentry's events_stats payload. Tolerant against both
 * the v2 `{data: [[{values: [{count}]}]]}` shape and a flat `{count}` per bucket — the exact
 * response shape could not be verified against the live API locally (no org token in CI), so the
 * parser accepts both instead of guessing wrong.
 */
export function parseEventsStats(payload) {
  const series = payload?.data;
  if (!Array.isArray(series)) return [];

  const buckets = [];
  for (const single of series) {
    if (!Array.isArray(single)) continue;
    single.forEach((bucket, index) => {
      const value = Array.isArray(bucket?.values)
        ? bucket.values.reduce((sum, entry) => sum + (Number(entry?.count) || 0), 0)
        : Number(bucket?.count) || 0;
      buckets[index] = (buckets[index] ?? 0) + value;
    });
  }
  return buckets;
}

export function evaluateCspReportRate({
  current,
  previous,
  multiplier = ESCALATION_MULTIPLIER,
  minBaseline = MIN_BASELINE_EVENTS,
}) {
  const ratio = previous > 0 ? Math.round((current / previous) * 100) / 100 : 0;

  if (previous >= minBaseline && current > multiplier * previous) {
    return { level: 'escalated', ratio, multiplier, minBaseline };
  }
  if (previous < minBaseline && current >= minBaseline) {
    return { level: 'new-activity', ratio, multiplier, minBaseline };
  }
  return { level: 'normal', ratio, multiplier, minBaseline };
}

export function renderJobSummary({ level, current, previous, ratio, scope }) {
  const marker =
    level === 'escalated' ? '**ESCALATION**' : level === 'new-activity' ? '**NEW ACTIVITY**' : 'ok';
  return [
    '## CSP violation report rate watch (informational, non-blocking)',
    '',
    `| Scope | Last 24h | Previous 24h | Ratio | Verdict |`,
    `| --- | --- | --- | --- | --- |`,
    `| ${scope} | ${current} | ${previous} | ${ratio} | ${marker} — ${level} |`,
    '',
    'Query: `source:"csp-report"` over the last 48h in daily buckets. Escalation only marks the',
    `summary — it never blocks a merge. Escalation threshold: > ${ESCALATION_MULTIPLIER}x baseline and baseline >= ${MIN_BASELINE_EVENTS}.`,
  ];
}

async function fetchCspEventCounts({ apiBase, org, project, token }) {
  const url =
    `${apiBase}/api/0/organizations/${encodeURIComponent(org)}/events_stats/?` +
    `interval=1d&statsPeriod=48h&yAxis=count()&query=${encodeURIComponent(CSP_REPORT_TAG_QUERY)}` +
    `&project=${encodeURIComponent(project)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Sentry API ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  return parseEventsStats(await response.json());
}

function appendSummary(lines) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}

export async function main({ env = process.env } = {}) {
  const org = env.SENTRY_ORG;
  const project = env.SENTRY_PROJECT;
  const token = env.SENTRY_AUTH_TOKEN;
  const apiBase = env.SENTRY_API_BASE ?? DEFAULT_API_BASE;
  const scope = `${org ?? 'unknown-org'}/${project ?? 'unknown-project'}`;

  // Local verification path: CSP_RATE_WATCH_SIMULATE carries a recorded events_stats payload so
  // the summary pipeline can be exercised without network access or an org token.
  const simulateRaw = env.CSP_RATE_WATCH_SIMULATE;

  if (!org || !project || !token) {
    if (simulateRaw) {
      return runRateWatch({ simulateRaw, scope });
    }
    appendSummary(
      renderJobSummary({
        level: 'normal',
        current: 0,
        previous: 0,
        ratio: 0,
        scope,
      }).concat('', `Skipped: SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN not fully configured.`),
    );
    return 0;
  }

  return runRateWatch({ simulateRaw, scope, apiBase, org, project, token });
}

async function runRateWatch({ simulateRaw, scope, apiBase, org, project, token }) {
  try {
    const buckets = simulateRaw
      ? parseEventsStats(JSON.parse(simulateRaw))
      : await fetchCspEventCounts({ apiBase, org, project, token });
    const current = buckets.length > 0 ? buckets[buckets.length - 1] : 0;
    const previous = buckets.slice(0, -1).reduce((sum, value) => sum + value, 0);
    const result = evaluateCspReportRate({ current, previous });
    appendSummary(renderJobSummary({ ...result, current, previous, scope }));
    return 0;
  } catch (error) {
    appendSummary(
      renderJobSummary({ level: 'normal', current: 0, previous: 0, ratio: 0, scope }).concat(
        '',
        `Skipped: rate watch could not read the Sentry API (${String(error).slice(0, 200)}).`,
      ),
    );
    return 0;
  }
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('csp-report-rate-watch.mjs');
if (invokedDirectly) {
  main();
}
