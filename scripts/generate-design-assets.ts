import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';
import { loadDesignAssetsEnv } from '../src/lib/design-assets/env';
import {
  createCostGuard,
  checkBudget,
  recordSpend,
  estimateBatchCostUsd,
  getEstimatedCostForRequest,
} from '../src/lib/design-assets/cost-guard';
import {
  loadSpendLedger,
  recordLedgerSpend,
  checkMonthlyCap,
  saveSpendLedger,
  getMonthKey,
} from '../src/lib/design-assets/spend-ledger';
import {
  parsePromptManifest,
  interpolatePrompt,
  analyzeManifestDiff,
} from '../src/lib/design-assets/prompts-manifest';
import { buildAssetFileName, nextVersionFor, formatDate } from '../src/lib/design-assets/naming';
import { composePrompt } from '../src/lib/design-assets/style-preset';
import {
  upsertAssetIndexEntry,
  parseAssetIndex,
  type AssetIndex,
} from '../src/lib/design-assets/asset-index';
import {
  generateImageWithMeta,
  DEFAULT_IMAGE_MODEL,
  OpenAiImageError,
} from '../src/lib/design-assets/openai-image-client';
import type { ImageQuality, ImageSize, PromptEntry } from '../src/lib/design-assets/types';

import {
  validateSafeAssetName,
  resolveSafePath,
  scrubSensitiveText,
} from '../src/lib/design-assets/security';
import { writeAssetAtomically, atomicWriteJsonSync } from '../src/lib/design-assets/storage';
import { SIZE_DIMENSIONS } from '../src/lib/design-assets/client';
import { listAssetVersions, rollbackAssetIndexEntry } from '../src/lib/design-assets/lifecycle';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/images');
const ASSET_INDEX_PATH = path.join(OUTPUT_DIR, 'asset-index.json');
const SPEND_LEDGER_PATH = path.join(OUTPUT_DIR, 'spend-ledger.json');
const CHANGELOG_PATH = path.resolve(process.cwd(), 'public/images/CHANGELOG.md');

function loadLocalEnv(): void {
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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
loadLocalEnv();

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      manifest: { type: 'string' },
      name: { type: 'string' },
      prompt: { type: 'string' },
      size: { type: 'string' },
      quality: { type: 'string' },
      category: { type: 'string' },
      background: { type: 'string' },
      'list-versions': { type: 'string' },
      rollback: { type: 'string' },
      'to-version': { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      yes: { type: 'boolean', default: false },
    },
  });
  return values;
}

function loadEntries(args: ReturnType<typeof parseCliArgs>): PromptEntry[] {
  if (args.manifest) {
    const safeManifestPath = resolveSafePath(process.cwd(), args.manifest);
    const raw = JSON.parse(fs.readFileSync(safeManifestPath, 'utf8'));
    return parsePromptManifest(raw).entries;
  }
  if (args.name && args.prompt) {
    const safeName = validateSafeAssetName(args.name);
    return [
      {
        name: safeName,
        prompt: args.prompt,
        size: args.size as ImageSize | undefined,
        quality: args.quality as ImageQuality | undefined,
        category: args.category as PromptEntry['category'],
        background: args.background as PromptEntry['background'],
      },
    ];
  }
  throw new Error('Entweder --manifest <pfad> ODER --name <name> --prompt "<text>" angeben.');
}

function readExistingFileNames(): string[] {
  if (!fs.existsSync(OUTPUT_DIR)) return [];
  return fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.png'));
}

function readAssetIndex(): AssetIndex {
  if (!fs.existsSync(ASSET_INDEX_PATH)) return {};
  return parseAssetIndex(JSON.parse(fs.readFileSync(ASSET_INDEX_PATH, 'utf8')));
}

function appendChangelogEntry(line: string): void {
  fs.mkdirSync(path.dirname(CHANGELOG_PATH), { recursive: true });
  const header = fs.existsSync(CHANGELOG_PATH) ? '' : '# Design-Assets Changelog\n\n';
  fs.appendFileSync(CHANGELOG_PATH, `${header}${line}\n`);
}

