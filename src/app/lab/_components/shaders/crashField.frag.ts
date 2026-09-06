/**
 * §7 — Fragment-Shader des PULS-Partikelfelds (annotierter Lernkern).
 *
 * (1) Was der Shader macht — in 3 Sätzen:
 * Jeder Punkt (`THREE.Points`) wird zu einem weichen, radial ausklingenden
 * Glimmer gezeichnet statt zu einem harten Quadrat — der Kern bleibt hell,
 * der Rand klingt sauber aus, damit Additive-Blendung keine Streifen wirft.
 * Die Farbe ist eine Farb-State-Maschine: Gold = Ruhe/Gewinn, Weiß = Momentum
 * (nur als Zustand der laufenden Wette), Rot ausschließlich im BUST.
 *
 * (2) Uniforms (Name, Typ, physikalische Bedeutung, Schreibender):
 * - uGold, vec3, Grundton des Feldes, Farbkonstante (PULS-Palette).
 * - uWhite, vec3, Momentumton (glühend) — Zustandsfarbe, nie Schmuck.
 * - uRed, vec3, Bustton, Farbkonstante.
 * - uMomentum, float 0..1, Übergang Gold→Weiß während der laufenden Wette,
 *   Wager-Controller (CrashField.setWagerState).
 * - uBust, float 0..1, Übergang→Rot nach BUST, Bust-Controller.
 *
 * (3) util:
 * - smoothstep(edge0, edge1, x): Hermite-Interpolation; erzeugt die weiche
 *   Sprite-Kante. Kanten hier (0.5 → 0.06) Kern, (0.5 → 0.28) Halo, damit der
 *   Kern hell bleibt und der Rand ohne Alpha-Zittern bei DPR-Sprüngen ausklingt.
 */

export const crashFieldFrag = /* glsl */ `
  precision highp float;

  uniform vec3 uGold;
  uniform vec3 uWhite;
  uniform vec3 uRed;
  uniform float uMomentum;
  uniform float uBust;

  varying float vGlow;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    float dist = length(offset);

    float core = smoothstep(0.5, 0.06, dist);
    float halo = smoothstep(0.5, 0.28, dist) * 0.35;
    float intensity = core + halo * vGlow;

    vec3 tone = mix(uGold, uWhite, clamp(uMomentum, 0.0, 1.0));
    tone = mix(tone, uRed, clamp(uBust, 0.0, 1.0));
    tone = mix(tone, uWhite, clamp(vGlow - 1.1, 0.0, 1.0));

    // Additive-Blendung (three: src ALPHA, dst ONE) — Alpha trägt die Deckkraft.
    gl_FragColor = vec4(tone, intensity);
  }
`;

export const GOLD_RGB = [0.86, 0.68, 0.29] as const;
export const WHITE_RGB = [0.98, 0.96, 0.9] as const;
export const RED_RGB = [0.82, 0.12, 0.08] as const;
