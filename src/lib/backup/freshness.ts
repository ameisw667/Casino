export const RPO_TARGET_HOURS = 24;
export const FRESHNESS_BUFFER_HOURS = 2;
export const DEFAULT_MAX_AGE_HOURS = RPO_TARGET_HOURS + FRESHNESS_BUFFER_HOURS;

export type FreshnessCandidate = {
  target: string;
  createdAt: string | null;
};

export type FreshnessResult = {
  target: string;
  ok: boolean;
  latestCreatedAt: string | null;
  ageHours: number | null;
};

/**
 * Säule 9 N4: RPO ≤ 24 h plus 2 h Puffer (L1 der Vorversion) = maximales Alter des
 * jüngsten Manifests. Ein Ziel gilt als überfällig, wenn kein Manifest im Fenster liegt
 * oder der jüngste Zeitstempel älter als das Fenster ist — fail-closed, kein stiller
 * Teilerfolg.
 */
export function checkBackupFreshness(input: {
  now: Date;
  candidates: FreshnessCandidate[];
  maxAgeHours?: number;
}): FreshnessResult[] {
  const maxAgeHours = input.maxAgeHours ?? DEFAULT_MAX_AGE_HOURS;
  const deadline = input.now.getTime() - maxAgeHours * 60 * 60 * 1000;

  return input.candidates.map((candidate) => {
    const timestamps = [candidate.createdAt]
      .filter((value): value is string => typeof value === 'string')
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));
    const latest = timestamps.length > 0 ? Math.max(...timestamps) : null;

    return {
      target: candidate.target,
      ok: latest !== null && latest >= deadline,
      latestCreatedAt: latest !== null ? new Date(latest).toISOString() : null,
      ageHours:
        latest !== null ? Number(((input.now.getTime() - latest) / 3_600_000).toFixed(2)) : null,
    };
  });
}

export function freshnessCheckHasFailure(results: FreshnessResult[]): boolean {
  return results.some((result) => !result.ok);
}
