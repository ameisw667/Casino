'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, RefreshCw } from 'lucide-react';
import { MULTIPLIER_PRESETS } from '@/components/casino/games/dice/dice-config';
import type { DiceCenterStageV2Props } from './dice-v2-types';
import { Dice3DPolyhedron } from './Dice3DPolyhedron';
import { DiceSpotlightCanvas } from './DiceSpotlightCanvas';
import { diceV2Audio } from './DiceV2Audio';

export function DiceCenterStageV2({
  isMobile,
  loading,
  lastResult,
  history,
  winStreak,
  targetPoint,
  isRollOver,
  winChance,
  multiplier,
  isDraggingThumb: _isDraggingThumb,
  sliderRef,
  onMouseDown,
  onTouchStart,
  onUpdateFromWinChance: _onUpdateFromWinChance,
  onUpdateFromMultiplier,
  onUpdateFromTarget: _onUpdateFromTarget,
  onToggleRollMode,
  soundEnabled = true,
}: DiceCenterStageV2Props) {
  const prefersReducedMotion = useReducedMotion();
  const [isRolling, setIsRolling] = useState(false);
  const [displayTicker, setDisplayTicker] = useState<number | null>(null);
  const [shockwaveCount, setShockwaveCount] = useState(0);
  const soundTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio-Stummschaltung steuern
  useEffect(() => {
    diceV2Audio.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Wenn loading = true wird -> 900ms kinoreife Dramaturgie starten
  useEffect(() => {
    if (loading) {
      const startTimer = setTimeout(() => {
        setIsRolling(true);
      }, 0);

      // 1. Odometer-Zahlenlauf starten
      const tickerInterval = setInterval(() => {
        setDisplayTicker(Math.floor(Math.random() * 9900 + 100) / 100);
      }, 40);

      // 2. Trockenes Acryl-Klackern während des Taumelns
      if (!prefersReducedMotion) {
        diceV2Audio.playTumbleClick(1900, 0.14);
        soundTimerRef.current = setTimeout(() => {
          diceV2Audio.playTumbleClick(1650, 0.12);
          setTimeout(() => {
            diceV2Audio.playTumbleClick(1400, 0.15);
          }, 180);
        }, 200);
      }

      // Cleanup für den laufenden Ticker
      return () => {
        clearTimeout(startTimer);
        clearInterval(tickerInterval);
        if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
      };
    }
  }, [loading, prefersReducedMotion]);

  // Wenn ein neues Resultat eintrifft und loading beendet wird -> Sofortige synchrone Landung!
  useEffect(() => {
    if (!loading && isRolling) {
      const landTimer = setTimeout(() => {
        setIsRolling(false);
        if (lastResult !== null) {
          setDisplayTicker(lastResult.roll);
          setShockwaveCount((prev) => prev + 1);

          // Haptischer Filz-Aufprall
          diceV2Audio.playFeltImpact(0.4);

          // Win/Loss Sound nach 40ms Nachhall
          setTimeout(() => {
            if (lastResult.win) {
              diceV2Audio.playChampagnerWin(multiplier);
            } else {
              diceV2Audio.playSubBassLoss();
            }
          }, 40);
        }
      }, 0);

      return () => clearTimeout(landTimer);
    }
  }, [loading, isRolling, lastResult, multiplier]);

  const isWin = lastResult ? lastResult.win : null;

  // Berechne Prozent-Position für Schieberegler
  const sliderPercentage = Math.max(0, Math.min(100, targetPoint));

  return (
    <div
      className="dice-v2-main game-area"
      style={{
        borderRadius: '24px',
        backgroundColor: '#07090E',
        backgroundImage: `linear-gradient(180deg, rgba(11, 14, 20, 0.35) 0%, rgba(11, 14, 20, 0.08) 36%, rgba(11, 14, 20, 0.75) 100%), url('/images/2026-09-04_backdrop-dice-quantum-felt_v001.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 45%',
        backgroundRepeat: 'no-repeat',
        border: '1.5px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95), inset 0 0 60px rgba(0, 0, 0, 0.8)',
        padding: isMobile ? '18px 12px 24px' : '28px 32px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        perspective: '1400px',
        position: 'relative',
        boxSizing: 'border-box',
        order: isMobile ? 1 : 2,
        minWidth: 0,
        width: '100%',
        height: '100%',
        minHeight: isMobile ? '520px' : '680px',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'all 0.6s ease',
      }}
    >
      {/* Verfolgendes Spotlight & Schockwelle */}
      <DiceSpotlightCanvas
        isRolling={isRolling}
        isWin={isRolling ? null : isWin}
        triggerShockwave={shockwaveCount}
        isMobile={isMobile}
      />

      {/* ── TOP HEADER: WIN STREAK + ROLL HISTORY ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {winStreak >= 2 ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              color: '#D4AF37',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.25)',
            }}
          >
            <Flame size={14} color="#D4AF37" />
            <span>{winStreak}× WIN STREAK</span>
          </div>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.55)',
              fontSize: '0.70rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>DICE 3D ARCADE</span>
          </div>
        )}

        {/* Roll History Stream */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            flex: 1,
            justifyContent: 'flex-end',
            paddingBottom: '2px',
            scrollbarWidth: 'none',
          }}
        >
          {history.slice(0, 7).map((h) => (
            <div
              key={h.id}
              style={{
                padding: '4px 9px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 800,
                flexShrink: 0,
                fontFamily: 'var(--font-mono, monospace)',
                color: h.win ? (h.multiplier >= 5 ? '#FFD700' : '#34D399') : '#F87171',
                background: h.win ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                border: `1px solid ${h.win ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
                boxShadow: h.win ? '0 0 8px rgba(16, 185, 129, 0.2)' : 'none',
              }}
            >
              {h.roll.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      {/* ── ZENTRALE 3D-WÜRFEL-ARENA (Option A — Der Würfel als Star) ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '180px' : '220px',
          position: 'relative',
          zIndex: 5,
          padding: '10px 0',
        }}
      >
        {/* Der 3D-Polyeder mit Frontfacetten-Zahlenanzeige */}
        <Dice3DPolyhedron
          isRolling={isRolling}
          rollValue={lastResult?.roll ?? null}
          displayTicker={displayTicker}
          isWin={isRolling ? null : isWin}
          isMobile={isMobile}
        />

        {/* Subtiler Status-Chip unter dem Würfel (Clean Glass, kein Neon-Glow) */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: 'rgba(11, 14, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            border: loading
              ? '1px solid rgba(212, 175, 55, 0.35)'
              : isWin === true
                ? '1px solid rgba(16, 185, 129, 0.35)'
                : isWin === false
                  ? '1px solid rgba(239, 68, 68, 0.30)'
                  : '1px solid rgba(255, 255, 255, 0.10)',
            color: loading
              ? '#D4AF37'
              : isWin === true
                ? '#34D399'
                : isWin === false
                  ? '#F87171'
                  : 'rgba(255, 255, 255, 0.75)',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={12} />
              </motion.div>
              <span>ROLLING 3D DICE...</span>
            </>
          ) : isWin === true ? (
            <span>WON {(multiplier * (lastResult?.win ? 1 : 0)).toFixed(2)}× PAYOUT</span>
          ) : isWin === false ? (
            <span>MISSED TARGET</span>
          ) : (
            <span>READY TO ROLL</span>
          )}
        </motion.div>
      </div>

      {/* ── SCHIEBEREGLER MIT WIN/LOSS ZONEN ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          position: 'relative',
          zIndex: 10,
          marginTop: '4px',
        }}
      >
        {/* Target Info Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            fontSize: '0.80rem',
            fontWeight: 800,
          }}
        >
          <button
            onClick={onToggleRollMode}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              padding: '4px 10px',
              borderRadius: '8px',
              color: '#D4AF37',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              fontWeight: 800,
            }}
          >
            <RefreshCw size={12} />
            <span>{isRollOver ? 'ROLL OVER' : 'ROLL UNDER'}</span>
          </button>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
              TARGET: <strong style={{ color: '#FFFFFF' }}>{targetPoint.toFixed(2)}</strong>
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>
              CHANCE: <strong style={{ color: '#34D399' }}>{winChance.toFixed(2)}%</strong>
            </span>
          </div>
        </div>

        {/* Der interaktive Schieberegler Track */}
        <div
          ref={sliderRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{
            height: '38px',
            borderRadius: '19px',
            background: '#0B0F17',
            border: '2px solid rgba(212, 175, 55, 0.25)',
            position: 'relative',
            cursor: loading ? 'not-allowed' : 'ew-resize',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.8)',
            overflow: 'visible',
          }}
        >
          {/* Win-Zone Balken (Smaragdgrün) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: isRollOver ? `${sliderPercentage}%` : '0%',
              right: isRollOver ? '0%' : `${100 - sliderPercentage}%`,
              borderRadius: '17px',
              background:
                'linear-gradient(90deg, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.7) 100%)',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.1s ease',
            }}
          />

          {/* Slider Thumb (Der Gold-Grip) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${sliderPercentage}%`,
              transform: 'translate(-50%, -50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 35%, #FFEBAA 0%, #D4AF37 60%, #8A6E1E 100%)',
              border: '2px solid #FFFFFF',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.6)',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#07090E',
              }}
            />
          </div>

          {/* Letzter gewürfelter Punkt als kleiner Indikator — erst sichtbar wenn Wurf beendet ist! */}
          {!loading && !isRolling && lastResult !== null && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: `${Math.max(2, Math.min(98, lastResult.roll))}%`,
                transform: 'translate(-50%, -50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: lastResult.win ? '#10B981' : '#EF4444',
                boxShadow: `0 0 8px ${lastResult.win ? '#10B981' : '#EF4444'}`,
                zIndex: 4,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Skalen-Markierungen (0, 25, 50, 75, 100) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 6px',
            color: 'rgba(255, 255, 255, 0.35)',
            fontSize: '0.70rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono, monospace)',
          }}
        >
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      {/* ── QUICK MULTIPLIER PRESETS (2x, 5x, 10x, 25x, 50x, 100x) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)',
          gap: '8px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {MULTIPLIER_PRESETS.map((p) => {
          const isActive = Math.abs(multiplier - p) < 0.05;
          return (
            <button
              key={p}
              onClick={() => onUpdateFromMultiplier(p)}
              disabled={loading}
              style={{
                minHeight: '44px', // WCAG AAA Target Area
                padding: '8px 10px',
                borderRadius: '12px',
                background: isActive ? 'rgba(212, 175, 55, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: isActive ? '1.5px solid #D4AF37' : '1px solid rgba(255, 255, 255, 0.08)',
                color: isActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.75)',
                fontSize: '0.80rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono, monospace)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 0 14px rgba(212, 175, 55, 0.25)' : 'none',
              }}
            >
              <span>{p}x</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  color: isActive ? 'rgba(212, 175, 55, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {(99 / p).toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
