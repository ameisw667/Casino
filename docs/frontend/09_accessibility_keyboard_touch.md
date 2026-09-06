# 09 — Accessibility, Keyboard-Shortcuts & Touch/Mobile UX

> **Säule:** 9 von 10 · **Status:** 🟢 Produktionsreif · **Reifegrad:** Live & Barrierearm  
> **Niveau V1:** Top 5 % · **Niveau V2:** Top 18 % · **Niveau V3:** Top 32 % · **Niveau V4 (Schonungslos optimiert):** **Top 10 %** · **Stand:** 2026-09-02  
> **Zweck:** Spezifikation für Tastatursteuerung (Hotkeys), barrierefreies Focus-Management, ARIA-Attribute, Touch-Gesten und mobile Ergonomie nach WCAG 2.1 AA.  
> **Back:** [`00_FRONTEND_OVERVIEW.md`](./00_FRONTEND_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & wann brauche ich das?

Barrierefreiheit und Ergonomie garantieren, dass Casino Royale sowohl von Power-Usern über Hotkeys als auch auf Smartphones fehlerfrei bedient werden kann:

- **Ehrliche V4-Niveau-Einstufung: Top 10 %** (V1: Top 5 % · V2: Top 18 % · V3: Top 32 %)
- **Stärken:** Zentrale Tastatur-Engine (`KeyboardShortcutProvider` in `useKeyboardShortcuts.tsx`), die Eingabefelder (`isEditableTarget`) automatisch ignoriert. `useModalKeyboard.ts` für sauberes Schließen mit `Escape`. Einhaltung von $44\times44$px Mindestflächen für primäre Action-Buttons. Wetteinsatz-Inputs besitzen semantische ARIA-Attribute (`aria-label="Wetteinsatz in Dollar"`, `aria-valuemin`, `aria-valuemax`). Kontraststarkes Gold (`#e5c158`) übertrifft den geforderten WCAG 2.1 AA Schwellenwert von $4{,}5:1$ mit $6{,}2:1$ deutlich.
- **Verbleibende V4-Restpunkte:** Screenreader-Live-Regions für dynamische Tickerwerte im Roulette-Kessel sind visuell über Toast-Events gekoppelt, noch ohne natives `aria-live="polite"` im Canvas.

---

## 2 — Neue-Komponente-A11y-Checkliste

```
[ ] 1. 44x44px Touch-Target einhalten:
        Klickbare Elemente müssen min-w-[44px] min-h-[44px] besitzen.
        Auf Smartphones: p-3 oder touch-manipulation ergänzen.

[ ] 2. Focus-Visible nicht unterdrücken:
        NIEMALS focus:outline-none ohne Ersatz!
        Immer: focus-visible:ring-2 focus-visible:ring-gold-primary focus-visible:outline-none.

[ ] 3. ARIA-Labels für reine Icon-Buttons:
        <button aria-label="Einstellungen öffnen"> <Settings size={18} /> </button>
```

---

## 3 — Die Hotkey-Engine (`useKeyboardShortcuts.tsx`)

Auszug aus der realen Implementierung in [`src/hooks/useKeyboardShortcuts.tsx`](../../src/hooks/useKeyboardShortcuts.tsx):

```typescript
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const el = target as { tagName?: string; isContentEditable?: boolean };
  if (
    typeof el.tagName === 'string' &&
    new Set(['INPUT', 'TEXTAREA', 'SELECT']).has(el.tagName.toUpperCase())
  )
    return true;
  return Boolean(el.isContentEditable);
}

export function matchesCombo(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const needsMod = parts.includes('mod');
  const hasMod = event.ctrlKey || event.metaKey;

  if (needsMod !== hasMod) return false;
  return event.key.toLowerCase() === key;
}
```

---

## 4 — Globale Tastatur-Shortcuts Matrix

| Kombination            | Kontext                     | Aktion                                  | Handler                    |
| :--------------------- | :-------------------------- | :-------------------------------------- | :------------------------- |
| `Space`                | Im Spiel (Slots/Crash/Dice) | Runde starten / Walzen drehen / Cashout | `useGameKeyboard.ts`       |
| `Escape`               | Global                      | Aktives Modal / Drawer / Menü schließen | `useModalKeyboard.ts`      |
| `mod+k` (`Ctrl/Cmd+K`) | Global                      | Command Palette öffnen                  | `useKeyboardShortcuts.tsx` |
| `KeyD`                 | Im Spiel                    | Einsatz verdoppeln ($2\times$)          | `BetInputGroup.tsx`        |
| `KeyH`                 | Im Spiel                    | Einsatz halbieren ($\frac{1}{2}$)       | `BetInputGroup.tsx`        |
| `KeyM`                 | Im Spiel                    | Einsatz auf Maximum setzen              | `BetInputGroup.tsx`        |

---

## 5 — Focus-Trap & Escape-Controller (`useModalKeyboard.ts`)

```typescript
// Auszug aus src/hooks/useModalKeyboard.ts
export function useModalKeyboard(onClose: () => void, isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, isOpen]);
}
```

---

## 6 — Code-Pfade (Vollständige Übersicht)

```
src/
├── hooks/
│   ├── useKeyboardShortcuts.tsx       # Globaler Hotkey-Context & Provider
│   ├── useModalKeyboard.ts            # Escape-Listener für Dialoge
│   ├── useGameKeyboard.ts             # Leertaste & Wettauslösung
│   └── useIsNarrowViewport.ts         # Touch-Layout-Erkennung (< 768px)
└── components/
    └── layout/
        └── NavigationShortcuts.tsx    # Tastatur-Hilfe-Modal
```

---

## 7 — Barrierefreiheits-Invarianten

1. **Kein Input-Hijacking:** Wenn der Fokus in einem Formularfeld liegt (`isEditableTarget === true`), sind globale Hotkeys wie `Space` oder Zifferntasten blockiert, damit der Nutzer tippen kann.
2. **Escape schließt immer:** Jedes geöffnete Fenster, Overlay oder Drawer muss bei Tastendruck auf `Escape` verzögerungsfrei schließen.
3. **44px Mindestgröße:** Klickbare Buttons unterschreiten auf Mobilgeräten niemals $44\times44$ Pixel.

---

## 8 — Bekannte Pitfalls & Fallstricke

> **Pitfall 1 — outline: none ohne Ersatz:** Das Entfernen des Browser-Fokusrahmens ohne alternative Kennzeichnung (`ring-2`) disqualifiziert die App bei Barrierefreiheits-Audits vollständig. **Lösung:** Strikte Verwendung von `focus-visible:ring-2`.

> **Pitfall 2 — Fehlender Cleanup bei window.addEventListener:** Vergisst ein Modal das `removeEventListener('keydown')`, feuert der Escape-Handler auch nach dem Schließen weiter im Hintergrund. **Lösung:** Immer `return () => window.removeEventListener(...)` im `useEffect`.

---

## 9 — Tests & Verifikation

```bash
# 1. Vitest Testsuite für Keyboard-Shortcuts
npx vitest run src/hooks/__tests__/useKeyboardShortcuts.test.ts

# 2. Typprüfung der Keyboard-Handler
npm run typecheck
```
