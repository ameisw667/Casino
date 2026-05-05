# 🛡️ Casino Royale: Stability & Build Workflow

Dieser Workflow wird vom **DevOps-Slayer** und dem **Bug-Hunter** ausgeführt, um die Produktionsreife des Codes sicherzustellen.

## 📋 Ablaufschritte

### 1. Statische Analyse (Linting)
- **Befehl:** `npm run lint`
- **Ziel:** Suche nach Syntaxfehlern, ungenutzten Variablen und TypeScript-Typkonflikten.
- **Vibe-Check:** Keine "Any"-Typen in kritischen Pfaden (Wallet, Bets).

### 2. Dependency-Audit
- **Befehl:** `npm audit`
- **Ziel:** Prüfung auf bekannte Sicherheitslücken in den installierten Paketen.
- **Aktion:** Bei "High" oder "Critical" Fehlern muss eine sofortige Aktualisierung oder ein Fix erfolgen.

### 3. Production Build Test
- **Befehl:** `npm run build`
- **Ziel:** Sicherstellen, dass die Next.js-Optimierung fehlerfrei durchläuft.
- **Validierung:** Prüfung, ob alle dynamischen Routen (`/games/[id]`) korrekt generiert werden können.

### 4. SEO & Metadata Audit
- **Check:** Überprüfung der `layout.tsx` und Seiten-Metadaten.
- **Standard:** Jede Seite muss einen Titel, eine Beschreibung und OpenGraph-Tags für den "Premium-Look" haben.

### 5. Mobile-Final-Check (Sync)
- **Check:** Kurze Validierung der Viewport-Einstellungen (iPhone 15 Baseline).

---
**Trigger:** `/stability-check` oder manuelle Aufforderung an den DevOps-Slayer.
