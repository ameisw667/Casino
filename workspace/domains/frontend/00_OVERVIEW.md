# Domänen-Navigator: Frontend & Visuals

> **Domäne:** `workspace/domains/frontend` · **Stand:** 2026-09-19  
> **Zweck:** Zentrale Navigation für UI-Komponenten, Design-System, Motion und Bild-Assets.

---

## 1 — Modulübersicht

| Modul             | Verzeichnis                                                               | Beschreibung                              | Status   |
| :---------------- | :------------------------------------------------------------------------ | :---------------------------------------- | :------- |
| **Frontend Core** | [`T_FRONTEND/`](./T_FRONTEND/00_UEBERSICHT.md)                            | UI-Architektur, Token, Navigation, Motion | 🟢 Aktiv |
| **Bild-Assets**   | [`T_IMAGE/`](./T_IMAGE/00_bildgenerierung_uebersicht_jan.md)              | Generierte Assets & DALL-E Workflows      | 🟢 Aktiv |
| **Bild-Creation** | [`T_IMAGE_CREATION/`](./T_IMAGE_CREATION/00_IMAGE_CREATION_UEBERSICHT.md) | Inpainting, Asset-Lifecycle & Masking     | 🟢 Aktiv |

---

## 2 — Binnenstruktur

- `active/` — Aktuell in Bearbeitung befindliche UI- und Bildpläne
- `archive/` — Historische, bereits ausgeführte Frontend-Pläne
- `references/` — Stabile Design-Tokens, UI-Standards & Farbpaletten

---

## 3 — Wichtigste Invarianten

- **Design System:** Obsidian & Gold (Premium); Obsidian `#0B0E14`, Gold `#D4AF37`.
- **Z-Index-Hierarchie:** Shell `z-20`, Modals `z-50`, Overlays `z-900`.
- **Zero Wallet-Autorität:** Keine clientseitige Berechnung von Wallet, XP oder RNG.
