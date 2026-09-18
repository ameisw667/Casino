'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Key, Hash, Sparkles } from 'lucide-react';

export interface CircuitBoardVisualizerProps {
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
  hashResult?: string;
  outcome?: string;
  isVerifying?: boolean;
  className?: string;
}

/**
 * CircuitBoardVisualizer — Componentry Luxury Circuit Board & Magnet Lines
 *
 * Renders an Obsidian & 24k Gold printed circuit board (PCB)
 * with animated electric trace paths flowing from Seed inputs
 * through the HMAC-SHA256 cryptographic core into the verified outcome.
 */
export function CircuitBoardVisualizer({
  serverSeed = 'Offenbarten Seed aus Historie',
  clientSeed = 'client-seed',
  nonce = 0,
  hashResult = '',
  outcome = '',
  isVerifying = false,
  className = '',
}: CircuitBoardVisualizerProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const truncatedServer =
    serverSeed && serverSeed.length > 16
      ? `${serverSeed.slice(0, 7)}...${serverSeed.slice(-6)}`
      : serverSeed;
  const truncatedClient =
    clientSeed && clientSeed.length > 12
      ? `${clientSeed.slice(0, 5)}...${clientSeed.slice(-4)}`
      : clientSeed;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '16px',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        background: '#07090D',
        backgroundImage: 'radial-gradient(rgba(212, 175, 55, 0.12) 1px, transparent 0)',
        backgroundSize: '16px 16px',
        padding: '16px 14px',
        boxShadow: '0 14px 40px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Board Header Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              background: 'rgba(212, 175, 55, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37',
            }}
          >
            <Cpu size={14} />
          </div>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#D4AF37',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            Cryptographic PCB Engine • 256-Bit
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '2px 10px',
            fontSize: '0.62rem',
            fontWeight: 800,
            color: '#10b981',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          DETERMINISTIC
        </div>
      </div>

      {/* PCB Interactive Circuit Surface */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '180px',
        }}
      >
        {/* SVG Trace Layer */}
        <svg
          viewBox="0 0 460 180"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="goldTraceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A6B1C" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFE885" stopOpacity="1" />
            </linearGradient>

            <filter id="pcbGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Static Traces */}
          <path
            d="M 140 34 L 185 34 L 210 85"
            fill="none"
            stroke={hoveredNode === 'server' ? '#FFE885' : 'rgba(212, 175, 55, 0.28)'}
            strokeWidth={hoveredNode === 'server' ? '3' : '2'}
            strokeLinecap="round"
          />
          <path
            d="M 140 90 L 210 90"
            fill="none"
            stroke={hoveredNode === 'client' ? '#FFE885' : 'rgba(212, 175, 55, 0.28)'}
            strokeWidth={hoveredNode === 'client' ? '3' : '2'}
            strokeLinecap="round"
          />
          <path
            d="M 140 146 L 185 146 L 210 95"
            fill="none"
            stroke={hoveredNode === 'nonce' ? '#FFE885' : 'rgba(212, 175, 55, 0.28)'}
            strokeWidth={hoveredNode === 'nonce' ? '3' : '2'}
            strokeLinecap="round"
          />

          {/* Animated Gold Pulses */}
          <motion.path
            d="M 140 34 L 185 34 L 210 85"
            fill="none"
            stroke="url(#goldTraceGrad)"
            strokeWidth="2.5"
            strokeDasharray="16 90"
            animate={{ strokeDashoffset: [106, 0] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
            filter="url(#pcbGlow)"
          />
          <motion.path
            d="M 140 90 L 210 90"
            fill="none"
            stroke="url(#goldTraceGrad)"
            strokeWidth="2.5"
            strokeDasharray="16 70"
            animate={{ strokeDashoffset: [86, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            filter="url(#pcbGlow)"
          />
          <motion.path
            d="M 140 146 L 185 146 L 210 95"
            fill="none"
            stroke="url(#goldTraceGrad)"
            strokeWidth="2.5"
            strokeDasharray="16 90"
            animate={{ strokeDashoffset: [106, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            filter="url(#pcbGlow)"
          />

          {/* Output Trace from HMAC to Result Node */}
          <path
            d="M 285 90 L 335 90"
            fill="none"
            stroke="rgba(16, 185, 129, 0.35)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <motion.path
            d="M 285 90 L 335 90"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="16 50"
            animate={{ strokeDashoffset: [66, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            filter="url(#pcbGlow)"
          />

          {/* Micro Solder Rings */}
          <circle cx="140" cy="34" r="3.5" fill="#07090D" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="140" cy="90" r="3.5" fill="#07090D" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="140" cy="146" r="3.5" fill="#07090D" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="335" cy="90" r="4.5" fill="#07090D" stroke="#10b981" strokeWidth="2" />
        </svg>

        {/* 1. Left Nodes (Seeds & Nonce) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '136px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 10,
          }}
        >
          {/* Server Seed Node */}
          <div
            onMouseEnter={() => setHoveredNode('server')}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              height: '42px',
              borderRadius: '8px',
              border: `1px solid ${hoveredNode === 'server' ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)'}`,
              background: 'rgba(16, 20, 28, 0.95)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <Key size={13} style={{ color: '#D4AF37', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                SERVER SEED
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {truncatedServer}
              </div>
            </div>
          </div>

          {/* Client Seed Node */}
          <div
            onMouseEnter={() => setHoveredNode('client')}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              height: '42px',
              borderRadius: '8px',
              border: `1px solid ${hoveredNode === 'client' ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)'}`,
              background: 'rgba(16, 20, 28, 0.95)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <Hash size={13} style={{ color: '#FFE885', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                CLIENT SEED
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, fontFamily: 'monospace', color: '#FFE885', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {truncatedClient}
              </div>
            </div>
          </div>

          {/* Nonce Node */}
          <div
            onMouseEnter={() => setHoveredNode('nonce')}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              height: '42px',
              borderRadius: '8px',
              border: `1px solid ${hoveredNode === 'nonce' ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)'}`,
              background: 'rgba(16, 20, 28, 0.95)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#D4AF37', flexShrink: 0, fontFamily: 'monospace' }}>
              #
            </span>
            <div>
              <div style={{ fontSize: '0.55rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                NONCE
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 900, fontFamily: 'monospace', color: '#D4AF37' }}>
                {nonce}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Central HMAC-SHA256 Cryptographic Processor */}
        <div
          style={{
            position: 'absolute',
            left: '210px',
            top: '53px',
            width: '74px',
            height: '74px',
            zIndex: 15,
          }}
        >
          <motion.div
            animate={{
              boxShadow: isVerifying
                ? [
                    '0 0 15px rgba(212,175,55,0.3)',
                    '0 0 35px rgba(212,175,55,0.85)',
                    '0 0 15px rgba(212,175,55,0.3)',
                  ]
                : '0 0 20px rgba(212,175,55,0.25)',
              scale: isVerifying ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              border: '2px solid #D4AF37',
              background: 'linear-gradient(180deg, #1C2230 0%, #0A0D14 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            {/* Gold Corner Terminals */}
            <div style={{ position: 'absolute', top: '3px', left: '3px', width: '4px', height: '4px', borderRadius: '50%', background: '#D4AF37' }} />
            <div style={{ position: 'absolute', top: '3px', right: '3px', width: '4px', height: '4px', borderRadius: '50%', background: '#D4AF37' }} />
            <div style={{ position: 'absolute', bottom: '3px', left: '3px', width: '4px', height: '4px', borderRadius: '50%', background: '#D4AF37' }} />
            <div style={{ position: 'absolute', bottom: '3px', right: '3px', width: '4px', height: '4px', borderRadius: '50%', background: '#D4AF37' }} />

            <ShieldCheck size={20} style={{ color: '#FFE885', marginBottom: '2px' }} />
            <span style={{ fontSize: '0.54rem', fontWeight: 900, letterSpacing: '0.08em', color: '#D4AF37', textTransform: 'uppercase' }}>
              HMAC
            </span>
            <span style={{ fontSize: '0.46rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>
              SHA-256
            </span>
          </motion.div>
        </div>

        {/* 3. Right Node: Cryptographic Outcome Terminal */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '45px',
            width: '125px',
            height: '90px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              background: 'rgba(10, 24, 18, 0.95)',
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '0.56rem',
                fontWeight: 900,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '2px',
              }}
            >
              <Sparkles size={10} /> ERGEBNIS
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 950,
                fontFamily: 'monospace',
                color: '#fff',
                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))',
                lineHeight: 1.1,
              }}
            >
              {outcome || '0.00'}
            </div>
            <div
              style={{
                fontSize: '0.52rem',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '4px',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {hashResult ? `${hashResult.slice(0, 6)}...${hashResult.slice(-4)}` : 'Authentifiziert'}
            </div>
          </div>
        </div>
      </div>

      {/* PCB Footer */}
      <div
        style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(212, 175, 55, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.62rem',
          color: 'rgba(255, 255, 255, 0.45)',
        }}
      >
        <span>Zero-Trust Verification Architecture</span>
        <span style={{ fontFamily: 'monospace', color: '#D4AF37' }}>Web Crypto API</span>
      </div>
    </div>
  );
}
