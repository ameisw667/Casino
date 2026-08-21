'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Shield, TrendingUp, Copy } from 'lucide-react';

type GamePhase =
  'IDLE' | 'DEALING' | 'PLAYER_TURN' | 'PLAYER_TURN_HAND2' | 'DEALER_TURN' | 'SETTLEMENT';

interface BlackjackActionsProps {
  phase: GamePhase;
  canDouble: boolean;
  canSplit: boolean;
  isProcessing?: boolean;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
}

export default function BlackjackActions({
  phase,
  canDouble,
  canSplit,
  isProcessing = false,
  onHit,
  onStand,
  onDouble,
  onSplit,
}: BlackjackActionsProps) {
  const isPlayerTurn = phase === 'PLAYER_TURN' || phase === 'PLAYER_TURN_HAND2';

  return (
    <AnimatePresence>
      {isPlayerTurn && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            marginTop: '8px',
          }}
        >
          {/* HIT BUTTON */}
          <button
            onClick={onHit}
            disabled={isProcessing}
            style={{
              padding: '11px 22px',
              borderRadius: '12px',
              background: 'radial-gradient(ellipse at 50% 20%, #152238 0%, #0c1524 100%)',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              color: '#e0f2fe',
              fontWeight: 900,
              fontSize: '0.9rem',
              letterSpacing: '1px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <PlusCircle size={16} color="#38bdf8" />
            <span>HIT (H)</span>
          </button>

          {/* STAND BUTTON */}
          <button
            onClick={onStand}
            disabled={isProcessing}
            style={{
              padding: '11px 22px',
              borderRadius: '12px',
              background: 'radial-gradient(ellipse at 50% 20%, #252830 0%, #14161c 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              color: '#f8fafc',
              fontWeight: 900,
              fontSize: '0.9rem',
              letterSpacing: '1px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <Shield size={16} color="#D4AF37" />
            <span>STAND (S)</span>
          </button>

          {/* DOUBLE DOWN BUTTON */}
          {canDouble && (
            <button
              onClick={onDouble}
              disabled={isProcessing}
              style={{
                padding: '11px 22px',
                borderRadius: '12px',
                background: 'radial-gradient(ellipse at 50% 20%, #0d3324 0%, #061c13 100%)',
                border: '1.5px solid rgba(52, 211, 153, 0.45)',
                boxShadow:
                  '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                color: '#a7f3d0',
                fontWeight: 900,
                fontSize: '0.9rem',
                letterSpacing: '1px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <TrendingUp size={16} color="#34d399" />
              <span>DOUBLE 2× (D)</span>
            </button>
          )}

          {/* SPLIT BUTTON */}
          {canSplit && (
            <button
              onClick={onSplit}
              disabled={isProcessing}
              style={{
                padding: '11px 22px',
                borderRadius: '12px',
                background: 'radial-gradient(ellipse at 50% 20%, #281744 0%, #150c26 100%)',
                border: '1.5px solid rgba(192, 132, 252, 0.45)',
                boxShadow:
                  '0 4px 14px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                color: '#ede9fe',
                fontWeight: 900,
                fontSize: '0.9rem',
                letterSpacing: '1px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Copy size={16} color="#c084fc" />
              <span>SPLIT (P)</span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
