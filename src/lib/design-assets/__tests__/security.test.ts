import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  resolveSafePath,
  safeRedactApiKey,
  scrubSensitiveText,
  validateSafeAssetName,
} from '../security';

describe('security', () => {
  describe('validateSafeAssetName', () => {
    it('allows valid kebab-case names', () => {
      expect(validateSafeAssetName('hero-bg-crash')).toBe('hero-bg-crash');
      expect(validateSafeAssetName('icon-dice')).toBe('icon-dice');
      expect(validateSafeAssetName('vip-badge-01')).toBe('vip-badge-01');
    });

    it('rejects path traversal characters (../, slashes, backslashes)', () => {
      expect(() => validateSafeAssetName('../hero')).toThrow('Path-Traversal-Zeichen');
      expect(() => validateSafeAssetName('sub/dir')).toThrow('Path-Traversal-Zeichen');
      expect(() => validateSafeAssetName('sub\\dir')).toThrow('Path-Traversal-Zeichen');
      expect(() => validateSafeAssetName('asset\0null')).toThrow('Path-Traversal-Zeichen');
    });

    it('rejects non-kebab-case or empty names', () => {
      expect(() => validateSafeAssetName('')).toThrow('darf nicht leer sein');
      expect(() => validateSafeAssetName('Hero_Crash')).toThrow('kebab-case');
      expect(() => validateSafeAssetName('hero crash')).toThrow('kebab-case');
    });
  });

  describe('resolveSafePath', () => {
    const baseDir = path.resolve('public/generated/design-assets');

    it('resolves safe relative subpaths', () => {
      const resolved = resolveSafePath(baseDir, 'manifests/prompts.json');
      expect(resolved).toBe(path.resolve(baseDir, 'manifests/prompts.json'));
    });

    it('blocks path traversal attempts outside baseDir', () => {
      expect(() => resolveSafePath(baseDir, '../../../../windows/system32')).toThrow(
        'Sicherheitsverletzung',
      );
      expect(() => resolveSafePath(baseDir, '../other-folder')).toThrow('Sicherheitsverletzung');
    });
  });

  describe('scrubSensitiveText', () => {
    it('scrubs OpenAI API keys from error messages and logs', () => {
      const rawError = 'Call failed with key sk-proj-1234567890abcdef1234567890 for user';
      const scrubbed = scrubSensitiveText(rawError);

      expect(scrubbed).not.toContain('sk-proj-');
      expect(scrubbed).toContain('[REDACTED_API_KEY]');
    });

    it('scrubs Bearer tokens', () => {
      const log = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const scrubbed = scrubSensitiveText(log);

      expect(scrubbed).toBe('Authorization: Bearer [REDACTED_TOKEN]');
    });

    it('scrubs explicitly provided custom secrets', () => {
      const secret = 'super-secret-password-xyz';
      const log = `Connected using ${secret} successfully.`;
      const scrubbed = scrubSensitiveText(log, [secret]);

      expect(scrubbed).not.toContain(secret);
      expect(scrubbed).toContain('[REDACTED_SECRET]');
    });
  });

  describe('safeRedactApiKey', () => {
    it('redacts standard keys', () => {
      expect(safeRedactApiKey('sk-proj-abcdef123456')).toBe('sk-***456');
    });

    it('handles short keys safely without errors', () => {
      expect(safeRedactApiKey('short')).toBe('***');
      expect(safeRedactApiKey('')).toBe('[EMPTY_KEY]');
    });
  });
});
