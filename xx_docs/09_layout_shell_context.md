# 09 — Layout, Shell & UI-Provider-Kontext

> **Zweck:** Modulkarte für das Root-Layout (`src/app/layout.tsx`), den Shell-Router (`src/components/layout/ClientShell.tsx`) und globale UI-Provider. Design-System: [SOP Design System & UI](../xx_sop/04_design_system_ui.md).

---

## 1 — Systemgrenze & Render-Hierarchie

* `src/app/layout.tsx` erzwingt `export const dynamic = 'force-dynamic'`, da Middleware und Session-Provider jede Anfrage dynamisch verarbeiten.
* **Typografie & Fonts:** `IBM_Plex_Sans` (UI-Body, CSS-Variable `--font-inter`) und `IBM_Plex_Mono` (Zahlen/Multiplikatoren, CSS-Variable `--font-mono`).
* **Root-Provider (`ClientProviders`):** Kapselt `SupabaseSessionProvider` (React Context für `supabase.auth.onAuthStateChange`) und globale Theme-Variablen.

---

## 2 — Shell-Routing (`ClientShell.tsx`)

`ClientShell` schützt die UI vor Navigations- und Layout-Konflikten durch strikte Pfad-Trennung:

* **Admin-Bereich (`/admin/**`):** Rendert `AdminLayout` (Admin-Sidebar, Berechtigungs-Header, Fraud-Alerts).
* **Standard-App (alle regulären Routen):** Rendert `MainLayout` + `OnboardingFlow` (Sidebar-Navigation, Header mit Wallet-HUD, Modals, GlobalChat).
* **Isolierte Sandboxen (`/v2`, `/refactoring`, `/testing`):** Rendert Bare-Components ohne `MainLayout`/`AdminLayout`-Shell, um visuelle Prototypen ohne globale UI-Interferenzen zu entwickeln.

---

## 3 — Globale UI-Layer in `MainLayout`

`MainLayout` koordiniert alle globalen Overlays nach der Z-Index-Hierarchie:

* **Navigations-Layer (`z-20`):** `Header` und `Sidebar`.
* **Interaktions-Layer (`z-30`):** Filter-Dropdowns, Schnellmenüs.
* **Kommunikations-Layer (`z-40`):** `GlobalChat` und Drawer.
* **Modal-Layer (`z-50`):** `WalletModal`, `SettingsModal`, `PlayerProfileModal`, `RankBenefitsModal`.
* **Overlay-Layer (`z-50+`):** `BigWinOverlay` (Vollbild-Animation bei Big-Wins), `CommandPalette`.

---

## 4 — Bereinigung & Invarianten

* **Feature-Stripdown:** `DailyReward` und `Challenges` wurden vollständig aus dem Layout entfernt.
* **Keine Sandbox-Lecks:** `/v2` und `/refactoring` dürfen niemals globale Navigationselemente von `MainLayout` mounten.
