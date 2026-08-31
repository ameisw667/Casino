/**
 * P35/1.21 — Datengetriebene Game-Economy-Tuning-Engine (Analyse-Skript)
 * Rein lesend: vergleicht Ist- vs. Soll-House-Edge je Spiel aus wallet_transactions/game_rounds.
 * Run: npx tsx scripts/economy-audit.ts [--json]
 */

import fs from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import {
  DEFAULT_GAME_CONFIG,
  calculateSlotsPayoutWithConfig,
  getCrashHouseEdge,
  type GameConfig,
} from '../src/lib/casino/game-config';

const MIN_SAMPLE_SIZE = 100;
const SLOTS_REEL_COUNT = 5;
const SLOTS_SYMBOLS_PER_REEL = 8; // matches the live call site in casino-core.ts, not the provably-fair.ts default
const ROULETTE_POCKETS = 37;
const ROULETTE_COVERAGE: Record<string, number> = {
  STRAIGHT: 1,
  COLOR: 18,
  EVEN_ODD: 18,
  RANGE: 18,
  DOZEN: 12,
  COLUMN: 12,
  VOISINS: 17,
  TIERS: 12,
  ORPHELINS: 8,
};

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const walletTxSchema = z.array(
  z.object({
    game: z.string().nullable(),
    type: z.string(),
    metadata: z.unknown(),
  }),
);
const gameRoundSchema = z.array(
  z.object({
    game: z.string(),
    status: z.string(),
    bet_amount: z.coerce.number(),
    state: z.unknown(),
  }),
);
const settledWalletResultSchema = z.object({
  response: z.object({
    result: z.object({
      amount: z.coerce.number(),
      payout: z.coerce.number(),
    }),
  }),
});
const settledRoundResultSchema = z.object({
  result: z.object({ payout: z.coerce.number() }),
});

interface GameStats {
  game: string;
  wager: number;
  payout: number;
  betCount: number;
}

function emptyStats(game: string): GameStats {
  return { game, wager: 0, payout: 0, betCount: 0 };
}

function addBet(stats: GameStats, wager: number, payout: number): void {
  stats.wager += wager;
  stats.payout += payout;
  stats.betCount += 1;
}

async function fetchWalletBetStats(supabase: SupabaseClient): Promise<Map<string, GameStats>> {
  const { data, error } = await supabase
    .from('wallet_transactions')
    .select('game, type, metadata')
    .eq('type', 'bet_settled');
  if (error) throw new Error(`wallet_transactions read failed: ${error.message}`);

  const rows = walletTxSchema.parse(data ?? []);
  const byGame = new Map<string, GameStats>();
  for (const row of rows) {
    if (!row.game) continue;
    const parsed = settledWalletResultSchema.safeParse(row.metadata);
    if (!parsed.success) continue;
    const stats = byGame.get(row.game) ?? emptyStats(row.game);
    addBet(stats, parsed.data.response.result.amount, parsed.data.response.result.payout);
    byGame.set(row.game, stats);
  }
  return byGame;
}

async function fetchRoundBetStats(supabase: SupabaseClient): Promise<Map<string, GameStats>> {
  const { data, error } = await supabase
    .from('game_rounds')
    .select('game, status, bet_amount, state')
    .eq('status', 'SETTLED');
  if (error) throw new Error(`game_rounds read failed: ${error.message}`);

  const rows = gameRoundSchema.parse(data ?? []);
  const byGame = new Map<string, GameStats>();
  for (const row of rows) {
    const parsed = settledRoundResultSchema.safeParse(row.state);
    if (!parsed.success) continue;
    const game = row.game.toLowerCase();
    const stats = byGame.get(game) ?? emptyStats(game);
    addBet(stats, row.bet_amount, parsed.data.result.payout);
    byGame.set(game, stats);
  }
  return byGame;
}

function istEdge(stats: GameStats): number | null {
  return stats.wager > 0 ? 1 - stats.payout / stats.wager : null;
}

