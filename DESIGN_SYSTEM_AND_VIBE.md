# Design System & Vibe-Guidelines (Casino Royale)

Dieses Dokument ist das zentrale Regelwerk für das UI/UX-Design und die visuelle Identität des Casino-Projekts. Jeder Entwickler und jeder KI-Agent **muss** sich bei der Erstellung oder Modifikation von Frontend-Komponenten zwingend an diese Vorgaben halten, um ein konsistentes, weltklasse Nutzererlebnis zu garantieren.

## 1. Visuelle Identität (Vibe)

Der gewählte Kern-Stil ist **"Obsidian & Gold (Premium)"**. Das Casino soll sich nicht nach billiger Arcade anfühlen, sondern wie ein luxuriöser, exklusiver VIP-Raum.

### A. Farbpalette (CSS Variablen)
- **Backgrounds (Obsidian):** Sehr dunkle, tiefschwarze Töne (z.B. `#0a0a0a` bis `#121212`). Kein reines Grau!
- **Accents (Gold):** Edle Gold-Töne für Call-to-Actions, Gewinne und wichtige Hervorhebungen (z.B. `#D4AF37` oder ein linearer Gold-Gradient).
- **Surfaces:** Leicht aufgehellte dunkle Töne für Cards und Modals (z.B. `rgba(255, 255, 255, 0.03)`).
- **Status:** 
  - Success/Win: Leuchtendes, sattes Smaragdgrün.
  - Error/Loss: Kühles, klares Rot (kein grelles Alarm-Rot, eher Rubinrot).

### B. UI-Komponenten Stil (Glassmorphismus)
- Modals, Navigation Bars und Dropdowns nutzen zwingend **Glassmorphismus**.
- **Regeln:** Nutzung von `backdrop-filter: blur(12px)` (oder höher) kombiniert mit stark transparenten Hintergründen (z.B. `bg-black/40` in Tailwind oder `rgba(0,0,0,0.4)` in CSS).
- **Borders:** Sehr subtile, halbtransparente weiße Ränder (z.B. `border: 1px solid rgba(255,255,255,0.08)`), um Kanten im Dunkeln zu betonen.

## 2. Typografie-Strategie (Blended)

Um sowohl optimale Lesbarkeit im UI als auch technische Präzision beim Glücksspiel zu gewährleisten, fahren wir eine strikte Zwei-Schriftarten-Strategie:

1. **UI & Text (Modern Sans-Serif):** 
   - *Einsatz:* Für Navigation, Buttons, Fließtext, Beschreibungen.
   - *Charakter:* Sauber, modern, hochgradig lesbar (z.B. Inter, Roboto, SF Pro Display).
2. **Werte & Tabellen (Technical / Mono):**
   - *Einsatz:* **EXKLUSIV** für Kontostände, Multiplikatoren (z.B. `1.45x`), Leaderboards, Game-Historie und Wettbeträge.
   - *Charakter:* Monospaced (jeder Buchstabe ist gleich breit). Das verhindert, dass das Layout bei schnellen Live-Updates (z.B. der hochzählende Multiplikator bei Crash) wackelt oder flackert.

## 3. Animationen & Motion (Bouncy & Playful)

Das Casino soll sich "lebendig" anfühlen. Tote, abrupte UI-Wechsel sind untersagt.
- **Engine:** Alle Animationen werden primär mit `framer-motion` umgesetzt.
- **Physik:** Wir nutzen standardmäßig **Spring-Physik** (Federn) statt linearen Übergängen.
  - *Beispiel:* Wenn ein Modal öffnet, skaliert es nicht stur von 0 auf 100%, sondern schießt kurz auf 105% und federt sanft auf 100% zurück.
  - *Code-Beispiel:* `transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}`
- **Interaktion:** Buttons haben zwingend `whileHover={{ scale: 1.02 }}` und `whileTap={{ scale: 0.95 }}`.

## 4. Z-Index Layering Architektur