async function main() {
  const args = parseCliArgs();

  // 1. Lifecycle-Befehl: --list-versions <name>
  if (args['list-versions']) {
    const assetName = validateSafeAssetName(args['list-versions']);
    const existing = readExistingFileNames();
    const index = readAssetIndex();
    const versions = listAssetVersions(assetName, existing, index);

    console.log(`📜 Versionshistorie für Asset "${assetName}":`);
    if (versions.length === 0) {
      console.log('   (Keine Versionen auf der Festplatte gefunden)');
      return;
    }
    for (const v of versions) {
      const activeMarker = v.isActive ? ' 🟢 [AKTIV IM INDEX]' : '';
      console.log(
        `   • v${String(v.version).padStart(3, '0')} (${v.date}) → ${v.fileName}${activeMarker}`,
      );
    }
    return;
  }

  // 2. Lifecycle-Befehl: --rollback <name> --to-version <v> --yes
  if (args.rollback) {
    if (!args['to-version']) {
      console.error('⛔ Fehler: Für ein Rollback muss --to-version <nummer> angegeben werden.');
      process.exitCode = 1;
      return;
    }
    if (!args.yes) {
      console.error('⛔ Sicherheits-Gate: Rollback erfordert Bestätigung mit --yes.');
      process.exitCode = 1;
      return;
    }

    const assetName = validateSafeAssetName(args.rollback);
    const targetVer = Number.parseInt(args['to-version'], 10);
    const existing = readExistingFileNames();
    const index = readAssetIndex();

    const updatedIndex = rollbackAssetIndexEntry(index, assetName, targetVer, existing, OUTPUT_DIR);
    atomicWriteJsonSync(ASSET_INDEX_PATH, updatedIndex);

    const now = new Date();
    appendChangelogEntry(
      `- ${formatDate(now)} — [ROLLBACK] \`${assetName}\` zurückgesetzt auf v${String(targetVer).padStart(3, '0')} (0.00 USD, Zero-Cost)`,
    );
    console.log(
      `✅ Rollback erfolgreich: "${assetName}" zeigt nun im Index auf v${String(targetVer).padStart(3, '0')}.`,
    );
    return;
  }

  const env = loadDesignAssetsEnv();
  const entries = loadEntries(args);
  const existingFiles = readExistingFileNames();
  const diff = analyzeManifestDiff(entries, existingFiles);

  const now = new Date();
  const monthKey = getMonthKey(now);
  let spendLedger = loadSpendLedger(SPEND_LEDGER_PATH);
  const currentMonthSpend = spendLedger.monthlySpentUsd[monthKey] ?? 0;

  const estimatedTotalUsd = estimateBatchCostUsd(entries, env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD);

  console.log('========================================================');
  console.log(
    `🎨 Design-Asset-Generierung — ${entries.length} Bild(er) geplant (${diff.newCount} neu, ${diff.updateCount} Version-Bumps)`,
  );
  console.log(`   Geschätzte Batch-Kosten: ~${estimatedTotalUsd} USD`);
  console.log(`   Lauf-Budget (Max):       ${env.DESIGN_ASSETS_MAX_SPEND_USD} USD`);
  console.log(
    `   Monats-Budget (${monthKey}): ${currentMonthSpend} / ${env.DESIGN_ASSETS_MONTHLY_BUDGET_USD} USD verbraucht`,
  );
  console.log('--------------------------------------------------------');
  for (const diffItem of diff.items) {
    const cost = getEstimatedCostForRequest(
      diffItem.size,
      'medium',
      env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD,
    );
    const catLabel = diffItem.category ? `[${diffItem.category}]` : '';
    const statusLabel = diffItem.isNew ? '✨ NEU' : `🔄 ${diffItem.targetVersion}`;
    console.log(
      `   • ${diffItem.name.padEnd(22)} ${catLabel.padEnd(10)} [${diffItem.size}] ${statusLabel.padEnd(10)} ~${cost.toFixed(2)} USD`,
    );
  }
  console.log('========================================================');

  const monthlyCheck = checkMonthlyCap(
    spendLedger,
    estimatedTotalUsd,
    env.DESIGN_ASSETS_MONTHLY_BUDGET_USD,
    now,
  );
  if (!monthlyCheck.allowed) {
    console.error(`⛔ ${monthlyCheck.reason}`);
    process.exitCode = 1;
    return;
  }

  if (args['dry-run']) {
    console.log('--- 🔍 DRY-RUN: Vollständig komponierte Prompts ---');
    for (const entry of entries) {
      const interpolated = interpolatePrompt(entry.prompt, entry.variables);
      const composed = composePrompt({
        basePrompt: interpolated,
        category: entry.category,
        background: entry.background,
        exclusions: entry.negativePrompt ? [entry.negativePrompt] : undefined,
      });
      console.log(`  • ${entry.name} (${entry.category ?? 'general'}):`);
      console.log(`    "${composed}"\n`);
    }
    console.log('Dry-Run beendet — kein API-Call ausgeführt.');
    return;
  }

  if (!args.yes) {
    console.error('Abgebrochen: Lauf erzeugt echte Kosten. Mit --yes bestätigen, um fortzufahren.');
    process.exitCode = 1;
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  let costGuard = createCostGuard(env.DESIGN_ASSETS_MAX_SPEND_USD);
  let assetIndex = readAssetIndex();

  for (const entry of entries) {
    const size: ImageSize = entry.size ?? '1024x1024';
    const quality: ImageQuality = entry.quality ?? 'medium';
    const interpolatedPrompt = interpolatePrompt(entry.prompt, entry.variables);
    const prompt = composePrompt({
      basePrompt: interpolatedPrompt,
      category: entry.category,
      background: entry.background,
      exclusions: entry.negativePrompt ? [entry.negativePrompt] : undefined,
    });
    const itemCost = getEstimatedCostForRequest(
      size,
      quality,
      env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD,
    );

    const budgetCheck = checkBudget(costGuard, itemCost);
    if (!budgetCheck.allowed) {
      console.error(`⛔ ${entry.name}: ${budgetCheck.reason}`);
      break;
    }

    try {
      console.log(`→ ${entry.name} (${size}, ${quality}) …`);
      const payload = await generateImageWithMeta(
        {
          name: entry.name,
          prompt,
          size,
          quality,
          model: DEFAULT_IMAGE_MODEL,
          background: entry.background,
        },
        { apiKey: env.OPENAI_API_KEY },
      );

      const version = nextVersionFor(entry.name, readExistingFileNames());
      const fileName = buildAssetFileName(entry.name, now, version);
      const safeDestPath = resolveSafePath(OUTPUT_DIR, fileName);
      const storageResult = writeAssetAtomically(safeDestPath, payload.imageBuffer);

      costGuard = recordSpend(costGuard, itemCost);
      spendLedger = recordLedgerSpend(spendLedger, {
        name: entry.name,
        size,
        quality,
        costUsd: itemCost,
        date: now,
      });

      const dims = SIZE_DIMENSIONS[size] ?? { width: 1024, height: 1024, aspectRatio: '1/1' };
      assetIndex = upsertAssetIndexEntry(assetIndex, {
        name: entry.name,
        path: `/generated/design-assets/${fileName}`,
        version: `v${String(version).padStart(3, '0')}`,
        updatedAt: now.toISOString(),
        size,
        width: dims.width,
        height: dims.height,
        aspectRatio: dims.aspectRatio,
        alt: `${entry.name.replace(/-/g, ' ')} asset`,
        sha256: storageResult.sha256,
        bytes: storageResult.bytes,
        category: entry.category,
      });

      // Inkrementeller atomarer Flush verhindert Datenverlust bei vorzeitigem Abbruch
      atomicWriteJsonSync(ASSET_INDEX_PATH, assetIndex);
      saveSpendLedger(SPEND_LEDGER_PATH, spendLedger);

      appendChangelogEntry(
        `- ${formatDate(now)} — \`${entry.name}\` v${String(version).padStart(3, '0')} (${size}, ${quality}, ${storageResult.bytes} B, sha256:${storageResult.sha256.slice(0, 8)}, ${(payload.meta.durationMs / 1000).toFixed(1)}s, ~${itemCost.toFixed(2)} USD) → \`${fileName}\``,
      );
      console.log(
        `  ✅ atomar gespeichert: ${fileName} (${storageResult.bytes} B, sha256:${storageResult.sha256.slice(0, 8)}, ${(payload.meta.durationMs / 1000).toFixed(1)}s, ~${itemCost.toFixed(2)} USD, Versuche: ${payload.meta.attemptsMade}${payload.meta.requestId ? `, req: ${payload.meta.requestId}` : ''})`,
      );
    } catch (error) {
      if (error instanceof OpenAiImageError) {
        console.error(`  ❌ ${entry.name}: [${error.status}] ${error.message}`);
        if (error.isFatal()) {
          console.error(
            `🛑 Fataler Fehler erkannt (${error.status} / ${error.errorCode ?? 'fatal'}). Batch-Verarbeitung wird zum Kostenschutz abgebrochen.`,
          );
          break;
        }
      } else {
        throw error;
      }
    }
  }

  console.log('========================================================');
  console.log(
    `Fertig. Ausgegeben in diesem Lauf: ~${costGuard.spentUsd.toFixed(2)} USD über ${costGuard.callCount} Call(s).`,
  );
  console.log(
    `Monatsausgaben (${monthKey}): ~${(spendLedger.monthlySpentUsd[monthKey] ?? 0).toFixed(2)} / ${env.DESIGN_ASSETS_MONTHLY_BUDGET_USD} USD`,
  );
  console.log(
    `Asset-Index & Spend-Ledger aktualisiert unter ${path.relative(process.cwd(), OUTPUT_DIR)}`,
  );
}

main().catch((error) => {
  const rawMsg = error instanceof Error ? error.message : String(error);
  console.error('Design-Asset-Generierung fehlgeschlagen:', scrubSensitiveText(rawMsg));
  process.exitCode = 1;
});
