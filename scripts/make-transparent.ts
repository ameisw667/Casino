import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import {
  extractAlphaChannel,
  defringeEdges,
  exportDualFormats,
} from '../src/lib/design-assets/post-process';

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      input: { type: 'string' },
      output: { type: 'string' },
      'key-color': { type: 'string', default: '0B0E14' }, // Hex ohne #
      tolerance: { type: 'string', default: '25' },
      feather: { type: 'string', default: '15' },
      'dual-export': { type: 'boolean', default: true },
    },
  });
  return values;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = Number.parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

async function main() {
  const args = parseCliArgs();

  if (!args.input || !args.output) {
    console.log('Verwendung:');
    console.log(
      '  npx tsx scripts/make-transparent.ts --input <bild.png> --output <ziel-pfad-ohne-ext> [--key-color 0B0E14] [--tolerance 25] [--feather 15]',
    );
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`⛔ Eingabedatei existiert nicht: ${inputPath}`);
    process.exit(1);
  }

  const inputBuffer = fs.readFileSync(inputPath);
  const rgb = hexToRgb(args['key-color'] ?? '0B0E14');
  const tolerance = Number.parseInt(args.tolerance ?? '25', 10);
  const feather = Number.parseInt(args.feather ?? '15', 10);

  console.log(`🎨 Extrahiere Alpha-Kanal für: ${args.input}`);
  console.log(
    `   Schlüsselfarbe: rgb(${rgb.join(', ')}), Toleranz: ${tolerance}, Feather: ${feather}`,
  );

  const transparentBuffer = await extractAlphaChannel(inputBuffer, {
    keyColor: rgb,
    tolerance,
    feather,
  });

  const defringedBuffer = await defringeEdges(transparentBuffer);

  const baseOutput = path.resolve(process.cwd(), args.output.replace(/\.(png|webp)$/i, ''));

  const result = await exportDualFormats(defringedBuffer, baseOutput);

  console.log('✅ Alpha-Extraktion & Defringing abgeschlossen:');
  console.log(`   PNG-Master: ${result.pngPath} (${(result.pngBytes / 1024).toFixed(1)} KB)`);
  console.log(
    `   WebP-Asset: ${result.webpPath} (${(result.webpBytes / 1024).toFixed(1)} KB, -${Math.round((1 - result.webpBytes / result.pngBytes) * 100)}% kleiner)`,
  );
}

main().catch((err) => {
  console.error('Fehler bei Alpha-Extraktion:', err);
  process.exit(1);
});