Um z-index Kriege ("Mein Modal wird vom Header überdeckt") zu vermeiden, gelten folgende harte globale Variablen:
- `z-0` bis `z-10`: Normale Seiteninhalte (Games, Tabellen).
- `z-20`: Header / Navigation Bar.
- `z-30`: Dropdowns, Tooltips, Command Palette.
- `z-40`: Overlays / Backdrops (Der dunkle Hintergrund hinter Modals).
- `z-50`: Modals (Wallet, Settings, Profil).
- `z-100`: Globale Toasts, Live-Gewinn-Benachrichtigungen.
- `z-999`: Ladescreens (Loading Overlays).

---

## 5. Präziser LLM-Kontext & Ausführungsanweisungen (Prompt-Input)

Dieser Abschnitt definiert zwingende Regeln für LLM-Agenten, die an der Benutzeroberfläche (UI) oder User Experience (UX) arbeiten.

### Grundregeln für die LLM-Ausführung
1. **Glassmorphism-Check:** Wenn du eine Karte oder ein Modal baust, darfst du keinen soliden `rgb(30,30,30)` Hintergrund verwenden. Du **musst** die Kombination aus `backdrop-filter` und RGBA-Transparenz anwenden.
2. **Mono-Font-Check:** Wenn deine Komponente eine Zahl rendert, die sich schnell ändert (Balance, Multiplikator), **musst** du überprüfen, ob die CSS-Klasse für die Monospace-Schriftart angewandt wurde.
3. **Selbsttest-Mandat (ZWINGEND):** Nach Erstellung einer UI-Komponente musst du den Code auf TypeScript-Typisierungsfehler (z.B. fehlende Framer-Motion Props) testen.
4. **Vibe-Zerstörung:** Verzichte auf Standard-Browser-Alerts (`alert()`), hässliche native `<select>` Dropdowns oder ungestylte Checkboxen. Alles muss custom und "Premium" aussehen.

### Detaillierte Checkliste, Erfolgs- & Fehlerszenarien

#### Kategorie A: Globale CSS & Design-Token Setup
- **Implementierungsziel:** Definition der Kernfarben und Schriften im globalen Stylesheet (z.B. `globals.css` oder `tailwind.config.ts`).
- **Selbsttest-Anweisung:** LLM liest das globale Stylesheet und validiert, ob die `--primary-gold` und Glassmorphism-Utility-Klassen (`.glass-panel`) existieren.
- **Erfolgsszenario:**
  - `globals.css` enthält die Obsidian-Farbpalette als root-Variablen.
  - Es existiert eine wiederverwendbare CSS-Klasse `.glass-panel` mit `backdrop-filter: blur(12px)`.
- **Fehlerszenario (NICHT erfolgreich):**
  - Farben sind hardcodet in einzelnen Komponenten (z.B. `style={{ backgroundColor: '#111' }}`) verstreut, statt die CSS-Variablen zu nutzen.

#### Kategorie B: Modals & Überlagerungen
- **Implementierungsziel:** Erstellung eines neuen Modals (z.B. VIP-Status-Modal).
- **Selbsttest-Anweisung:** LLM prüft den vergebenen `z-index` Wert der Komponente gegen die Tabelle in Abschnitt 4.
- **Erfolgsszenario:**
  - Der Backdrop des Modals hat `z-40`, das Modal selbst `z-50`.
  - Das Modal nutzt Framer-Motion für den Einflug (Spring-Animation).
- **Fehlerszenario (NICHT erfolgreich):**
  - Das Modal hat `z-index: 9999`, was die definierte Architektur bricht.
  - Das Modal poppt ohne Animation direkt auf (zerstört den Premium-Vibe).

#### Kategorie C: Zahlen & Kontostände (Typography)
- **Implementierungsziel:** Anzeige des Echtzeit-Guthabens in der Header-Navigation.
- **Selbsttest-Anweisung:** LLM überprüft den Tag/die CSS-Klasse, in der der Wert `$ 1,000.00` gerendert wird.
- **Erfolgsszenario:**
  - Der Container für die Zahl nutzt die konfigurierte Mono-Schriftfamilie (z.B. `<span className="font-mono text-gold">`).
- **Fehlerszenario (NICHT erfolgreich):**
  - Die Zahl nutzt die Standard-Sans-Serif-Schrift. Bei jedem Rollout wackelt das UI horizontal hin und her, da die Ziffern (wie '1' und '8') unterschiedlich breit sind.
