// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { isEditableTarget, matchesCombo } from '../useKeyboardShortcuts';

function keydown(key: string, modifiers: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, ...modifiers });
}

describe('matchesCombo', () => {
  it('matches a plain single-key combo', () => {
    expect(matchesCombo(keydown('1'), '1')).toBe(true);
    expect(matchesCombo(keydown('2'), '1')).toBe(false);
  });

  it('is case-insensitive on the key', () => {
    expect(matchesCombo(keydown('S'), 's')).toBe(true);
  });

  it('requires ctrl or meta for a "mod" combo', () => {
    expect(matchesCombo(keydown('k', { ctrlKey: true }), 'mod+k')).toBe(true);
    expect(matchesCombo(keydown('k', { metaKey: true }), 'mod+k')).toBe(true);
    expect(matchesCombo(keydown('k'), 'mod+k')).toBe(false);
  });

  it('rejects a mod-combo when no modifier is pressed and vice versa', () => {
    expect(matchesCombo(keydown('1', { ctrlKey: true }), '1')).toBe(false);
    expect(matchesCombo(keydown('k'), 'mod+k')).toBe(false);
  });

  it('matches "escape" case-insensitively', () => {
    expect(matchesCombo(keydown('Escape'), 'escape')).toBe(true);
  });

  it('requires shift/alt only when explicitly part of the combo', () => {
    expect(matchesCombo(keydown('k', { shiftKey: true }), 'shift+k')).toBe(true);
    expect(matchesCombo(keydown('k'), 'shift+k')).toBe(false);
    expect(matchesCombo(keydown('k', { shiftKey: true }), 'k')).toBe(false);
  });
});

describe('isEditableTarget', () => {
  it('returns true for input, textarea and select elements', () => {
    expect(isEditableTarget(document.createElement('input'))).toBe(true);
    expect(isEditableTarget(document.createElement('textarea'))).toBe(true);
    expect(isEditableTarget(document.createElement('select'))).toBe(true);
  });

  it('returns true for contenteditable elements', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'isContentEditable', { value: true, configurable: true });
    expect(isEditableTarget(div)).toBe(true);
  });

  it('returns false for regular elements and non-element targets', () => {
    expect(isEditableTarget(document.createElement('div'))).toBe(false);
    expect(isEditableTarget(document.createElement('button'))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});
