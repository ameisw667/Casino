/**
 * Säule 9 N5 — Exportiert ein secretfreies Auth-/Realtime-/Extension-Konfigurationsinventar
 * über die read-only Supabase Management API. Vor dem Schreiben läuft der automatisierte
 * Secret-Muster-Selbstcheck (assertInventoryHasNoSecrets) — ein Treffer bricht fail-closed
 * ab, bevor die Datei entsteht.
 *
 * Lauf: npx tsx scripts/export-project-config-inventory.ts
 * Benötigt: SUPABASE_ACCESS_TOKEN (read-only, gleiche Rechteklasse wie der
 * Query-Performance-Audit), SUPABASE_PROJECT_REF (im CI-Workflow gesetzt).
 * Output: docs/database/config-inventory/<YYYY-MM-DD>.json (kein API-Key im Output).
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildConfigInventory } from '@/lib/backup/config-inventory';

const OUTPUT_DIRECTORY = join('docs', 'database', 'config-inventory');

async function main(): Promise<void> {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();
  if (!accessToken || !projectRef) {
    throw new Error(
      'Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF — refusing to run (fail-closed).',
    );
  }

  const inventory = await buildConfigInventory({ projectRef, accessToken });
  const filename = `${inventory.generatedAt.slice(0, 10)}.json`;
  const output = JSON.stringify(inventory, null, 2);

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  await writeFile(join(OUTPUT_DIRECTORY, filename), `${output}\n`, 'utf8');

  console.info(
    JSON.stringify({
      status: 'config-inventory-written',
      file: join(OUTPUT_DIRECTORY, filename),
      endpointAvailability: inventory.endpointAvailability,
      extensionCount: inventory.extensions.length,
    }),
  );
}

main().catch((error: unknown) => {
  console.error(
    `Config inventory export failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
