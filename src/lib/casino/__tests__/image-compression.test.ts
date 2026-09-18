import { describe, expect, it } from 'vitest';
import {
  calculateScaledDimensions,
  isAllowedImageFile,
  MAX_COMPRESSED_IMAGE_BYTES,
  processGuideAttachment,
} from '../image-compression';

describe('image-compression', () => {
  describe('isAllowedImageFile', () => {
    it('accepts valid PNG, JPEG and WebP files', () => {
      expect(isAllowedImageFile({ type: 'image/png' } as File)).toBe(true);
      expect(isAllowedImageFile({ type: 'image/jpeg' } as File)).toBe(true);
      expect(isAllowedImageFile({ type: 'image/jpg' } as File)).toBe(true);
      expect(isAllowedImageFile({ type: 'image/webp' } as File)).toBe(true);
    });

    it('rejects unsupported or dangerous file types', () => {
      expect(isAllowedImageFile({ type: 'image/gif' } as File)).toBe(false);
      expect(isAllowedImageFile({ type: 'image/svg+xml' } as File)).toBe(false);
      expect(isAllowedImageFile({ type: 'application/pdf' } as File)).toBe(false);
      expect(isAllowedImageFile({ type: 'text/html' } as File)).toBe(false);
      expect(isAllowedImageFile({} as File)).toBe(false);
    });
  });

  describe('calculateScaledDimensions', () => {
    it('scales down large landscape 4K screenshot (3840x2160) to max 1024 width maintaining aspect ratio', () => {
      const result = calculateScaledDimensions(3840, 2160, 1024, 1024);
      expect(result.width).toBe(1024);
      expect(result.height).toBe(576);
    });

    it('scales down tall mobile screenshot (1080x2400) to max 1024 height maintaining aspect ratio', () => {
      const result = calculateScaledDimensions(1080, 2400, 1024, 1024);
      expect(result.height).toBe(1024);
      expect(result.width).toBe(461);
    });

    it('does not upscale small images already below max dimensions', () => {
      const result = calculateScaledDimensions(600, 400, 1024, 1024);
      expect(result.width).toBe(600);
      expect(result.height).toBe(400);
    });

    it('handles zero or negative dimensions safely', () => {
      const result = calculateScaledDimensions(0, 0, 1024, 1024);
      expect(result.width).toBe(1024);
      expect(result.height).toBe(1024);
    });
  });

  describe('MAX_COMPRESSED_IMAGE_BYTES', () => {
    it('sets a 2.5 MB cap', () => {
      expect(MAX_COMPRESSED_IMAGE_BYTES).toBe(2_500_000);
    });
  });

  describe('processGuideAttachment', () => {
    it('rejects an unsupported file type without attempting compression', async () => {
      const result = await processGuideAttachment({ type: 'application/pdf' } as File);
      expect(result).toEqual({ status: 'rejected', reason: 'invalid-type' });
    });

    it('reports a compression failure as its own distinct, inspectable outcome instead of silently discarding it (regression: the caller used to get a bare rejected promise with no way to tell "not an image" apart from "compression broke")', async () => {
      // This test file runs in vitest's Node environment (no window/document), so the real
      // compressImageFile() genuinely fails here — no mocking needed to exercise this path.
      const result = await processGuideAttachment({ type: 'image/png' } as File);

      expect(result.status).toBe('rejected');
      if (result.status !== 'rejected' || result.reason !== 'compression-failed') {
        throw new Error(`expected a compression-failed result, got ${JSON.stringify(result)}`);
      }
      expect(result.error).toBeInstanceOf(Error);
    });
  });
});
