import fs from 'fs';
import path from 'path';
import { parseAssetIndex } from '../src/lib/design-assets/asset-index';
import { auditOrphanAssets } from '../src/lib/design-assets/lifecycle';

const IMAGES_DIR = path.resolve(process.cwd(), 'public/images');
const ASSET_INDEX_PATH = path.join(IMAGES_DIR, 'asset-index.json');

function main() {
  console.log('🔍 Starte Audit für verwaiste Bilddateien (Orphan Assets)…');

  if (!fs.existsSync(ASSET_INDEX_PATH)) {
    console.error('⛔ Fehler: asset-index.json wurde nicht gefunden.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(ASSET_INDEX_PATH, 'utf8'));
  const index = parseAssetIndex(raw);

  const result = auditOrphanAssets(IMAGES_DIR, index);

  console.log(`📊 Asset-Index enthält ${result.allTrackedCount} registrierte Einträge.`);

  if (result.missingFromDisk.length > 0) {
    console.error(
      `❌ KRITISCH: ${result.missingFromDisk.length} im Index referenzierte Datei(en) fehlen auf der Festplatte:`,
    );
    for (const f of result.missingFromDisk) {
      console.error(`   • ${f}`);
    }
  } else {
    console.log('✅ 100 % Integrität: Alle im Index hinterlegten Dateien existieren physisch.');
  }

  if (result.unindexedFiles.length > 0) {
    console.log(
      `ℹ️ ${result.unindexedFiles.length} historische / unindexierte Bilddatei(en) auf der Festplatte (Archivbestand / Mipmaps):`,
    );
    for (const f of result.unindexedFiles.slice(0, 10)) {
      console.log(`   • ${f}`);
    }
    if (result.unindexedFiles.length > 10) {
      console.log(`   ... und ${result.unindexedFiles.length - 10} weitere.`);
    }
  } else {
    console.log('✅ Keine unindexierten Dateien gefunden.');
  }
}

main();
