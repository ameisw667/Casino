import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  computeSha256,
  verifyAssetIntegrity,
  writeAssetAtomically,
  atomicWriteJsonSync,
} from '../storage';

describe('storage', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'design-assets-storage-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('computes deterministic sha256 checksums', () => {
    const buf1 = Buffer.from('hello world');
    const buf2 = Buffer.from('hello world');
    const buf3 = Buffer.from('other content');

    expect(computeSha256(buf1)).toBe(computeSha256(buf2));
    expect(computeSha256(buf1)).not.toBe(computeSha256(buf3));
  });

  it('writes file atomically without leaving temp files behind', () => {
    const dest = path.join(testDir, 'test-image.png');
    const data = Buffer.from('fake png image binary stream');

    const result = writeAssetAtomically(dest, data);

    expect(fs.existsSync(dest)).toBe(true);
    expect(result.bytes).toBe(data.length);
    expect(result.sha256).toBe(computeSha256(data));

    // Keine verbliebenen .tmp-Dateien im Verzeichnis
    const files = fs.readdirSync(testDir);
    expect(files).toEqual(['test-image.png']);
  });

  it('throws when attempting to write an empty buffer', () => {
    const dest = path.join(testDir, 'empty.png');
    expect(() => writeAssetAtomically(dest, Buffer.alloc(0))).toThrow('leer (0 Bytes)');
  });

  it('verifies asset integrity accurately', () => {
    const dest = path.join(testDir, 'verify.png');
    const data = Buffer.from('verification data');
    const { sha256 } = writeAssetAtomically(dest, data);

    const checkValid = verifyAssetIntegrity(dest, sha256);
    expect(checkValid.valid).toBe(true);
    expect(checkValid.bytes).toBe(data.length);

    const checkInvalid = verifyAssetIntegrity(dest, 'wrong-sha256');
    expect(checkInvalid.valid).toBe(false);

    const checkNonExistent = verifyAssetIntegrity(path.join(testDir, 'missing.png'));
    expect(checkNonExistent.valid).toBe(false);
  });

  it('writes json objects atomically', () => {
    const jsonPath = path.join(testDir, 'meta.json');
    const payload = { test: true, count: 42 };

    atomicWriteJsonSync(jsonPath, payload);

    expect(fs.existsSync(jsonPath)).toBe(true);
    const readBack = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(readBack).toEqual(payload);
  });
});
