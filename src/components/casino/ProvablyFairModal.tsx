'use client';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import {
  type VerifiableGame,
  verifySeedHistoryEntry,
} from '@/lib/casino/seed-history-verification';

interface SeedHistoryEntry {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonceAtRotation: number;
  rotatedAt: string;
}

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServerSeed?: string;
  initialClientSeed?: string;
  initialNonce?: number;
  initialGame?: string;
}

export function ProvablyFairModal({
  isOpen,
  onClose,
  initialServerSeed = '',
  initialClientSeed = 'casino-player-seed',
  initialNonce = 1,
  initialGame = 'dice',
}: ProvablyFairModalProps) {
  const [serverSeed, setServerSeed] = useState(initialServerSeed);
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [clientSeed, setClientSeed] = useState(initialClientSeed);
  const [nonce, setNonce] = useState(initialNonce);
  const [game, setGame] = useState<VerifiableGame>(initialGame as VerifiableGame);
  const [history, setHistory] = useState<SeedHistoryEntry[]>([]);
  const [selectedHistory, setSelectedHistory] = useState('');
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    hash: string;
    computedOutcome: string;
    verified: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    fetch('/api/casino/seeds/history', { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Seed-Historie konnte nicht geladen werden.');
        const payload: unknown = await response.json();
        if (!Array.isArray(payload)) throw new Error('Ungültige Seed-Historie.');
        setHistory(payload as SeedHistoryEntry[]);
        setHistoryError(null);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') {
          setHistoryError(
            error instanceof Error ? error.message : 'Seed-Historie nicht verfügbar.',
          );
        }
      });
    return () => controller.abort();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setResult(null);

    try {
      if (!serverSeed.trim() || !serverSeedHash || !clientSeed.trim()) {
        throw new Error('Wähle einen offenbarten Seed aus der Historie.');
      }
      const verified = await verifySeedHistoryEntry({
        game,
        serverSeed: serverSeed.trim(),
        serverSeedHash,
        clientSeed: clientSeed.trim(),
        nonce: Math.max(0, Number(nonce) || 0),
      });
      setResult({
        hash: verified.hmac ?? '—',
        computedOutcome:
          verified.computedOutcome ??
          'Hash-Commitment stimmt nicht mit dem offenbarten Seed überein',
        verified: verified.hashVerified,
      });
    } catch {
      setResult({
        hash: '—',
        computedOutcome: 'Verifikation fehlgeschlagen (Ungültiges Seed-Format)',
        verified: false,
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0a0a0c',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '24px',
          padding: '28px',
          color: '#fff',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <ShieldCheck size={22} color="#D4AF37" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#fff' }}>
            Provably Fair Verifier
          </h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 20px 0' }}>
          Kryptographische HMAC-SHA256 Re-Berechnung zur Verifikation deterministischer
          Spielergebnisse.
        </p>

        {historyError && (
          <p style={{ color: 'hsl(var(--error))', fontSize: '0.8rem' }}>{historyError}</p>
        )}
        {history.length === 0 && !historyError && (
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
            Noch kein offenbarter Seed. Rotiere deinen Seed, um eine Kette zu verifizieren.
          </p>
        )}
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
          Bet vor Seed-Siegel-Rollout: nicht verifizierbar.
        </p>

        {history.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#D4AF37',
                marginBottom: '6px',
              }}
            >
              Offenbarten Seed auswählen
            </label>
            <select
              value={selectedHistory}
              onChange={(event) => {
                const entry = history[Number(event.target.value)];
                setSelectedHistory(event.target.value);
                setServerSeed(entry.serverSeed);
                setServerSeedHash(entry.serverSeedHash);
                setClientSeed(entry.clientSeed);
                setNonce(0);
                setResult(null);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            >
              <option value="">Seed-Historie auswählen</option>
              {history.map((entry, index) => (
                <option key={`${entry.serverSeedHash}-${entry.rotatedAt}`} value={index}>
                  {new Date(entry.rotatedAt).toLocaleString()} · Nonce 0–{entry.nonceAtRotation}
                </option>
              ))}
            </select>
          </div>
        )}

        <form
          onSubmit={handleVerify}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#D4AF37',
                marginBottom: '6px',
              }}
            >
              Spiel auswaehlen
            </label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value as VerifiableGame)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                outline: 'none',
              }}
            >
              <option value="dice">Dice (0.00 - 100.00)</option>
              <option value="crash">Crash Multiplier</option>
              <option value="roulette">Roulette (0 - 36)</option>
              <option value="slots">Slots (5 Reels)</option>
              <option value="blackjack">Blackjack (Fisher-Yates Deck)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '6px',
              }}
            >
              Server Seed
            </label>
            <input
              type="text"
              value={serverSeed}
              readOnly
              placeholder="Offenbarten Seed aus der Historie auswählen"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '6px',
                }}
              >
                Client Seed
              </label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '6px',
                }}
              >
                Nonce
              </label>
              <input
                type="number"
                min="0"
                max={selectedHistory ? history[Number(selectedHistory)]?.nonceAtRotation : 0}
                value={nonce}
                onChange={(e) => {
                  const maximum = selectedHistory
                    ? (history[Number(selectedHistory)]?.nonceAtRotation ?? 0)
                    : 0;
                  setNonce(Math.max(0, Math.min(maximum, Number(e.target.value) || 0)));
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: '#D4AF37',
              border: 'none',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: verifying ? 0.6 : 1,
            }}
          >
            {verifying ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
            {verifying ? 'Berechne HMAC-SHA256…' : 'Wette verifizieren'}
          </button>
        </form>

        {result && (
          <div
            style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '14px',
              background: result.verified ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${result.verified ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: result.verified ? '#10b981' : '#ef4444',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              {result.verified ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {result.verified
                ? 'HMAC-SHA256 Verifiziert & Deterministisch'
                : 'Verifikation fehlgeschlagen'}
            </div>
            <div
              style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}
            >
              {result.computedOutcome}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              HMAC: {result.hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
