#!/usr/bin/env node
// docs/security-hardening/07_dependency_supply_chain_audit.md L2 (Runde 2) — informational only,
// same philosophy as the L3-round-1 moderate-visibility step below it in dependency-audit.yml: it
// never fails the build on its own.
//
// The plain moderate-count step only ever shows "how many" — it can't tell you whether a finding
// is a fresh one that just landed or one that's been silently ignored for months. This reads a
// fresh `npm audit --audit-level=moderate --json` report, extracts the GHSA advisory IDs, and
// compares each against .audit-moderate-baseline.json (manually curated first-seen dates). Any
// advisory whose age exceeds `agingThresholdDays` is flagged as "aging — needs triage" in the job
// summary; any advisory not yet in the baseline is flagged as "new — add to baseline". Nothing
// here writes the baseline back (this CI job has no commit permission) — a human updates
// .audit-moderate-baseline.json when a finding is actually triaged.

import { readFileSync, appendFileSync } from 'node:fs';

const auditJsonPath = process.argv[2] ?? 'audit-moderate.json';
const baselinePath = process.argv[3] ?? '.audit-moderate-baseline.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

function loadJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function extractAdvisoryIds(auditReport) {
  const ids = new Set();
  for (const finding of Object.values(auditReport.vulnerabilities ?? {})) {
    for (const via of finding.via ?? []) {
      const url = typeof via === 'object' ? via.url : undefined;
      if (url?.includes('/advisories/')) {
        ids.add(url.split('/').pop());
      }
    }
  }
  return ids;
}

function describeAge(firstSeenIso, thresholdDays) {
  const dayMs = 24 * 60 * 60 * 1000;
  const ageDays = Math.floor((Date.now() - new Date(firstSeenIso).getTime()) / dayMs);
  const label = ageDays >= thresholdDays ? `aging (${ageDays}d) — needs triage` : `${ageDays}d`;
  return label;
}

function buildSummaryLines(advisoryIds, baseline) {
  const rows = [];
  for (const id of advisoryIds) {
    const known = baseline.advisories?.[id];
    if (!known) {
      rows.push(`| \`${id}\` | — | new — add to .audit-moderate-baseline.json |`);
      continue;
    }
    rows.push(
      `| \`${id}\` | ${known.package ?? '—'} | ${describeAge(known.firstSeen, baseline.agingThresholdDays)} |`,
    );
  }

  return [
    '',
    `## Moderate/low aging baseline (informational, threshold ${baseline.agingThresholdDays}d)`,
    '',
    '| Advisory | Package | Status |',
    '| --- | --- | --- |',
    ...(rows.length ? rows : ['| — | — | no moderate/low findings |']),
  ];
}

const auditReport = loadJson(auditJsonPath, { vulnerabilities: {} });
const baseline = loadJson(baselinePath, { agingThresholdDays: 30, advisories: {} });
const advisoryIds = extractAdvisoryIds(auditReport);
const lines = buildSummaryLines(advisoryIds, baseline);

if (summaryPath) {
  appendFileSync(summaryPath, lines.join('\n') + '\n');
} else {
  console.log(lines.join('\n'));
}
