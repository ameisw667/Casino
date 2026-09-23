import { describe, expect, test } from 'vitest';
import {
  getCanvasBackingSize,
  needsBackingStoreUpdate,
  resolveDevicePixelRatio,
} from '../canvas-frame';

describe('resolveDevicePixelRatio', () => {
  test('nimmt den gemeldeten Wert an', () => {
    expect(resolveDevicePixelRatio(2)).toBe(2);
    expect(resolveDevicePixelRatio(1.5)).toBe(1.5);
  });

  test('fällt auf 1 zurück, wenn der Browser nichts meldet', () => {
    expect(resolveDevicePixelRatio(undefined)).toBe(1);
    expect(resolveDevicePixelRatio(0)).toBe(1);
  });
});

describe('getCanvasBackingSize', () => {
  test('skaliert die Anzeigefläche mit der Pixeldichte', () => {
    expect(getCanvasBackingSize(800, 400, 1)).toEqual({ width: 800, height: 400 });
    expect(getCanvasBackingSize(800, 400, 2)).toEqual({ width: 1600, height: 800 });
  });

  test('bleibt bei gebrochener Pixeldichte berechenbar', () => {
    expect(getCanvasBackingSize(801, 401, 1.25)).toEqual({ width: 1001.25, height: 501.25 });
  });
});

describe('needsBackingStoreUpdate', () => {
  test('fordert ein Update bei abweichender Größe', () => {
    const target = getCanvasBackingSize(800, 400, 2);

    expect(needsBackingStoreUpdate(800, 400, target)).toBe(true);
    expect(needsBackingStoreUpdate(1600, 400, target)).toBe(true);
  });

  test('schweigt, wenn die Größe bereits stimmt', () => {
    const target = getCanvasBackingSize(800, 400, 2);

    expect(needsBackingStoreUpdate(1600, 800, target)).toBe(false);
  });
});
