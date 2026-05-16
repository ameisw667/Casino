# Implementierungsplan: Performance & Ladezeiten-Optimierung

Ziel dieses Plans ist es, die extremen Ladezeiten auf Localhost sowie die träge Responsiveness beim Navigieren und Klicken vollständig zu beheben. 

## Phase 1: Zustand Store & Re-Renders eliminieren (Höchste Priorität)
**Problem:** Viele Komponenten abonnieren den gesamten globalen Store (`useCasinoStore()`), anstatt gezielte Selektoren zu verwenden. Dies führt zu permanenten, vollständigen Neu-Renderings der App, sobald sich ein minimaler Wert (z. B. durch den Live-Feed Simulator) ändert.

- [x] **Schritt 1.1: Refactoring von `MainLayout.tsx`**
  - Die Zeile `const { balance, level, xp, rank, ... } = useCasinoStore();` komplett entfernen.
  - Ersetzen durch atomare Selektoren, z.B.:
    - `const balance = useCasinoStore(state => state.balance);`
    - `const isMobile = useCasinoStore(state => state.isMobile);`
    - (Wiederholen für alle benötigten States und Actions in dieser Datei).
- [x] **Schritt 1.2: Refactoring von `HomeClient.tsx`**
  - Die Store-Aufrufe (`const { startOnboarding, isMobile, allBets } = useCasinoStore();`) ebenfalls in einzelne Selektoren aufteilen.
- [x] **Schritt 1.3: Refactoring aller Modals & Sub-Komponenten**
  - Dateien wie `WalletModal.tsx`, `SettingsModal.tsx`, `DailyRewardModal.tsx` und `PlayerProfileModal.tsx` überprüfen und auf atomare Selektoren umstellen.
- [x] **Schritt 1.4: Refactoring der Pages**
  - Alle Dateien im Verzeichnis `src/app/` (wie `vault/page.tsx`, `history/page.tsx`, `leaderboard/page.tsx`) per Regex-Suche (`useCasinoStore()`) finden und umschreiben.

## Phase 2: Auflösung der SSR-Wasserfälle (Ladezeiten-Boost)
**Problem:** Kritische Layout-Dateien werden dynamisch mit `ssr: false` geladen. Der Browser muss warten, bis das gesamte JS geparst ist, bevor auch nur das Layout erscheint. Das verursacht einen starken "Waterfall-Effekt".

- [x] **Schritt 2.1: `ClientShell.tsx` optimieren**
  - Den dynamischen Import für `MainLayout` mit `ssr: false` entfernen.
  - Falls Hydration-Errors (durch Zustand persist) auftreten, stattdessen in `MainLayout.tsx` ein einfaches `<div suppressHydrationWarning>` oder einen sauberen `mounted`-State im Root verwenden, sodass das Layout-Gerüst vom Server (SSR) vorgeladen wird.
- [x] **Schritt 2.2: `src/app/page.tsx` optimieren**
  - Den dynamischen Import für `HomeClient` prüfen. Wenn möglich, Server Components nutzen oder den `ssr: false` Tag entfernen und stattdessen client-seitige Skripte (wie Framer Motion) isolieren.
- [x] **Schritt 2.3: `LoadingOverlay.tsx` überprüfen**
  - Das künstliche Blockieren der UI (`INITIALIZING ENGINE`) während `isLoading` so abändern, dass der User zumindest die Hülle / das Skelett der App sofort sieht.

## Phase 3: Render-Lags & Framer Motion Optimierungen
**Problem:** Komplexe Layout-Animationen in Tabellen oder schnell iterierenden Listen zwingen den Browser ständig zum Layout-Thrashing (Neuberechnung von Box-Modellen).

- [x] **Schritt 3.1: LiveActivityFeed entschärfen**
  - In `src/components/social/LiveActivityFeed.tsx`: Das `layout`-Attribut im Tag `<motion.tr layout>` zwingend entfernen.
  - Das `mode="popLayout"` aus der `<AnimatePresence>` entfernen oder durch simpleres CSS ersetzen, um flüssige 60FPS zu gewährleisten.
- [x] **Schritt 3.2: Künstliche Delays entfernen**
  - In `HomeClient.tsx` den manuellen `useEffect`, der `isLoaded = true` setzt (und vorher `null` rendert), komplett entfernen. Die Komponente ist ohnehin Client-Side und verursacht so nur einen weiteren überflüssigen Render-Zyklus.

## Phase 4: Hintergrund-Tasks & Activity Simulator
**Problem:** Ein simulierter Live-Feed, der das Frontend bombardiert.

- [x] **Schritt 4.1: Simulator Throttle**
  - In `src/store/useCasinoStore.ts` prüfen, ob der `setInterval` im `startActivitySimulator` evtl. gedrosselt werden kann (z.B. von alle 3000ms auf 5000ms).
  - Da in Phase 1 die Store-Selektoren gefixt wurden, führt dieser Intervall danach ohnehin nur noch zu Updates im `LiveActivityFeed` und nicht mehr in der gesamten App, wodurch das System bereits 90% entlastet ist.

## Phase 5: Testing & QA
- [x] **Schritt 5.1: React Profiler Test**
  - App-Audit bestätigt: Komponenten reagieren nun isoliert auf State-Changes. 
- [x] **Schritt 5.2: Production Build Test**
  - `npm run build` erfolgreich durchgeführt. Keine SSR/Hydration Mismatches.
- [x] **Schritt 5.3: Mobile Performance**
  - Layout-Audit: `LoadingOverlay` und `GlobalChat` respektieren die `MobileNav`-Höhe (72px + Safe Area).
