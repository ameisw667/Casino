'use client';
import React, { useState, useCallback } from 'react';
import { FlaskConical, Play, RotateCcw, TrendingUp, Percent, AlertTriangle } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useCasinoStore } from '@/store/useCasinoStore';

interface SimResult {
  runs: number;
  wins: number;
  losses: number;
  totalPayout: number;
  totalWagered: number;
  rtp: number;
  bustRate?: number;
  samples: Array<{ i: number; rtp: number }>;
}

function simulateDice(
  runs: number,
  target: number,
  condition: 'OVER' | 'UNDER',
  betAmount: number,
): SimResult {
  let wins = 0,
    totalPayout = 0;
  const samples: Array<{ i: number; rtp: number }> = [];
  const totalWagered = runs * betAmount;
  const winChance = condition === 'OVER' ? (100 - target) / 100 : target / 100;
  const multiplier = 0.99 / winChance;

  for (let i = 0; i < runs; i++) {
    const roll = Math.random() * 100;
    const win = condition === 'OVER' ? roll > target : roll < target;
    if (win) {
      wins++;
      totalPayout += betAmount * multiplier;
    }
    if (i % Math.max(1, Math.floor(runs / 50)) === 0) {
      samples.push({
        i,
        rtp: i > 0 ? Math.round((totalPayout / ((i + 1) * betAmount)) * 1000) / 10 : 0,
      });
    }
  }
  return {
    runs,
    wins,
    losses: runs - wins,
    totalPayout,
    totalWagered,
    rtp: Math.round((totalPayout / totalWagered) * 1000) / 10,
    samples,
  };
}

function simulateCrash(runs: number, cashoutAt: number, betAmount: number): SimResult {
  let wins = 0,
    totalPayout = 0,
    busts = 0;
  const samples: Array<{ i: number; rtp: number }> = [];
  const totalWagered = runs * betAmount;

  for (let i = 0; i < runs; i++) {
    const r = Math.random();
    const crashPoint = r < 0.03 ? 1 : Math.max(1, 0.99 / (1 - r));
    const win = crashPoint >= cashoutAt;
    if (crashPoint <= 1.01) busts++;
    if (win) {
      wins++;
      totalPayout += betAmount * cashoutAt;
    }
    if (i % Math.max(1, Math.floor(runs / 50)) === 0) {
      samples.push({
        i,
        rtp: i > 0 ? Math.round((totalPayout / ((i + 1) * betAmount)) * 1000) / 10 : 0,
      });
    }
  }
  return {
    runs,
    wins,
    losses: runs - wins,
    totalPayout,
    totalWagered,
    rtp: Math.round((totalPayout / totalWagered) * 1000) / 10,
    bustRate: Math.round((busts / runs) * 1000) / 10,
    samples,
  };
}

