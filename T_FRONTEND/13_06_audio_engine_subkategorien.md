# 13_06 — Audio-Engine: Sub-Subkategorien

> Ebene 2 von [`00_UEBERSICHT.md`](./00_UEBERSICHT.md#1--die-10-subkategorien-gewichtung--bewertung) · Modul 06 (Gewicht 5, Niveau Top 15 %) · Stand 2026-09-13 · Nur Tabelle, keine Planungsdatei in dieser Runde.

|  #  | Sub-Subkategorie | Gewichtung | Niveau | Kurzbefund |
| :-: | :--- | :---: | :---: | :--- |
| 1 | `SoundManager`-Singleton-Architektur | **25** | Top 12 % | Zentrale Instanz (`SoundManager.getInstance()`), Store-Sync über `onRehydrateStorage` verifiziert |
| 2 | Logarithmische Lautstärkekurve + Pitch-Randomisierung | **20** | Top 15 % | `getLogarithmicGain()` ($V^2$) und ±4 % Pitch-Randomisierung gegen Hör-Ermüdung im Code vorhanden |
| 3 | Synthetischer Micro-Chirp (`playHover()`, Web Audio Oscillator) | **20** | Top 15 % | 12ms Sine-Chirp mit 75ms-Drosselung, 0 KB Asset-Load — sauber implementiert |
| 4 | Autoplay-/Mute-Guards | **15** | Top 15 % | `audio.play().catch(...)` fängt `NotAllowedError` lautlos ab, `enabled`-Flag konsequent geprüft |
| 5 | 3D Spatial Audio / Stereo-Panning | **20** | Top 60 % | Vom Dokument selbst benannt: als Web-Audio-`PannerNode` konzipiert, aber noch nicht in allen Slot-Animationen aktiv — größte reale Lücke der Säule |
