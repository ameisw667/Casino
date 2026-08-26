'use client';

import React from 'react';

interface VintageCardBackProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'burgundy' | 'navy' | 'obsidian';
}

export function VintageCardBack({
  size = 'md',
  variant = 'burgundy',
}: VintageCardBackProps) {
  const width = size === 'sm' ? 68 : size === 'lg' ? 104 : 88;
  const height = size === 'sm' ? 96 : size === 'lg' ? 148 : 124;

  const bgGradient =
    variant === 'burgundy'
      ? 'radial-gradient(ellipse at 50% 50%, #8A1515 0%, #630D0D 60%, #3D0606 100%)'
      : variant === 'navy'
      ? 'radial-gradient(ellipse at 50% 50%, #132A52 0%, #0C1A33 60%, #060D1A 100%)'
      : 'radial-gradient(ellipse at 50% 50%, #1E1E24 0%, #121216 60%, #08080A 100%)';

  const accentColor = variant === 'burgundy' ? '#E5C158' : variant === 'navy' ? '#D4AF37' : '#C5A059';

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '10px',
        background: '#FAF7F0', // Echtes warmes Leinen-Kartenpapier (Ivory White)
        boxShadow:
          '0 14px 28px rgba(0, 0, 0, 0.75), 0 4px 8px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(0,0,0,0.3)',
        padding: '4px', // Der ikonische weiße Sicherheitsrand echter Spielkarten
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Bedruckter Innenbereich */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '7px',
          background: bgGradient,
          border: `1.2px solid ${accentColor}`,
          boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.85)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Klassischer filigraner Vektordruck (Viktorianische Ornamente, Rauten und doppelte Symmetrie) */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 80 114"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {/* Innerer feiner Rahmen mit Zier-Ecken */}
          <rect
            x="3"
            y="3"
            width="74"
            height="108"
            rx="4"
            stroke={accentColor}
            strokeWidth="0.8"
            strokeOpacity="0.85"
            fill="none"
          />
          <rect
            x="5.5"
            y="5.5"
            width="69"
            height="103"
            rx="2.5"
            stroke={accentColor}
            strokeWidth="0.4"
            strokeDasharray="1.5 1"
            strokeOpacity="0.6"
            fill="none"
          />

          {/* Dichtes Vintage-Kreuzgitter / Rauten-Weave (wie historische Bicycle & Bee Decks) */}
          <defs>
            <pattern
              id={`vintage-weave-${variant}`}
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="none" />
              <line x1="0" y1="0" x2="6" y2="0" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.22" />
              <line x1="0" y1="0" x2="0" y2="6" stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.22" />
              <circle cx="3" cy="3" r="0.5" fill={accentColor} fillOpacity="0.3" />
            </pattern>
          </defs>
          <rect x="6" y="6" width="68" height="102" fill={`url(#vintage-weave-${variant})`} />

          {/* Symmetrische florale Eck-Ornamente (Oben Links & Rechts) */}
          <g stroke={accentColor} strokeWidth="0.6" fill="none" strokeOpacity="0.75">
            <path d="M 7 14 C 9 10, 10 9, 14 7" />
            <path d="M 73 14 C 71 10, 70 9, 66 7" />
            <path d="M 7 100 C 9 104, 10 105, 14 107" />
            <path d="M 73 100 C 71 104, 70 105, 66 107" />
          </g>

          {/* Oberes klassisches Medaillon (Königliche Lilie / Fleur-de-lis) */}
          <g transform="translate(40, 24)" stroke={accentColor} strokeWidth="0.5" fill={accentColor} fillOpacity="0.15">
            <circle cx="0" cy="0" r="8" strokeOpacity="0.8" />
            <circle cx="0" cy="0" r="6.5" strokeOpacity="0.4" strokeDasharray="1 1" />
            <path
              d="M 0 -4 C 1 -2, 2.5 -1, 3 1 C 1.5 1, 0 3, 0 3 C 0 3, -1.5 1, -3 1 C -2.5 -1, -1 -2, 0 -4 Z"
              fill={accentColor}
              fillOpacity="0.75"
            />
          </g>

          {/* Zentrales klassisches Barock-Wappen mit filigranen Schnörkeln */}
          <g transform="translate(40, 57)">
            {/* Äußerer Ornament-Ring */}
            <ellipse cx="0" cy="0" rx="14" ry="17" stroke={accentColor} strokeWidth="0.8" strokeOpacity="0.8" fill="none" />
            <ellipse cx="0" cy="0" rx="12" ry="15" stroke={accentColor} strokeWidth="0.4" strokeDasharray="1.5 1" strokeOpacity="0.5" fill="none" />

            {/* Symmetrische Akanthusblatt-Schwünge */}
            <path
              d="M -11 -7 C -7 -14, 7 -14, 11 -7 C 7 0, -7 0, -11 -7 Z"
              stroke={accentColor}
              strokeWidth="0.5"
              strokeOpacity="0.6"
              fill={accentColor}
              fillOpacity="0.1"
            />
            <path
              d="M -11 7 C -7 14, 7 14, 11 7 C 7 0, -7 0, -11 7 Z"
              stroke={accentColor}
              strokeWidth="0.5"
              strokeOpacity="0.6"
              fill={accentColor}
              fillOpacity="0.1"
            />

            {/* Zentrales klassisches Pik-Herz-Symbol mit edlem Zierband */}
            <path
              d="M 0 -6 C 2.5 -2, 6 1, 4 4.5 C 2 6, 0.8 5.5, 0 4 C -0.8 5.5, -2 6, -4 4.5 C -6 1, -2.5 -2, 0 -6 Z"
              fill={accentColor}
              fillOpacity="0.85"
            />
            <path d="M 0 3.5 L 0 7 M -1.8 7 L 1.8 7" stroke={accentColor} strokeWidth="0.7" strokeLinecap="round" />
          </g>

          {/* Unteres symmetrisches Medaillon (Gespiegelt für echte Kartensymmetrie) */}
          <g transform="translate(40, 90) rotate(180)" stroke={accentColor} strokeWidth="0.5" fill={accentColor} fillOpacity="0.15">
            <circle cx="0" cy="0" r="8" strokeOpacity="0.8" />
            <circle cx="0" cy="0" r="6.5" strokeOpacity="0.4" strokeDasharray="1 1" />
            <path
              d="M 0 -4 C 1 -2, 2.5 -1, 3 1 C 1.5 1, 0 3, 0 3 C 0 3, -1.5 1, -3 1 C -2.5 -1, -1 -2, 0 -4 Z"
              fill={accentColor}
              fillOpacity="0.75"
            />
          </g>
        </svg>

        {/* Feiner nostalgischer Lichtschein quer über die Karte */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, rgba(0, 0, 0, 0.15) 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}
