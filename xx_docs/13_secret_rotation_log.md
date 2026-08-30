# 13 — Secret-Rotation-Log

> **Zweck:** Nachweis, wann ein Secret zuletzt rotiert wurde — **niemals ein Wert**, ausschließlich Datum + Grund. Grundlage für `npm run check-secret-rotation` (`scripts/check-secret-rotation-due.ts`), das dieses Log gegen die Turnus-Tabelle in [`xx_sop/14_secret_rotation.md`](../xx_sop/14_secret_rotation.md) Abschnitt 1 prüft.
> **Pflege:** Nach jeder tatsächlichen Rotation (Schritt 7 in `xx_sop/14_secret_rotation.md` Abschnitt 2) oder nach einem Incident (Schritt 6 in Abschnitt 5) einen Eintrag ergänzen. Ein fehlender Eintrag für ein bekanntes Secret wird vom Skript als „nie rotiert, sofort prüfen" gewertet — absichtlich konservativ.

| Secret | Letztes Rotationsdatum | Grund | Klasse (siehe SOP) |
| :--- | :---: | :--- | :--- |
| _(noch keine Rotation dokumentiert seit Einführung dieses Logs, 2026-08-29)_ | — | — | — |

## Format für neue Einträge

```
| SECRET_NAME | YYYY-MM-DD | Turnus \| Incident \| Ersteinrichtung | Kritisch \| Hoch \| Mittel \| Niedrig |
```

`Ersteinrichtung` ist erlaubt, wenn das Datum, an dem ein Secret ursprünglich angelegt wurde, bekannt ist (z. B. Projektstart) — verhindert, dass jedes Secret ab Tag 1 fälschlich als „überfällig" erscheint, bis die erste echte Rotation stattgefunden hat.
