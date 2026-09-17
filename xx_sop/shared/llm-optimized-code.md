---
name: llm-optimized-code
description: Schreibe Code, den LLMs (Claude, Gemini) schnell, token-sparend und präzise verstehen. Universell für alle VibeCoding-Projekte — Python, JavaScript, TypeScript, HTML, CSS.
version: 1.0.0
---

# LLM-Optimized Code

Code so strukturieren, dass LLMs ihn mit minimalen Tokens und maximaler Präzision verstehen. Jede Regel spart Context-Window-Platz und Reasoning-Zeit.

---

## 1. File-level TOC

Jede Datei >200 Zeilen bekommt eine 3–5-zeilige Inhaltsübersicht ganz am Kopf. Das LLM sieht sofort, was wo steht — statt die ganze Datei zu scannen.

```python
# ✅ GUT — LLM kennt die Dateistruktur in 3 Zeilen
# server.py — HTTP proxy + stats API + dashboard serving
# Structure: helpers → SSE → DB worker → tokenizer → cost/util → ProxyHandler → import workers → main()


# ❌ SCHLECHT — LLM muss 830 Zeilen scannen, um zu verstehen was die Datei macht
import csv
import json
...
```

**Regel:** TOC nur bei >200 Zeilen. Darunter lohnt der Overhead nicht.

---

## 2. Type Annotations

Volle Typ-Hints auf allen Funktionssignaturen. Typen sind Mini-Dokumentation — das LLM sieht Datenfluss ohne den Body parsen zu müssen.

```python
# ❌ SCHLECHT — LLM muss Body lesen, um Rückgabetyp zu erraten
def _parse_date_range(date_from, date_to, range_days, default_days=7):


# ✅ GUT — LLM erkennt in einer Zeile: nimmt Strings/Optionals, gibt String-Tupel zurück
def _parse_date_range(date_from: Optional[str], date_to: Optional[str], range_days: int, default_days: int = 7) -> Tuple[str, Optional[str]]:
```

```javascript
// ✅ GUT — JSDoc für vanilla JS
/**
 * @param {Array<{bucket: string, total_tokens: number}>} series
 * @param {SVGElement} svg
 */
function renderSVGChart(svg, metaEl, tooltip, series, dataKey, valueFormatter, strokeColor, gradientId, dotColor, axisFormatter) {
```

**Regel:** Jede öffentliche Funktion bekommt Typen. Private Helper mindestens Rückgabetyp.

---

## 3. Single Responsibility

Funktionen machen genau eine Sache, max. ~50 Zeilen. Der Name sagt was, die Signatur sagt wie — der Body erklärt sich dann von selbst.

```python
# ❌ SCHLECHT — 158 Zeilen, 4 verschiedene Aufgaben (Setup, HTTP, Streaming, DB)
def _handle_ollama_proxy_post(self, endpoint, ...):
    start = time.perf_counter()            # Setup
    payload = json.loads(...)              # Parsing
    with urlopen(request) as response:     # HTTP
        if not stream:
            body = response.read()         # Non-streaming
            ...
        else:
            for line in response:          # Streaming
                ...
    _db_queue.put({...})                   # DB write


# ✅ GUT — 3 Funktionen mit je einer Verantwortung
def _handle_ollama_proxy_post(self, endpoint, ...):
    """Orchestrate: parse → proxy → enqueue."""
    metrics = self._read_proxy_body(response, start) if not stream \
         else self._stream_proxy_body(response, start)
    _db_queue.put({...})

def _read_proxy_body(self, response, start: float) -> Tuple[int, int, int, int, Optional[float], Optional[str]]:
    """Non-streaming: read body → write to client → return metrics."""

def _stream_proxy_body(self, response, start: float) -> Tuple[int, int, int, int, Optional[float], Optional[str]]:
    """Streaming: chunked transfer → parse inline metrics → return aggregated results."""
```

**Regel:** Wenn du beim Beschreiben einer Funktion das Wort "und" brauchst, ist es Zeit zum Aufteilen.

---

## 4. Warum-Kommentare (nicht Was-Kommentare)

Kommentare erklären nur nicht-offensichtliche Design-Entscheidungen. Niemals das WAS paraphrasieren — das sieht das LLM am Code.

```python
# ❌ SCHLECHT — paraphrasiert nur den Code, reine Token-Verschwendung
prompt_eval = int(data.get("prompt_eval_count") or 0)  # Get prompt eval count
eval_count = int(data.get("eval_count") or 0)           # Get eval count


# ✅ GUT — erklärt WARUM (nicht-offensichtliche Entscheidung)
# Regex-based BPE approximation — more accurate than simple len/4 for subword tokenizers
_TOKEN_RE = re.compile(r"""(?x)\s?[A-Za-zÄÖÜäöüß]+|\s?\d+|\s?[^\s\w]""")


# ✅ GUT — erklärt den Grund für scheinbar redundanten Code
# Instruct Excel to use comma delimiter (German Excel expects semicolon by default)
buf.write("sep=,\n")
```

