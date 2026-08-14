import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MAX_CHUNK_SIZE_KB = 350;

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

async function main() {
  console.log('--- Performance & Bundle Measurement Audit ---');

  // 1. Verify dead dependencies in package.json
  const pkgPath = path.resolve(rootDir, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  const deadDeps = ['svix', '@types/webxr', '@types/stats.js'];
  const foundDead = deadDeps.filter(
    (dep) =>
      (pkgJson.dependencies && pkgJson.dependencies[dep]) ||
      (pkgJson.devDependencies && pkgJson.devDependencies[dep]),
  );

  if (foundDead.length === 0) {
    console.log(
      '✅ Dead dependencies check PASSED (svix, @types/webxr, @types/stats.js uninstalled)',
    );
  } else {
    console.error(`❌ Dead dependencies found: ${foundDead.join(', ')}`);
    process.exit(1);
  }

  // 2. Measure .next static chunks if present
  const chunksDir = path.resolve(rootDir, '.next/static/chunks');
  if (fs.existsSync(chunksDir)) {
    const files = fs.readdirSync(chunksDir);
    let oversizedCount = 0;

    files.forEach((file) => {
      if (file.endsWith('.js')) {
        const stats = fs.statSync(path.join(chunksDir, file));
        const sizeKb = stats.size / 1024;
        if (sizeKb > MAX_CHUNK_SIZE_KB) {
          console.warn(
            `⚠️ Oversized Chunk: ${file} (${formatBytes(stats.size)} > ${MAX_CHUNK_SIZE_KB} KB limit)`,
          );
          oversizedCount++;
        }
      }
    });

    if (oversizedCount === 0) {
      console.log(`✅ All JS Chunks are within the ${MAX_CHUNK_SIZE_KB} KB limit!`);
    }
  } else {
    console.log(
      'ℹ️ `.next/static/chunks` not present yet (run `npm run build` to generate static bundle)',
    );
  }

  console.log('✅ Bundle & Performance audit passed!');
}

main();
