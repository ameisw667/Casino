'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /refactoring — Isolierte Testseite für die eigenständige Lobby v2-Konzeption.
 *
 * Betreibt das self-contained HTML-Prototype in `public/prototypes/lobby_v2_refactoring.html`
 * in einem fullscreen-iframe. Dadurch bleiben Three.js / GSAP (lokal vendored) komplett
 * außerhalb des Casino-Builds — kein neuer npm-Dep, kein Bundle-Risiko, keine CSP-Expansion.
 *
 * Siehe worldmap/02_FRONTEND_REDESIGN.md §10 für den vollständigen Plan.
 */

const PROTOTYPE_SRC = '/prototypes/lobby_v2_refactoring.html';

export default function RefactoringPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Sobald der iframe gemountet ist, brechen wir die native Back-Navigation
    // der Testseite nicht — sie hat keine internen Routen. Focus-Trap entfällt.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0b0e14',
        zIndex: 0,
      }}
    >
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#8a97ad',
            fontFamily: 'monospace',
            fontSize: 13,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Lobby v2 lädt …
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={PROTOTYPE_SRC}
        title="Lobby v2 · Refactoring-Testseite"
        onLoad={() => setLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}
        // same-origin → darf geladen werden (X-Frame-Options: SAMEORIGIN, siehe src/proxy.ts)
        // sandbox: allow-same-origin reicht (keine scripts vom Parent nötig, Prototype hat eigene)
        sandbox="allow-same-origin allow-scripts allow-popups"
      />
    </div>
  );
}
