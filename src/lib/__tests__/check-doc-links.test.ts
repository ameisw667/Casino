import { describe, expect, it } from 'vitest';
import { resolveCaseInsensitive } from '../../../scripts/check-doc-links.mjs';

// worldmap/06_check_doc_links_case_fallback.md — the check-doc-links CI gate treats a
// case-only mismatch (link target exists, only with different casing) as a non-blocking
// warning instead of a hard failure, since Windows dev machines are case-insensitive but the
// ubuntu-latest CI runner is not. Genuinely missing targets must keep failing.
describe('resolveCaseInsensitive', () => {
  it('resolves a filename-level case mismatch against a real, stable file', () => {
    expect(resolveCaseInsensitive('docs/readme.md')).toBe(true);
  });

  it('resolves a directory-level case mismatch against a real, stable file', () => {
    expect(resolveCaseInsensitive('DOCS/README.MD')).toBe(true);
  });

  it('resolves the exact casing too (no regression on the already-correct case)', () => {
    expect(resolveCaseInsensitive('docs/README.md')).toBe(true);
  });

  it('returns false for a target that does not exist under any casing', () => {
    expect(resolveCaseInsensitive('docs/this-file-truly-does-not-exist-anywhere.md')).toBe(false);
  });

  it('returns false when an intermediate directory segment does not exist at all', () => {
    expect(resolveCaseInsensitive('this-directory-does-not-exist/readme.md')).toBe(false);
  });

  it('does not escape the repo root via traversal segments', () => {
    // repoRelativePath is always produced by the caller via `relative(process.cwd(), ...)`,
    // so it never legitimately starts with "..", but the walk must not silently succeed either.
    expect(resolveCaseInsensitive('../outside-the-repo.md')).toBe(false);
  });
});