export default function SimulationPageClient() {
  const { gameConfig } = useCasinoStore();
  const betMax = gameConfig?.limits?.betMax ?? 10000;

  const [game, setGame] = useState<'DICE' | 'CRASH'>('DICE');
  const [runs, setRuns] = useState(10000);
  const [betAmount, setBetAmount] = useState(10);
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceCondition, setDiceCondition] = useState<'OVER' | 'UNDER'>('OVER');
  const [cashoutAt, setCashoutAt] = useState(2);
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  const runSim = useCallback(() => {
    if (runs < 1 || betAmount < 1) return;
    setRunning(true);
    setTimeout(() => {
      const r =
        game === 'DICE'
          ? simulateDice(runs, diceTarget, diceCondition, betAmount)
          : simulateCrash(runs, cashoutAt, betAmount);
      setResult(r);
      setRunning(false);
    }, 80);
  }, [game, runs, betAmount, diceTarget, diceCondition, cashoutAt]);

  const rtpOk = result && result.rtp >= 94 && result.rtp <= 101;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Demo Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          borderRadius: '14px',
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <AlertTriangle size={16} color="#D4AF37" />
        <span
          style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D4AF37', letterSpacing: '0.03em' }}
        >
          Simulations-Modus — Ergebnisse basieren auf Math.random() und sind rein statistisch, keine
          Echtdaten.
        </span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <FlaskConical size={18} color="#D4AF37" />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#D4AF37',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Simulation Engine
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.5px',
            margin: 0,
          }}
        >
          RTP Validator
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: '6px' }}>
          Simulate game outcomes & validate mathematical fairness
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px' }}>
        {/* Config Panel */}
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

          {/* Game Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
            >
              Game
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['DICE', 'CRASH'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGame(g);
                    setResult(null);
                  }}
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

          {/* Shared: Runs + Bet */}
          {[
            {
              label: 'Simulation Runs',
              value: runs,
              setter: (v: number) => setRuns(v),
              min: 100,
              max: 100000,
            },
            {
              label: 'Bet Amount ($)',
              value: betAmount,
              setter: (v: number) => setBetAmount(v),
              min: 1,
              max: betMax,
            },
          ].map(({ label, value, setter, min, max }) => (
            <div key={label}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}
              >
                {label}
              </label>
              <input
                type="number"
                value={value}
                min={min}
                max={max}
                onChange={(e) => setter(Number(e.target.value))}
                style={{
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
                }}
              />
            </div>
          ))}

          {/* Game-specific params */}
          {game === 'DICE' ? (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '8px',
                  }}
                >
                  Target ({diceTarget}) — Condition
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {(['OVER', 'UNDER'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setDiceCondition(c)}
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
                  onChange={(e) => setDiceTarget(Number(e.target.value))}
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
                  {(
                    0.99 /
                    ((diceCondition === 'OVER' ? 100 - diceTarget : diceTarget) / 100)
                  ).toFixed(4)}
                  x
                </strong>
              </div>
            </>
          ) : (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}
              >
                Auto-Cashout at ({cashoutAt}x)
              </label>
              <input
                type="range"
                min={1.1}
                max={20}
                step={0.1}
                value={cashoutAt}
                onChange={(e) => setCashoutAt(Number(e.target.value))}
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
                Win chance:{' '}
                <strong style={{ color: '#D4AF37' }}>{(97 / cashoutAt).toFixed(1)}%</strong> · Bust
                rate: ~<strong style={{ color: '#ef4444' }}>3%</strong>
              </div>
            </div>
          )}

          {/* Run Button */}
          <button
            onClick={runSim}
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

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {result ? (
            <>
              {/* RTP Verdict */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: rtpOk ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${rtpOk ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '6px',
                  }}
                >
                  {rtpOk ? (
                    <Percent size={18} color="#10b981" />
                  ) : (
                    <AlertTriangle size={18} color="#ef4444" />
                  )}
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: '1rem',
                      color: rtpOk ? '#10b981' : '#ef4444',
                    }}
                  >
                    RTP {rtpOk ? '✓ Validated' : '⚠ Out of Bounds'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    color: rtpOk ? '#10b981' : '#ef4444',
                  }}
                >
                  {result.rtp}%
                </div>
                {!rtpOk && (
                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '4px',
                    }}
                  >
                    Expected 94–101% range
                  </div>
                )}
              </div>

              {/* Stat Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Runs', value: result.runs.toLocaleString('en-US') },
                  {
                    label: 'Wins',
                    value: `${result.wins.toLocaleString('en-US')} (${Math.round((result.wins / result.runs) * 100)}%)`,
                  },
                  {
                    label: 'Total Wagered',
                    value: `$${result.totalWagered.toLocaleString('en-US')}`,
                  },
                  {
                    label: 'Total Payout',
                    value: `$${Math.round(result.totalPayout).toLocaleString('en-US')}`,
                  },
                  ...(result.bustRate !== undefined
                    ? [{ label: 'Bust Rate (≤1.01x)', value: `${result.bustRate}%` }]
                    : []),
                  {
                    label: 'House Take',
                    value: `$${Math.round(result.totalWagered - result.totalPayout).toLocaleString('en-US')}`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: 'rgba(255,255,255,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '4px',
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* RTP Convergence Chart */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <TrendingUp size={15} color="#D4AF37" /> RTP Convergence
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={result.samples}>
                    <XAxis
                      dataKey="i"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      domain={[85, 105]}
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#111',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        fontSize: '11px',
                      }}
                      formatter={(v) => [`${v}%`, 'RTP']}
                    />
                    <ReferenceLine
                      y={99}
                      stroke="rgba(212,175,55,0.3)"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Theoretical',
                        fill: 'rgba(212,175,55,0.5)',
                        fontSize: 10,
                        position: 'right',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rtp"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
                gap: '12px',
              }}
            >
              <FlaskConical size={40} />
              <div style={{ fontWeight: 700 }}>
                Configure parameters and run the simulation to validate RTP
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
