import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MAX_AGE_HOURS,
  checkBackupFreshness,
  freshnessCheckHasFailure,
} from '@/lib/backup/freshness';

const now = new Date('2026-09-13T20:00:00.000Z');

describe('checkBackupFreshness', () => {
  it('passes a manifest that is younger than the 26h window', () => {
    const results = checkBackupFreshness({
      now,
      candidates: [{ target: 'primary', createdAt: '2026-09-13T10:00:00.000Z' }],
    });

    expect(results[0].ok).toBe(true);
    expect(results[0].ageHours).toBe(10);
    expect(freshnessCheckHasFailure(results)).toBe(false);
  });

  it('flags a manifest that is older than RPO 24h plus the 2h buffer', () => {
    const results = checkBackupFreshness({
      now,
      candidates: [{ target: 'primary', createdAt: '2026-09-12T00:00:00.000Z' }],
    });

    expect(results[0].ok).toBe(false);
    expect(results[0].ageHours).toBe(44);
    expect(freshnessCheckHasFailure(results)).toBe(true);
  });

  it('accepts a backup exactly at the 26h boundary and fails just past it', () => {
    const atBoundary = checkBackupFreshness({
      now,
      candidates: [{ target: 'primary', createdAt: '2026-09-12T18:00:00.000Z' }],
    });
    const pastBoundary = checkBackupFreshness({
      now,
      candidates: [{ target: 'primary', createdAt: '2026-09-12T17:59:00.000Z' }],
    });

    expect(atBoundary[0].ok).toBe(true);
    expect(pastBoundary[0].ok).toBe(false);
  });

  it('fails closed when no manifest exists for a target', () => {
    const results = checkBackupFreshness({
      now,
      candidates: [{ target: 'primary', createdAt: null }],
    });

    expect(results[0]).toEqual({
      target: 'primary',
      ok: false,
      latestCreatedAt: null,
      ageHours: null,
    });
  });

  it('evaluates each target independently', () => {
    const results = checkBackupFreshness({
      now,
      candidates: [
        { target: 'primary', createdAt: '2026-09-13T10:00:00.000Z' },
        { target: 'secondary', createdAt: '2026-09-12T00:00:00.000Z' },
      ],
    });

    expect(results.map((result) => result.ok)).toEqual([true, false]);
    expect(DEFAULT_MAX_AGE_HOURS).toBe(26);
  });
});
