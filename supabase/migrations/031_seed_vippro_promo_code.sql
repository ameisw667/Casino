-- Migration 031: Seed VIPPRO Promo Code ($500 Bonus Credits)
-- Adds/activates the VIPPRO promo code in public.promo_codes table with 10,000 max uses.

INSERT INTO public.promo_codes (code, amount, max_uses, used_count, active, created_by)
VALUES ('VIPPRO', 500.00, 10000, 0, TRUE, 'system_welcome')
ON CONFLICT (code) DO UPDATE
SET amount = 500.00,
    active = TRUE,
    max_uses = 10000;
