import { describe, expect, it } from 'vitest';
import { evaluateCoverage, type Inventory } from '../../../scripts/check-pgtap-coverage';

const BASE_INVENTORY: Inventory = {
  functions: [
    {
      name: 'settle_game_bet',
      definition: '045_fix_wallet_events_jackpot_regression.sql:25',
      priority: 'P0',
      tested: 'direct',
      testFiles: ['supabase/tests/settle_game_bet.test.sql'],
    },
    {
      name: 'settle_game_round',
      definition: '045_fix_wallet_events_jackpot_regression.sql:194',
      priority: 'P0',
      tested: 'direct',
      testFiles: ['supabase/tests/settle_game_round.test.sql'],
    },
    {
      name: 'jackpot_pool_settle',
      definition: '034_jackpot_pool_settle_rpc.sql:18',
      priority: 'P0',
      tested: 'indirect',
      testFiles: [],
    },
    {
      name: 'match_guide_documents',
      definition: '039_guide_documents.sql:10',
      priority: 'P1',
      tested: false,
      testFiles: [],
    },
    {
      name: 'get_guide_public',
      definition: '039_guide_documents.sql:40',
      priority: 'P2',
      tested: false,
      testFiles: [],
    },
  ],
};

const fileNameOf = (path: string): string => path.replace('.test.sql', '').split('/').pop() ?? '';

const readers = {
  direct: (path: string) =>
    `SELECT has_function('public', '${fileNameOf(path)}', ...);\nSELECT lives_ok($$ SELECT public.${fileNameOf(path)}(...) $$, ...);`,
  noReference: () => '-- Testdatei ohne Bezug zu irgendeiner Funktion',
};

describe('evaluateCoverage', () => {
  it('meldet vollen P0-Coverage, wenn direct-Tests existieren und die Funktion referenzieren', () => {
    const result = evaluateCoverage(BASE_INVENTORY, (path: string) => readers.direct(path));

    expect(result.gaps).toEqual([]);
    expect(result.p0Total).toBe(3);
    expect(result.p0Covered).toBe(2);
    expect(result.warnings.some((w: string) => w.includes('jackpot_pool_settle'))).toBe(true);
  });

  it('liefert GAP, wenn eine P0-Funktion als direct markiert ist, die Testdatei aber die Funktion nicht referenziert', () => {
    const result = evaluateCoverage(BASE_INVENTORY, (path: string) =>
      path.includes('settle_game_bet') ? readers.noReference() : readers.direct(path),
    );

    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]).toContain('P0 settle_game_bet');
    expect(result.gaps[0]).toContain('referenziert die Funktion nicht');
  });

  it('liefert GAP, wenn eine gelistete Testdatei nicht existiert (Reader wirft)', () => {
    const result = evaluateCoverage(BASE_INVENTORY, (path: string) => {
      if (path.includes('settle_game_round')) throw new Error('ENOENT');
      return readers.direct(path);
    });

    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]).toContain('P0 settle_game_round');
  });

  it('liefert GAP, wenn eine P0-Funktion gar keine direct-Abdeckung hat', () => {
    const untested: Inventory = {
      functions: [
        {
          name: 'settle_game_bet',
          definition: '045_fix_wallet_events_jackpot_regression.sql:25',
          priority: 'P0',
          tested: false,
          testFiles: [],
        },
      ],
    };

    const result = evaluateCoverage(untested, (path: string) => readers.direct(path));

    expect(result.gaps).toEqual([
      'P0 settle_game_bet: keine direct-Abdeckung im Inventar (tested=false)',
    ]);
    expect(result.p0Covered).toBe(0);
  });

  it('bewertet fehlende P1-Abdeckung nur als Warning, nicht als GAP', () => {
    const result = evaluateCoverage(BASE_INVENTORY, (path: string) => readers.direct(path));

    expect(result.warnings.some((w: string) => w.includes('P1 match_guide_documents'))).toBe(true);
    expect(result.gaps.some((g: string) => g.includes('match_guide_documents'))).toBe(false);
  });

  it('ignoriert P2 vollstaendig (weder GAP noch Warning)', () => {
    const result = evaluateCoverage(BASE_INVENTORY, (path: string) => readers.direct(path));

    expect(result.warnings.some((w: string) => w.includes('get_guide_public'))).toBe(false);
    expect(result.gaps.some((g: string) => g.includes('get_guide_public'))).toBe(false);
  });
});
