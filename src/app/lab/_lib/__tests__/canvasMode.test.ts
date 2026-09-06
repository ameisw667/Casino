import { describe, expect, it } from 'vitest';
import { resolveCanvasMode, hasWebGLSupportInEnvironment } from '../canvasMode';

describe('resolveCanvasMode', () => {
  it('kein WebGL → DOM-Only (fail-closed)', () => {
    expect(resolveCanvasMode(false, false)).toBe('disabled');
  });

  it('unbekannte WebGL-Lage (null) → DOM-Only, nie kaputter Canvas', () => {
    expect(resolveCanvasMode(null, false)).toBe('disabled');
  });

  it('WebGL ohne reduced motion → live', () => {
    expect(resolveCanvasMode(true, false)).toBe('live');
  });

  it('WebGL mit reduced motion → static', () => {
    expect(resolveCanvasMode(true, true)).toBe('static');
  });
});

describe('hasWebGLSupportInEnvironment', () => {
  it('fehlende Canvas-Fabrik → false', () => {
    expect(hasWebGLSupportInEnvironment(() => null)).toBe(false);
  });

  it('Canvas ohne WebGL-Kontext → false', () => {
    expect(hasWebGLSupportInEnvironment(() => ({ getContext: () => null }))).toBe(false);
  });

  it('WebGL2 verfügbar → true', () => {
    expect(
      hasWebGLSupportInEnvironment(() => ({
        getContext: (type: string) => (type === 'webgl2' ? {} : null),
      })),
    ).toBe(true);
  });

  it('werfende Umgebung → false statt Crash', () => {
    expect(
      hasWebGLSupportInEnvironment(() => {
        throw new Error('broken env');
      }),
    ).toBe(false);
  });
});
