'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Table } from 'lucide-react';
import type { BlackjackHand } from './CardHand';

interface StrategyMatrixProps {
  playerHand: BlackjackHand | null;
  dealerUpcardNumeric?: number;
  isInGame?: boolean;
}

type ActionType = 'H' | 'S' | 'D' | 'P';

interface MatrixEntry {
  label: string;
  // dealer cards 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 (11 = Ace)
  actions: Record<number, ActionType>;
  match: (hand: BlackjackHand) => boolean;
}

const DEALER_COLS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// 1. HARD TOTALS
const HARD_ROWS: MatrixEntry[] = [
  {
    label: '17+',
    actions: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
    match: (h) => !h.isSoft && h.score >= 17,
  },
  {
    label: '13-16',
    actions: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => !h.isSoft && h.score >= 13 && h.score <= 16,
  },
  {
    label: '12',
    actions: { 2: 'H', 3: 'H', 4: 'S', 5: 'S', 6: 'S', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => !h.isSoft && h.score === 12,
  },
  {
    label: '11',
    actions: { 2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'D', 11: 'H' },
    match: (h) => !h.isSoft && h.score === 11,
  },
  {
    label: '10',
    actions: { 2: 'D', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'D', 8: 'D', 9: 'D', 10: 'H', 11: 'H' },
    match: (h) => !h.isSoft && h.score === 10,
  },
  {
    label: '9',
    actions: { 2: 'H', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => !h.isSoft && h.score === 9,
  },
  {
    label: '5-8',
    actions: { 2: 'H', 3: 'H', 4: 'H', 5: 'H', 6: 'H', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => !h.isSoft && h.score <= 8,
  },
];

// 2. SOFT TOTALS
const SOFT_ROWS: MatrixEntry[] = [
  {
    label: 'A,8+',
    actions: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
    match: (h) => h.isSoft && h.score >= 19,
  },
  {
    label: 'A,7',
    actions: { 2: 'S', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'S', 8: 'S', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => h.isSoft && h.score === 18,
  },
  {
    label: 'A,6',
    actions: { 2: 'H', 3: 'D', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => h.isSoft && h.score === 17,
  },
  {
    label: 'A,4-5',
    actions: { 2: 'H', 3: 'H', 4: 'D', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => h.isSoft && (h.score === 15 || h.score === 16),
  },
  {
    label: 'A,2-3',
    actions: { 2: 'H', 3: 'H', 4: 'H', 5: 'D', 6: 'D', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => h.isSoft && (h.score === 13 || h.score === 14),
  },
];

// 3. PAIRS
const PAIR_ROWS: MatrixEntry[] = [
  {
    label: 'A,A',
    actions: { 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P' },
    match: (h) => h.cards.length === 2 && h.cards[0].value === 'A' && h.cards[1].value === 'A',
  },
  {
    label: '10,10',
    actions: { 2: 'S', 3: 'S', 4: 'S', 5: 'S', 6: 'S', 7: 'S', 8: 'S', 9: 'S', 10: 'S', 11: 'S' },
    match: (h) =>
      h.cards.length === 2 &&
      ['10', 'J', 'Q', 'K'].includes(h.cards[0].value) &&
      ['10', 'J', 'Q', 'K'].includes(h.cards[1].value),
  },
  {
    label: '9,9',
    actions: { 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'S', 8: 'P', 9: 'P', 10: 'S', 11: 'S' },
    match: (h) => h.cards.length === 2 && h.cards[0].value === '9' && h.cards[1].value === '9',
  },
  {
    label: '8,8',
    actions: { 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'P', 9: 'P', 10: 'P', 11: 'P' },
    match: (h) => h.cards.length === 2 && h.cards[0].value === '8' && h.cards[1].value === '8',
  },
  {
    label: '7,7',
    actions: { 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'P', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => h.cards.length === 2 && h.cards[0].value === '7' && h.cards[1].value === '7',
  },
  {
    label: '6,6',
    actions: { 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'P', 7: 'H', 8: 'H', 9: 'H', 10: 'H', 11: 'H' },
    match: (h) => h.cards.length === 2 && h.cards[0].value === '6' && h.cards[1].value === '6',
  },
];

const ACTION_COLORS: Record<ActionType, { bg: string; text: string; label: string }> = {
  H: { bg: 'rgba(56, 189, 248, 0.25)', text: '#38bdf8', label: 'Hit' },
  S: { bg: 'rgba(212, 175, 55, 0.25)', text: '#FFD700', label: 'Stand' },
  D: { bg: 'rgba(52, 211, 153, 0.25)', text: '#34d399', label: 'Double' },
  P: { bg: 'rgba(192, 132, 252, 0.25)', text: '#c084fc', label: 'Split' },
};

export default function StrategyMatrix({
  playerHand,
  dealerUpcardNumeric = 0,
  isInGame = false,
}: StrategyMatrixProps) {
  const [userTab, setUserTab] = useState<'HARD' | 'SOFT' | 'PAIRS' | null>(null);

  // Automatically determine tab from hand type, unless user manually chose a tab
  const tab = useMemo(() => {
    if (userTab) return userTab;
    if (!playerHand || playerHand.cards.length < 2) return 'HARD';
    if (playerHand.cards.length === 2 && playerHand.cards[0].value === playerHand.cards[1].value) {
      return 'PAIRS';
    }
    if (playerHand.isSoft) {
      return 'SOFT';
    }
    return 'HARD';
  }, [userTab, playerHand]);

  const activeRows = useMemo(() => {
    if (tab === 'SOFT') return SOFT_ROWS;
    if (tab === 'PAIRS') return PAIR_ROWS;
    return HARD_ROWS;
  }, [tab]);

  // Find active row & column
  const activeRowIndex = useMemo(() => {
    if (!isInGame || !playerHand) return -1;
    return activeRows.findIndex((r) => r.match(playerHand));
  }, [isInGame, playerHand, activeRows]);

  const normalizedDealerCard = dealerUpcardNumeric === 1 ? 11 : dealerUpcardNumeric;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: 'rgba(0, 0, 0, 0.45)',
        padding: '10px',
        borderRadius: '14px',
        border: '1px solid rgba(212, 175, 55, 0.25)',
      }}
    >
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Table size={13} color="#FFD700" />
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 900,
              color: '#FFD700',
              letterSpacing: '0.5px',
            }}
          >
            BASIC STRATEGY HEATMAP
          </span>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '3px',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '2px',
            borderRadius: '6px',
          }}
        >
          {(['HARD', 'SOFT', 'PAIRS'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setUserTab(t)}
              style={{
                border: 'none',
                background: tab === t ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                color: tab === t ? '#FFD700' : '#64748b',
                fontSize: '0.58rem',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Table */}
      <div style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'center',
            fontSize: '0.62rem',
          }}
        >
          <thead>
            <tr style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th
                style={{ padding: '3px 2px', fontWeight: 900, textAlign: 'left', color: '#cbd5e1' }}
              >
                HAND
              </th>
              {DEALER_COLS.map((col) => {
                const isColActive = isInGame && normalizedDealerCard === col;
                return (
                  <th
                    key={col}
                    style={{
                      padding: '3px 1px',
                      fontWeight: 900,
                      color: isColActive ? '#FFD700' : '#64748b',
                      background: isColActive ? 'rgba(212, 175, 55, 0.15)' : 'transparent',
                      borderRadius: '3px',
                    }}
                  >
                    {col === 11 ? 'A' : col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeRows.map((row, rIdx) => {
              const isRowActive = rIdx === activeRowIndex;
              return (
                <tr
                  key={row.label}
                  style={{
                    background: isRowActive ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <td
                    style={{
                      padding: '3px 2px',
                      textAlign: 'left',
                      fontWeight: 900,
                      color: isRowActive ? '#FFD700' : '#cbd5e1',
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.label}
                  </td>
                  {DEALER_COLS.map((col) => {
                    const action = row.actions[col] || 'H';
                    const isCellActive = isRowActive && normalizedDealerCard === col;
                    const meta = ACTION_COLORS[action];

                    return (
                      <td key={col} style={{ padding: '2px 1px' }}>
                        <motion.div
                          animate={isCellActive ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          style={{
                            padding: '2px 0',
                            borderRadius: '4px',
                            background: isCellActive
                              ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                              : meta.bg,
                            color: isCellActive ? '#000' : meta.text,
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            fontSize: '0.62rem',
                            border: isCellActive
                              ? '1px solid #FFE066'
                              : '1px solid rgba(255, 255, 255, 0.04)',
                            boxShadow: isCellActive ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none',
                          }}
                        >
                          {action}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.55rem',
          color: '#64748b',
          fontWeight: 800,
          paddingTop: '2px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <span style={{ color: '#38bdf8' }}>H: Hit</span>
        <span style={{ color: '#FFD700' }}>S: Stand</span>
        <span style={{ color: '#34d399' }}>D: Double</span>
        <span style={{ color: '#c084fc' }}>P: Split</span>
      </div>
    </div>
  );
}
