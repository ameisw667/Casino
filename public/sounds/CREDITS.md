# Sound Credits

All sound effects in this directory are either originals already in the repo (`win.mp3`, `loss.mp3`, `engine.mp3` — kept as generic fallback assets) or derived from the following CC0 (public domain) packs. No attribution is legally required, credited here for transparency.

| Source pack                              | Author                  | License | URL                                                                  |
| ---------------------------------------- | ----------------------- | ------- | -------------------------------------------------------------------- |
| Casino Audio                             | Kenney (kenney.nl)      | CC0     | https://kenney.nl/assets/casino-audio                                |
| UI Audio                                 | Kenney (kenney.nl)      | CC0     | https://kenney.nl/assets/ui-audio                                    |
| 50 CC0 Sci-Fi SFX                        | OpenGameArt contributor | CC0     | https://opengameart.org/content/50-cc0-sci-fi-sfx                    |
| Level up, power up, Coin get (13 Sounds) | wobbleboxx              | CC0     | https://opengameart.org/content/level-up-power-up-coin-get-13-sounds |

## Derived files

All entries below went through a second pass after objective QA (see below): peak-normalized to a consistent target (-3dB, except `chip.mp3`/`blackjack-card.mp3` at their natural -3.0/-0.8dB and `crash-explode.mp3` deliberately left at its louder -0.8dB peak as the app's single most impactful moment) and trimmed so no file carries more than ~150ms of trailing silence.

| File                 | Source                           | Processing                                                                                        |
| -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `dice-roll.mp3`      | Casino Audio `die-throw-2.ogg`   | peak-normalized to -2.6dB                                                                         |
| `dice-win.mp3`       | Coin-get pack `Coin01.aif`       | trimmed 2.55s→1.09s (was 1.61s dead air), peak-normalized to -3.2dB                               |
| `dice-loss.mp3`      | Coin-get pack `Downer01.aif`     | trimmed 1.67s→0.73s, peak-normalized to -2.9dB                                                    |
| `slots-spin.mp3`     | Sci-Fi SFX `loop_machine_02.ogg` | trimmed to 1.4s + fade-out, peak-normalized to -3.0dB                                             |
| `slots-win.mp3`      | Coin-get pack `Rise03.aif`       | trimmed 1.56s→0.94s, peak-normalized to -3.0dB                                                    |
| `slots-loss.mp3`     | Coin-get pack `Downer01.aif`     | pitched -12% for distinction from `dice-loss.mp3`, trimmed 1.90s→0.81s, peak-normalized to -3.0dB |
| `chip.mp3`           | Casino Audio `chip-lay-2.ogg`    | peak-normalized to -3.0dB                                                                         |
| `roulette-spin.mp3`  | Sci-Fi SFX `loop_machine_03.ogg` | trimmed to 1.4s + fade-out, peak-normalized to -3.0dB                                             |
| `roulette-win.mp3`   | Coin-get pack `Rise05.aif`       | trimmed 2.5s→2.24s, peak-normalized to -3.0dB                                                     |
| `roulette-loss.mp3`  | Coin-get pack `Downer01.aif`     | pitched +12% for distinction, trimmed 1.49s→0.67s, peak-normalized to -2.9dB                      |
| `crash-launch.mp3`   | Sci-Fi SFX `rocket_01.ogg`       | trimmed 2.05s→1.84s, peak-normalized to -3.0dB                                                    |
| `crash-win.mp3`      | Coin-get pack `Upper01.aif`      | trimmed 2.0s→1.9s, peak-normalized to -2.9dB                                                      |
| `crash-explode.mp3`  | Sci-Fi SFX `explosion_01.ogg`    | trimmed 1.84s→1.19s, left at natural -0.8dB peak (intentional — loudest moment in the app)        |
| `blackjack-card.mp3` | Casino Audio `card-slide-3.ogg`  | peak-normalized to -0.8dB                                                                         |
| `blackjack-win.mp3`  | Coin-get pack `Rise06.aif`       | trimmed 2.0s→1.34s (was 809ms dead air), peak-normalized to -2.9dB                                |
| `blackjack-loss.mp3` | Coin-get pack `Alarm.aif`        | trimmed to first 1.5s + fade-out, peak-normalized to -2.8dB                                       |

## Objective QA (2026-08-10)

Since Claude cannot subjectively judge audio the way a human ear does, verification here is technical/measurable, not a taste judgment — matching the same boundary as the `no-visual-check-frontend` rule for visual design.

**Method:** a temporary local HTML harness (Web Audio API `decodeAudioData`) fetched all 22 sound-manager URLs, decoded each, and measured duration, sample peak, RMS, and leading/trailing silence (threshold -50dBFS). Served via a standalone `python -m http.server` rooted at `public/` — the project's own dev server could not be used because another concurrent session's `next dev` process held an exclusive lock on `.next/` for the full duration.

**First pass found two real, objective problems:**

1. **Peak level spread of ~13dB** across the 16 new files (quietest: `roulette-win`/`dice-win`/`blackjack-win` at -12.7 to -13.5dB peak; loudest: `crash-explode` at -0.7dB) — win sounds would have played back noticeably quieter than action sounds in the same game.
2. **Excessive trailing silence** on several files, worst case `dice-win.mp3`: 2.55s total duration, but only ~0.94s of it was audible (63% dead air after the chime decayed).

**Fix applied:** all 16 new files re-rendered with `ffmpeg` — trailing silence trimmed to the measured cutoff + 150ms fade, peaks gain-adjusted to a consistent ~-3dB target (explosion sound intentionally exempted, kept louder as the app's peak moment).

**Second pass (post-fix) confirmed:** all 16 files load without error, none silent, peak spread reduced to 2.4dB (-3.2 to -0.8dB), all trailing silence under 151ms, no clipping (`dice-roll.mp3`'s legacy-key family initially landed at exactly 0.0dB peak from an overshot gain correction — caught and re-rendered to -2.6dB for safety headroom before finalizing).

**Out of scope for this QA (needs a human ear):** whether each sound is thematically convincing for its game moment — that judgment is Jan's, same as the plan always intended.
