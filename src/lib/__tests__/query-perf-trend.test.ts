import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildTrendRecord,
  parseTrendLines,
  appendTrendRecord,
  readTrendRecords,
  type TrendPath,
} from '../../../scripts/query-perf-trend';

describe('buildTrendRecord', () => {
  it('keeps the top 5 paths sorted by meanMs descending', () => {
    const paths: TrendPath[] = [
      { name: 'slow', meanMs: 40, calls: 10 },
      { name: 'mid', meanMs: 20, calls: 100 },
      { name: 'fast', meanMs: 1, calls: 500 },
    ];
    const record = buildTrendRecord({
      timestamp: '2026-09-13T12:00:00.000Z',
      mode: 'cli',
      callsFindingsCount: 1,
      seqScanFindings: ['users'],
      paths,
      maxPaths: 5,
    });

    expect(record.paths.map((p) => p.name)).toEqual(['slow', 'mid', 'fast']);
    expect(record.findings).toEqual({ calls: 1, seqScans: 1 });
    expect(record.seqScanTables).toEqual(['users']);
  });

  it('caps the number of stored paths (jsonl stays compact)', () => {
    const paths: TrendPath[] = Array.from({ length: 8 }, (_, i) => ({
      name: `q${i}`,
      meanMs: 8 - i,
      calls: i + 1,
    }));
    const record = buildTrendRecord({
      timestamp: '2026-09-13T12:00:00.000Z',
      mode: 'management-api',
      callsFindingsCount: 0,
      seqScanFindings: [],
      paths,
      maxPaths: 5,
    });

    expect(record.paths).toHaveLength(5);
    expect(record.paths[0]?.name).toBe('q0');
  });
});

describe('parseTrendLines', () => {
  it('parses one JSON object per line and tolerates blank lines', () => {
    const content = [
      '{"timestamp":"t1","mode":"cli","findings":{"calls":0,"seqScans":0},"paths":[],"seqScanTables":[]}',
      '',
      '{"timestamp":"t2","mode":"cli","findings":{"calls":1,"seqScans":0},"paths":[],"seqScanTables":[]}',
    ].join('\n');
    const records = parseTrendLines(content);

    expect(records).toHaveLength(2);
    expect(records[0]?.timestamp).toBe('t1');
    expect(records[1]?.findings.calls).toBe(1);
  });
});

describe('appendTrendRecord / readTrendRecords (append-only Konvention)', () => {
  it('appends without overwriting and round-trips two runs', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trend-test-'));
    const file = path.join(dir, 'trend.jsonl');
    const first = buildTrendRecord({
      timestamp: '2026-09-13T10:00:00.000Z',
      mode: 'cli',
      callsFindingsCount: 0,
      seqScanFindings: [],
      paths: [{ name: 'a', meanMs: 5, calls: 10 }],
      maxPaths: 5,
    });
    const second = buildTrendRecord({
      timestamp: '2026-09-13T11:00:00.000Z',
      mode: 'cli',
      callsFindingsCount: 2,
      seqScanFindings: [],
      paths: [{ name: 'a', meanMs: 7, calls: 10 }],
      maxPaths: 5,
    });

    await appendTrendRecord(first, file);
    await appendTrendRecord(second, file);

    const content = fs.readFileSync(file, 'utf8');
    expect(content.trim().split('\n')).toHaveLength(2);

    const records = await readTrendRecords(file);
    expect(records).toHaveLength(2);
    expect(records.map((r) => r.timestamp)).toEqual([
      '2026-09-13T10:00:00.000Z',
      '2026-09-13T11:00:00.000Z',
    ]);
  });
});
