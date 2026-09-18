import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import {
  createBoxMask,
  createCircleMask,
  validateInpaintingInputs,
  auditMaskInvariance,
} from '../masking';

describe('masking & inpainting invariance', () => {
  it('generates a box mask with correct dimensions and alpha channel', async () => {
    const width = 256;
    const height = 256;
    const maskBuffer = await createBoxMask(width, height, { x: 50, y: 50, w: 100, h: 100 }, 0);

    const meta = await sharp(maskBuffer).metadata();
    expect(meta.width).toBe(width);
    expect(meta.height).toBe(height);
    expect(meta.channels).toBe(4);

    const raw = await sharp(maskBuffer).raw().toBuffer({ resolveWithObject: true });
    // Point (10, 10) is protected -> alpha must be 255
    const idxOutside = (10 * width + 10) * 4;
    expect(raw.data[idxOutside + 3]).toBe(255);

    // Point (75, 75) is inside the edit hole -> alpha must be 0
    const idxInside = (75 * width + 75) * 4;
    expect(raw.data[idxInside + 3]).toBe(0);
  });

  it('generates a circular mask with centered transparent edit zone', async () => {
    const width = 256;
    const height = 256;
    const maskBuffer = await createCircleMask(width, height, { cx: 128, cy: 128, r: 40 }, 0);

    const meta = await sharp(maskBuffer).metadata();
    expect(meta.width).toBe(width);
    expect(meta.height).toBe(height);

    const raw = await sharp(maskBuffer).raw().toBuffer({ resolveWithObject: true });
    // Center point (128, 128) is inside hole -> alpha should be low/0
    const idxCenter = (128 * width + 128) * 4;
    expect(raw.data[idxCenter + 3]).toBeLessThan(50);

    // Far corner (10, 10) is outside -> alpha should be 255
    const idxCorner = (10 * width + 10) * 4;
    expect(raw.data[idxCorner + 3]).toBeGreaterThan(200);
  });

  it('validates inpainting input dimensions correctly', async () => {
    // 1. Square valid
    const validSquare = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 11, g: 14, b: 20, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const validMask = await sharp({
      create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .png()
      .toBuffer();

    const checkValid = await validateInpaintingInputs(validSquare, validMask);
    expect(checkValid.valid).toBe(true);
    expect(checkValid.width).toBe(512);

    // 2. Non-square image -> must fail
    const nonSquare = await sharp({
      create: {
        width: 600,
        height: 400,
        channels: 4,
        background: { r: 11, g: 14, b: 20, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const checkNonSquare = await validateInpaintingInputs(nonSquare);
    expect(checkNonSquare.valid).toBe(false);
    expect(checkNonSquare.error).toContain('strikt quadratisch');

    // 3. Mismatched mask dimensions -> must fail
    const mismatchMask = await sharp({
      create: { width: 256, height: 256, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .png()
      .toBuffer();
    const checkMismatch = await validateInpaintingInputs(validSquare, mismatchMask);
    expect(checkMismatch.valid).toBe(false);
    expect(checkMismatch.error).toContain('stimmen nicht überein');
  });

  it('audits pixel invariance and detects collateral damage in protected zones', async () => {
    const width = 100;
    const height = 100;

    // Original: all solid dark blue
    const orig = await sharp({
      create: { width, height, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 1 } },
    })
      .png()
      .toBuffer();

    // Box mask: center 20x20 is hole (transparent)
    const mask = await createBoxMask(width, height, { x: 40, y: 40, w: 20, h: 20 }, 0);

    // Edit 1 (Clean): Only center modified
    const cleanEditSvg = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="rgb(10,20,30)" />
        <rect x="40" y="40" width="20" height="20" fill="gold" />
      </svg>
    `;
    const cleanEdit = await sharp(Buffer.from(cleanEditSvg)).png().toBuffer();

    const auditClean = await auditMaskInvariance(orig, cleanEdit, mask);
    expect(auditClean.passed).toBe(true);
    expect(auditClean.mutatedPixels).toBe(0);

    // Edit 2 (Dirty/Collateral Mutation): Top-left (0,0) also altered
    const dirtyEditSvg = `
      <svg width="${width}" height="${height}">
        <rect width="${width}" height="${height}" fill="rgb(10,20,30)" />
        <rect x="0" y="0" width="10" height="10" fill="red" />
        <rect x="40" y="40" width="20" height="20" fill="gold" />
      </svg>
    `;
    const dirtyEdit = await sharp(Buffer.from(dirtyEditSvg)).png().toBuffer();

    const auditDirty = await auditMaskInvariance(orig, dirtyEdit, mask);
    expect(auditDirty.passed).toBe(false);
    expect(auditDirty.mutatedPixels).toBeGreaterThan(0);
  });
});
