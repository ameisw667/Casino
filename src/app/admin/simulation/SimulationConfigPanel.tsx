'use client';
import { Play, RotateCcw } from 'lucide-react';
import type { CSSProperties } from 'react';

export type SimulationGame = 'DICE' | 'CRASH';
export type DiceCondition = 'OVER' | 'UNDER';

const LABEL_STYLE: CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 800,
  color: 'rgba(255,255,255,0.35)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px',
};

const INPUT_STYLE: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: '0.95rem',
  fontWeight: 700,
  outline: 'none',
  boxSizing: 'border-box',
};

interface SimulationConfigPanelProps {
  game: SimulationGame;
  onGameChange: (game: SimulationGame) => void;
  runs: number;
  onRunsChange: (runs: number) => void;
  betAmount: number;
  betMax: number;
  onBetAmountChange: (amount: number) => void;
  diceTarget: number;
  onDiceTargetChange: (target: number) => void;
  diceCondition: DiceCondition;
  onDiceConditionChange: (condition: DiceCondition) => void;
  cashoutAt: number;
  onCashoutAtChange: (value: number) => void;
  running: boolean;
  onRunSimulation: () => void;
}

export function SimulationConfigPanel({
  game,
  onGameChange,
  runs,
  onRunsChange,
  betAmount,
  betMax,
  onBetAmountChange,
  diceTarget,
  onDiceTargetChange,
  diceCondition,
  onDiceConditionChange,
  cashoutAt,
  onCashoutAtChange,
  running,
  onRunSimulation,
}: SimulationConfigPanelProps) {
  return (
    <div
      style={{
        padding: '28px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Configuration</div>

      <div>
        <label style={LABEL_STYLE}>Game</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['DICE', 'CRASH'] as const).map((g) => (
            <button
              key={g}
              onClick={() => onGameChange(g)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${game === g ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)'}`,
                background: game === g ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: game === g ? '#D4AF37' : 'rgba(255,255,255,0.5)',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {[
        { label: 'Simulation Runs', value: runs, setter: onRunsChange, min: 100, max: 100000 },
        {
          label: 'Bet Amount ($)',
          value: betAmount,
          setter: onBetAmountChange,
          min: 1,
          max: betMax,
        },
      ].map(({ label, value, setter, min, max }) => (
        <div key={label}>
          <label style={LABEL_STYLE}>{label}</label>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => setter(Number(e.target.value))}
            style={INPUT_STYLE}
          />
        </div>
      ))}

      {game === 'DICE' ? (
        <>
          <div>
            <label style={LABEL_STYLE}>Target ({diceTarget}) — Condition</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {(['OVER', 'UNDER'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => onDiceConditionChange(c)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${diceCondition === c ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    background: diceCondition === c ? 'rgba(212,175,55,0.1)' : 'transparent',
                    color: diceCondition === c ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={5}
              max={95}
              value={diceTarget}
              onChange={(e) => onDiceTargetChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#D4AF37' }}
            />
          </div>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            Win chance:{' '}
            <strong style={{ color: '#D4AF37' }}>
              {diceCondition === 'OVER' ? 100 - diceTarget : diceTarget}%
            </strong>{' '}
            · Multiplier:{' '}
            <strong style={{ color: '#D4AF37' }}>
              {(0.99 / ((diceCondition === 'OVER' ? 100 - diceTarget : diceTarget) / 100)).toFixed(
                4,
              )}
              x
            </strong>
          </div>
        </>
      ) : (
        <div>
          <label style={LABEL_STYLE}>Auto-Cashout at ({cashoutAt}x)</label>
          <input
            type="range"
            min={1.1}
            max={20}
            step={0.1}
            value={cashoutAt}
            onChange={(e) => onCashoutAtChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#D4AF37' }}
          />
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              marginTop: '8px',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 600,
            }}
          >
            Win chance: <strong style={{ color: '#D4AF37' }}>{(97 / cashoutAt).toFixed(1)}%</strong>{' '}
            · Bust rate: ~<strong style={{ color: '#ef4444' }}>3%</strong>
          </div>
        </div>
      )}

      <button
        onClick={onRunSimulation}
        disabled={running}
        style={{
          padding: '14px',
          borderRadius: '12px',
          background: running ? 'rgba(212,175,55,0.05)' : 'rgba(212,175,55,0.15)',
          border: '1px solid rgba(212,175,55,0.3)',
          color: '#D4AF37',
          fontWeight: 900,
          fontSize: '0.95rem',
          cursor: running ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {running ? (
          <>
            <RotateCcw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Running…
          </>
        ) : (
          <>
            <Play size={16} /> Run Simulation
          </>
        )}
      </button>
    </div>
  );
}