function sollEdgeSlots(config: GameConfig): number {
  let combos = 0;
  let totalPayoutMultiplier = 0;
  const reel: number[] = new Array(SLOTS_REEL_COUNT).fill(0);

  function recurse(index: number): void {
    if (index === SLOTS_REEL_COUNT) {
      combos += 1;
      totalPayoutMultiplier += calculateSlotsPayoutWithConfig(reel, config);
      return;
    }
    for (let symbol = 0; symbol < SLOTS_SYMBOLS_PER_REEL; symbol++) {
      reel[index] = symbol;
      recurse(index + 1);
    }
  }
  recurse(0);

  return 1 - totalPayoutMultiplier / combos;
}

function rouletteBetTypeEdges(config: GameConfig): Record<string, number> {
  const edges: Record<string, number> = {};
  for (const [type, coverage] of Object.entries(ROULETTE_COVERAGE)) {
    const multiplier = config.roulette.multipliers[type] ?? 0;
    const winChance = coverage / ROULETTE_POCKETS;
    edges[type] = 1 - winChance * multiplier;
  }
  return edges;
}

function formatPct(value: number | null): string {
  return value === null ? 'n/a' : `${(value * 100).toFixed(2)}%`;
}

interface GameReport {
  game: string;
  betCount: number;
  wager: number;
  payout: number;
  istEdge: number | null;
  sollEdge: number | null;
  note: string | null;
  lowSample: boolean;
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const config = DEFAULT_GAME_CONFIG;

  const [walletStats, roundStats] = await Promise.all([
    fetchWalletBetStats(supabase),
    fetchRoundBetStats(supabase),
  ]);
  const allStats = new Map<string, GameStats>([...walletStats, ...roundStats]);

  const reports: GameReport[] = [];
  for (const stats of allStats.values()) {
    const lowSample = stats.betCount < MIN_SAMPLE_SIZE;
    let sollEdge: number | null = null;
    let note: string | null = null;

    if (stats.game === 'crash') {
      sollEdge = getCrashHouseEdge(config);
    } else if (stats.game === 'dice') {
      sollEdge = config.dice.houseEdge;
    } else if (stats.game === 'slots') {
      sollEdge = sollEdgeSlots(config);
    } else if (stats.game === 'roulette') {
      note = 'kein Blend-Soll-Wert — Bet-Type-Mix nicht persistiert, siehe Referenztabelle unten';
    } else if (stats.game === 'blackjack') {
      note = 'kein Soll-Wert — strategieabhängig, keine geschlossene Formel im Code';
    }

    reports.push({
      game: stats.game,
      betCount: stats.betCount,
      wager: stats.wager,
      payout: stats.payout,
      istEdge: istEdge(stats),
      sollEdge,
      note,
      lowSample,
    });
  }
  reports.sort((a, b) => a.game.localeCompare(b.game));

  const jsonOutput = process.argv.includes('--json');
  if (jsonOutput) {
    console.log(
      JSON.stringify({ reports, rouletteBetTypeEdges: rouletteBetTypeEdges(config) }, null, 2),
    );
    return;
  }

  console.log('=== P35/1.21 — Game Economy Audit (Ist vs. Soll House-Edge) ===\n');
  for (const report of reports) {
    const sampleFlag = report.lowSample ? '  ⚠ zu wenig Datenvolumen (< 100 Bets)' : '';
    console.log(
      `${report.game.toUpperCase()}: bets=${report.betCount} wager=${report.wager.toFixed(2)} ` +
        `payout=${report.payout.toFixed(2)} ist-edge=${formatPct(report.istEdge)} ` +
        `soll-edge=${formatPct(report.sollEdge)}${report.note ? `  (${report.note})` : ''}${sampleFlag}`,
    );
  }

  if (reports.some((report) => report.game === 'roulette')) {
    console.log('\n--- Roulette: Soll-Edge je Bet-Type (Referenz, konfigurationsbasiert) ---');
    for (const [type, edge] of Object.entries(rouletteBetTypeEdges(config))) {
      console.log(`  ${type}: ${formatPct(edge)}`);
    }
  }

  if (reports.length === 0) {
    console.log('Keine settled Bets gefunden — noch nicht genug Datenvolumen für eine Analyse.');
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
