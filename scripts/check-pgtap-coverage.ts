/**
 * pgTAP-Coverage-Check (T_DATABASE/10_database_testschicht_pgtap.md N4).
 *
 * Prueft das Inventar in docs/database/pgtap-coverage-inventory.json gegen die
 * tatsaechlichen pgTAP-Testdateien unter supabase/tests/:
 *  - GAP (blockierend):  P0-Funktion ohne "direct"-Abdeckung, oder gelistete
 *    Testdatei fehlt / referenziert die Funktion nicht im Body
 *  - WARN (informativ):  P0 nur "indirect" (via RPC-Kette) bzw. P1-Luecken
 *
 * Lauf: npx tsx scripts/check-pgtap-coverage.ts
 * Exit 1 nur bei GAPs; der security-staging-Step fuehrt ihn informativ aus.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface InventoryFunction {
  name: string;
  definition: string;
  priority: 'P0' | 'P1' | 'P2' | 'legacy';
  tested: false | 'direct' | 'indirect' | 'fixture-only';
  testFiles: string[];
}

export interface Inventory {
  functions: InventoryFunction[];
}

export interface CoverageResult {
  gaps: string[];
  warnings: string[];
  p0Total: number;
  p0Covered: number;
}

const INVENTORY_PATH = 'docs/database/pgtap-coverage-inventory.json';

export function evaluateCoverage(
  inventory: Inventory,
  readTestFile: (path: string) => string,
): CoverageResult {
  const gaps: string[] = [];
  const warnings: string[] = [];
  const p0 = inventory.functions.filter((f) => f.priority === 'P0');

  for (const fn of p0) {
    if (fn.tested === 'direct') {
      for (const testFile of fn.testFiles) {
        let body: string | null = null;
        try {
          body = readTestFile(testFile);
        } catch {
          body = null;
        }
        if (body === null || !body.includes(fn.name)) {
          gaps.push(
            `P0 ${fn.name}: Testdatei ${testFile} fehlt oder referenziert die Funktion nicht`,
          );
        }
      }
    } else if (fn.tested === 'indirect') {
      warnings.push(
        `P0 ${fn.name}: nur indirect abgedeckt (via RPC-Kette) — dedizierter Test empfohlen`,
      );
    } else {
      gaps.push(`P0 ${fn.name}: keine direct-Abdeckung im Inventar (tested=${String(fn.tested)})`);
    }
  }

  const p1 = inventory.functions.filter((f) => f.priority === 'P1');
  for (const fn of p1) {
    if (fn.tested === false) {
      warnings.push(`P1 ${fn.name}: ungetestet (informativ, kein GAP)`);
    }
  }

  const p0Covered = p0.filter((fn) => fn.tested === 'direct').length;
  return { gaps, warnings, p0Total: p0.length, p0Covered };
}

function main(): void {
  const inventoryPath = join(process.cwd(), INVENTORY_PATH);
  if (!existsSync(inventoryPath)) {
    console.error(`Inventar nicht gefunden: ${INVENTORY_PATH}`);
    process.exit(1);
  }
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8')) as Inventory;

  const result = evaluateCoverage(inventory, (relPath) =>
    readFileSync(join(process.cwd(), relPath), 'utf8'),
  );

  for (const warning of result.warnings) console.log(`⚠ ${warning}`);
  for (const gap of result.gaps) console.error(`❌ ${gap}`);

  const quote = result.p0Total > 0 ? Math.round((result.p0Covered / result.p0Total) * 100) : 0;
  console.log(`P0-Abdeckungsquote: ${result.p0Covered}/${result.p0Total} (${quote}%)`);

  if (result.gaps.length > 0) {
    console.error(`pgTAP-Coverage: ${result.gaps.length} GAP(s) gefunden.`);
    process.exit(1);
  }
  console.log('✅ pgTAP-Coverage: alle P0-Funktionen direct abgedeckt.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
