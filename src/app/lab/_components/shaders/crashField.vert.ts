/**
 * §7 — Vertex-Shader des PULS-Partikelfelds (annotierter Lernkern).
 *
 * (1) Was der Shader macht — in 3 Sätzen:
 * Jeder Partikel interpoliert zwischen zwei statischen Form-Attributen
 * (`aSource`, `aTarget`) gemäß dem Uniform `uMorph` — Morphing geschieht also
 * komplett auf der GPU, ohne Buffer-Uploads pro Frame. Über die interpolierte
 * Basisposition legt sich ein Simplex-Drift (Chaos), eine Pointer-Repulsion
 * (Störwelle um den Cursor) sowie ein `uBust`-Explosionsanteil (roter Bust).
 * Zusätzlich formt `uHold` die Partikel zurück zur Zielmaske (Straffung der
 * „Wette") und koppelt vGlow (Helligkeit) an Nähe, Halten und Scroll-Energie.
 *
 * (2) Uniforms (Name, Typ, physikalische Bedeutung, Schreibender):
 * - uTime, float, fortlaufende Zeit in s für Drift-Phase, CrashField.useFrame.
 * - uMorph, float 0..1, Interpolation aSource→aTarget, MorphField via CPU (ein
 *   Wert pro Frame — Uniform, nie Buffer).
 * - uDrift, float, Amplitude des Chaos-Flugs (Höhe des Feldes), Zustand/Scroll.
 * - uPointer, vec3, Pointerposition in Weltraumkoordinaten (z=Plane),
 *   Pointerlerp im CrashField (window pointermove → NDC → Weltebene).
 * - uPointerStrength, float, Stärke der Repulsion (skaliert mit Scroll-
 *   Velocity), Pointer-Controller.
 * - uHold, float 0..1, Straffungsgrad während „Halten" (Wette), Wager-Controller.
 * - uEnergy, float 0..1, Feldenergie (CASH-OUT-Impuls/Scroll), decays im
 *   Frame-Loop, setzt impulsartig bei Cash-Out.
 * - uBust, float 0..1, Explosionsanteil nach BUST, Bust-Controller.
 * - uColorWhite, uColorGold als vec3-Tönung in Fragment (nicht hier).
 * - uSize, float, Basisgröße in px @ DPR 1, Profil-Resolver.
 * - uPixelRatio, float, devicePixelRatio-Cap des Renderers, Renderer-Setup.
 *
 * (3) Noise/util-Funktionen:
 * - snoise(vec3): 3D-Simplex-Noise nach Ashima (MIT), klassische Permutation
 *   über Modulo-289-Trick; liefert -1..1, hier zweifach gefaltet (Drift).
 * - hash(i) → per Partikel konstante Zufallsrichtung aus aSeed, weil
 *   Explosionsrichtung deterministisch pro Partikel bleiben soll.
 */

export const crashFieldVert = /* glsl */ `
  attribute vec3 aSource;
  attribute vec3 aTarget;
  attribute vec4 aSeed;

  uniform float uTime;
  uniform float uMorph;
  uniform float uDrift;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uHold;
  uniform float uEnergy;
  uniform float uBust;
  uniform float uSize;
  uniform float uPixelRatio;

  varying float vGlow;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  // Ashima-Simplex: Gitterzelle des Punktes bestimmen, Ecken-Beiträge über
  // Gradienten (Kanten eines Würfels) gewichten, zu einer skalaren Welle
  // summieren. Liefert ±1, skaliert hier auf Driftamplitude.
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 base = mix(aSource, aTarget, uMorph);

    // uHold zieht Partikel zur Zielmaske zurück: Straffung der Wette.
    vec3 shaped = mix(base, aTarget, uHold * 0.65);

    // Drift: zwei Simplex-Oktaven über Zeit, aSeed = Partikel-Phase.
    float phase = aSeed.w * 6.2831853;
    vec3 drift = vec3(
      snoise(shaped * 0.28 + vec3(uTime * 0.05, phase, 0.0)),
      snoise(shaped * 0.28 + vec3(0.0, uTime * 0.05, phase)),
      snoise(shaped * 0.28 + vec3(phase, 0.0, uTime * 0.05))
    ) * uDrift;

    // Pointer-Repulsion: Dämpfungsfall in der XY-Weltebene.
    vec3 toPointer = shaped - uPointer;
    float pointerDist = length(toPointer.xy);
    float repulse = exp(-pointerDist * 0.55) * uPointerStrength;
    vec3 repelled = shaped + normalize(vec3(toPointer.xy, 0.0) + 1e-5) * repulse;

    // BUST: deterministische Explosionsrichtung aus aSeed, Energie klingt ab.
    vec3 bustDir = normalize(vec3(aSeed.xyz) - 0.5 + 1e-5);
    vec3 pos = repelled + drift + bustDir * uBust * (1.5 + aSeed.z * 3.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Helligkeit: Basis + Halten + Energieniveau (Cursor-Nähe glüht zusätzlich).
    vGlow = clamp(
      0.32 + uHold * 0.9 + uEnergy * 0.7 + repulse * 0.05,
      0.0,
      2.2
    );

    // Partikelgröße: Basis * per-Partikel * perspektivisch gedämpft.
    gl_PointSize = uSize * (0.6 + aSeed.z * 0.9) * uPixelRatio * (10.0 / max(1.0, -mvPosition.z));
  }
`;
