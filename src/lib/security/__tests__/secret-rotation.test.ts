import { describe, it, expect } from 'vitest';
import { TURNUS_DAYS, parseRotationLog, computeOverdue } from '../secret-rotation';

describe('parseRotationLog', () => {
  it('parses a normal entry row', () => {
    const content = `
| Secret | Letztes Rotationsdatum | Grund | Klasse |
| :--- | :---: | :--- | :--- |
| SUPABASE_SERVICE_ROLE_KEY | 2026-06-01 | Turnus | Kritisch |
`;
    const entries = parseRotationLog(content);
    expect(entries).toEqual([
      { secret: 'SUPABASE_SERVICE_ROLE_KEY', lastRotated: '2026-06-01', reason: 'Turnus' },
    ]);
  });

  it('ignores the header row, separator row, and empty-log placeholder row', () => {
    const content = `
| Secret | Letztes Rotationsdatum | Grund | Klasse |
| :--- | :---: | :--- | :--- |
| _(noch keine Rotation dokumentiert)_ | — | — | — |
`;
    expect(parseRotationLog(content)).toEqual([]);
  });

  it('marks a non-date value as lastRotated: null instead of throwing', () => {
    const content = `
| Secret | Letztes Rotationsdatum | Grund | Klasse |
| :--- | :---: | :--- | :--- |
| OPENAI_API_KEY | tbd | — | Hoch |
`;
    const entries = parseRotationLog(content);
    expect(entries[0].lastRotated).toBeNull();
  });
});

describe('computeOverdue', () => {
  const today = new Date('2026-08-29T00:00:00Z');

  it('marks a secret within its turnus as ok', () => {
    const entries = [
      { secret: 'SUPABASE_SERVICE_ROLE_KEY', lastRotated: '2026-08-01', reason: 'Turnus' },
    ];
    const results = computeOverdue(entries, { SUPABASE_SERVICE_ROLE_KEY: 90 }, today);
    expect(results).toEqual([
      { secret: 'SUPABASE_SERVICE_ROLE_KEY', status: 'ok', daysSinceRotation: 28, turnusDays: 90 },
    ]);
  });

  it('marks a secret past its turnus as overdue', () => {
    const entries = [
      { secret: 'SUPABASE_SERVICE_ROLE_KEY', lastRotated: '2026-01-01', reason: 'Turnus' },
    ];
    const results = computeOverdue(entries, { SUPABASE_SERVICE_ROLE_KEY: 90 }, today);
    expect(results[0].status).toBe('overdue');
  });

  it('marks a secret with no log entry as never-rotated, not silently skipped', () => {
    const results = computeOverdue([], { OPENAI_API_KEY: 180 }, today);
    expect(results).toEqual([
      { secret: 'OPENAI_API_KEY', status: 'never-rotated', daysSinceRotation: null, turnusDays: 180 },
    ]);
  });

  it('marks a secret with a non-date log entry as never-rotated', () => {
    const entries = [{ secret: 'OPENAI_API_KEY', lastRotated: null, reason: 'tbd' }];
    const results = computeOverdue(entries, { OPENAI_API_KEY: 180 }, today);
    expect(results[0].status).toBe('never-rotated');
  });

  it('covers every secret in TURNUS_DAYS with a result, even when the log is empty', () => {
    const results = computeOverdue([], TURNUS_DAYS, today);
    expect(results).toHaveLength(Object.keys(TURNUS_DAYS).length);
    expect(results.every((r) => r.status === 'never-rotated')).toBe(true);
  });
});
