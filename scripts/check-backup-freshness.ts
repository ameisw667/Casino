/**
 * Säule 9 N4 — Staleness-Alerting: vergleicht das jüngste verfügbare Backup-Manifest
 * jedes konfigurierten Ziels (N2) gegen RPO ≤ 24 h + 2 h Puffer (= 26 h). Der Script
 * liest mit den vorhandenen GET-Primitives (kein Listing): zuerst das heutige Manifest,
 * bei Fehlversuch das Vortags-Manifest — dessen createdAt muss dann immer noch im
 * 26-h-Fenster liegen, sonst gilt das Ziel als überfällig.
 *
 * Lauf: npx tsx scripts/check-backup-freshness.ts [--date=YYYY-MM-DD]
 * Exit 1 bei Überschreitung — strukturierter Fehler statt stillem Teilerfolg.
 */
import { downloadS3Object } from '@/lib/backup/s3-download';
import { manifestObjectKey } from '@/lib/backup/integrity-check';
import {
  checkBackupFreshness,
  freshnessCheckHasFailure,
  type FreshnessCandidate,
} from '@/lib/backup/freshness';
import { readBackupTargets, type BackupTargetConfig } from '@/lib/backup/targets';

const HOUR_MS = 3_600_000;

function parseDateArgument(argumentsList: string[]): Date {
  const argument = argumentsList.find((value) => value.startsWith('--date='));
  if (!argument) return new Date();
  const parsed = new Date(`${argument.slice('--date='.length)}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('--date expects YYYY-MM-DD');
  }
  return parsed;
}

function extractCreatedAt(raw: Buffer): string | null {
  try {
    const parsed = JSON.parse(raw.toString('utf8')) as { createdAt?: unknown };
    return typeof parsed.createdAt === 'string' ? parsed.createdAt : null;
  } catch {
    return null;
  }
}

async function latestManifestCreatedAt(
  target: BackupTargetConfig,
  date: Date,
): Promise<string | null> {
  const today = await downloadS3Object({
    config: target.config,
    objectKey: manifestObjectKey(target.config.s3.prefix, date),
    now: new Date(),
  }).catch(() => undefined);
  if (today) return extractCreatedAt(today);

  const yesterday = await downloadS3Object({
    config: target.config,
    objectKey: manifestObjectKey(target.config.s3.prefix, new Date(date.getTime() - 24 * HOUR_MS)),
    now: new Date(),
  }).catch(() => undefined);
  return yesterday ? extractCreatedAt(yesterday) : null;
}

async function main(): Promise<void> {
  const targets = readBackupTargets(process.env);
  const date = parseDateArgument(process.argv.slice(2));
  const now = new Date();

  const candidates: FreshnessCandidate[] = [];
  for (const target of targets) {
    candidates.push({
      target: target.name,
      createdAt: await latestManifestCreatedAt(target, date),
    });
  }

  const results = checkBackupFreshness({ now, candidates });
  console.info(
    JSON.stringify({ status: 'freshness-check', checkedAt: now.toISOString(), results }, null, 2),
  );

  if (freshnessCheckHasFailure(results)) {
    console.error('Backup freshness FAILED: at least one target is older than the RPO window.');
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(
    `Backup freshness check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