**Regel:** Ein Kommentar muss eine Frage beantworten, die der Code nicht selbst beantwortet.

---

## 5. Named Constants

Magic Numbers und Strings durch benannte Konstanten ersetzen. Das LLM muss nicht raten, warum es 15, 300 oder "gemma" ist.

```python
# ❌ SCHLECHT — das LLM muss raten: warum 15? hängt das mit anderen 15ern zusammen?
while True:
    time.sleep(15)
    self.wfile.write(b": heartbeat\n\n")


# ✅ GUT — LLM versteht sofort: das ist der SSE-Heartbeat, 15 Sekunden Intervall
SSE_HEARTBEAT_SECONDS = 15
CLAUDE_IMPORT_INTERVAL_SECONDS = 300
DEFAULT_INPUT_RATE = float(os.getenv("DEFAULT_INPUT_COST_PER_1K_EUR", "0.003"))

while True:
    time.sleep(SSE_HEARTBEAT_SECONDS)
    self.wfile.write(b": heartbeat\n\n")
```

**Regel:** Jede Zahl/String, die kein offensichtlicher Teil einer Formel ist, wird Konstante.

---

## DRY: Duplicate Code ist Token-Missbrauch

Jede kopierte Codezeile zwingt das LLM, dieselbe Logik mehrfach zu parsen. Das verschwendet Context-Window und erhöht das Risiko, dass ein Bugfix eine Kopie verpasst.

```python
# ❌ SCHLECHT — 7× die gleiche Date-Range-Logik, 7× Token-Verbrauch
# In /api/stats/summary:
from_iso = f"{date_from}T00:00:00Z" if date_from else (datetime.now(timezone.utc) - timedelta(days=range_days)).isoformat()
# In /api/stats/timeseries:
from_iso = f"{date_from}T00:00:00Z" if date_from else (datetime.now(timezone.utc) - timedelta(days=range_days)).isoformat()
# In /api/stats/models: ... (5 weitere identische Kopien)


# ✅ GUT — 1× definiert, 7× aufgerufen. LLM versteht es einmal, vertraut den Aufrufen.
def _parse_date_range(date_from: Optional[str], date_to: Optional[str], range_days: int, default_days: int = 7) -> Tuple[str, Optional[str]]:
    from_iso = f"{date_from}T00:00:00Z" if date_from else (datetime.now(timezone.utc) - timedelta(days=range_days)).isoformat()
    to_iso = f"{date_to}T23:59:59Z" if date_to else None
    return from_iso, to_iso
```

**Regel:** 3 oder mehr Kopien → Extraktion. 2 Kopien → Extraktion wenn >5 Zeilen.

---

## CSS/HTML: Trennung von Struktur und Stil

Embedded CSS und Inline-Styles zwingen das LLM, Stil-Regeln im HTML-Kontext zu parsen. Ausgelagertes CSS kann separat verstanden werden.

```html
<!-- ❌ SCHLECHT — 216 Zeilen CSS mitten im HTML, LLM muss ständig Kontext wechseln -->
<style>
  .detail-table { ... }
  .badge { ... }
  .summary-strip { ... }
  /* ... 200 weitere Zeilen */
</style>
<div class="detail-table">...</div>

<!-- ✅ GUT — eine Zeile im Head, CSS separat versteh- und cache-bar -->
<link rel="stylesheet" href="/assets/styles.css" />
```

```html
<!-- ❌ SCHLECHT — Inline-Styles zwingen LLM, Styling im Markup-Kontext zu verstehen -->
<a
  href="/pricing"
  style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;color:var(--muted);text-decoration:none;font-size:13px;font-weight:600;"
  onmouseover="this.style.color='var(--amber)'"
  onmouseout="this.style.color='var(--muted)'"
  >Pricing</a
>

<!-- ✅ GUT — Klasse referenziert, CSS-Regeln einmal im Stylesheet -->
<a href="/pricing" class="nav-btn nav-amber">Pricing</a>
```

---

## Zusammenfassung: LLM-First Checkliste

Vor dem Commit prüfen:

- [ ] Datei >200 Zeilen: TOC am Kopf vorhanden?
- [ ] Alle Funktionssignaturen haben Type Hints / JSDoc?
- [ ] Funktionen <50 Zeilen, machen genau eine Sache?
- [ ] Keine "Was"-Kommentare — nur "Warum"?
- [ ] Keine Magic Numbers — alle benannt?
- [ ] Kein kopierter Code (>2×)?
- [ ] Kein Embedded CSS/Inline-Style?
