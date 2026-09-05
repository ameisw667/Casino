import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import type { ImageQuality, ImageSize } from './types';
import { round2 } from './cost-guard';

const spendLedgerEntrySchema = z.object({
  timestamp: z.string(),
  name: z.string(),
  size: z.string(),
  quality: z.string(),
  costUsd: z.number(),
});

const spendLedgerSchema = z.object({
  totalSpentUsd: z.number().default(0),
  monthlySpentUsd: z.record(z.string(), z.number()).default({}),
  lifetimeCalls: z.number().default(0),
  lastUpdated: z.string().optional(),
  history: z.array(spendLedgerEntrySchema).default([]),
});

export type SpendLedger = z.infer<typeof spendLedgerSchema>;
export type SpendLedgerEntry = z.infer<typeof spendLedgerEntrySchema>;

export function getMonthKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function createEmptyLedger(): SpendLedger {
  return {
    totalSpentUsd: 0,
    monthlySpentUsd: {},
    lifetimeCalls: 0,
    history: [],
  };
}

export function parseSpendLedger(raw: unknown): SpendLedger {
  const parsed = spendLedgerSchema.safeParse(raw);
  if (!parsed.success) {
    return createEmptyLedger();
  }
  return parsed.data;
}

export function loadSpendLedger(filePath: string): SpendLedger {
  if (!fs.existsSync(filePath)) {
    return createEmptyLedger();
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parseSpendLedger(JSON.parse(content));
  } catch {
    return createEmptyLedger();
  }
}

export function recordLedgerSpend(
  ledger: Readonly<SpendLedger>,
  entry: {
    name: string;
    size: ImageSize;
    quality: ImageQuality;
    costUsd: number;
    date?: Date;
  },
): SpendLedger {
  const date = entry.date ?? new Date();
  const monthKey = getMonthKey(date);
  const currentMonthSpend = ledger.monthlySpentUsd[monthKey] ?? 0;

  const newHistoryEntry: SpendLedgerEntry = {
    timestamp: date.toISOString(),
    name: entry.name,
    size: entry.size,
    quality: entry.quality,
    costUsd: round2(entry.costUsd),
  };

  return {
    totalSpentUsd: round2(ledger.totalSpentUsd + entry.costUsd),
    monthlySpentUsd: {
      ...ledger.monthlySpentUsd,
      [monthKey]: round2(currentMonthSpend + entry.costUsd),
    },
    lifetimeCalls: ledger.lifetimeCalls + 1,
    lastUpdated: date.toISOString(),
    history: [...ledger.history, newHistoryEntry],
  };
}

export function checkMonthlyCap(
  ledger: Readonly<SpendLedger>,
  plannedCostUsd: number,
  monthlyCapUsd: number,
  date: Date = new Date(),
): { allowed: boolean; currentMonthSpend: number; projectedMonthSpend: number; reason?: string } {
  const monthKey = getMonthKey(date);
  const currentMonthSpend = ledger.monthlySpentUsd[monthKey] ?? 0;
  const projectedMonthSpend = round2(currentMonthSpend + plannedCostUsd);

  if (projectedMonthSpend > monthlyCapUsd) {
    return {
      allowed: false,
      currentMonthSpend,
      projectedMonthSpend,
      reason: `Monatsbudget für ${monthKey} überschritten: ${projectedMonthSpend} USD / Limit ${monthlyCapUsd} USD`,
    };
  }

  return {
    allowed: true,
    currentMonthSpend,
    projectedMonthSpend,
  };
}

import { atomicWriteJsonSync } from './storage';

export function saveSpendLedger(filePath: string, ledger: Readonly<SpendLedger>): void {
  atomicWriteJsonSync(filePath, ledger);
}
