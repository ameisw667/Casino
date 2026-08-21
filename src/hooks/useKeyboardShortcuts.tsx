'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

export interface ShortcutDefinition {
  /** e.g. "mod+k", "escape", "1", "s". "mod" matches Ctrl or Cmd. */
  combo: string;
  handler: () => void;
}

interface KeyboardShortcutContextValue {
  registerShortcut: (id: string, definition: ShortcutDefinition) => void;
  unregisterShortcut: (id: string) => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | null>(null);

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (EDITABLE_TAGS.has(target.tagName)) return true;
  return target.isContentEditable;
}

export function matchesCombo(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const needsMod = parts.includes('mod');
  const needsShift = parts.includes('shift');
  const needsAlt = parts.includes('alt');
  const hasMod = event.ctrlKey || event.metaKey;

  if (needsMod !== hasMod) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;
  return event.key.toLowerCase() === key;
}

export function KeyboardShortcutProvider({ children }: { children: React.ReactNode }) {
  const registryRef = useRef(new Map<string, ShortcutDefinition>());

  const registerShortcut = useCallback((id: string, definition: ShortcutDefinition) => {
    registryRef.current.set(id, definition);
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    registryRef.current.delete(id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      for (const definition of registryRef.current.values()) {
        if (matchesCombo(event, definition.combo)) {
          event.preventDefault();
          definition.handler();
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({ registerShortcut, unregisterShortcut }),
    [registerShortcut, unregisterShortcut],
  );

  return (
    <KeyboardShortcutContext.Provider value={value}>{children}</KeyboardShortcutContext.Provider>
  );
}

/** Raw registry access for callers registering multiple shortcuts at once (e.g. nav lists). */
export function useKeyboardShortcuts(): KeyboardShortcutContextValue {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  return context;
}

/** Convenience hook for a single shortcut. Pass `enabled=false` to temporarily deregister. */
export function useKeyboardShortcut(
  id: string,
  combo: string,
  handler: () => void,
  enabled = true,
) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return undefined;
    registerShortcut(id, { combo, handler: () => handlerRef.current() });
    return () => unregisterShortcut(id);
  }, [id, combo, enabled, registerShortcut, unregisterShortcut]);
}
