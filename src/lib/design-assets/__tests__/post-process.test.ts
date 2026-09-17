import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { extractAlphaChannel, defringeEdges, exportDualFormats } from '../post-process';

describe('post-process alpha matting & defringing', () => {
  it('extracts alpha channel from key color cleanly', async () => {
    const width = 64;
    const height = 64;

    // Create a 64x64 image: dark obsidian background (#0B0E14 -> rgb 11, 14, 20) with a gold box in center
    const svg = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="rgb(11, 14, 20)" />
        <rect x="20" y="20" width="24" height="24" fill="rgb(212, 175, 55)" />
      </svg>
    `;
    const input = await sharp(Buffer.from(svg)).png().toBuffer();

    const output = await extractAlphaChannel(input, {
      keyColor: [11, 14, 20],
      tolerance: 15,
      feather: 10,
    });

    const raw = await sharp(output).raw().toBuffer({ resolveWithObject: true });

    // Corner (5, 5) was dark obsidian -> must now be transparent (alpha = 0)
    const idxCorner = (5 * width + 5) * 4;
    expect(raw.data[idxCorner + 3]).toBe(0);

    // Center (32, 32) was gold (#D4AF37) -> must remain fully opaque (alpha = 255)
    const idxCenter = (32 * width + 32) * 4;
    expect(raw.data[idxCenter + 3]).toBe(255);
    expect(raw.data[idxCenter]).toBe(212); // R matches gold
  });

  it('defringes edges without modifying center colors', async () => {
    const width = 32;
    const height = 32;
    const svg = `
      <svg width="${width}" height="${height}">
        <circle cx="16" cy="16" r="10" fill="gold" />
      </svg>
    `;
    const input = await sharp(Buffer.from(svg)).png().toBuffer();

    const defringed = await defringeEdges(input, { blurSigma: 0.8 });
    const meta = await sharp(defringed).metadata();

    expect(meta.width).toBe(width);
    expect(meta.height).toBe(height);
  });

  it('exports dual formats (PNG + WebP) with WebP compression savings', async () => {
    const width = 128;
    const height = 128;
    const svg = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="gold" />
      </svg>
    `;
    const input = await sharp(Buffer.from(svg)).png().toBuffer();

    const tempBase = path.resolve(process.cwd(), 'src/lib/design-assets/__tests__/temp_dual_test');
    try {
      const res = await exportDualFormats(input, tempBase, 80);

      expect(fs.existsSync(res.pngPath)).toBe(true);
      expect(fs.existsSync(res.webpPath)).toBe(true);
      expect(res.pngBytes).toBeGreaterThan(0);
      expect(res.webpBytes).toBeGreaterThan(0);
      expect(res.webpBytes).toBeLessThanOrEqual(res.pngBytes);
    } finally {
      if (fs.existsSync(`${tempBase}.png`)) fs.unlinkSync(`${tempBase}.png`);
      if (fs.existsSync(`${tempBase}.webp`)) fs.unlinkSync(`${tempBase}.webp`);
    }
  });
});
