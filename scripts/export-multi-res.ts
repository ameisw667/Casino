import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import {
  generateMipmaps,
  createSilhouette,
  checkZeroClipping,
} from '../src/lib/design-assets/resizing';

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      image: { type: 'string' },
      output: { type: 'string' },
      silhouette: { type: 'boolean', default: true },
      'margin-check': { type: 'boolean', default: true },
    },
  });
  return values;
}

async function main() {
  const args = parseCliArgs();

  if (!args.image) {
    console.log('Verwendung:');
    console.log('  npx tsx scripts/export-multi-res.ts --image <pfad.png> [--output <ordner>]');
    process.exit(1);
  }

  const imagePath = path.resolve(process.cwd(), args.image);
  if (!fs.existsSync(imagePath)) {
    console.error(`⛔ Eingabebild existiert nicht: ${imagePath}`);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const outDir = args.output ? path.resolve(process.cwd(), args.output) : path.dirname(imagePath);
  fs.mkdirSync(outDir, { recursive: true });
  const baseName = path.basename(imagePath, path.extname(imagePath));

  console.log(`📐 Multi-Resolution-Export & Legibilitäts-Check für "${baseName}":`);

  if (args['margin-check']) {
    const margin = await checkZeroClipping(imageBuffer, 10);
    if (!margin.passed) {
      console.warn(
        `⚠️ WARNUNG: Zero-Clipping verletzt! ${margin.clippingPixelsCount} Pixel im 10px-Randbereich gefunden.`,
      );
    } else {
      console.log('  ✅ Zero-Clipping-Audit bestanden (Keine abgeschnittenen Kanten).');
    }
  }

  const mipmaps = await generateMipmaps(imageBuffer, [16, 32, 64, 128, 256]);
  for (const m of mipmaps) {
    const dest = path.join(outDir, `${baseName}_${m.size}px.png`);
    fs.writeFileSync(dest, m.buffer);
    console.log(
      `  • ${m.size}x${m.size}px: ${(m.bytes / 1024).toFixed(1)} KB → ${path.basename(dest)}`,
    );
  }

  if (args.silhouette) {
    const sil = await createSilhouette(imageBuffer, 32);
    const silDest = path.join(outDir, `${baseName}_silhouette_32px.png`);
    fs.writeFileSync(silDest, sil);
    console.log(`  🔍 32px-Silhouette für Legibilitätsprüfung erzeugt: ${path.basename(silDest)}`);
  }

  console.log('✅ Export erfolgreich abgeschlossen.');
}

main().catch((err) => {
  console.error('Fehler:', err);
  process.exit(1);
});
