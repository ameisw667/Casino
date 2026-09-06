export type CanvasMode = 'live' | 'static' | 'disabled';

/**
 * Fail-closed: fehlende WebGL-Erkennung (null) landet immer im DOM-Only-Modus,
 * nie in einem kaputten Canvas.
 */
export function resolveCanvasMode(
  hasWebGLSupport: boolean | null,
  prefersReducedMotion: boolean,
): CanvasMode {
  if (hasWebGLSupport !== true) return 'disabled';
  return prefersReducedMotion ? 'static' : 'live';
}

export function hasWebGLSupportInEnvironment(
  createElement: () => { getContext: (type: string) => unknown } | null,
): boolean {
  try {
    const canvas = createElement();
    if (!canvas) return false;
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
