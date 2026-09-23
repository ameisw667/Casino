# 09 — Execution-Handoff-Prompt: Security Hardening (Säulen 1, 2, 4, 6)

> **Kanonisches Template:** [`xx_sop/23_standard_handoff_prompt_template.md`](file:///v:/VibeCoding/Casino/xx_sop/23_standard_handoff_prompt_template.md)
> **Status:** Historischer Referenz-Prompt (Execution am 2026-09-13 abgeschlossen)

### Aufgabenspezifische Parameter

- **Domäne:** Security Hardening (`workspace/domains/security/T_SECURITY_HARDENING/`)
- **Ziel-Pläne:** [`01_csp_script_hardening.md`](file:///v:/VibeCoding/Casino/docs/archive/security/T_SECURITY_HARDENING/01_csp_script_hardening.md), [`02_security_ci_gate.md`](file:///v:/VibeCoding/Casino/docs/archive/security/T_SECURITY_HARDENING/02_security_ci_gate.md), [`04_csrf_origin_guard.md`](file:///v:/VibeCoding/Casino/docs/archive/security/T_SECURITY_HARDENING/04_csrf_origin_guard.md), [`06_csp_violation_reporting.md`](file:///v:/VibeCoding/Casino/docs/archive/security/T_SECURITY_HARDENING/06_csp_violation_reporting.md)
- **Übergeordnete Übersicht:** [`00_SECURITY_HARDENING_UEBERSICHT.md`](file:///v:/VibeCoding/Casino/workspace/domains/security/T_SECURITY_HARDENING/00_SECURITY_HARDENING_UEBERSICHT.md)
- **Sicherheits-Invariante:** Fail-Closed CSRF/Origin-Prüfung, CSP-Nonces und strikte Secret-Isolation (`xx_sop/09_security_wallet_invariants.md`).
- **Verifikation:** 5-Stufen-DoD gemäß SOP 02 / SOP 23 (`check-doc-links`, `typecheck`, `test`, `lint`, `build`).
