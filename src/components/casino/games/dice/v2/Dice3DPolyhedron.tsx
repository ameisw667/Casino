'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Dice3DPolyhedronProps {
  isRolling: boolean;
  rollValue: number | null;
  displayTicker: number | null;
  isWin: boolean | null;
  isMobile: boolean;
  onFaceSettled?: () => void;
}

export function Dice3DPolyhedron({
  isRolling,
  rollValue,
  displayTicker,
  isWin,
  isMobile,
}: Dice3DPolyhedronProps) {
  const size = isMobile ? 124 : 152;
  const halfSize = size / 2;
  const depth = halfSize * 0.94;

  const currentDisplay = useMemo(() => {
    if (isRolling) {
      return displayTicker !== null ? displayTicker.toFixed(2) : '??.??';
    }
    return rollValue !== null ? rollValue.toFixed(2) : '50.00';
  }, [isRolling, displayTicker, rollValue]);

  // Edle Farbnuance (subtil, kein lauter Neon-Glow)
  const statusColor = useMemo(() => {
    if (isRolling) return '#D4AF37'; // Warmes Gold beim Rollen
    if (isWin === true) return '#10B981'; // Smaragd bei Sieg
    if (isWin === false) return '#EF4444'; // Rubin bei Verlust
    return '#D4AF37'; // Neutral edles Gold
  }, [isRolling, isWin]);

  // Subtile Kanten-Akzente statt giftigem Neon-Glow
  const statusBorder = useMemo(() => {
    if (isRolling) return 'rgba(212, 175, 55, 0.6)';
    if (isWin === true) return 'rgba(16, 185, 129, 0.65)';
    if (isWin === false) return 'rgba(239, 68, 68, 0.6)';
    return 'rgba(212, 175, 55, 0.4)';
  }, [isRolling, isWin]);

  // Dauer der ruhigen Idle-Animation: 7.6 Sekunden für majestätisches Schweben
  const idleVariants = {
    // Schräger 3D-Blickwinkel (Isometric Reveal) — damit man immer die 3D-Tiefe,
    // die Top-Kanten und die Nachbarfacetten sieht, statt nur ein flaches Quadrat!
    rotateX: [17, 23, 13, 19, 17],
    rotateY: [-22, -14, -30, -20, -22],
    rotateZ: [4, 1, 6, 3, 4],
    y: [0, -10, 2, -6, 0],
    transition: {
      duration: 7.6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  const rollingVariants = {
    rotateX: [17, 737, 1097, 1457, 1457],
    rotateY: [-22, -562, -922, -1462, -1462],
    rotateZ: [4, 364, 544, 724, 724],
    y: [0, -90, -102, 8, 0], // Hoher dynamischer Sprung -> Gravitation -> federnder Aufsetzer
    scale: [1, 1.1, 1.12, 0.96, 1], // Elastische Stauchung beim Aufprall
    transition: {
      duration: 0.6,
      times: [0, 0.35, 0.65, 0.88, 1],
      ease: 'easeInOut' as const,
    },
  };

  // Hochwertige Facetten-Oberfläche (Titan/Obsidian mit Schliffkanten und Inset-Licht)
  const baseFacetStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    top: 0,
    left: 0,
    background: 'linear-gradient(142deg, #202738 0%, #131722 38%, #0A0D14 100%)',
    border: `1.5px solid ${statusBorder}`,
    borderRadius: '20px',
    boxShadow:
      'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.28), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.95), 0 16px 36px -4px rgba(0, 0, 0, 0.75)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'visible',
    WebkitBackfaceVisibility: 'visible',
    userSelect: 'none',
    overflow: 'hidden',
    transition: 'border-color 0.4s ease',
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        perspective: '1300px',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      {/* ── 1. WEICHER KONTAKTSCHATTEN AUF DEM FILZ ── */}
      <motion.div
        animate={{
          scale: isRolling ? [1, 0.55, 0.5, 1.1, 1] : [1, 0.88, 1.05, 0.94, 1],
          opacity: isRolling ? [0.65, 0.2, 0.18, 0.85, 0.65] : [0.65, 0.5, 0.75, 0.6, 0.65],
          y: isRolling ? [14, 25, 28, 12, 14] : [14, 18, 11, 15, 14],
        }}
        transition={{
          duration: isRolling ? 0.6 : 7.6,
          repeat: isRolling ? 0 : Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: '-24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${size * 0.82}px`,
          height: '22px',
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.85) 0%, transparent 72%)',
          filter: 'blur(5px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── 2. DREIDIMENSIONALER WÜRFELKÖRPER ── */}
      <motion.div
        animate={isRolling ? rollingVariants : idleVariants}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          zIndex: 1,
        }}
      >
        {/* ── FACETTE 1: FRONT (Holografische Hauptanzeige) ── */}
        <div
          style={{
            ...baseFacetStyle,
            transform: `translateZ(${depth}px)`,
          }}
        >
          {/* Subtiler diagonaler Lichtreflex-Streifen (Brushed Sheen) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(125deg, transparent 25%, rgba(255, 255, 255, 0.05) 45%, rgba(212, 175, 55, 0.10) 50%, transparent 68%)',
              pointerEvents: 'none',
            }}
          />

          {/* 4 Goldene Eck-Klammern (Präzisions-Horologie-Optik) */}
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: 5,
              width: 9,
              height: 9,
              borderTop: '2px solid rgba(212, 175, 55, 0.8)',
              borderLeft: '2px solid rgba(212, 175, 55, 0.8)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              width: 9,
              height: 9,
              borderTop: '2px solid rgba(212, 175, 55, 0.8)',
              borderRight: '2px solid rgba(212, 175, 55, 0.8)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 5,
              left: 5,
              width: 9,
              height: 9,
              borderBottom: '2px solid rgba(212, 175, 55, 0.8)',
              borderLeft: '2px solid rgba(212, 175, 55, 0.8)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 5,
              right: 5,
              width: 9,
              height: 9,
              borderBottom: '2px solid rgba(212, 175, 55, 0.8)',
              borderRight: '2px solid rgba(212, 175, 55, 0.8)',
            }}
          />

          {/* Feiner innerer Rahmen */}
          <div
            style={{
              position: 'absolute',
              inset: '7px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              pointerEvents: 'none',
            }}
          />

          {/* Vertiefte Display-Kammer für die Ziffern */}
          <div
            style={{
              width: '82%',
              padding: '8px 6px',
              borderRadius: '12px',
              background: 'rgba(5, 7, 11, 0.72)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: '0.60rem',
                fontWeight: 800,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: statusColor,
                opacity: 0.9,
              }}
            >
              {isRolling ? 'ROLLING' : isWin === true ? 'WIN' : isWin === false ? 'BUST' : 'TARGET'}
            </span>

            {/* Der scharfe Ziffernwert */}
            <div
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: isMobile ? '1.85rem' : '2.20rem',
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: '-1px',
                color: '#FFFFFF',
                fontVariantNumeric: 'tabular-nums',
                textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              }}
            >
              {currentDisplay}
            </div>
          </div>

          {/* Subtiler Status-Leuchtpunkt (dezent) */}
          <div
            style={{
              marginTop: '6px',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
            }}
          />
        </div>

        {/* ── FACETTE 2: TOP (Im Idle-Winkel sichtbar!) ── */}
        <div
          style={{
            ...baseFacetStyle,
            transform: `rotateX(90deg) translateZ(${depth}px)`,
            background: 'linear-gradient(180deg, #263044 0%, #181E2C 50%, #0D1018 100%)', // Hellerer Lichteinfall von oben
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 35%, rgba(255, 240, 200, 0.16) 0%, transparent 70%)',
            }}
          />
          {/* Gravierte Casino-Krone / Stern */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid rgba(212, 175, 55, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
              fontWeight: 900,
              fontSize: '0.95rem',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5), 0 0 10px rgba(212, 175, 55, 0.25)',
            }}
          >
            ✦
          </div>
          <span
            style={{
              marginTop: '4px',
              fontSize: '0.55rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'rgba(212, 175, 55, 0.75)',
            }}
          >
            ROYALE
          </span>
        </div>

        {/* ── FACETTE 3: RIGHT (Im Idle-Winkel sichtbar!) ── */}
        <div
          style={{
            ...baseFacetStyle,
            transform: `rotateY(90deg) translateZ(${depth}px)`,
            background: 'linear-gradient(220deg, #1C2333 0%, #10141D 60%, #07090D 100%)',
          }}
        >
          {/* Gefräste Vertiefungen (Pip-Slots) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #D4AF37 0%, #7A6115 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #D4AF37 0%, #7A6115 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #D4AF37 0%, #7A6115 100%)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.8)',
              }}
            />
          </div>
        </div>

        {/* ── FACETTE 4: LEFT ── */}
        <div
          style={{
            ...baseFacetStyle,
            transform: `rotateY(-90deg) translateZ(${depth}px)`,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.2rem',
              fontWeight: 900,
              color: 'rgba(212, 175, 55, 0.65)',
            }}
          >
            99%
          </div>
          <span style={{ fontSize: '0.52rem', color: '#888', letterSpacing: '0.08em' }}>
            RTP FAIR
          </span>
        </div>

        {/* ── FACETTE 5: BACK ── */}
        <div
          style={{
            ...baseFacetStyle,
            transform: `rotateY(180deg) translateZ(${depth}px)`,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.3rem',
              fontWeight: 800,
              color: 'rgba(212, 175, 55, 0.6)',
            }}
          >
            PROVABLY
          </div>
          <span style={{ fontSize: '0.55rem', color: '#666', letterSpacing: '0.1em' }}>
            HMAC-SHA256
          </span>
        </div>

        {/* ── FACETTE 6: BOTTOM ── */}
        <div
          style={{
            ...baseFacetStyle,
            transform: `rotateX(-90deg) translateZ(${depth}px)`,
            background: '#07090E',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: 'rgba(212, 175, 55, 0.4)',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
