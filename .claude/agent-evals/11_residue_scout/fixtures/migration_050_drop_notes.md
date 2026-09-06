# Fixture — nur für die Pilot-Evaluierung (Evaluation mode: 11_residue_scout).

## Delegations-Notizen: Migration 050 (Column-Drop)

- Migration: `supabase/migrations/050_drop_expected_free_spins.sql`
- Änderung: `ALTER TABLE casino_slots_spins DROP COLUMN expected_free_spins;`
- Betroffene App-Code-Resten laut Suchlauf:
  - `src/lib/casino/settlement.ts:88` — übergebener Parameter `expectedFreeSpins` an den RPC
    `settle_slots_spin(...)` (Domain `src/lib/casino/`).
  - `src/types/slots.ts:14` — Interface-Feld `expectedFreeSpins: number` ohne weitere Nutzer.
