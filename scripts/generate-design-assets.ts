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
import { composePrompt } from '../src/lib/design-assets/style-preset';
import { parsePromptManifest } from '../src/lib/design-assets/prompts-manifest';
import { buildAssetFileName, nextVersionFor, formatDate } from '../src/lib/design-assets/naming';
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

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/generated/design-assets');
const ASSET_INDEX_PATH = path.join(OUTPUT_DIR, 'asset-index.json');
const SPEND_LEDGER_PATH = path.join(OUTPUT_DIR, 'spend-ledger.json');
const CHANGELOG_PATH = path.resolve(process.cwd(), 'docs/images/CHANGELOG.md');

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      manifest: { type: 'string' },
      name: { type: 'string' },
      prompt: { type: 'string' },
      size: { type: 'string' },
      quality: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      yes: { type: 'boolean', default: false },
    },
  });
  return values;
}

function loadEntries(args: ReturnType<typeof parseCliArgs>): PromptEntry[] {
  if (args.manifest) {
    const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args.manifest), 'utf8'));
    return parsePromptManifest(raw).entries;
  }
  if (args.name && args.prompt) {
    return [
      {
        name: args.name,
        prompt: args.prompt,
        size: args.size as ImageSize | undefined,
        quality: args.quality as ImageQuality | undefined,
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
  const env = loadDesignAssetsEnv();
  const entries = loadEntries(args);

  const now = new Date();
  const monthKey = getMonthKey(now);
  let spendLedger = loadSpendLedger(SPEND_LEDGER_PATH);
  const currentMonthSpend = spendLedger.monthlySpentUsd[monthKey] ?? 0;

  const estimatedTotalUsd = estimateBatchCostUsd(entries, env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD);

  console.log('========================================================');
  console.log(`🎨 Design-Asset-Generierung — ${entries.length} Bild(er) geplant`);
  console.log(`   Geschätzte Batch-Kosten: ~${estimatedTotalUsd} USD`);
  console.log(`   Lauf-Budget (Max):       ${env.DESIGN_ASSETS_MAX_SPEND_USD} USD`);
  console.log(
    `   Monats-Budget (${monthKey}): ${currentMonthSpend} / ${env.DESIGN_ASSETS_MONTHLY_BUDGET_USD} USD verbraucht`,
  );
  console.log('--------------------------------------------------------');
  for (const entry of entries) {
    const size = entry.size ?? '1024x1024';
    const quality = entry.quality ?? 'medium';
    const cost = getEstimatedCostForRequest(
      size,
      quality,
      env.DESIGN_ASSETS_EST_COST_PER_IMAGE_USD,
    );
    console.log(
      `   • ${entry.name.padEnd(22)} [${size}, ${quality.padEnd(6)}] ~${cost.toFixed(2)} USD`,
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
    for (const entry of entries) console.log(`  [dry-run] ${entry.name}: "${entry.prompt}"`);
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
    const prompt = composePrompt(entry.prompt);
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
        { name: entry.name, prompt, size, quality, model: DEFAULT_IMAGE_MODEL },
        { apiKey: env.OPENAI_API_KEY },
      );

      const version = nextVersionFor(entry.name, readExistingFileNames());
      const fileName = buildAssetFileName(entry.name, now, version);
      fs.writeFileSync(path.join(OUTPUT_DIR, fileName), payload.imageBuffer);

      costGuard = recordSpend(costGuard, itemCost);
      spendLedger = recordLedgerSpend(spendLedger, {
        name: entry.name,
        size,
        quality,
        costUsd: itemCost,
        date: now,
      });

      assetIndex = upsertAssetIndexEntry(assetIndex, {
        name: entry.name,
        path: `/generated/design-assets/${fileName}`,
        version: `v${String(version).padStart(3, '0')}`,
        updatedAt: now.toISOString(),
      });

      appendChangelogEntry(
        `- ${formatDate(now)} — \`${entry.name}\` v${String(version).padStart(3, '0')} (${size}, ${quality}, ${(payload.meta.durationMs / 1000).toFixed(1)}s, ~${itemCost.toFixed(2)} USD) → \`${fileName}\``,
      );
      console.log(
        `  ✅ gespeichert: ${fileName} (${(payload.meta.durationMs / 1000).toFixed(1)}s, ~${itemCost.toFixed(2)} USD, Versuche: ${payload.meta.attemptsMade}${payload.meta.requestId ? `, req: ${payload.meta.requestId}` : ''})`,
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

  fs.writeFileSync(ASSET_INDEX_PATH, JSON.stringify(assetIndex, null, 2));
  saveSpendLedger(SPEND_LEDGER_PATH, spendLedger);

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
  console.error(
    'Design-Asset-Generierung fehlgeschlagen:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
