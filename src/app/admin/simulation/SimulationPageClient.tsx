'use client';
import { useCallback, useState } from 'react';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import { useCasinoStore } from '@/store/useCasinoStore';
import { simulateCrash, simulateDice, type SimResult } from '@/lib/casino/admin/simulation-engine';
import {
  SimulationConfigPanel,
  type DiceCondition,
  type SimulationGame,
} from './SimulationConfigPanel';
import { SimulationResultsPanel } from './SimulationResultsPanel';

const SIM_START_DELAY_MS = 80;

export default function SimulationPageClient() {
  const { gameConfig } = useCasinoStore();
  const betMax = gameConfig?.limits?.betMax ?? 10000;

  const [game, setGame] = useState<SimulationGame>('DICE');
  const [runs, setRuns] = useState(10000);
  const [betAmount, setBetAmount] = useState(10);
  const [diceTarget, setDiceTarget] = useState(50);
  const [diceCondition, setDiceCondition] = useState<DiceCondition>('OVER');
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
    }, SIM_START_DELAY_MS);
  }, [game, runs, betAmount, diceTarget, diceCondition, cashoutAt]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
        <SimulationConfigPanel
          game={game}
          onGameChange={(g) => {
            setGame(g);
            setResult(null);
          }}
          runs={runs}
          onRunsChange={setRuns}
          betAmount={betAmount}
          betMax={betMax}
          onBetAmountChange={setBetAmount}
          diceTarget={diceTarget}
          onDiceTargetChange={setDiceTarget}
          diceCondition={diceCondition}
          onDiceConditionChange={setDiceCondition}
          cashoutAt={cashoutAt}
          onCashoutAtChange={setCashoutAt}
          running={running}
          onRunSimulation={runSim}
        />
        <SimulationResultsPanel result={result} />
      </div>
    </div>
  );
}
