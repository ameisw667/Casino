-- pgTAP-RLS-Laufzeittest (T_DATABASE/10 L6) — schliesst den L1-Fund:
-- rls-defense-in-depth.test.ts ist statische Text-Verifikation; dieser Test fuehrt
-- echte Queries unter der Rolle `authenticated` mit fremdem JWT-Kontext aus
-- (Supabase-Konvention: auth.uid() liest request.jwt.claims -> sub).
-- Erwartung: Default-Deny bzw. Zeilen-Isolation quer ueber alle Kerntabellen.

BEGIN;
SET LOCAL search_path = public, extensions;

SELECT plan(6);

-- Setup: zwei Nutzer mit Wallet-Zeilen. User A ist der "Angreifer" im JWT-Kontext,
-- User B das Angriffsziel.
INSERT INTO public.users (id, username, balance)
VALUES ('pgtap_rls_user_a', 'pgtap_rls_user_a', 100.00),
       ('pgtap_rls_user_b', 'pgtap_rls_user_b', 200.00);

INSERT INTO public.game_rounds (user_id, request_id, game, bet_amount, state)
VALUES ('pgtap_rls_user_b', '12111111-1111-4111-8111-111111111111', 'CRASH', 10.00, '{"seed": "rls"}'::jsonb);

-- In den "angreifenden" Nutzerkontext wechseln (Rolle authenticated + JWT-Claims von User A).
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "pgtap_rls_user_a"}';

-- 1. User A sieht NICHT die users-Zeile von User B (RLS-Spalten-/Zeilen-Isolation).
SELECT is(
  ( SELECT count(*)::text FROM public.users WHERE id = 'pgtap_rls_user_b' ),
  '0',
  'authenticated (User A) darf die users-Zeile von User B nicht sehen'
);

-- 2. User A sieht seine eigene Zeile (Policy ist nicht ueber-zu-restrictiv).
SELECT is(
  ( SELECT count(*)::text FROM public.users WHERE id = 'pgtap_rls_user_a' ),
  '1',
  'authenticated (User A) muss seine eigene users-Zeile sehen'
);

-- 3. User A sieht KEINE wallet_transactions von User B.
SELECT is(
  ( SELECT count(*)::text FROM public.wallet_transactions WHERE user_id = 'pgtap_rls_user_b' ),
  '0',
  'authenticated (User A) darf wallet_transactions von User B nicht sehen'
);

-- 4. game_rounds hat gar keine Grants an authenticated (haerter als RLS-Filterung):
-- der SELECT selbst ist verboten, nicht nur zeilengefiltert.
SELECT throws_ok(
  $$ SELECT count(*) FROM public.game_rounds WHERE user_id = 'pgtap_rls_user_b' $$,
  42501,
  NULL,
  'SELECT auf game_rounds als authenticated muss permission denied werfen (keine Grants)'
);

-- 5. Balance-Update auf users ist authenticated komplett entzogen (REVOKE-Postur,
-- fail-closed statt zeilengefiltert): der UPDATE selbst wird abgewiesen.
SELECT throws_ok(
  $$ UPDATE public.users SET balance = 999999 WHERE id = 'pgtap_rls_user_b' $$,
  42501,
  NULL,
  'UPDATE auf users als authenticated muss permission denied werfen (keine Grants)'
);

-- 6. INSERT-Fremdzugriff (Wallet-Zeile im Namen von User B) ist verboten.
SELECT throws_ok(
  $$ INSERT INTO public.wallet_transactions (user_id, game, type, amount, balance_after, metadata)
     VALUES ('pgtap_rls_user_b', 'crash', 'bet_settled', 1, 1, '{}'::jsonb) $$,
  42501,
  NULL,
  'INSERT in wallet_transactions fuer fremden User B muss verboten sein (RLS with check)'
);

-- Aufräumen: Rollenkontext zuruecksetzen (Rollback der Testtransaktion erledigt den Rest).
RESET ROLE;

SELECT * FROM finish();
ROLLBACK;