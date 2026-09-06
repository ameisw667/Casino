# 20 — IMG-10: Royale Guide gezielte Zustandsmotive (Welcome-Hero & Thinking-State)

> **Status:** Umgesetzt (lokal verifiziert) · **Stand:** 2026-09-05 · **Owner:** LLM · **Scope:** Einbindung des Casino-Maskottchens als Willkommens-Hero im leeren Chat-Panel und als lebendige 3D-Denk-Pose (`royale-guide-thinking.png`) während der KI-Antwortgenerierung in GuideThinkingSkeleton.tsx.  
> **Money-Pfad:** Nein · **Security-Review:** Nein · **Freigabe-Basis:** Option A im Workflow-Jan Option-Gate vom 2026-09-05.

---

## 1 — Übersicht für Jan

| Nummer | Meilenstein                                               |     Status     | Nächster Schritt                                                      | Zuständigkeit |
| :----: | :-------------------------------------------------------- | :------------: | :-------------------------------------------------------------------- | :-----------: |
| **L0** | Asset-Bereitstellung: `royale-guide-thinking.png`         |  🟢 Umgesetzt  | Asset vorhanden und über `next/image` responsiv ausgeliefert          |      LLM      |
| **L1** | Welcome-Hero im leeren Guide-Panel                        |  🟢 Umgesetzt  | Maskottchen erscheint ausschließlich vor der ersten Spieler-Nachricht |      LLM      |
| **L2** | Thinking-State-Integration in `GuideThinkingSkeleton.tsx` |  🟢 Umgesetzt  | Denkpose mit Gold-Puls und Status-Text eingebunden                    |      LLM      |
| **L3** | Transition- & Auto-Fade-Logik bei Chat-Start              |  🟢 Umgesetzt  | AnimatePresence blendet den Welcome-Hero weich aus                    |      LLM      |
| **L4** | Responsiv-Check (Mobile Drawer) & Typecheck               | 🟢 Verifiziert | Typecheck, Tests, Lint und Build lokal gelaufen                       |      LLM      |

---

## 2 — Ziel, Scope & Nicht-Scope

### 2.1 Ziel

Das Royale-Guide-Chatfenster verliert seinen sterilen Text- und Ladebalken-Charakter. Das Casino-Maskottchen (der helle Geist mit Goldturban) erhält einen festen Platz im Chat-Panel als sympathischer Begrüßer und als lebendiger Begleiter während der KI-Antwortberechnung.

### 2.2 In Scope

- **1 neues Bild-Asset (`public/images/royale-guide-thinking.png`):**
  - Master 1024×1024 PNG mit Alphatransparenz, Web-komprimiert (unter 80 KB).
  - _Motiv:_ Derselbe helle Geist aus [`royale-guide-mascot-white.png`](file:///v:/VibeCoding/Casino/public/images/royale-guide-mascot-white.png), jedoch in einer nachdenklichen Pose (z. B. Kinn aufgestützt, zarter Goldstaub um den Turban).
- **Willkommens-Zustand ([`GuideMessageList.tsx`](file:///v:/VibeCoding/Casino/src/components/social/casino-guide/GuideMessageList.tsx)):**
  - Vor der ersten Nutzereingabe (wenn nur die Initial-Begrüßung vorliegt) thront das Maskottchen zentriert über dem Begrüßungstext mit dezentem Floating-Effekt (`y: [-3, 3, -3]`).
- **Denk-Zustand ([`GuideThinkingSkeleton.tsx`](file:///v:/VibeCoding/Casino/src/components/social/casino-guide/GuideThinkingSkeleton.tsx)):**
  - Während `isSending` aktiv ist, schwebt der Denk-Avatar neben einem animierten Gold-Puls, bis das Server-Sent-Event (SSE) den ersten Text-Token liefert.
- **Sidebar-Unberührtheit ([`MainSidebar.tsx`](file:///v:/VibeCoding/Casino/src/components/layout/MainSidebar.tsx)):**
  - Das bewährte 28-px-Icon bleibt unverändert schlank und funktional.

### 2.3 Nicht-Scope (Explizit ausgeschlossen)

- Keine Verdrängung der drei Persona-Bilder (_Math Strategist, High-Roller Host, Casual Buddy_ in [`GuideHeader.tsx`](file:///v:/VibeCoding/Casino/src/components/social/casino-guide/GuideHeader.tsx)). Diese bleiben für die Strategie-Auswahl zuständig.
- Keine 3D-WebGL-Modellierung oder Rigging (Framer Motion 2.5D-Springs genügen vollkommen).
- Keine Änderungen an der OpenAI-Streaming-Logik oder API-Endpunkten.

---

## 3 — Technische Spezifikation

### 3.1 Floating-Animation (Framer Motion)

```typescript
const floatingAnimation = {
  y: [-4, 4, -4],
  transition: {
    duration: 3.6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};
```

### 3.2 Zustands-Reihenfolge im Chat-Panel

1. `turns.length === 0`: Willkommens-Maskottchen (64×64 px) im Chat-Header zentriert sichtbar.
2. `user sendet Frage`: Willkommens-Maskottchen blendet weich aus (`opacity: 0, height: 0`).
3. `isSending === true`: `GuideThinkingSkeleton` zeigt `royale-guide-thinking.png` (40×40 px) mit atmendem Goldglanz.
4. `Stream beginnt`: Nahtloser Übergang in den Text-Stream der gewählten Persona.

---

## 4 — Meilensteine im Detail

### L0: Asset-Bereitstellung

- **Ziel:** Erstellung und Ablage von `public/images/royale-guide-thinking.png`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Identische Gesichts- und Turban-Silhouette wie `royale-guide-mascot-white.png`, sauber freigestellt.

### L1: Welcome-Hero-Integration

- **Ziel:** Einbindung in `GuideMessageList.tsx`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Skaliert auf 64 px, bricht auf Smartphones nicht um, wirkt einladend und hochwertig.

### L2: Thinking-State-Integration

- **Ziel:** Neugestaltung von `GuideThinkingSkeleton.tsx`.
- **Zuständigkeit:** LLM.
- **Kriterien:** Ersetzt rein graue Balken durch schwebenden Avatar mit Goldpartikeln.

### L3: Fade-Out-Logik

- **Ziel:** Automatisches Ausblenden des Willkommens-Heroes bei erster Nachricht.
- **Zuständigkeit:** LLM.
- **Kriterien:** Kein abruptes Verschwinden, sondern weiche Framer-Motion-Transition (`AnimatePresence`).

### L4: Verifikation & Abschluss

- **Ziel:** Mobil- und Typprüfung.
- **Zuständigkeit:** LLM.
- **Kriterien:** `npm run typecheck` fehlerfrei, WCAG 2.2 AAA Dialog-Konformität bleibt erhalten.

---

## 5 — Selbstprüfung vor `Execution-Ready`

- [x] **Scope klar abgegrenzt:** Reines visuelles UI-Upgrade im Chat-Panel; keine Persona-Verdrängung.
- [x] **LLM-Zuständigkeit:** Alle Schritte L0–L4 liegen vollständig beim LLM.
- [x] **Performance-Garantie:** Unter 80 KB Payload, keine Layout-Verschiebungen.
- [x] **Verknüpfung:** Verlinkt in [`00_bildgenerierung_uebersicht_jan.md`](../T_IMAGE/00_bildgenerierung_uebersicht_jan.md) und [`02_bildgenerierung_top10_details.md#img-10`](../T_IMAGE/02_bildgenerierung_top10_details.md#img-10).
