import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import sharp from 'sharp';
import { createBoxMask, createCircleMask } from '../src/lib/design-assets/masking';

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      image: { type: 'string' },
      output: { type: 'string' },
      box: { type: 'string' }, // "x,y,w,h"
      circle: { type: 'string' }, // "cx,cy,r"
      feather: { type: 'string', default: '2' },
    },
  });
  return values;
}

async function main() {
  const args = parseCliArgs();

  if (!args.image || !args.output || (!args.box && !args.circle)) {
    console.log('Verwendung:');
    console.log(
      '  npx tsx scripts/create-image-mask.ts --image <pfad.png> --output <mask.png> --box "x,y,w,h" [--feather 2]',
    );
    console.log(
      '  npx tsx scripts/create-image-mask.ts --image <pfad.png> --output <mask.png> --circle "cx,cy,r" [--feather 2]',
    );
    process.exit(1);
  }

  const imagePath = path.resolve(process.cwd(), args.image);
  if (!fs.existsSync(imagePath)) {
    console.error(`⛔ Eingabebild existiert nicht: ${imagePath}`);
    process.exit(1);
  }

  const meta = await sharp(imagePath).metadata();
  if (!meta.width || !meta.height) {
    console.error('⛔ Bilddimensionen konnten nicht ermittelt werden.');
    process.exit(1);
  }

  const featherPx = Number.parseInt(args.feather ?? '2', 10);
  let maskBuffer: Buffer;

  if (args.box) {
    const parts = args.box.split(',').map((p) => Number.parseInt(p.trim(), 10));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
      console.error(
        '⛔ Ungültiges Format für --box. Erwartet: "x,y,w,h" (z. B. "200,200,400,400")',
      );
      process.exit(1);
    }
    const [x, y, w, h] = parts;
    maskBuffer = await createBoxMask(meta.width, meta.height, { x, y, w, h }, featherPx);
    console.log(`✅ Box-Maske berechnet: (${x}, ${y}, ${w}x${h}) mit ${featherPx}px Feathering.`);
  } else if (args.circle) {
    const parts = args.circle.split(',').map((p) => Number.parseInt(p.trim(), 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      console.error('⛔ Ungültiges Format für --circle. Erwartet: "cx,cy,r" (z. B. "512,512,200")');
      process.exit(1);
    }
    const [cx, cy, r] = parts;
    maskBuffer = await createCircleMask(meta.width, meta.height, { cx, cy, r }, featherPx);
    console.log(`✅ Kreis-Maske berechnet: Center (${cx}, ${cy}), Radius ${r}px.`);
  } else {
    throw new Error('Weder --box noch --circle angegeben.');
  }

  const outputPath = path.resolve(process.cwd(), args.output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, maskBuffer);
  console.log(`💾 Alpha-Maske erfolgreich gespeichert: ${outputPath} (${maskBuffer.byteLength} B)`);
}

main().catch((err) => {
  console.error('Fehler bei Maskenerzeugung:', err);
  process.exit(1);
});
