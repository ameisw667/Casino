import fs from 'fs';
import path from 'path';
import { parseAssetIndex } from '../src/lib/design-assets/asset-index';

const OUTPUT_DIR = path.resolve(process.cwd(), 'public/images');
const ASSET_INDEX_PATH = path.join(OUTPUT_DIR, 'asset-index.json');
const GALLERY_HTML_PATH = path.join(OUTPUT_DIR, 'review-gallery.html');

function generateGalleryHtml(): string {
  if (!fs.existsSync(ASSET_INDEX_PATH)) {
    throw new Error('asset-index.json existiert nicht.');
  }

  const rawIndex = JSON.parse(fs.readFileSync(ASSET_INDEX_PATH, 'utf8'));
  const assetIndex = parseAssetIndex(rawIndex);
  const assets = Object.entries(assetIndex);

  const cardsHtml = assets
    .map(([_key, asset]) => {
      const fileName = path.basename(asset.path);
      const isWebp = fileName.endsWith('.webp');
      const webpFileName = isWebp ? fileName : fileName.replace(/\.png$/, '.webp');
      const hasWebp = fs.existsSync(path.join(OUTPUT_DIR, webpFileName));

      return `
      <div class="asset-card">
        <div class="card-header">
          <span class="asset-name">${asset.name}</span>
          <span class="asset-version">${asset.version}</span>
        </div>
        <div class="preview-stage">
          <img src="./${fileName}" alt="${asset.alt}" loading="lazy" class="main-preview" />
        </div>
        <div class="mipmap-strip">
          <div class="mipmap-item">
            <span class="mipmap-label">128px</span>
            <img src="./${fileName}" style="width: 64px; height: 64px; object-fit: contain;" />
          </div>
          <div class="mipmap-item">
            <span class="mipmap-label">32px</span>
            <img src="./${fileName}" style="width: 32px; height: 32px; object-fit: contain;" />
          </div>
          <div class="mipmap-item">
            <span class="mipmap-label">16px</span>
            <img src="./${fileName}" style="width: 16px; height: 16px; object-fit: contain;" />
          </div>
        </div>
        <div class="card-meta">
          <div class="meta-row"><span>Format:</span> <strong>${asset.width}×${asset.height} (${asset.aspectRatio})</strong></div>
          <div class="meta-row"><span>Größe:</span> <strong>${((asset.bytes ?? 0) / 1024).toFixed(1)} KB</strong></div>
          <div class="meta-row"><span>SHA-256:</span> <code>${(asset.sha256 ?? 'n/a').slice(0, 10)}…</code></div>
          <div class="meta-row"><span>WebP Status:</span> <span class="badge ${hasWebp ? 'badge-ok' : 'badge-warn'}">${hasWebp ? 'Dual WebP ✅' : 'PNG Only ⚠️'}</span></div>
        </div>
      </div>
    `;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Casino Royale — Design Assets Review Gallery</title>
  <style>
    :root {
      --bg: #0B0E14;
      --card-bg: #121824;
      --border: #1E293B;
      --gold: #D4AF37;
      --text: #F8FAFC;
      --muted: #94A3B8;
      --emerald: #10B981;
      --ruby: #EF4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 32px; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 32px; }
    h1 { font-size: 24px; color: var(--gold); letter-spacing: 0.5px; }
    .subtitle { color: var(--muted); font-size: 14px; margin-top: 4px; }
    .stats { display: flex; gap: 16px; font-size: 14px; }
    .stat-pill { background: var(--card-bg); border: 1px solid var(--border); padding: 6px 14px; border-radius: 9999px; }
    .stat-pill strong { color: var(--gold); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .asset-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; }
    .asset-card:hover { transform: translateY(-3px); border-color: var(--gold); }
    .card-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); }
    .asset-name { font-weight: 600; font-size: 15px; color: var(--text); }
    .asset-version { font-size: 12px; background: rgba(212, 175, 55, 0.15); color: var(--gold); border: 1px solid var(--gold); padding: 2px 8px; border-radius: 4px; font-weight: bold; }
    .preview-stage { background: radial-gradient(circle, #1E293B 0%, #0B0E14 100%); height: 260px; display: flex; align-items: center; justify-content: center; padding: 16px; position: relative; }
    .main-preview { max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5)); }
    .mipmap-strip { display: flex; justify-content: space-around; align-items: center; background: rgba(0,0,0,0.3); padding: 10px 16px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .mipmap-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .mipmap-label { font-size: 10px; color: var(--muted); text-transform: uppercase; }
    .card-meta { padding: 14px 16px; font-size: 13px; color: var(--muted); display: flex; flex-direction: column; gap: 6px; }
    .meta-row { display: flex; justify-content: space-between; align-items: center; }
    .meta-row strong { color: var(--text); }
    code { font-family: monospace; font-size: 11px; color: #CBD5E1; }
    .badge { font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
    .badge-ok { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid var(--emerald); }
    .badge-warn { background: rgba(239, 68, 68, 0.15); color: var(--ruby); border: 1px solid var(--ruby); }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Casino Royale — Design Assets Review Gallery</h1>
      <p class="subtitle">Lokale Qualitäts- und Mipmap-Sichtprüfung für Jan & Design-Guardian</p>
    </div>
    <div class="stats">
      <div class="stat-pill">Assets: <strong>${assets.length}</strong></div>
      <div class="stat-pill">Design-System: <strong>Obsidian & Gold</strong></div>
    </div>
  </header>
  <main class="grid">
    ${cardsHtml}
  </main>
</body>
</html>`;
}

function main() {
  const html = generateGalleryHtml();
  fs.writeFileSync(GALLERY_HTML_PATH, html, 'utf8');
  console.log(`✅ Review-Gallerie erfolgreich erzeugt: ${GALLERY_HTML_PATH}`);
}

main();
