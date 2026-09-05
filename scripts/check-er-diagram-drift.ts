/**
 * ER-Diagramm-Drift-Check (T_DATABASE/02_database_schema_design.md L5).
 *
 * Vergleicht die Entity-Namen im Mermaid-erDiagram-Block von
 * docs/database/02_schema_design_datenmodell.md gegen die echten Tabellen aus
 * src/types/database.types.ts und meldet:
 *  - ERROR:  Entity im Diagramm, die als Tabelle nicht existiert (Diagramm "erfindet" Tabellen)
 *  - WARNING: reale Tabellen, die im Diagramm fehlen (nur Core-Domänen im Diagramm — informativ)
 *
 * Lauf: npx tsx scripts/check-er-diagram-drift.ts
 * Exit 1 nur bei ERRORs; WARNINGs sind nicht blockierend.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOC_PATH = 'docs/database/02_schema_design_datenmodell.md';
const TYPES_PATH = 'src/types/database.types.ts';

const doc = readFileSync(join(process.cwd(), DOC_PATH), 'utf8');
const types = readFileSync(join(process.cwd(), TYPES_PATH), 'utf8');

const diagramBlock = doc.match(/```mermaid\r?\nerDiagram\r?\n([\s\S]*?)```/);
if (!diagramBlock) {
  console.error(`Kein erDiagram-Mermaid-Block in ${DOC_PATH} gefunden.`);
  process.exit(1);
}

const diagramEntities = new Set<string>();
for (const line of diagramBlock[1].split(/\r?\n/)) {
  // Beziehungslinien: "A ||--o{ B : label" (Mermaid-Syntax: 3 Tokens + Label)
  const relation = line.match(/^\s*([A-Z_]+)\s+\S+\s+([A-Z_]+)\s*:/);
  if (relation) {
    diagramEntities.add(relation[1]);
    diagramEntities.add(relation[2]);
    continue;
  }
  // Entity-Blöcke: "NAME {"
  const entity = line.match(/^\s*([A-Z_]+)\s*\{/);
  if (entity) diagramEntities.add(entity[1]);
}

// Echte Tabellen: Deklarationen der Form "      name: {\n        Row: {" im Schema public.
// Segmentgrenze hängt von der CLI-Version ab (neuer: "  Relationships", älter: "    Views:").
const publicStart = types.indexOf('  public: {');
const boundaryMatch = types.slice(publicStart).match(/\n  Relationships|\n    Views:/m);
const relStart = boundaryMatch?.index !== undefined ? publicStart + boundaryMatch.index : -1;
if (publicStart === -1 || relStart === -1) {
  console.error('Konnte Schema "public" in database.types.ts nicht abgrenzen.');
  process.exit(1);
}
const publicSegment = types.slice(publicStart, relStart);
const realTables = new Set<string>();
const tableRe = /(\r?\n      )([a-z_]+)(: \{[\s\S]{0,200}?Row: \{)/g;
for (const match of publicSegment.matchAll(tableRe)) realTables.add(match[2]);

// AUTH_USERS ist das auth-Schema (auth.users), keine public-Tabelle — erlaubte Ausnahme.
const knownAliases = new Set(['AUTH_USERS']);

const invented = [...diagramEntities].filter(
  (e) => !realTables.has(e.toLowerCase()) && !knownAliases.has(e),
);
const missing = [...realTables].filter((t) => !diagramEntities.has(t.toUpperCase()));

if (invented.length > 0) {
  console.error(`❌ ${invented.length} Entity/Entities im Diagramm ohne reale Tabelle:`);
  for (const e of invented) console.error(`   - ${e}`);
  process.exit(1);
}
if (missing.length > 0) {
  console.log(
    `⚠ ${missing.length} reale Tabellen sind nicht im Diagramm (informativ, Diagramm zeigt Core-Domänen):`,
  );
  console.log(`   ${missing.join(', ')}`);
}
console.log(
  `✅ ${diagramEntities.size} Diagramm-Entities entsprechen alle realen Tabellen (${realTables.size} Tabellen in public).`,
);
