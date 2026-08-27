# 11 — UI-Architektur: SettingsModal & Sicherheits-Zentrale

> **Typ:** UI/UX-Architektur · **Status:** 🟢 Produktionsreif · **Stand:** 2026-08-27  
> **Komponenten:** `SettingsPopover.tsx`, `SettingsModal.tsx` · **Back:** [`00_AUTH_OVERVIEW.md`](00_AUTH_OVERVIEW.md)

---

## 1 — High-Level: Was ist das & warum im nächsten Projekt?

Das `SettingsModal` ist die zentrale Sicherheits- und Verwaltungszentrale des Nutzers. Es bündelt die 4 sicherheitsrelevanten Einstellungs-Komponenten (Passkeys, 2FA, Identity Linking, Login-Historie) in einem responsiven 2-Spalten-Layout mit Obsidian & Gold Design.

---

## 2 — Dual-Mode-Konzept (Quick vs. Full)

1. **Modus A (Quick Popover):** Kompaktes Dropdown im Header für schnelle Anpassungen (Lautstärke, Sound-Effekte, Dark Mode).
2. **Modus B (Center Modal):** Großes 3-Tab-Zentralfenster (740px × 480px) mit Backdrop-Blur (12px) und Spring-Animation für vertiefte Sicherheits- und Profileinstellungen.

```
SettingsModal (740x480px)
├── Linke Spalte: Tab-Navigation (Audio, Sicherheit & Login, Benachrichtigungen)
└── Rechte Spalte: Tab-Content
    └── Tab "Sicherheit & Login":
        ├── 1. PasskeyManagementSection.tsx   (WebAuthn Biometrie)
        ├── 2. MfaManagementSection.tsx       (RFC 6238 TOTP 2FA)
        ├── 3. LinkedAccountsSection.tsx      (Google / E-Mail Verknüpfung)
        └── 4. LoginHistorySection.tsx        (DSGVO Audit-Timeline)
```

---

## 3 — Z-Index & Layering-Hierarchie

| Layer | Z-Index | Komponente |
| :--- | :--- | :--- |
| **Page Content** | `z-0` | Spielfelder, Lobby |
| **Header / Navigation** | `z-20` | Sticky Top-Bar, Quick Popover |
| **Modal Backdrop** | `z-50` | Dunkler Blur-Hintergrund |
| **Modal Container** | `z-50` | `SettingsModal.tsx` |
| **Toast Notifications** | `z-999` | Erfolgs- / Fehlermeldungen |

---

## 4 — Code-Pfade

```
src/components/casino/
├── SettingsPopover.tsx          # Header-Trigger & Quick-Controls
├── SettingsModal.tsx            # 3-Tab Center Modal
├── PasskeyManagementSection.tsx # Säule 1
├── MfaManagementSection.tsx     # Säule 2
├── LinkedAccountsSection.tsx    # Säule 3
└── LoginHistorySection.tsx      # Säule 6
```
