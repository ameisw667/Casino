# 25 — Analytics-Kontext und Änderungsworkflow

> **Status:** Executed (archiviert) · **Stand:** 2026-08-21 · **Owner:** Jan + LLM · **Scope:** Analytics-Inventar in `xx_docs/`, Änderungsworkflow in SOP 08; `CLAUDE.md`, `AGENTS.md` und `GEMINI.md` bleiben unverändert.

## 1 — Übersicht für Jan

| Nummer | Meilenstein | Status | Nächster Schritt | Zuständigkeit |
| --- | --- | --- | --- | --- |
| L0 | Plan, Scope und Ausgangslage | 🟢 Executed | Kontextreferenz erstellen | LLM |
| L1 | `xx_docs/06_analytics_context.md` | 🟢 Executed | Laufzeitkette, Module und Privacy-Vertrag dokumentiert | LLM |
| L2 | `xx_sop/08_analytics_posthog.md` | 🟢 Executed | Veraltete Bezeichner und Eventbeispiele ersetzt | LLM |
| L3 | Quellen-, Link- und Scope-Prüfung | 🟢 Executed | Event-Allowlist, Links und Kernanweisungen geprüft | LLM |

## 2 — Ziel und Nicht-Scope

- Ausgangsniveau: Top 35–45 % für Analytics-Dokumentation — die Kernsektion war nützlich, die vorhandene SOP nannte aber falschen Consent-Key, falsche Exporte und nicht vorhandene Events.
- Gewählte Struktur: Kerninvariante im späteren `CLAUDE.md`-Vorschlag, Systemkarte in `xx_docs/`, Änderungsablauf in SOP 08.
- Zielniveau: Top 10–12 % für Analytics-Routing und Dokumentationskorrektheit.
- Nicht-Scope: Keine Produkt-Analytics-Events, keine Providerkonfiguration, keine Secrets, keine Löschanbindung und kein Edit der drei Kernanweisungsdateien.

## 3 — Zwei-Perspektiven-Prüfung

| Perspektive | Anforderung | Prüfung |
| --- | --- | --- |
| Privacy und Security | Consent, Pseudonymisierung und Erasure dürfen nicht zu Rohdatenversand oder impliziter Löschung führen. | Kontext und SOP enthalten dieselben Consent-, HMAC- und Freigabegrenzen. |
| Drift und Bedienbarkeit | Kurzkontext darf keine falschen Exporte, Eventnamen oder Archivbehauptungen mitführen. | Event-Union, Exporte, Route, Call-Sites und Tests gegen den Code abgeglichen. |

## 4 — Abnahme

- Kontextreferenz trennt Produkt-Analytics von Admin-BI, Sentry und Guide-Telemetrie.
- SOP verweist auf Kontext statt ein zweites Modul-Inventar zu kopieren.
- Erasure wird als unverdrahtete Funktion, nicht als aktiver Löschprozess dokumentiert.
- Kein Edit von `CLAUDE.md`, `AGENTS.md` oder `GEMINI.md`.
