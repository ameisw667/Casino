-- Migration 012: Welcome Bonus & Starting Balance ($10,000)
-- Default balance for newly registered users set to 10000.00

ALTER TABLE users ALTER COLUMN balance SET DEFAULT 10000.00;

-- Update existing test users with 0 balance to 10000.00 starting balance
UPDATE users SET balance = 10000.00 WHERE balance = 0.00;
