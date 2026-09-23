export interface CanvasBackingSize {
  width: number;
  height: number;
}

export function resolveDevicePixelRatio(rawValue: number | undefined): number {
  return rawValue || 1;
}

export function getCanvasBackingSize(
  displayWidth: number,
  displayHeight: number,
  dpr: number,
): CanvasBackingSize {
  return {
    width: displayWidth * dpr,
    height: displayHeight * dpr,
  };
}

export function needsBackingStoreUpdate(
  canvasWidth: number,
  canvasHeight: number,
  target: CanvasBackingSize,
): boolean {
  return canvasWidth !== target.width || canvasHeight !== target.height;
}
